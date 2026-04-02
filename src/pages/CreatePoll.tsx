import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { usePolls } from "@/contexts/PollContext";
import { LoginDialog } from "@/components/LoginDialog";
import { Zap, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { STRK } from "@/lib/starkzap";
import { Amount, fromAddress } from "starkzap";

// Poll contract address (placeholder — in production this would be the real contract)
const POLL_CONTRACT = "0x0000000000000000000000000000000000000000000000000000000000000001";

const CreatePoll = () => {
  const { user, wallet, isConnected, refreshBalance } = useAuth();
  const { createPoll } = usePolls();
  const navigate = useNavigate();
  const [loginOpen, setLoginOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [question, setQuestion] = useState("");
  const [option1, setOption1] = useState("");
  const [option2, setOption2] = useState("");
  const [deadline, setDeadline] = useState<Date>();

  const handleSubmit = async () => {
    if (!isConnected || !wallet) {
      setLoginOpen(true);
      return;
    }
    if (!question.trim() || !option1.trim() || !option2.trim() || !deadline) {
      toast({ title: "Missing fields", description: "Fill in all fields and pick a deadline.", variant: "destructive" });
      return;
    }
    if (user!.strkBalance < 1) {
      toast({ title: "Insufficient balance", description: "You need at least 1 STRK to create a poll.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      // Transfer 1 STRK creation deposit via Starkzap ERC20 module (gasless via Paymaster)
      const tx = await wallet.transfer(STRK, [
        { to: fromAddress(POLL_CONTRACT), amount: Amount.parse("1", STRK) },
      ]);
      await tx.wait();

      await refreshBalance();

      const id = createPoll(question.trim(), [option1.trim(), option2.trim()], deadline, user!.id, user!.walletAddress);
      toast({ title: "Poll created! ⚡", description: "1 STRK deposit taken. Gasless via Starkzap Paymaster." });
      navigate(`/poll/${id}`);
    } catch (err) {
      console.error("Create poll failed:", err);
      toast({ title: "Transaction failed", description: "Could not create poll. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container max-w-lg py-8 pb-24 sm:pb-8">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <h1 className="font-heading text-3xl font-bold mb-2">Create Poll</h1>
      <p className="text-muted-foreground text-sm mb-8">Requires 1 STRK creation deposit • Gasless via Starkzap</p>

      <div className="space-y-5">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Question</label>
          <Input
            placeholder="Will ETH flip BTC by 2030?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-primary mb-1.5 block">Option A</label>
            <Input
              placeholder="Yes 🚀"
              value={option1}
              onChange={(e) => setOption1(e.target.value)}
              className="bg-muted border-primary/30 text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-secondary mb-1.5 block">Option B</label>
            <Input
              placeholder="No way 📉"
              value={option2}
              onChange={(e) => setOption2(e.target.value)}
              className="bg-muted border-secondary/30 text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Deadline</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full justify-start text-left font-normal bg-muted border-border", !deadline && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {deadline ? format(deadline, "PPP") : "Pick a deadline"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={deadline}
                onSelect={setDeadline}
                disabled={(date) => date < new Date()}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 flex items-start gap-3">
          <Zap className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">1 STRK Creation Deposit</p>
            <p className="text-xs text-muted-foreground mt-0.5">Deducted from your balance. All transactions are gasless via Starkzap Paymaster.</p>
          </div>
        </div>

        <Button onClick={handleSubmit} disabled={submitting} className="w-full h-12 text-base font-semibold glow-orange">
          <Zap className="h-5 w-5 mr-2" />
          {submitting ? "Submitting..." : "Create Poll"}
        </Button>
      </div>

      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </div>
  );
};

export default CreatePoll;
