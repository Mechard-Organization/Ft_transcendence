import { useState, useEffect } from "react";
import { validatePassword, validateEmail } from "../../../services/validate.service";
import { isAuthenticated } from "../access/authenticator";
import TwoFA from "./2fa";
import Footer from "../ts/Footer";

type UserStats = {
  id: number;
  username: string;
  mail: string;
  avatarUrl?: string;
  twofaEnabled?: boolean;
};

export default function UserSettings() {
  const [userStats, setUserStats] = useState<UserStats>({
    id: 0,
    username: "",
    mail: "",
    avatarUrl: "/uploads/profil/default.jpeg",
    twofaEnabled: false
  });

  const [username, setUsername] = useState("");
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchUser() {
      try {
        const auth = await isAuthenticated();
        if (!auth?.id) return;

        const res = await fetch("/api/getuser", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: auth.id }),
        });

        const user = await res.json();
        setUserStats(prev => ({
          ...prev,
          ...user,
          avatarUrl: user.avatarUrl || "/uploads/profil/default.jpeg"
        }));
        setUsername(user.username);
        setMail(user.mail);

      } catch (err) {
        console.error("Erreur récupération profil :", err);
      }
    }
    fetchUser();
  }, []);

  const handleFile = async (file: File) => {
    if (file.type !== "image/jpeg") return alert("Uniquement des fichiers .jpeg");
    if (file.size > 2 * 1024 * 1024) return alert("Max 2 Mo");

    const formData = new FormData();
    formData.append("avatars", file);
    formData.append("id", String(userStats.id));

    try {
      console.log("avatar ", formData);
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

  const updateUsername = async () => {
    if (!username || !userStats.id) return alert("Entrez un username valide");
    try {
      const res = await fetch("/api/updateUserUsername", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, id: userStats.id }),
      });
      if (!res.ok) return alert("Erreur");
      setUserStats(prev => ({ ...prev, username }));
      setUsername("");
    } catch (err) { console.error(err); }
  };

  const updatePassword = async () => {
    if (!password || !password2) return alert("Remplir tous les champs mot de passe");
    if (password !== password2) return alert("Les mots de passe ne correspondent pas");
    if (!validatePassword(password, userStats.username).ok) {
      return alert(validatePassword(password, userStats.username).reason);
    }

    try {
      const res = await fetch("/api/updateUserPassword", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, id: userStats.id }),
      });
      if (!res.ok) return alert("Erreur");
      setPassword("");
      setPassword2("");
    } catch (err) { console.error(err); }
  };

  const updateMail = async () => {
    if (!mail) return alert("Remplir le mail");
    if (!validateEmail(mail).ok) return alert(validateEmail(mail).reason);

    try {
      const res = await fetch("/api/updateUserMail", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mail, id: userStats.id }),
      });
      if (!res.ok) return alert("Erreur");
      setUserStats(prev => ({ ...prev, mail }));
      setMail("");
    } catch (err) { console.error(err); }
  };

  const eraseUser = async () => {
    //logout
    //changer la page
    //supprimer le user
    console.log("erase user clicked")
  }

  return (
  <div className="min-h-screen bg-[#FFF9E5] flex flex-col">
    <main className="flex-grow max-w-3xl mx-auto px-6 py-12 space-y-8">

      <div className="bg-white/90 rounded-3xl shadow-xl border-4 border-[#FEE96E] p-6 text-center">
        <h1 className="text-3xl font-bold text-[#8B5A3C] mb-6">
          Paramètres du profil
        </h1>

        <input
          type="file"
          id="fileInput"
          accept="image/*"
          hidden
          onChange={(e) => {
            if (e.target.files?.[0]) handleFile(e.target.files[0]);
          }}
        />

        <button
          onClick={() => document.getElementById("fileInput")?.click()}
          className="relative group"
        >
          <img
            src={userStats.avatarUrl}
            alt="Avatar"
            className="w-32 h-32 object-cover rounded-full border-4 border-[#FEE96E] mx-auto"
          />
          <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-sm">
            Modifier
          </div>
        </button>
      </div>
<div className="bg-white/90 rounded-3xl shadow-xl border-4 border-[#FEE96E] p-6">
  <h2 className="text-xl font-bold text-[#8B5A3C] mb-4 text-center">
    Nom d'utilisateur
  </h2>

  <div className="flex gap-3">
    <input
      type="text"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      className="flex-1 px-4 py-2 rounded-full border-2 border-[#FEE96E] bg-white"
    />
    <button
      onClick={updateUsername}
      className="px-6 py-2 rounded-full bg-[#FEE96E] text-[#8B5A3C] font-semibold hover:scale-105 transition"
    >
      Modifier
    </button>
  </div>
</div>
    <div className="">
<div className=" bg-white/90 rounded-3xl shadow-xl border-4 border-[#FEE96E] p-6">
  <h2 className="text-xl font-bold text-[#8B5A3C] mb-4 text-center">
    Mot de passe
  </h2>

  <div className="space-y-3">
    <input
      type="password"
      placeholder="Nouveau mot de passe"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="w-full px-4 py-2 rounded-full border-2 border-[#FEE96E]"
    />
    <input
      type="password"
      placeholder="Confirmer"
      value={password2}
      onChange={(e) => setPassword2(e.target.value)}
      className="w-full px-4 py-2 rounded-full border-2 border-[#FEE96E]"
    />
      <div className="flex items-center justify-center">
    <button
      onClick={updatePassword}
      className=" px-6 py-2 rounded-full bg-[#FEE96E] text-[#8B5A3C] font-semibold hover:scale-105 transition"
    >
      Modifier le mot de passe
    </button>
    </div>
    </div>
  </div>
</div>
<div className="bg-white/90 rounded-3xl shadow-xl border-4 border-[#FEE96E] p-6">
  <h2 className="text-xl font-bold text-[#8B5A3C] mb-4 text-center">
    Sécurité (2FA)
  </h2>

  <TwoFA
    userId={userStats.id}
    twofaEnabled={userStats.twofaEnabled ?? false}
    onEnable2FA={() => setUserStats(prev => ({ ...prev, twofaEnabled: true }))}
    onDisable2FA={() => setUserStats(prev => ({ ...prev, twofaEnabled: false }))}
  />
</div>
  <div className="flex items-center justify-center">
  <button onClick={eraseUser}
    className=" px-6 py-2 rounded-full bg-red-500 text-white font-semibold hover:bg-red-600 transition"
  >
    Supprimer le profil
  </button>
</div>
</main>
<Footer/>
</div>
  );
}
