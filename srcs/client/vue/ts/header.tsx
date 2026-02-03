import { Link, useLocation } from "react-router-dom";
import { Gamepad2, MessageCircle, User } from "lucide-react";
import { useEffect, useState } from "react";
import { isAuthenticated } from "../access/authenticator";
import  handlelogout  from "../profil/profilPage" ;


type AuthStatus = "loading" | "authenticated" | "anonymous";
type avatarUrl = "";

type UserStats = {
  id: number;
  username: string;
  mail: string;
  avatarUrl: string;
};

export default function Header() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const [avatarUrl, setAvatarUrl] = useState<avatarUrl>();
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
  const [userId, setUserId] = useState<number>(0);
  const [userStats, setUserStats] = useState<UserStats>({
    id: 0,
    username: "",
    mail: "",
    avatarUrl: "/uploads/profil/default.jpeg"
  });

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const auth = await isAuthenticated();
        if (!mounted) return;

        if (auth?.authenticated) {
          setAuthStatus("authenticated");
          setUserId(auth.id ?? 0);
          const user = await fetch("/api/getuser", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: auth.id }),
          });
          const userData = await user.json();
          setUserStats({
            id: userData.id,
            username: userData.username,
            mail: userData.mail,
            avatarUrl: userData.avatarUrl ?? "./uploads/profil/default.jpeg",
          });
          } else {
            setAuthStatus("anonymous");
          }
        } catch {
          if (!mounted) return;
          setAuthStatus("anonymous");
        }

      })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    console.log("✅ userStats mis à jour :", userStats);
  }, [userStats]);

  useEffect(() => {
    console.log("✅ avatarUrl mis à jour :", avatarUrl);
  }, [avatarUrl]);


const handlelogout = async () => {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include", // 🔑 OBLIGATOIRE
  });

  window.location.href = "/login";
};

  return (
    <header
      className="w-full relative bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage:
          "url('/shared-assets/pompompurin/background/header.jpeg')",
        minHeight: "5px",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-8 flex items-center justify-between py-5">
        {/* Logo Home */}
        <div className="rounded-2xl transition-all transform hover:scale-150 cursor-pointer">
          <Link to="/">
            <img
              src="/shared-assets/pompompurin/profil/main.jpeg"
              alt="personnage Home link"
              className="w-15 h-15 object-cover rounded-full"
            />
          </Link>
        </div>
        {/* Navigation */}
        <nav className="flex items-center gap-4 h-full">
          {authStatus === "authenticated" ? (
            <>
              {/* Jouer */}
              <Link to="/game">
                <div
                  className={`w-12 h-12 flex items-center justify-center rounded-full transition-all cursor-pointer ${
                    isActive("/game")
                      ? "bg-[#FEE96E] text-[#8B5A3C] shadow-lg"
                      : "bg-[#FEE96E]/80 text-[#8B5A3C] hover:bg-[#FEE96E]/100"
                  }`}
                >
                  <Gamepad2 className="w-6 h-6" />
                </div>
              </Link>

              {/* Chat */}
              <Link to="/chat">
                <div
                  className={`w-12 h-12 flex items-center justify-center rounded-full transition-all cursor-pointer ${
                    isActive("/chat")
                      ? "bg-[#FEE96E] text-[#8B5A3C] shadow-lg"
                      : "bg-[#FEE96E]/80 text-[#8B5A3C] hover:bg-[#FEE96E]/100"
                  }`}
                >
                  <MessageCircle className="w-6 h-6" />
                </div>
              </Link>

              {/* Avatar + Logout */}
              <div className="flex items-center gap-2 px-2 py-1 rounded-full cursor-pointer bg-[#FEE96E] transition-all hover:scale-105">
                <button
                  onClick={handlelogout}
                  className="px-3 py-1 rounded-full bg-[#FEE96E]/80 text-[#8B5A3C] hover:bg-[#FEE96E]/100 transition-colors"
                >
                  Logout
                </button>
                <Link to="/profile">
                  <img
                    src={userStats.avatarUrl}
                    alt="Avatar"
                    className="w-10 h-10 object-cover rounded-full border-2 border-[#FEE96E]"
                  />
                </Link>
              </div>
            </>
          ) : (
            // Si utilisateur non connecté → un seul bouton Login
            <Link to="/login">
              <div
                className={`w-12 h-12 flex items-center justify-center rounded-full transition-all cursor-pointer ${
                  isActive("/login")
                    ? "bg-[#FEE96E] text-[#8B5A3C] shadow-lg"
                    : "bg-[#FEE96E]/80 text-[#8B5A3C] hover:bg-[#FEE96E]/100"
                }`}
                title={authStatus === "loading" ? "Vérification..." : "Se connecter"}
              >
                <User className="w-6 h-6" />
              </div>
            </Link>
          )}
        </nav>

      </div>
    </header>
  );
}

