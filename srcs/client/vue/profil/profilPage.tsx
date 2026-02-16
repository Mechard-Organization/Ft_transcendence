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

type MatchStats = {
  id: number;
  date: number;
  my_username: string;
  my_score: number;
  adv_username: string;
  adv_score: number;
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
    avatarUrl: "/uploads/profil/default.jpeg",
    winRate: 0,
    gamesPlayed: 0,
    gamesWon: 0,
    highScore: 0,
    admin: false
  });

  const [matchs, setMatchs] = useState<MatchStats[]>([]);

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
        admin: data.admin ?? false
      });


      const resmatchs = await fetch("/api/getMatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name_player: data.username })
      });
      const dataMatchs = await resmatchs.json();
      console.log(dataMatchs);
      setMatchs(
        dataMatchs.map((match:any) => {
          if (match.name_player1 === data.username)
          {
            return {
              id: match.id_match,
              date: match.date,
              my_username: match.name_player1,
              adv_username: match.name_player2,
              my_score: match.score1,
              adv_score: match.score2
            };
          }
          else
          {
            return {
              id: match.id_match,
              date: match.date,
              my_username: match.name_player2,
              adv_username: match.name_player1,
              my_score: match.score2,
              adv_score: match.score1
            };
          }
        }),
      );
    }
    fetchUser();
  }, []);


  useEffect(() => {
    console.log("userStats mis à jour :", userStats);
  }, [userStats]);

  useEffect(() => {
    console.log("matchs mis à jour :", matchs);
  }, [matchs]);

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



return (
    <div className="flex flex-col">
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
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-4xl font-bold text-[#8B5A3C]">{userStats.username}</h1>
              <p className="text-[#A67C52] mt-1">{userStats.mail}</p>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => window.location.href = "/settings"} className="p-4 rounded-full bg-[#FEE96E] hover:scale-105 transition">
                <Settings className="w-6 h-6 text-[#8B5A3C]"/>
              </button>
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

          {/* Tableau scrollable */}
          <div className="mt-10 bg-white/95 rounded-3xl shadow-lg border-4 border-[#FEE96E] h-70 flex flex-col overflow-hidden">
            <div className="overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#FEE96E] sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-bold text-[#8B5A3C]">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-[#8B5A3C]">Adversaire</th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-[#8B5A3C]">Score</th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-[#8B5A3C]">Résultat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-[#8B5A3C]">
                  {matchs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center font-medium">Aucune partie jouée</td>
                    </tr>
                  ) : (
                    matchs.map(match => {
                      const isWin = match.my_score > match.adv_score;
                      return (
                        <tr key={match.id} className={isWin ? "bg-[#C3F99A]" : "bg-[#F9D09A]"}>
                          <td className="px-6 py-4">{new Date(match.date).toLocaleDateString()}</td>
                          <td className="px-6 py-4">{match.adv_username}</td>
                          <td className="px-6 py-4">{Math.round(match.my_score)} - {Math.round(match.adv_score)}</td>
                          <td className="px-6 py-4 font-bold">{isWin ? "Victoire" : "Défaite"}</td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}