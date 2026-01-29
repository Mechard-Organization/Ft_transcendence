import { useEffect, useState } from 'react';
import { Trophy, Target, Clock } from 'lucide-react';
import Footer from '../ts/Footer';
import { isAuthenticated } from "../access/authenticator";

type UserStats = {
  id: number;
  username: string;
  mail: string;
  avatarUrl?: string;
  winRate: number;
  gamesPlayed: number;
  gamesWon: number,
  highScore: number
};

export default function SettingsPage() {
  const [profilePic, setProfilePic] = useState(1);
  const [userStats, setUserStats] = useState<UserStats>({
    id: 0,
    username: "",
    mail: "",
    avatarUrl: "/uploads/profil/default.jpeg", 
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
          avatarUrl: userData.avatarUrl,
          winRate: 0,
          gamesPlayed: 0,
          gamesWon: 0,
          highScore: 0
        });
        if (!userData.avatarUrl) setProfilePic(1);
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

  console.log("poulet : ", formData);

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


  return (
    <div>
        <p>settings</p>
    </div>
  );
}
