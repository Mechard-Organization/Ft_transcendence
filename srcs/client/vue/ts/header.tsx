import { Link, useLocation } from "react-router-dom";
import { Gamepad2, MessageCircle, User } from "lucide-react";
import { useEffect, useState } from "react";
import { isAuthenticated } from "../interface/authenticator"; // adapte le chemin si besoin

type AuthStatus = "loading" | "authenticated" | "anonymous";

export default function Header() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
  const [userId, setUserId] = useState<number>(0);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const auth = await isAuthenticated();
        if (!mounted) return;

        if (auth?.authenticated) {
          setAuthStatus("authenticated");
          setUserId(auth.id ?? 0);
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

          {/* ✅ Login OU Profil */}
          {authStatus !== "authenticated" ? (
            <Link to="/login">
              <div
                className={`w-12 h-12 flex items-center justify-center rounded-full transition-all cursor-pointer ${
                  isActive("/login")
                    ? "bg-[#FEE96E] text-[#8B5A3C] shadow-lg"
                    : "bg-[#FEE96E]/80 text-[#8B5A3C] hover:bg-[#FEE96E]/100"
                }`}
                title={
                  authStatus === "loading"
                    ? "Vérification..."
                    : "Se connecter"
                }
              >
                <User className="w-6 h-6" />
              </div>
            </Link>
          ) : (
            <Link to={userId ? `/profil/${userId}` : "/profil"}>
              <div
                className={`w-12 h-12 flex items-center justify-center rounded-full transition-all cursor-pointer ${
                  isActive("/profil")
                    ? "bg-[#FEE96E] text-[#8B5A3C] shadow-lg"
                    : "bg-[#FEE96E]/80 text-[#8B5A3C] hover:bg-[#FEE96E]/100"
                }`}
              >
                <img
                  src="/shared-assets/pompompurin/profil/13.jpeg"
                  alt="personnage profil"
                  className="w-10 h-10 object-cover rounded-full"
                />
              </div>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
