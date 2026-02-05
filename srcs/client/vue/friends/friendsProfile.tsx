import React, { useEffect, useState } from "react";
import { Trophy, Target, Clock } from "lucide-react";
import Footer from "../ts/Footer";
import { isAuthenticated } from "../access/authenticator";
import { useParams } from "react-router-dom";

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
};

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const userId: number = Number(3);

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

        setUserStats({
          id: data.id,
          username: data.username,
          mail: data.mail,
          avatarUrl: data.avatarUrl ?? "./uploads/profil/default.jpeg",
          winRate: data.winRate ?? 0,
          gamesPlayed: data.gamesPlayed ?? 0,
          gamesWon: data.gamesWon ?? 0,
          highScore: data.highScore ?? 0,
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

  if (!userStats) {
    return <p>Chargement...</p>;
  }

  return (
    <div className="flex flex-col min-h-215 relative">
      <div className=" mb-8 max-w-4xl w-full mx-auto text-center">
        {isMe && (
          <input
            type="file"
            id="fileInput"
            accept="image/*"
            hidden
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />
        )}

        <button
          onClick={() =>
            isMe && document.getElementById("fileInput")?.click()
          }
          className="flex items-center justify-center inline-block cursor-pointer"
        >
          <img
            src={userStats.avatarUrl}
            alt="avatar profil"
            className="w-25 h-25 object-cover rounded-full border-4 border-[#FEE96E]"
          />
        </button>

        <h1 className="text-4xl text-[#8B5A3C] mt-4">
          {userStats.username}
        </h1>
      </div>

      <div className="max-w-4xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title="Parties jouées"
          value={userStats.gamesPlayed}
          icon={<Target className="w-8 h-8" />}
        />
        <StatCard
          title="Victoires"
          value={userStats.gamesWon}
          icon={<Trophy className="w-8 h-8" />}
        />
        <StatCard
          title="Meilleur score"
          value={userStats.highScore}
          icon={<Trophy className="w-8 h-8" />}
        />
      </div>

      <Footer />
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
