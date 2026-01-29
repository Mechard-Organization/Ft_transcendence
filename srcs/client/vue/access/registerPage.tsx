import { useState, FormEvent } from "react";
import { User } from "lucide-react";
import { validatePassword, validateEmail } from "../../../services/validate.service.js";

type RegisterResponse = {
  error?: string;
  message?: string;
};

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mail, setMail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("")

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmitRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const u = username.trim();
    const p = password.trim();
    const m = mail.trim();

    if (!u || !p || !m) {
      setError("Merci d'entrer un username, un password et un mail.");
      return;
    }

    if (p !== confirmPassword.trim()) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    const passCheck = validatePassword(p, u);
    if (!passCheck.ok) {
      setError(passCheck.reason);
      return;
    }

    const mailCheck = validateEmail(m);
    if (!mailCheck.ok) {
      setError(mailCheck.reason);
      return;
    }

    setLoading(true);
	console.log("username :", username);
	console.log("password :", password);
	console.log("mail :", mail);
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password: p, mail: m }),
      });

      const data: RegisterResponse = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error || data.message || "Erreur lors de la création");
        return;
      }

      setUsername("");
      setPassword("");
      setConfirmPassword("");
      setMail("");

    } catch (err) {
      console.error(err);
      setError("Erreur réseau, réessaie plus tard.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main id="mainContent">
      <div className="mb-8 max-w-2xl w-full mx-auto text-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 border-4 border-[#FEE96E] cursor-pointer">
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-[#FEE96E] flex items-center justify-center">
              <User className="w-6 h-6 text-[#8B5A3C]" />
            </div>
          </div>

          <h1 className="flex items-center justify-center rounded-full">Inscription</h1>
		  <br/>

          <div className="flex justify-center">
            <form
              id="registerForm"
              className="form-container flex flex-col items-center gap-4"
              onSubmit={onSubmitRegister}
            >
              <div className="form-group w-full text-center">
                <label htmlFor="username" className="block mb-1">
                  Nom d'utilisateur
                </label>
                <input
                  type="text"
                  id="username"
                  placeholder="Nom d'utilisateur"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  className="mx-auto block flex-1 px-6 py-3 rounded-full border-2 border-[#FEE96E] focus:outline-none focus:border-[#8B5A3C]"
                />
              </div>

              <div className="form-group w-full text-center">
                <label htmlFor="mail" className="block mb-1">
                  Adresse mail
                </label>
                <input
                  type="email"
                  id="mail"
                  placeholder="Adresse mail"
                  value={mail}
                  onChange={(e) => setMail(e.target.value)}
                  autoComplete="email"
                  className="flex-1 px-6 py-3 rounded-full border-2 border-[#FEE96E] focus:outline-none focus:border-[#8B5A3C]"
                />
              </div>

              <div className="form-group w-full text-center">
                <label htmlFor="password" className="block mb-1">
                  Mot de passe
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="flex-1 px-6 py-3 rounded-full border-2 border-[#FEE96E] focus:outline-none focus:border-[#8B5A3C]"
                />
              </div>

              <div className="form-group w-full text-center">
                <label htmlFor="confirmPassword" className="block mb-1">
                  Confirmez mot de passe
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="Confirmez mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className="flex-1 px-6 py-3 rounded-full border-2 border-[#FEE96E] focus:outline-none focus:border-[#8B5A3C]"
                />
              </div>

              <button
                id="registerBtn"
                className="flex-1 px-6 py-3 rounded-full border-2 border-[#FEE96E] bg-[#FEE96E] focus:outline-none focus:border-[#8B5A3C]"
                type="submit"
                disabled={loading}
              >
                {loading ? "Création..." : "S'enregistrer"}
              </button>

              {error && (
                <p id="registerError" className="text-red-600 text-center">
                  {error}
                </p>
              )}
            </form>
          </div>
          </div>
		  <div className="mt-4"> Vous avez déjà un compte ?{" "}<a className="text-[#A67C52] hover:text-[#8B5A3C]" href="/login">Cliquez ici</a>
        </div>
      </div>
    </main>
  );
}
