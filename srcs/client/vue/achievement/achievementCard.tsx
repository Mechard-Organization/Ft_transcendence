import { Lock } from 'lucide-react';

type AchievementCardProps = {
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'Merguez';
};

export default function AchievementCard({ 
  title, 
  description, 
  icon, 
  unlocked, 
  rarity 
}: AchievementCardProps) {
  
  const rarityColors = {
    common: 'border-gray-400 bg-gray-50',
    rare: 'border-blue-400 bg-blue-50',
    epic: 'border-purple-400 bg-purple-50',
    legendary: 'border-yellow-400 bg-yellow-50',
    Merguez: 'border-yellow-400 bg-brown-50'

  };

  const rarityGlow = {
    common: '',
    rare: 'shadow-blue-200',
    epic: 'shadow-purple-200',
    legendary: 'shadow-yellow-200',
    Merguez: 'shadow-brwn-200'
  };

  return (
    <div 
      className={`
        relative rounded-2xl p-4 border-4 transition-all
        ${unlocked 
          ? `${rarityColors[rarity]} ${rarityGlow[rarity]} shadow-lg hover:scale-105` 
          : 'border-gray-300 bg-gray-100 opacity-50'
        }
      `}
    >
      {!unlocked && (
        <div className="absolute top-2 right-2">
          <Lock className="w-5 h-5 text-gray-500" />
        </div>
      )}

      <div className={`text-5xl mb-2 ${unlocked ? '' : 'grayscale'}`}>
        {icon}
      </div>

      <h4 className={`font-bold text-lg mb-1 ${unlocked ? 'text-[#8B5A3C]' : 'text-gray-500'}`}>
        {title}
      </h4>

      <p className={`text-sm ${unlocked ? 'text-[#A67C52]' : 'text-gray-400'}`}>
        {description}
      </p>

      {unlocked && (
        <div className="mt-2">
          <span className={`
            text-xs px-2 py-1 rounded-full font-semibold
            ${rarity === 'common' && 'bg-gray-200 text-gray-700'}
            ${rarity === 'rare' && 'bg-blue-200 text-blue-700'}
            ${rarity === 'epic' && 'bg-purple-200 text-purple-700'}
            ${rarity === 'legendary' && 'bg-yellow-200 text-yellow-700'}
            ${rarity === 'Merguez' && 'bg-[#6b1912] text-yellow-100'}
          `}>
            {rarity === 'common' && 'Commun'}
            {rarity === 'rare' && 'Rare'}
            {rarity === 'epic' && 'Épique'}
            {rarity === 'legendary' && 'Légendaire'}
            {rarity === 'Merguez' && 'Honteux'}
          </span>
        </div>
      )}
    </div>
  );
}