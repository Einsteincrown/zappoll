export interface Stake {
  userId: string;
  walletAddress: string;
  amount: number;
  option: 0 | 1;
  timestamp: Date;
}

export interface Poll {
  id: string;
  question: string;
  options: [string, string];
  deadline: Date;
  creatorId: string;
  creatorAddress: string;
  stakes: Stake[];
  resolved: boolean;
  winningOption?: 0 | 1;
  createdAt: Date;
}

export interface UserProfile {
  id: string;
  walletAddress: string;
  email?: string;
  loginMethod: 'email' | 'google' | 'twitter';
  strkBalance: number;
}
