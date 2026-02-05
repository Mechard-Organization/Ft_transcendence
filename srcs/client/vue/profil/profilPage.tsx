import { useEffect, useState } from "react";
import { Trophy, Target, UserRoundCheck, UserRoundPlus, UserRoundMinus, Settings } from "lucide-react";
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

type AdminUser = {
  id: number;
  username: string;
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
    admin: false
  });

  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [newAdminName, setNewAdminName] = useState("");

  useEffect(() => {
    async function fetchUser() {
      const auth = await isAuthenticated();
      if (!auth?.id) return;

      const resUser = await fetch("/api/getuser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: auth.id })
      });
      const data = await resUser.json();

      setUserStats({
        id: data.id,
        username: data.username,
        mail: data.mail,
        avatarUrl: data.avatarUrl ?? "./uploads/profil/default.jpeg",
        winRate: data.winRate ?? 0,
        gamesPlayed: data.gamesPlayed ?? 0,
        gamesWon: data.gamesWon ?? 0,
        highScore: data.highScore ?? 0,
        admin: data.admin ?? false
      });

      if (data.admin) loadAdmins();
    }
    fetchUser();
  }, []);

  async function loadAdmins() {
    try {
      const res = await fetch("/api/users");
      if (!res.ok) return;
      const allUsers = await res.json();
      const admins = allUsers.filter((u: any) => u.admin);
      setAdmins(admins);
    } catch (err) {
      console.error("Erreur récupération admins:", err);
    }
  }

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
    const res = await fetch("/api/users/me/avatar", { method: "POST", body: formData });
    const data = await res.json();

    setUserStats(prev => ({ ...prev, avatarUrl: data.avatarUrl }));
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    window.location.href = "/Login";
  };

  const addAdmin = async () => {
    if (!newAdminName.trim()) return;

    try {
      const resUser = await fetch("/api/getuserbyname", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newAdminName })
      });
      const user = await resUser.json();
      if (!user?.id) return alert("Utilisateur introuvable");

      await fetch("/api/updateUserAdmin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, status: true })
      });

      setNewAdminName("");
      loadAdmins();
    } catch (err) {
      console.error(err);
    }
  };

  const removeAdmin = async (id: number) => {
    if (id === userStats.id) return alert("Vous ne pouvez pas vous supprimer vous-même");
    await fetch("/api/updateUserAdmin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: false })
    });
    loadAdmins();
  };

  return (
    <div className="flex flex-col min-h-215 bg-[#FFF9E5] relative">
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-6 pt-14 pb-12">

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
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-4xl font-bold text-[#8B5A3C]">{userStats.username}</h1>
              <p className="text-[#A67C52] mt-1">{userStats.mail}</p>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => window.location.href = "/settings"} className="p-4 rounded-full bg-[#FEE96E] hover:scale-105 transition"><Settings className="w-6 h-6 text-[#8B5A3C]"/></button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <div className="bg-white/90 rounded-3xl p-4 shadow-xl border-4 border-[#FEE96E] flex flex-col items-center">
              <div className="bg-[#FEE96E] rounded-full p-4 mb-4">
                <Target className="w-6 h-6 text-[#8B5A3C]" />
              </div>
              <h3 className="text-xl text-[#8B5A3C] mb-2">Parties jouées</h3>
              <p className="text-5xl font-bold text-[#8B5A3C]">{userStats.gamesPlayed}</p>
            </div>
            <div className="bg-white/90 rounded-3xl p-6 shadow-xl border-4 border-[#FEE96E] flex flex-col items-center">
              <div className="bg-[#FEE96E] rounded-full p-4 mb-4">
                <Trophy className="w-6 h-6 text-[#8B5A3C]" />
              </div>
              <h3 className="text-xl text-[#8B5A3C] mb-2">Victoires</h3>
              <p className="text-5xl font-bold text-[#8B5A3C]">{userStats.gamesWon}</p>
            </div>
            <div className="bg-white/90 rounded-3xl p-6 shadow-xl border-4 border-[#FEE96E] flex flex-col items-center">
              <div className="bg-[#FEE96E] rounded-full p-4 mb-4">
                <Trophy className="w-6 h-6 text-[#8B5A3C]" />
              </div>
              <h3 className="text-xl text-[#8B5A3C] mb-2">Meilleur score</h3>
              <p className="text-5xl font-bold text-[#8B5A3C]">{userStats.highScore}</p>
            </div>
          </div>

          {/* Admin Panel */}
          {userStats.admin == true && (
            <div className="mt-12 bg-white/90 rounded-3xl shadow-xl border-4 border-[#FEE96E] p-4">
              <h3 className="text-2xl text-[#8B5A3C] mb-4 flex items-center gap-2">
                <UserRoundCheck className="w-6 h-6" />
                Admin Panel
              </h3>

              {/* Ajouter un admin */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Nom d'utilisateur"
                  value={newAdminName}
                  onChange={e => setNewAdminName(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-full border-2 border-[#FEE96E]"
                />
                <button onClick={addAdmin} className="px-4 py-2 bg-[#FEE96E] text-[#8B5A3C] rounded-full hover:scale-105 transition flex items-center gap-2">
                  <UserRoundPlus className="w-5 h-5" /> Ajouter
                </button>
              </div>

              {/* Liste des admins */}
              <ul className="space-y-2 text-[#8B5A3C]">
                {admins.map(a => (
                  <li key={a.id} className="flex justify-between items-center bg-[#FFF9E5] px-4 py-2 rounded-full">
                    {a.username}
                    <button onClick={() => removeAdmin(a.id)} className="p-1 rounded-full hover:bg-red-200">
                      <UserRoundMinus className="w-4 h-4" />
                    </button>
                  </li>
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
