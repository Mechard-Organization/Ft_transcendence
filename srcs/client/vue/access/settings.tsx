import { useState, useEffect, FormEvent } from "react";
import { validatePassword, validateEmail } from "../../../services/validate.service";
import { isAuthenticated } from "../access/authenticator";
import { Link } from "react-router-dom";


type UserStats = {
  id: number;
  username: string;
  mail: string;
  avatarUrl?: string | null;
  password?: string;
  password2?: string;
};

export default function UserSettings() {
  const [userStats, setUserStats] = useState<UserStats>({
    id: 0,
    username: "",
    mail: "",
    avatarUrl: "/uploads/profil/default.jpeg",
  });

  const [username, setUsername] = useState("");
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  // Erreur / état loading
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // --- Charger les infos utilisateur au montage ---
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

        setUserStats(user);
        setUsername(user.username);
        setMail(user.mail);
      } catch (err) {
        console.error("Erreur récupération profil :", err);
      }
    }
    fetchUser();
  }, []);

  // --- Modifier username ---
  const updateUsername = async () => {
    if (!username || !userStats.id) {
      alert("Merci de vous connecter et d'entrer un username");
      return;
    }
    try {
      const res = await fetch("/api/updateUserUsername", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, id: userStats.id }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error || "Erreur");
      setUserStats(prev => ({ ...prev, username }));
      setUsername("");
    } catch (err) {
      console.error(err);
    }
  };

  // --- Modifier mot de passe ---
  const updatePassword = async () => {
    if (!password || !password2 || !userStats.id) {
      alert("Merci de remplir tous les champs mot de passe");
      return;
    }
    if (password !== password2) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }
    if (!validatePassword(password, userStats.username).ok) {
      alert(validatePassword(password, userStats.username).reason);
      return;
    }

    try {
      const res = await fetch("/api/updateUserPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, id: userStats.id }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error || "Erreur");
      setPassword("");
      setPassword2("");
    } catch (err) {
      console.error(err);
    }
  };

  // --- Modifier mail ---
  const updateMail = async () => {
    if (!mail || !userStats.id) {
      alert("Merci de remplir le mail");
      return;
    }
    if (!validateEmail(mail).ok) {
      alert(validateEmail(mail).reason);
      return;
    }

    try {
      const res = await fetch("/api/updateUserMail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mail, id: userStats.id }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error || "Erreur");
      setUserStats(prev => ({ ...prev, mail }));
      setMail("");
    } catch (err) {
      console.error(err);
    }
  };

  // --- Upload avatar ---
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

  return (
    <main id="mainContent">
      <br />
      <br />

      {/* Avatar */}

      <button
        onClick={() => window.location.href = "/profile"}
        className="inline-block cursor-pointer"
      >
        <p>❌</p>
      </button>

      <input
        type="file"
        id="fileInput"
        accept="image/*"
        hidden
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
        }}
      />
        <div className="mb-8 max-w-4xl w-full mx-auto text-center">
      <button
        onClick={() => document.getElementById("fileInput")?.click()}
        className="inline-block cursor-pointer"
      >
        <img
          src={userStats.avatarUrl}
          alt="personnage profil"
          className="w-25 h-25 object-cover rounded-full border-4 border-[#FEE96E]"
        />
      </button>
        </div>

      <div className="form-group w-full text-center mt-4">
        <label htmlFor="username" className="block mb-1">
          Modifier Le Nom d'utilisateur
        </label>
        <input
          type="text"
          id="username"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mx-auto block flex-1 px-6 py-3 rounded-full border-2 border-[#FEE96E] focus:outline-none focus:border-[#8B5A3C]"
        />
        <button
          onClick={updateUsername}
          className="flex-1 px-6 py-3 mt-2 rounded-full border-2 border-[#FEE96E] bg-[#FEE96E]"
        >
          Modifier Username
        </button>
      </div>
        <br />
        <br />

      <div className="form-group w-full text-center mt-4">
        <label className="block mb-1">Mot de passe</label>
        <input
          type="password"
          placeholder="Nouveau mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="flex-1 px-6 py-3 rounded-full border-2 border-[#FEE96E]"
        />
        <br />

        <input
          type="password"
          placeholder="Confirmer mot de passe"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          className="flex-1 px-6 py-3 rounded-full border-2 border-[#FEE96E] mt-2"
        />
        <br />
        <button
          onClick={updatePassword}
          className="flex-1 px-6 py-3 mt-2 rounded-full border-2 border-[#FEE96E] bg-[#FEE96E]"
        >
          Modifier Password
        </button>
      </div>
        <br />

      <div className="form-group w-full text-center mt-4">
        <label className="block mb-1">Email</label>
        <input
          type="email"
          placeholder="Nouvelle adresse mail"
          value={mail}
          onChange={(e) => setMail(e.target.value)}
          className="flex-1 px-6 py-3 rounded-full border-2 border-[#FEE96E]"
        />

        <br />
        <button
          onClick={updateMail}
          className="flex-1 px-6 py-3 mt-2 rounded-full border-2 border-[#FEE96E] bg-[#FEE96E]"
        >
          Modifier Mail
        </button>
      </div>

      {error && <p className="text-red-600 text-center mt-4">{error}</p>}
    </main>
  );
}
