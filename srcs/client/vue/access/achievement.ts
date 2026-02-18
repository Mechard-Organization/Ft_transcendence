
export type UserStats = {
  id: number;
  username: string;
  mail: string;
  avatarUrl?: string;
  winRate: number;
  gamesPlayed: number;
  gamesWon: number;
  highScore: number;
  admin?: boolean;
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (stats: UserStats) => boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'Merguez';
};

export const achievements: Achievement[] = [
  {
    id: 'first_win',
    title: 'Première Victoire',
    description: 'Remporter votre première partie',
    icon: '',
    condition: (stats) => stats.gamesWon >= 1,
    rarity: 'common'
  },
  {
    id: 'veteran',
    title: 'Vétéran',
    description: 'Jouer 10 parties',
    icon: '',
    condition: (stats) => stats.gamesPlayed >= 10,
    rarity: 'common'
  },
  {
    id: 'champion',
    title: 'Champion',
    description: 'Remporter 5 victoires',
    icon: '',
    condition: (stats) => stats.gamesWon >= 5,
    rarity: 'rare'
  },
  {
    id: 'win_streak',
    title: 'Série Victorieuse',
    description: 'Avoir un taux de victoire supérieur à 75%',
    icon: '',
    condition: (stats) => stats.winRate >= 0.75 && stats.gamesPlayed >= 5,
    rarity: 'epic'
  },
  {
    id: 'high_scorer',
    title: 'Score Parfait',
    description: 'Atteindre un score de 3',
    icon: '',
    condition: (stats) => stats.highScore >= 3,
    rarity: 'rare'
  },
  {
    id: 'master',
    title: 'Maître Absolu',
    description: 'Remporter 20 victoires',
    icon: '',
    condition: (stats) => stats.gamesWon >= 20,
    rarity: 'legendary'
  },
    {
    id: 'master',
    title: 'Meguez',
    description: 'Perdre 5 Parties',
    icon: '',
    condition: (stats) => (stats.gamesPlayed - stats.gamesWon) >= 5,
    rarity: 'Merguez'
  },
    {
    id: 'master',
    title: 'Grosse Meguez',
    description: 'Perdre 10 Parties',
    icon: '',
    condition: (stats) => (stats.gamesPlayed - stats.gamesWon) >= 10,
    rarity: 'Merguez'
  }
];