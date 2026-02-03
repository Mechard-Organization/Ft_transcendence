import { useEffect, useState } from 'react';
import { Trophy, Target, Clock } from 'lucide-react';
import Footer from '../ts/Footer';
import { isAuthenticated } from "../access/authenticator";
import { Link, useLocation } from "react-router-dom";

type UserStats = {
  id: number;
  username: string;
  mail: string;
  avatarUrl?: string;
  winRate: number;
  gamesPlayed: number;
  gamesWon: number,
  highScore: number;
   twofaEnabled?: boolean;
};

export default function ProfilePage() {
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

  
  const [userStats, setUserStats] = useState<UserStats>({
    id: 0,
    username: "",
    mail: "",
    avatarUrl: "./uploads/profil/default.jpeg", 
    winRate: 0,
    gamesPlayed: 0,
    gamesWon: 0,
    highScore: 0
  });

  useEffect(() => {
    async function fetchUser() {
      try {
        const auth = await isAuthenticated();
        if (!auth?.id) return;

        const resUser = await fetch("/api/getuser", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: auth.id }),
        });
        const userData = await resUser.json();

        setUserStats({
          id: userData.id,
          username: userData.username,
          mail: userData.mail,
          avatarUrl: userData.avatarUrl ?? "./uploads/profil/default.jpeg",
          winRate: userData.winRate ?? 0,
          gamesPlayed: userData.gamesPlayed ?? 0,
          gamesWon: userData.gamesWon ?? 0,
          highScore: userData.highScore ?? 0
        });
        console.log("userData: ", userStats)
      } catch (err) {
        console.error("Erreur récupération profil :", err);
      }
    }
    fetchUser();
  }, []);

const handleFile = async (file: File) => {
  if (file.type !== "image/jpeg") {
    alert("Uniquement des fichiers .jpeg");
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    alert("Max 2 Mo");
    return;
  }

  const formData = new FormData();
  formData.append("avatars", file);
  formData.append("id", String(userStats.id));
  try {
    const res = await fetch("/api/users/me/avatar", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    setUserStats(prev => ({
      ...prev,
      avatarUrl: data.avatarUrl,
    }));

  } catch (err) {
    console.error("Erreur upload avatar", err);
  }
};

const handlelogout = async () => {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include", // 🔑 OBLIGATOIRE
  });

  window.location.href = "/login";
};


  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col p-8">
        <div className="mb-8 max-w-4xl w-full mx-auto text-center">
          <input type="file" id="fileInput" accept="image/*" hidden onChange={(e) => { if (e.target.files && e.target.files[0]) { handleFile(e.target.files[0]); }}}/>
          <button onClick={() => document.getElementById("fileInput")?.click()} className="inline-block cursor-pointer">
            <img
              src={userStats.avatarUrl}
              alt="personnage profil"
              className="w-25 h-25 object-cover rounded-full border-4 border-[#FEE96E]"
            />
          </button>
                    
          <h1 className="text-4xl text-[#8B5A3C] mt-4">{userStats.username}</h1>
        </div>
      <button
        onClick={() => window.location.href = "/settings"}
        className="inline-block  text-center cursor-pointer w-10 h-10 object-cover rounded-full border-7 border-[#FEE96E] ">
        <p>⚙️</p>
      </button>
         

      <div className="max-w-4xl w-full mx-auto">
        <br/>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border-4 border-[#FEE96E]">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-[#FEE96E] rounded-full p-4">
                <Target className="w-8 h-8 text-[#8B5A3C]" />
              </div>
              <h3 className="text-2xl text-[#8B5A3C]">Parties jouées</h3>
            </div>
            <p className="text-5xl text-center text-[#8B5A3C]">{userStats.gamesPlayed}</p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border-4 border-[#FEE96E]">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-[#FEE96E] rounded-full p-4">
                <Trophy className="w-8 h-8 text-[#8B5A3C]" />
              </div>
              <h3 className="text-2xl text-[#8B5A3C]">Victoires</h3>
            </div>
            <p className="text-5xl text-center text-[#8B5A3C]">{userStats.gamesWon}</p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border-4 border-[#FEE96E]">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-[#FEE96E] rounded-full p-4">
                <Trophy className="w-8 h-8 text-[#8B5A3C]" />
              </div>
              <h3 className="text-2xl text-[#8B5A3C]">Meilleur score</h3>
            </div>
            <p className="text-5xl text-center text-[#8B5A3C]">{userStats.highScore}</p>
          </div>

        </div>
      </div>
        <Footer />
    </div>
  );
}
