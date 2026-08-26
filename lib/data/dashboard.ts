import { assets } from "@/lib/assets";

export type RecentWinner = {
  username: string;
  avatar: string;
  multiplier: number;
  amount: number;
};

export type LeaderboardRow = {
  rank: number;
  username: string;
  avatar: string;
  amount: number;
};

export type TournamentRow = {
  title: string;
  prize: number;
  status: string;
  avatar: string;
};

export const recentWinners: RecentWinner[] = [
  { username: "JetSetter", avatar: assets.avatars.a9, multiplier: 2.34, amount: 5230 },
  { username: "CryptoKing", avatar: assets.avatars.a22, multiplier: 4.12, amount: 8120 },
  { username: "QueenBee", avatar: assets.avatars.a51, multiplier: 1.76, amount: 2480 },
  { username: "HighRoller", avatar: assets.avatars.a75, multiplier: 6.91, amount: 12920 },
  { username: "LuckyPlayer", avatar: assets.avatars.a96, multiplier: 3.75, amount: 10420 },
];

export const leaderboardRows: LeaderboardRow[] = [
  { rank: 1, username: "SkyHigh", avatar: assets.avatars.a9, amount: 24850 },
  { rank: 2, username: "CryptoKing", avatar: assets.avatars.a22, amount: 18420 },
  { rank: 3, username: "HighRoller", avatar: assets.avatars.a75, amount: 15230 },
  { rank: 4, username: "QueenBee", avatar: assets.avatars.a51, amount: 11520 },
  { rank: 5, username: "JackPot", avatar: assets.avatars.a96, amount: 9810 },
];

export const tournamentRows: TournamentRow[] = [
  {
    title: "Daily Drop",
    prize: 5000,
    status: "Ends in 04:12:34",
    avatar: assets.avatars.a22,
  },
  {
    title: "High Roller Battle",
    prize: 15000,
    status: "Ends in 12:12:34",
    avatar: assets.avatars.a75,
  },
  {
    title: "Weekend Showdown",
    prize: 25000,
    status: "Starts in 1d 04:12:34",
    avatar: assets.avatars.a51,
  },
];
