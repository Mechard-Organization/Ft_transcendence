import { useState } from "react";
import { validatePassword, validateEmail } from "../../../services/validate.service";
import { isAuthenticated } from "../access/authenticator";

export default function UserUpdate() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [mail, setMail] = useState("");

  const handleEnter =
    (fn: () => void) =>
    (e: React.KeyboardEvent<HTMLInputElement | HTMLButtonElement>) => {
      if (e.key === "Enter") fn();
    };

  // --- USERNAME ---
  const updateUsername = async () => {
    const auth = await isAuthenticated();
    if (!username || !auth?.id) {
      alert("Merci de vous connecter et d'entrer un username");
      return;
    }

    const res = await fetch("/api/updateUserUsername", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, id: auth.id }),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Erreur lors de la création");
      return;
    }

    setUsername("");
  };

  // --- PASSWORD ---
  const updatePassword = async () => {
    const auth = await isAuthenticated();
    if (!password || !password2 || !auth?.id) {
      alert("Merci de vous connecter et d'entrer un password");
      return;
    }

    if (password !== password2) {
      alert("taper 2 fois le même mpd svp");
      return;
    }

    const resuser = await fetch("/api/getuser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: auth.id }),
    });

    const datausername = await resuser.json();
    if (!resuser.ok) {
      alert(datausername.error || "Erreur lors de la création");
      return;
    }

    if (!validatePassword(password, datausername.username).ok) {
      alert(validatePassword(password, datausername.username).reason);
      return;
    }

    const res = await fetch("/api/updateUserPassword", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, id: auth.id }),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Erreur lors de la création");
      return;
    }

    setPassword("");
    setPassword2("");
  };

  // --- MAIL ---
  const updateMail = async () => {
    const auth = await isAuthenticated();
    if (!mail || !auth?.id) {
      alert("Merci de vous connecter et d'entrer un mail");
      return;
    }

    if (!validateEmail(mail).ok) {
      alert(validateEmail(mail).reason);
      return;
    }

    const res = await fetch("/api/updateUserMail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mail, id: auth.id }),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Erreur lors de la création");
      return;
    }

    setMail("");
  };

  return (
      <div className="form-container">
        <h2 className="title">modifier votre nom d'utilisateur</h2>
        <div className="form-group">
          <label>Nouveau nom d'utilisateur</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleEnter(updateUsername)}
            placeholder="Nouveau nom d'utilisateur"
          />
        </div>
        <button className="btn-primary" onClick={updateUsername}>
          Modifier
        </button>
      </div>

      {/* PASSWORD */}
      <div className="form-container">
        <h2 className="title">modifier votre mot de passe</h2>
        <div className="form-group">
          <label>Nouveau mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleEnter(updatePassword)}
            placeholder="Nouveau mot de passe"
          />
          <input
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            onKeyDown={handleEnter(updatePassword)}
            placeholder="Nouveau mot de passe encore"
          />
        </div>
        <button className="btn-primary" onClick={updatePassword}>
          Modifier
        </button>
      </div>

      {/* MAIL */}
      <div className="form-container">
        <h2 className="title">modifier votre e-mail</h2>
        <div className="form-group">
          <label>Nouveau e-mail</label>
          <input
            type="email"
            value={mail}
            onChange={(e) => setMail(e.target.value)}
            onKeyDown={handleEnter(updateMail)}
            placeholder="Nouveau e-mail"
          />
        </div>
        <button className="btn-primary" onClick={updateMail}>
          Modifier
        </button>
      </div>
  );
}
