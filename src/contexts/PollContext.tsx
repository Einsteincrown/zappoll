import React, { createContext, useContext, useState, useCallback } from "react";
import { Poll, Stake } from "@/types/poll";

interface PollContextType {
  polls: Poll[];
  createPoll: (question: string, options: [string, string], deadline: Date, creatorId: string, creatorAddress: string) => string;
  addStake: (pollId: string, userId: string, walletAddress: string, option: 0 | 1, amount: number) => void;
  resolvePoll: (pollId: string, winningOption: 0 | 1) => void;
  getPoll: (id: string) => Poll | undefined;
}

const PollContext = createContext<PollContextType>({} as PollContextType);

// Seed some demo polls
const now = new Date();
const seedPolls: Poll[] = [
  {
    id: "demo-1",
    question: "Will ETH surpass $5k before 2027?",
    options: ["Yes, moon 🚀", "No way 📉"],
    deadline: new Date(now.getTime() + 86400000 * 3),
    creatorId: "seed",
    creatorAddress: "0x1234...abcd",
    stakes: [
      { userId: "a", walletAddress: "0xa", amount: 25, option: 0, timestamp: new Date() },
      { userId: "b", walletAddress: "0xb", amount: 15, option: 1, timestamp: new Date() },
      { userId: "c", walletAddress: "0xc", amount: 10, option: 0, timestamp: new Date() },
    ],
    resolved: false,
    createdAt: new Date(now.getTime() - 3600000),
  },
  {
    id: "demo-2",
    question: "Best L2 for DeFi in 2026?",
    options: ["Starknet 🔷", "Other L2s"],
    deadline: new Date(now.getTime() + 86400000 * 7),
    creatorId: "seed",
    creatorAddress: "0x5678...efgh",
    stakes: [
      { userId: "d", walletAddress: "0xd", amount: 40, option: 0, timestamp: new Date() },
      { userId: "e", walletAddress: "0xe", amount: 20, option: 1, timestamp: new Date() },
    ],
    resolved: false,
    createdAt: new Date(now.getTime() - 7200000),
  },
  {
    id: "demo-3",
    question: "Will ZK proofs go mainstream by 2027?",
    options: ["Absolutely ✅", "Not yet ⏳"],
    deadline: new Date(now.getTime() - 3600000),
    creatorId: "seed",
    creatorAddress: "0x9abc...1234",
    stakes: [
      { userId: "f", walletAddress: "0xf", amount: 30, option: 0, timestamp: new Date() },
      { userId: "g", walletAddress: "0xg", amount: 45, option: 1, timestamp: new Date() },
    ],
    resolved: true,
    winningOption: 1,
    createdAt: new Date(now.getTime() - 86400000),
  },
];

export const PollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [polls, setPolls] = useState<Poll[]>(seedPolls);

  const createPoll = useCallback((question: string, options: [string, string], deadline: Date, creatorId: string, creatorAddress: string) => {
    const id = crypto.randomUUID();
    const poll: Poll = {
      id,
      question,
      options,
      deadline,
      creatorId,
      creatorAddress,
      stakes: [],
      resolved: false,
      createdAt: new Date(),
    };
    setPolls((prev) => [poll, ...prev]);
    return id;
  }, []);

  const addStake = useCallback((pollId: string, userId: string, walletAddress: string, option: 0 | 1, amount: number) => {
    const stake: Stake = { userId, walletAddress, amount, option, timestamp: new Date() };
    setPolls((prev) =>
      prev.map((p) => (p.id === pollId ? { ...p, stakes: [...p.stakes, stake] } : p))
    );
  }, []);

  const resolvePoll = useCallback((pollId: string, winningOption: 0 | 1) => {
    setPolls((prev) =>
      prev.map((p) => (p.id === pollId ? { ...p, resolved: true, winningOption } : p))
    );
  }, []);

  const getPoll = useCallback((id: string) => polls.find((p) => p.id === id), [polls]);

  return (
    <PollContext.Provider value={{ polls, createPoll, addStake, resolvePoll, getPoll }}>
      {children}
    </PollContext.Provider>
  );
};

export const usePolls = () => useContext(PollContext);
