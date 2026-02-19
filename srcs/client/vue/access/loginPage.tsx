import { useState, FormEvent } from "react";
import { User } from "lucide-react";
import Footer from "../ts/Footer";

type LoginResponse = {
  twofa_required?: boolean;
  message?: string;
};

type TwoFAResponse = {
  error?: string;
};

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [twofaRequired, setTwofaRequired] = useState(false);
  const [twofaCode, setTwofaCode] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying2fa, setVerifying2fa] = useState(false);

  const onSubmitLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const u = username.trim();
    if (!u || !password) {
      setError("Nom d'utilisateur et mot de passe requis.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: u, password }),
      });

      const data: LoginResponse = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.message || "Identifiants invalides.");
        return;
      }

      if (data.twofa_required) {
        setTwofaRequired(true);
        return;
      }

      window.location.href = "/Profile";
    } catch (err) {
      console.error(err);
      setError("Erreur réseau, réessaie plus tard.");
    } finally {
      setLoading(false);
    }
  };

  const onVerify2FA = async () => {
    setError("");

    const code = twofaCode.trim();
    if (!code) {
      setError("Code requis.");
      return;
    }

    setVerifying2fa(true);
    try {
      const response = await fetch("/api/auth/login/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code }),
      });

      const data: TwoFAResponse = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error || "Code invalide.");
        return;
      }

      window.location.href = "/Profile";
    } catch (err) {
      console.error(err);
      setError("Erreur réseau, réessaie plus tard.");
    } finally {
      setVerifying2fa(false);
    }
  };

  const onGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <div>
    <main id="mainContent" className="margin-bot">
	  <div className="min-h-[calc(100vh-8rem)] mb-8 max-w-2xl w-full mx-auto text-center">
		<div className="bg-white/90 backdrop-blur-sm rounded-3xl p-4 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 border-4 border-[#FEE96E] cursor-pointer">
		  <div className="flex items-center justify-center">
  		    <div className="w-12 h-12 rounded-full bg-[#FEE96E] flex items-center justify-center">
    		  <User className="w-6 h-6 text-[#8B5A3C]" />
  		    </div>
		  </div>
		  <h1 className="w h flex items-center justify-center rounded-full">Login</h1>
		  <br/>
          <div className="flex justify-center">
            <form
              id="loginForm"
              className="form-container flex flex-col items-center gap-4"
              onSubmit={onSubmitLogin}

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
                  disabled={loading || twofaRequired}
                  className="mx-auto blockflex-1 px-6 py-3 rounded-full border-2 border-[#FEE96E] focus:outline-none focus:border-[#8B5A3C]"
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
                  autoComplete="current-password"
                  disabled={loading || twofaRequired}
                  className="flex-1 px-6 py-2 rounded-full border-2 border-[#FEE96E] focus:outline-none focus:border-[#8B5A3C]"
                />
              </div>

			  <br/>

              <button
                id="loginBtn"
                className="flex-1 px-6 py-2 rounded-full border-1 border-[#FEE96E] bg-[#FEE96E] focus:outline-none focus:border-[#8B5A3C]"
                type="submit"
                disabled={loading || twofaRequired}
              >
                {loading ? "Connexion..." : "Se connecter"}
              </button>

              {error && (
                <p id="loginError" className="text-red-600 text-center">
                  {error}
                </p>
              )}
              <div className="oauth-divider"><span>ou</span></div>
              <button
                type="button"
                onClick={onGoogleLogin}
                className="google-btn"
                aria-label="Sign in with Google"
              >
                <svg className="google-icon" width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.05 1.53 7.44 2.81l5.44-5.44C33.54 3.86 29.1 2 24 2 14.82 2 6.73 7.14 3.02 14.65l6.36 4.94C11.01 13.14 17.02 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.5 24.5c0-1.64-.15-3.21-.43-4.73H24v8.95h12.7c-.55 2.96-2.22 5.47-4.72 7.14l7.28 5.64C43.52 37.36 46.5 31.43 46.5 24.5z"/>
                  <path fill="#FBBC05" d="M9.38 28.59a14.94 14.94 0 0 1 0-9.18l-6.36-4.94a23.97 23.97 0 0 0 0 19.06l6.36-4.94z"/>
                  <path fill="#34A853" d="M24 46c6.48 0 11.92-2.14 15.9-5.82l-7.28-5.64c-2.02 1.36-4.62 2.16-8.62 2.16-6.98 0-12.99-3.64-15.12-9.09l-6.36 4.94C6.73 40.86 14.82 46 24 46z"/>
                </svg>
                <span>Sign in with Google</span>
              </button>
            </form>
          </div>
	    </div>
      <br/>
      <div className="text-[#A67C52]">Vous n'avez pas encore de compte ? <a className="text-[#8B5A3E] hover:text-[#8B5A3C]" href = "/Register">Cliquez ici</a></div>
      {twofaRequired && (
  <div className="mt-6 p-6 bg-white/90 rounded-2xl border-4 border-[#FEE96E]">
    <h2 className="text-xl text-[#8B5A3C] mb-4">Vérification 2FA</h2>

    <div className="form-group mb-4 text-[#8B5A3C]">
      <label htmlFor="twofaCode" className="block mb-1">
        Code de vérification
      </label>
      <input
        type="text"
        id="twofaCode"
        placeholder="123456"
        value={twofaCode}
        onChange={(e) => setTwofaCode(e.target.value)}
        inputMode="numeric"
        autoComplete="one-time-code"
        className="w-full px-6 py-3 rounded-full border-2 border-[#FEE96E] focus:outline-none focus:border-[#8B5A3C]"
      />
    </div>

    <button
      className="w-full px-6 py-3 rounded-full text-[#8B5A3C] bg-[#FEE96E] border-2 border-[#FEE96E]"
      onClick={onVerify2FA}
      disabled={verifying2fa}
    >
      {verifying2fa ? "Vérification..." : "Vérifier"}
    </button>
  </div>
)}
	  </div>

    </main>
    </div>
  );
}
