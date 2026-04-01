import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Zap, TrendingUp } from "lucide-react";
import { usePolls } from "@/contexts/PollContext";
import { useAuth } from "@/contexts/AuthContext";
import { PollCard } from "@/components/PollCard";
import { motion } from "framer-motion";

type Filter = "active" | "ended" | "mine";

const Index = () => {
  const { polls } = usePolls();
  const { user } = useAuth();
  const [filter, setFilter] = useState<Filter>("active");

  const now = new Date();
  const filtered = polls.filter((p) => {
    if (filter === "active") return !p.resolved && p.deadline > now;
    if (filter === "ended") return p.resolved || p.deadline <= now;
    if (filter === "mine") return user && (p.creatorId === user.id || p.stakes.some((s) => s.userId === user.id));
    return true;
  });

  const totalStaked = polls.reduce((s, p) => s + p.stakes.reduce((a, st) => a + st.amount, 0), 0);

  return (
    <div className="container py-8 pb-24 sm:pb-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-foreground mb-3">
          Stake Your <span className="text-primary">Opinion</span>
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Create polls, stake STRK on your prediction, and win the pot. Gasless & social login — powered by Starkzap.
        </p>
        <div className="flex items-center justify-center gap-6 mt-5 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-primary" />{polls.length} polls</span>
          <span className="flex items-center gap-1.5"><TrendingUp className="h-4 w-4 text-secondary" />{totalStaked.toFixed(0)} STRK staked</span>
        </div>
      </motion.div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-6">
        {(["active", "ended", "mine"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
              filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "mine" ? "My Polls" : f}
          </button>
        ))}
      </div>

      {/* Poll grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((poll, i) => (
            <PollCard key={poll.id} poll={poll} index={i} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg mb-2">No polls found</p>
          <p className="text-sm">Be the first to create one!</p>
        </div>
      )}

      {/* Floating CTA */}
      <Link
        to="/create"
        className="fixed bottom-20 sm:bottom-8 right-6 h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center glow-orange-lg hover:scale-105 transition-transform z-40"
      >
        <Plus className="h-6 w-6" />
      </Link>
    </div>
  );
};

export default Index;
