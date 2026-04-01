import { Link } from "react-router-dom";
import { Clock, Zap, TrendingUp } from "lucide-react";
import { Poll } from "@/types/poll";
import { motion } from "framer-motion";
import { useCountdown } from "@/hooks/useCountdown";

interface PollCardProps {
  poll: Poll;
  index: number;
}

export const PollCard: React.FC<PollCardProps> = ({ poll, index }) => {
  const totalStake = poll.stakes.reduce((s, st) => s + st.amount, 0);
  const option0Stake = poll.stakes.filter((s) => s.option === 0).reduce((s, st) => s + st.amount, 0);
  const option1Stake = poll.stakes.filter((s) => s.option === 1).reduce((s, st) => s + st.amount, 0);
  const pct0 = totalStake > 0 ? (option0Stake / totalStake) * 100 : 50;
  const pct1 = totalStake > 0 ? (option1Stake / totalStake) * 100 : 50;
  const isExpired = new Date() > poll.deadline;
  const countdown = useCountdown(poll.deadline);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link to={`/poll/${poll.id}`} className="block group">
        <div className={`rounded-xl border border-border/60 bg-card p-5 transition-all hover:border-primary/40 hover:glow-orange ${poll.resolved ? 'opacity-70' : ''}`}>
          {/* Status badge */}
          <div className="flex items-center justify-between mb-3">
            <span className={`text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full ${
              poll.resolved ? 'bg-muted text-muted-foreground' : isExpired ? 'bg-destructive/20 text-destructive' : 'bg-primary/15 text-primary'
            }`}>
              {poll.resolved ? "Resolved" : isExpired ? "Ended" : "Active"}
            </span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {poll.resolved ? "Closed" : isExpired ? "Expired" : countdown}
            </div>
          </div>

          {/* Question */}
          <h3 className="font-heading text-lg font-bold text-foreground mb-4 leading-snug group-hover:text-primary transition-colors">
            {poll.question}
          </h3>

          {/* Stake bars */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-primary font-medium truncate max-w-[45%]">{poll.options[0]}</span>
              <span className="text-secondary font-medium truncate max-w-[45%] text-right">{poll.options[1]}</span>
            </div>
            <div className="flex h-3 rounded-full overflow-hidden bg-muted">
              <div
                className="bg-primary transition-all duration-500 rounded-l-full"
                style={{ width: `${pct0}%` }}
              />
              <div
                className="bg-secondary transition-all duration-500 rounded-r-full"
                style={{ width: `${pct1}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{option0Stake.toFixed(1)} STRK ({pct0.toFixed(0)}%)</span>
              <span>{option1Stake.toFixed(1)} STRK ({pct1.toFixed(0)}%)</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/40">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{totalStake.toFixed(1)} STRK total</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-primary font-semibold">
              <Zap className="h-3.5 w-3.5" />
              Stake
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
