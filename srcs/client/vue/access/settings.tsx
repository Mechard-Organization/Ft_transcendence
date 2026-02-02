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
        method: "POST",
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
        method: "POST",
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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mail, id: userStats.id }),
      });
      if (!res.ok) return alert("Erreur");
      setUserStats(prev => ({ ...prev, mail }));
      setMail("");
    } catch (err) { console.error(err); }
  };

  return (
    <main id="mainContent">
      <br></br>
      <div className="mb-8 max-w-4xl w-full mx-auto text-center">
        <input
          type="file"
          id="fileInput"
          accept="image/*"
          hidden
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
          }}
        />
        <button
          onClick={() => document.getElementById("fileInput")?.click()}
          className="inline-block cursor-pointer"
        >
          <img
            src={userStats.avatarUrl}
            alt="Avatar"
            className="w-25 h-25 object-cover rounded-full border-4 border-[#FEE96E]"
          />
        </button>
      </div>

      {/* Composant 2FA */}
     

      {/* Username */}
      <div className="form-group w-full text-center mt-4">
        <input
          type="text"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mx-auto block flex-1 px-6 py-3  text-center rounded-full border-2 border-[#FEE96E] bg-white/70"
        />
        <button onClick={updateUsername} className="px-6 py-3 mt-2 rounded-full border-2 border-[#FEE96E] bg-[#FEE96E]">
          Modifier Username
        </button>
      </div>

      {/* Password */}
      <div className="form-group w-full text-center mt-4">
        <input
          type="password"
          placeholder="Nouveau mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="flex-1 px-6 py-3  text-center rounded-full border-2 border-[#FEE96E] bg-white/70"
        />
        <input
          type="password"
          placeholder="Confirmer mot de passe"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          className="flex-1 px-6 py-3  text-center rounded-full border-2 border-[#FEE96E] mt-2 bg-white/70"
        />
        <button onClick={updatePassword} className="px-6 py-3 mt-2 rounded-full border-2 border-[#FEE96E] bg-[#FEE96E]">
          Modifier Password
        </button>
      </div>

      {/* Mail */}
      <div className="form-group w-full text-center mt-4">
        <input
          type="email"
          placeholder="Nouvelle adresse mail"
          value={mail}
          onChange={(e) => setMail(e.target.value)}
          className="flex-1 px-6 py-3  text-center rounded-full border-2 border-[#FEE96E] bg-white/70"
        />
        <button onClick={updateMail} className="px-6 py-3 mt-2 rounded-full border-2 border-[#FEE96E] bg-[#FEE96E]">
          Modifier Mail
        </button>
      </div>

      {error && <p className="text-red-600 text-center mt-4">{error}</p>}

      <br></br>
       <TwoFA
        userId={userStats.id}
        twofaEnabled={userStats.twofaEnabled ?? false}
        onEnable2FA={() => setUserStats(prev => ({ ...prev, twofaEnabled: true }))}
        onDisable2FA={() => setUserStats(prev => ({ ...prev, twofaEnabled: false }))}
      />
      <Footer />
    </main>
  );
}
