import React, { useEffect, useState } from "react";
import Footer from "../ts/Footer";

type PlayerStats = {
  id: number;
  username: string;
  avatarUrl?: string;
  highScore: number;
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
};

export default function RankPage() {
  const [players, setPlayers] = useState<PlayerStats[]>([]);

    useEffect(() => {
    async function fetchPlayers() {
        try {
        const res = await fetch("/api/ranking");
        const json = await res.json();

        const data: PlayerStats[] = Array.isArray(json) ? json : [];
        console.log(data);

        setPlayers(data.map((user: any) => ({
          id: user.id,
          username: user.username,
          avatarUrl: user.avatarUrl ?? "/uploads/profil/default.jpeg",
          highScore: user.highScore,
          gamesPlayed: user.gamesPlayed,
          gamesWon: user.gamesWon,
          winRate: user.gamesWon / user.gamesPlayed * 100
        })));
        } catch (err) {
        console.error("Erreur fetch players:", err);
        }
    }
    fetchPlayers();
    }, []);

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col bg-[#FFF9E5]">
      <main className="max-w-6xl mx-auto px-5 py-8">
        <h1 className="text-4xl font-extrabold text-center text-[#8B5A3C] mb-12 tracking-wide">
          Classement des joueurs
        </h1>

        <div className="bg-white/95 rounded-3xl shadow-lg border-4 border-[#FEE96E] overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#FEE96E]">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-bold text-[#8B5A3C]">#</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-[#8B5A3C]">Avatar</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-[#8B5A3C]">Nom</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-[#8B5A3C]">Score</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-[#8B5A3C]">Victoires</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-[#8B5A3C]">Parties jouées</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-[#8B5A3C]">Win Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {players.map((player, idx) => (
                <tr
                  key={player.id}
                  className={`${
                    idx === 0
                      ? "bg-yellow-200 font-bold"
                      : idx === 1
                      ? "bg-yellow-100"
                      : idx === 2
                      ? "bg-yellow-50"
                      : ""
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">{idx + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img
                      src={player.avatarUrl || "/uploads/profil/default.jpeg"}
                      alt={player.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[#5A3E2B] font-medium">{player.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{player.highScore}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{player.gamesWon}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{player.gamesPlayed}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{player.winRate.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

    </div>
  );
}
