import { useEffect, useState } from "react";
import { Trophy, Target, UserRoundCheck } from "lucide-react";
import Footer from "../ts/Footer";
import { isAuthenticated } from "../access/authenticator";

type UserStats = {
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
    highScore: 0,
    admin: false,
  });
  const [admins, setAdmins] = useState<UserStats[]>([]);

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
          highScore: userData.highScore ?? 0,
          admin: userData.admin ?? false,
        });

        // Si admin, récupérer la liste des admins
        if (userData.admin) {
          const resAdmins = await fetch("/api/users/admins");
          const dataAdmins = await resAdmins.json();
          setAdmins(dataAdmins);
        }
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
      setUserStats(prev => ({ ...prev, avatarUrl: data.avatarUrl }));
    } catch (err) {
      console.error("Erreur upload avatar", err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FFF9E5]">
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-6 pt-16 pb-12">
          {/* Profil utilisateur */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border-4 border-[#FEE96E] p-8 flex flex-col sm:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="relative">
              <input
                type="file"
                id="fileInput"
                accept="image/*"
                hidden
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFile(e.target.files[0]);
                }}
              />
              <button onClick={() => document.getElementById("fileInput")?.click()}>
                <img
                  src={userStats.avatarUrl}
                  alt="avatar"
                  className="w-32 h-32 rounded-full object-cover border-4 border-[#FEE96E]"
                />
              </button>
            </div>

            {/* Infos */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-4xl font-bold text-[#8B5A3C]">{userStats.username}</h1>
              <p className="text-[#A67C52] mt-1">{userStats.mail}</p>

              {/* Section admin sous le pseudo */}
              {userStats.admin && (
                <div className="mt-4 flex items-center gap-2 text-[#8B5A3C]">
                  <UserRoundCheck className="w-6 h-6" />
                  <span>Admin</span>
                </div>
              )}
            </div>

            {/* Paramètres */}
            <div className="flex flex-col gap-4">
              <button
                onClick={() => window.location.href = "/settings"}
                className="p-4 rounded-full bg-[#FEE96E] hover:scale-105 transition"
              >
                ⚙️
              </button>
              {userStats.admin && (
                <button
                  onClick={() => window.location.href = "/admin"}
                  className="p-4 rounded-full bg-[#FEE96E] hover:scale-105 transition"
                >
                  ⚙️ Admin
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            <div className="bg-white/90 rounded-3xl p-6 shadow-xl border-4 border-[#FEE96E] flex flex-col items-center">
              <div className="bg-[#FEE96E] rounded-full p-4 mb-4">
                <Target className="w-8 h-8 text-[#8B5A3C]" />
              </div>
              <h3 className="text-xl text-[#8B5A3C] mb-2">Parties jouées</h3>
              <p className="text-5xl font-bold text-[#8B5A3C]">{userStats.gamesPlayed}</p>
            </div>

            <div className="bg-white/90 rounded-3xl p-6 shadow-xl border-4 border-[#FEE96E] flex flex-col items-center">
              <div className="bg-[#FEE96E] rounded-full p-4 mb-4">
                <Trophy className="w-8 h-8 text-[#8B5A3C]" />
              </div>
              <h3 className="text-xl text-[#8B5A3C] mb-2">Victoires</h3>
              <p className="text-5xl font-bold text-[#8B5A3C]">{userStats.gamesWon}</p>
            </div>

            <div className="bg-white/90 rounded-3xl p-6 shadow-xl border-4 border-[#FEE96E] flex flex-col items-center sm:col-span-2 lg:col-span-1">
              <div className="bg-[#FEE96E] rounded-full p-4 mb-4">
                <Trophy className="w-8 h-8 text-[#8B5A3C]" />
              </div>
              <h3 className="text-xl text-[#8B5A3C] mb-2">Meilleur score</h3>
              <p className="text-5xl font-bold text-[#8B5A3C]">{userStats.highScore}</p>
            </div>
          </div>

          {/* Liste des admins */}
          {userStats.admin && admins.length > 0 && (
            <div className="mt-8 bg-white/90 p-6 rounded-3xl shadow-xl border-4 border-[#FEE96E]">
              <h3 className="text-[#8B5A3C] text-2xl mb-4 flex items-center gap-2">
                <UserRoundCheck className="w-6 h-6" />
                Liste des admins
              </h3>
              <ul className="list-disc list-inside text-[#8B5A3C]">
                {admins.map(a => (
                  <li key={a.id}>{a.username}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>

      <footer className="w-full">
        <Footer />
      </footer>
    </div>
  );
}
