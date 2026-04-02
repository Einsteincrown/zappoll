import { useState, useCallback } from "react";
import confetti from "canvas-confetti";
import { useParams, Link } from "react-router-dom";
import { usePolls } from "@/contexts/PollContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCountdown } from "@/hooks/useCountdown";
import { LoginDialog } from "@/components/LoginDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Zap, Trophy, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { STRK } from "@/lib/starkzap";
import { Amount, fromAddress } from "starkzap";

// Poll contract address (placeholder — in production this would be the real contract)
const POLL_CONTRACT = "0x0000000000000000000000000000000000000000000000000000000000000001";

const PollDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { getPoll, addStake, resolvePoll } = usePolls();
  const { user, wallet, isConnected, refreshBalance } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [stakeAmount, setStakeAmount] = useState("");
  const [selectedOption, setSelectedOption] = useState<0 | 1 | null>(null);
  const [staking, setStaking] = useState(false);

  const poll = getPoll(id!);
  const countdown = useCountdown(poll?.deadline ?? new Date());

  if (!poll) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground text-lg">Poll not found</p>
        <Link to="/" className="text-primary text-sm mt-2 inline-block">Go home</Link>
      </div>
    );
  }

  const totalStake = poll.stakes.reduce((s, st) => s + st.amount, 0);
  const option0Stake = poll.stakes.filter((s) => s.option === 0).reduce((s, st) => s + st.amount, 0);
  const option1Stake = poll.stakes.filter((s) => s.option === 1).reduce((s, st) => s + st.amount, 0);
  const pct0 = totalStake > 0 ? (option0Stake / totalStake) * 100 : 50;
  const pct1 = totalStake > 0 ? (option1Stake / totalStake) * 100 : 50;
  const isExpired = new Date() > poll.deadline;

  const userStakes = user ? poll.stakes.filter((s) => s.userId === user.id) : [];
  const userTotal0 = userStakes.filter((s) => s.option === 0).reduce((a, s) => a + s.amount, 0);
  const userTotal1 = userStakes.filter((s) => s.option === 1).reduce((a, s) => a + s.amount, 0);

  const handleStake = async () => {
    if (!isConnected || !wallet) { setLoginOpen(true); return; }
    if (selectedOption === null) { toast({ title: "Select an option", variant: "destructive" }); return; }
    const amount = parseFloat(stakeAmount);
    if (!amount || amount <= 0) { toast({ title: "Enter a valid amount", variant: "destructive" }); return; }
    if (amount > user!.strkBalance) { toast({ title: "Insufficient STRK balance", variant: "destructive" }); return; }

    setStaking(true);
    try {
      // Transfer STRK via Starkzap ERC20 module (gasless via Paymaster)
      const tx = await wallet.transfer(STRK, [
        { to: fromAddress(POLL_CONTRACT), amount: Amount.parse(String(amount), STRK) },
      ]);
      await tx.wait();

      await refreshBalance();
      addStake(poll.id, user!.id, user!.walletAddress, selectedOption, amount);
      setStakeAmount("");
      toast({ title: `Staked ${amount} STRK ⚡`, description: `On "${poll.options[selectedOption]}" — gasless via Starkzap Paymaster` });
    } catch (err) {
      console.error("Stake failed:", err);
      toast({ title: "Transaction failed", description: "Could not stake. Please try again.", variant: "destructive" });
    } finally {
      setStaking(false);
    }
  };

  const handleResolve = (winner: 0 | 1) => {
    resolvePoll(poll.id, winner);
    // Payout logic — in production this would be on-chain
    const winnerStake = poll.stakes.filter((s) => s.option === winner).reduce((a, s) => a + s.amount, 0);
    if (user && winnerStake > 0) {
      const userWinStake = poll.stakes.filter((s) => s.userId === user.id && s.option === winner).reduce((a, s) => a + s.amount, 0);
      if (userWinStake > 0) {
        const payout = (userWinStake / winnerStake) * totalStake;
        toast({ title: `You won ${payout.toFixed(2)} STRK! 🎉` });
      }
    }
    toast({ title: "Poll resolved ✅", description: `"${poll.options[winner]}" wins!` });
  };

  const canResolve = isExpired && !poll.resolved && user?.id === poll.creatorId;

  return (
    <div className="container max-w-2xl py-8 pb-24 sm:pb-8">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {/* Status */}
        <div className="flex items-center gap-3 mb-4">
          <span className={`text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full ${
            poll.resolved ? 'bg-muted text-muted-foreground' : isExpired ? 'bg-destructive/20 text-destructive' : 'bg-primary/15 text-primary'
          }`}>
            {poll.resolved ? "Resolved" : isExpired ? "Ended" : "Active"}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{poll.resolved ? "Closed" : countdown}</span>
        </div>

        <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-6">{poll.question}</h1>

        {/* Stake distribution */}
        <div className="rounded-xl border border-border bg-card p-5 mb-6">
          <div className="flex items-center justify-between text-sm font-medium mb-2">
            <span className="text-primary">{poll.options[0]}</span>
            <span className="text-secondary">{poll.options[1]}</span>
          </div>
          <div className="flex h-5 rounded-full overflow-hidden bg-muted mb-2">
            <motion.div className="bg-primary rounded-l-full" initial={{ width: 0 }} animate={{ width: `${pct0}%` }} transition={{ duration: 0.6 }} />
            <motion.div className="bg-secondary rounded-r-full" initial={{ width: 0 }} animate={{ width: `${pct1}%` }} transition={{ duration: 0.6 }} />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{option0Stake.toFixed(1)} STRK ({pct0.toFixed(0)}%)</span>
            <span>{option1Stake.toFixed(1)} STRK ({pct1.toFixed(0)}%)</span>
          </div>
          <div className="text-center mt-3 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{totalStake.toFixed(1)} STRK</span> total pot • <Users className="inline h-3.5 w-3.5" /> {poll.stakes.length} stakers
          </div>
        </div>

        {/* User stakes */}
        {user && (userTotal0 > 0 || userTotal1 > 0) && (
          <div className="rounded-lg bg-muted/50 border border-border p-4 mb-6 text-sm">
            <p className="font-medium text-foreground mb-2">Your Stakes</p>
            {userTotal0 > 0 && <p className="text-muted-foreground">• {poll.options[0]}: <span className="text-primary font-semibold">{userTotal0.toFixed(1)} STRK</span></p>}
            {userTotal1 > 0 && <p className="text-muted-foreground">• {poll.options[1]}: <span className="text-secondary font-semibold">{userTotal1.toFixed(1)} STRK</span></p>}
          </div>
        )}

        {/* Resolved result */}
        {poll.resolved && poll.winningOption !== undefined && (
          <div className="rounded-xl border-2 border-primary/40 bg-primary/5 p-5 mb-6 text-center">
            <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="font-heading text-xl font-bold text-foreground">"{poll.options[poll.winningOption]}" wins!</p>
            <p className="text-sm text-muted-foreground mt-1">Pot of {totalStake.toFixed(1)} STRK distributed to winners proportionally.</p>
          </div>
        )}

        {/* Stake form */}
        {!poll.resolved && !isExpired && (
          <div className="rounded-xl border border-border bg-card p-5 mb-6">
            <p className="font-medium text-foreground mb-3">Place Your Stake</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {([0, 1] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSelectedOption(opt)}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    selectedOption === opt
                      ? opt === 0
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-secondary bg-secondary/10 text-secondary"
                      : "border-border bg-muted text-muted-foreground hover:border-border/80"
                  }`}
                >
                  {poll.options[opt]}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Input
                type="number"
                placeholder="STRK amount"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                className="bg-muted border-border text-foreground"
              />
              <Button onClick={handleStake} disabled={staking} className="glow-orange shrink-0">
                <Zap className="h-4 w-4 mr-1" /> {staking ? "..." : "Stake"}
              </Button>
            </div>
          </div>
        )}

        {/* Resolve */}
        {canResolve && (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
            <p className="font-medium text-foreground mb-3">Resolve This Poll</p>
            <p className="text-xs text-muted-foreground mb-4">As the creator, select the winning option to distribute the pot.</p>
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={() => handleResolve(0)} className="bg-primary hover:bg-primary/90">{poll.options[0]}</Button>
              <Button onClick={() => handleResolve(1)} variant="outline" className="border-secondary text-secondary hover:bg-secondary/10">{poll.options[1]}</Button>
            </div>
          </div>
        )}

        {/* Recent stakers */}
        {poll.stakes.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-medium text-foreground mb-3">Recent Stakers</p>
            <div className="space-y-2">
              {poll.stakes.slice(-5).reverse().map((s, i) => (
                <div key={i} className="flex items-center justify-between text-xs bg-muted/50 rounded-lg px-3 py-2">
                  <span className="text-muted-foreground font-mono">{s.walletAddress.slice(0, 8)}...</span>
                  <span className={s.option === 0 ? "text-primary" : "text-secondary"}>
                    {s.amount.toFixed(1)} STRK → {poll.options[s.option]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </div>
  );
};

export default PollDetail;
