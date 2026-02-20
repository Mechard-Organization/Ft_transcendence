import Footer from "../ts/Footer";
import { useParams } from "react-router-dom";
import React, { useEffect, useState, useRef } from "react";
import { isAuthenticated } from "../access/authenticator";
import AchievementCard from "../achievement/achievementCard";
import { Achievement, achievements } from "../achievement/achievement";
import { Trophy, Target, Settings, Clock } from "lucide-react";

/* =====================
   TYPES
===================== */
type UserStats = {
  id: number;
  username: string;
  mail: string;
  avatarUrl?: string;
  winRate: number;
  gamesPlayed: number;
  gamesWon: number;
  highScore: number;
  twofaEnabled?: boolean;
  connected: boolean;
};

const ProfilePage: React.FC = () => {
  const wsRef = useRef<WebSocket | null>(null);
  const { id } = useParams<{ id: string }>();
  const userId: number = Number(id);

  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isMe, setIsMe] = useState<boolean>(false);

  if (!userId || Number.isNaN(userId)) {
    return <p>Utilisateur invalide</p>;
  }



  useEffect((): void => {
    const fetchUser = async (): Promise<void> => {
      try {
        const res: Response = await fetch("/api/getuser", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: userId }),
        });

        if (!res.ok) throw new Error("User not found");

        const data: UserStats = await res.json();

        const resNum = await fetch("/api/numMatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name_player: data.username })
      });
      const dataNum = await resNum.json();

      const resWin = await fetch("/api/numWinMatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name_player: data.username })
      });
      const dataWin = await resWin.json();

      const resHight = await fetch("/api/highScoreMatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name_player: data.username })
      });
      const dataHight = await resHight.json();

      setUserStats({
        id: data.id,
        username: data.username,
        mail: data.mail,
        avatarUrl: data.avatarUrl ?? "/uploads/profil/default.jpeg",
        winRate: dataWin.Win / dataNum.Match,
        gamesPlayed: dataNum.Match,
        gamesWon: dataWin.Win,
        highScore: dataHight.max_score,
        connected: data.connected
      });
      } catch (error) {
        console.error("Erreur récupération profil :", error);
      }
    };
    fetchUser();
  }, [userId]);

  useEffect((): void => {
    const checkMe = async (): Promise<void> => {
      const auth = await isAuthenticated();
      setIsMe(auth?.id === userId);
    };

    checkMe();
  }, [userId]);

  const handleFile = async (file: File): Promise<void> => {
    if (!isMe) return;

    if (file.type !== "image/jpeg") {
      alert("Uniquement des fichiers .jpeg");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Max 2 Mo");
      return;
    }

    const formData: FormData = new FormData();
    formData.append("avatars", file);
    formData.append("id", String(userId));

    try {
      const res: Response = await fetch("/api/users/me/avatar", {
        method: "POST",
        body: formData,
      });

      const data: { avatarUrl: string } = await res.json();

      setUserStats((prev) =>
        prev ? { ...prev, avatarUrl: data.avatarUrl } : prev
      );
    } catch (error) {
      console.error("Erreur upload avatar", error);
    }
  };

  useEffect(() => {
    const ws = new WebSocket(`/ws/`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ WebSocket connecté (friendProfile)");
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === "user_status_changed" && message.data.userId === userId) {
          setUserStats(prev =>
            prev ? { ...prev, connected: message.data.connected } : prev
          );
        }
        if (message.type === "new_avatar" && message.data.userId === userId) {
          setUserStats(prev =>
            prev ? { ...prev, avatarUrl: message.data.avatarUrl } : prev
          );
        }
      } catch (err) {
        console.error("Erreur WS:", err);
      }
    };

    ws.onclose = () => {
      console.log("❌ WebSocket fermé (friendProfile)");
    };

    return () => ws.close();
  }, [userId]);



  if (!userStats) {
    return <p>Chargement...</p>;
  }

    const unlockedAchievements = achievements.filter(achievement =>
    achievement.condition(userStats)
  );

  const totalAchievements = achievements.length;
  const progressPercentage = (unlockedAchievements.length / totalAchievements) * 100;



  return (
    <div className="flex-1 min-h-[calc(100vh-8rem)] flex-col">
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-6 pt-8 pb-5">

          {/* Profil */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border-4 border-[#FEE96E] p-6 flex flex-col sm:flex-row items-center gap-8">
            <div className="relative">
              <input
                type="file"
                id="fileInput"
                accept="image/*"
                hidden
                onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
              />
              <button onClick={() => document.getElementById("fileInput")?.click()}>
                <img src={userStats.avatarUrl} alt="avatar" className="w-32 h-32 rounded-full object-cover border-4 border-[#FEE96E]" />
              </button>
            <div
                  className={`w-5 h-5 rounded-full border-4 border-white flex items-center justify-center ${
                    userStats.connected
                      ? "bg-green-500 shadow-lg shadow-green-500/50"
                      : "bg-red-500 shadow-lg shadow-red-500/50"}`}title={userStats.connected ? "En ligne" : "Hors ligne"}/>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-4xl font-bold text-[#8B5A3C]">{userStats.username}</h1>
              <p className="text-[#A67C52] mt-1">{userStats.mail}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
            <div className="bg-white/90 rounded-3xl p-4 shadow-xl border-4 border-[#FEE96E] flex flex-col items-center">
              <div className="bg-[#FEE96E] rounded-full p-4 mb-4">
                <Target className="w-6 h-6 text-[#8B5A3C]" />
              </div>
              <h3 className="text-xl text-[#8B5A3C] mb-2">Parties jouées</h3>
              <p className="text-5xl font-bold text-[#8B5A3C]">{Math.round(userStats.gamesPlayed)}</p>
            </div>
            <div className="bg-white/90 rounded-3xl p-6 shadow-xl border-4 border-[#FEE96E] flex flex-col items-center">
              <div className="bg-[#FEE96E] rounded-full p-4 mb-4">
                <Trophy className="w-6 h-6 text-[#8B5A3C]" />
              </div>
              <h3 className="text-xl text-[#8B5A3C] mb-2">Victoires</h3>
              <p className="text-5xl font-bold text-[#8B5A3C]">{Math.round(userStats.gamesWon)}</p>
            </div>
            <div className="bg-white/90 rounded-3xl p-6 shadow-xl border-4 border-[#FEE96E] flex flex-col items-center">
              <div className="bg-[#FEE96E] rounded-full p-4 mb-4">
                <Trophy className="w-6 h-6 text-[#8B5A3C]" />
              </div>
              <h3 className="text-xl text-[#8B5A3C] mb-2">Meilleur Score</h3>
              <p className="text-5xl font-bold text-[#8B5A3C]">{Math.round(userStats.highScore)}</p>
            </div>
          </div>

          {/* Section Achievements */}
          <div className="mt-10 bg-white/90 rounded-3xl p-6 shadow-xl border-4 border-[#FEE96E]">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-[#8B5A3C] flex items-center gap-3">
                <Trophy className="w-8 h-8" />
                Achievements
              </h2>
              <div className="text-right">
                <p className="text-2xl font-bold text-[#8B5A3C]">
                  {unlockedAchievements.length} / {totalAchievements}
                </p>
                <p className="text-sm text-[#A67C52]">
                  {Math.round(progressPercentage)}% complété
                </p>
              </div>
            </div>

            {/* Barre de progression */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
              <div
                className="bg-gradient-to-r from-[#FEE96E] to-[#FFD700] h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* Grille d'achievements */}
            {achievements.length === 0 ? (
              <p className="text-center text-[#A67C52] py-8">
                Aucun achievement disponible
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map(achievement => {
                  const unlocked = achievement.condition(userStats);
                  return (
                    <AchievementCard
                      key={achievement.id}
                      title={achievement.title}
                      description={achievement.description}
                      icon={achievement.icon}
                      unlocked={unlocked}
                      rarity={achievement.rarity}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;

type StatCardProps = {
  title: string;
  value: number | string;
  icon: JSX.Element;
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
}) => (
  <div className="bg-white/90 rounded-3xl p-8 shadow-xl border-4 border-[#FEE96E]">
    <div className="flex items-center gap-4 mb-4">
      <div className="bg-[#FEE96E] rounded-full p-4 text-[#8B5A3C]">
        {icon}
      </div>
      <h3 className="text-2xl text-[#8B5A3C]">{title}</h3>
    </div>
    <p className="text-5xl text-center text-[#8B5A3C]">{value}</p>
  </div>
);
