import { useAuth } from "@/contexts/AuthContext";
import { usePolls } from "@/contexts/PollContext";
import { LoginDialog } from "@/components/LoginDialog";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Zap, Copy, LogOut, CheckCircle, RefreshCw, Droplets } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const Profile = () => {
  const { user, isConnected, logout, refreshBalance } = useAuth();
  const { polls } = usePolls();
  const [loginOpen, setLoginOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Refresh balance on mount
  useEffect(() => {
    if (isConnected) {
      refreshBalance();
    }
  }, [isConnected, refreshBalance]);

  if (!isConnected || !user) {
    return (
      <div className="container max-w-lg py-20 text-center">
        <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
        <h1 className="font-heading text-2xl font-bold mb-2">Connect to ZapPoll</h1>
        <p className="text-muted-foreground mb-6">Sign in to view your profile, balance, and polls.</p>
        <Button onClick={() => setLoginOpen(true)} className="glow-orange">
          <Zap className="h-4 w-4 mr-2" /> Connect Wallet
        </Button>
        <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
      </div>
    );
  }

  const myPolls = polls.filter((p) => p.creatorId === user.id);
  const votedPolls = polls.filter((p) => p.stakes.some((s) => s.userId === user.id));

  const copyAddress = () => {
    navigator.clipboard.writeText(user.walletAddress);
    toast({ title: "Address copied!" });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshBalance();
    setRefreshing(false);
    toast({ title: "Balance refreshed" });
  };

  return (
    <div className="container max-w-lg py-8 pb-24 sm:pb-8">
      <h1 className="font-heading text-3xl font-bold mb-6">Profile</h1>

      {/* Wallet card */}
      <div className="rounded-xl border border-border bg-card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-xs text-muted-foreground capitalize">{user.loginMethod} login</span>
          </div>
          <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-destructive">
            <LogOut className="h-4 w-4 mr-1" /> Logout
          </Button>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="font-mono text-sm text-foreground">{user.walletAddress.slice(0, 10)}...{user.walletAddress.slice(-8)}</span>
          <button onClick={copyAddress} className="text-muted-foreground hover:text-foreground">
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <p className="text-xs text-muted-foreground">STRK Balance</p>
            <button onClick={handleRefresh} className="text-muted-foreground hover:text-primary">
              <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
          <p className="font-heading text-3xl font-bold text-primary">{user.strkBalance.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">sepoliaTokens.STRK</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{myPolls.length}</p>
          <p className="text-xs text-muted-foreground">Polls Created</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{votedPolls.length}</p>
          <p className="text-xs text-muted-foreground">Polls Voted</p>
        </div>
      </div>

      {/* My polls */}
      {myPolls.length > 0 && (
        <div className="mb-6">
          <h2 className="font-heading text-lg font-bold mb-3">My Polls</h2>
          <div className="space-y-2">
            {myPolls.map((p) => (
              <Link key={p.id} to={`/poll/${p.id}`} className="block rounded-lg border border-border bg-card p-3 hover:border-primary/40 transition-colors">
                <p className="text-sm font-medium text-foreground truncate">{p.question}</p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                  {p.resolved && <><CheckCircle className="h-3 w-3 text-primary" /> Resolved</>}
                  {!p.resolved && <>{p.stakes.length} stakers</>}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Voted polls */}
      {votedPolls.length > 0 && (
        <div>
          <h2 className="font-heading text-lg font-bold mb-3">Voted On</h2>
          <div className="space-y-2">
            {votedPolls.map((p) => (
              <Link key={p.id} to={`/poll/${p.id}`} className="block rounded-lg border border-border bg-card p-3 hover:border-secondary/40 transition-colors">
                <p className="text-sm font-medium text-foreground truncate">{p.question}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
