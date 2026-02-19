import { Link, useLocation } from "react-router-dom";
import { Brain, Crown, Gamepad2, Joystick, MessagesSquare, User } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { isAuthenticated } from "../access/authenticator";
import  handlelogout  from "../profil/profilPage" ;


type AuthStatus = "loading" | "authenticated" | "anonymous";
type avatarUrl = "";

type UserStats = {
  id: number;
  username: string;
  mail: string;
  avatarUrl: string;
  connected: boolean;
};

export default function Header() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const [avatarUrl, setAvatarUrl] = useState<avatarUrl>();
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
  const [userId, setUserId] = useState<number>(0);
  const wsRef = useRef<WebSocket | null>(null);
  const [hasProfileNotif, setHasProfileNotif] = useState(false);

  const [userStats, setUserStats] = useState<UserStats>({
    id: 0,
    username: "",
    mail: "",
    avatarUrl: "/uploads/profil/default.jpeg",
    connected: false
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
            avatarUrl: userData.avatarUrl ?? "/uploads/profil/default.jpeg",
            connected : userData.connected
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
    const ws = new WebSocket(`/ws/`);
    wsRef.current = ws;

    ws.onopen = () => {
      (async () => {
        try {
          const auth = await isAuthenticated();
          if (!auth?.id) return;

          const resUser = await fetch("/api/updateUserConnected", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: auth.id, status: true }),
          });
          setUserStats(prev => ({ ...prev, connected: true }));
        } catch (err) {
          console.error("Erreur update profil :", err);
        }
      })();
      console.log("laaaaaa : ", userStats.connected)
      console.log("✅ WebSocket connecté");
    };

    ws.onmessage = (event) => {
      try {
        const avatar = JSON.parse(event.data);
        if (avatar.data)
        {
          const idGroup = avatar.data.id_group ?? null;
          console.log("mm", avatar.data.avatarUrl);
          if (avatar.type === "new_avatar") {
            setUserStats(prev => ({ ...prev, avatarUrl: avatar.data.avatarUrl }));
          }
        }
      } catch (err) {
        console.error("Erreur WS:", err);
      }
    };

    ws.onclose = () => {
      (async () => {
        try {
          const auth = await isAuthenticated();
          if (!auth?.id) return;

          const resUser = await fetch("/api/updateUserConnected", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: auth.id, status: false }),
          });
        } catch (err) {
          console.error("Erreur update profil :", err);
        }
      })();
      console.log("❌ WebSocket fermé");
    };

  }, []);


  useEffect(() => {
    console.log("✅ userStats mis à jour :", userStats);
  }, [userStats]);

  useEffect(() => {
    console.log("✅ avatarUrl mis à jour :", avatarUrl);
  }, [avatarUrl]);


const handlelogout = async () => {
  try {
    const auth = await isAuthenticated();
    if (!auth?.id) return;

    const resUser = await fetch("/api/updateUserConnected", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: auth.id, status: false }),
    });
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include", // 🔑 OBLIGATOIRE
    });
  } catch (err) {
    console.error("Erreur update profil :", err);
  }

  window.location.href = "/Login";
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

      <div className="relative z-10 max-w-7xl mx-auto px-6 flex items-center justify-between py-3">
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
          <Link to="/about">
            <div
              className={`w-12 h-12 flex items-center justify-center rounded-full transition-all cursor-pointer ${
                isActive("/Game")
                  ? "bg-[#FEE96E] text-[#8B5A3C] shadow-lg"
                  : "bg-[#FEE96E]/80 text-[#8B5A3C] hover:bg-[#FEE96E]/100"
              }`}
            >
              <Brain className="HeaderIcone" />
            </div>
          </Link>
          {authStatus === "authenticated" ? (
            <>
              {/* Jouer */}
              <Link to="/Game">
                <div
                  className={`w-12 h-12 flex items-center justify-center rounded-full transition-all cursor-pointer ${
                    isActive("/Game")
                      ? "bg-[#FEE96E] text-[#8B5A3C] shadow-lg"
                      : "bg-[#FEE96E]/80 text-[#8B5A3C] hover:bg-[#FEE96E]/100"
                  }`}
                >
                  <Joystick className="HeaderIcone" />
                </div>
              </Link>
              <Link to="/rank">
                <div
                  className={`w-12 h-12 flex items-center justify-center rounded-full transition-all cursor-pointer ${
                    isActive("/rank")
                      ? "bg-[#FEE96E] text-[#8B5A3C] shadow-lg"
                      : "bg-[#FEE96E]/80 text-[#8B5A3C] hover:bg-[#FEE96E]/100"
                  }`}
                >
                  <Crown className="HeaderIcone" />
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
                  <MessagesSquare className="HeaderIcone" />
                </div>
              </Link>

              {location.pathname === "/Profile" ? (
                <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-[#FEE96E] transition-all hover:scale-105">
                  <button
                    onClick={handlelogout}
                    className="px-3 py-1 rounded-full bg-[#FEE96E]/80 text-[#8B5A3C] hover:bg-[#FEE96E]/100 transition-colors"
                  >
                    Logout
                  </button>

                  <img
                    src={userStats.avatarUrl}
                    alt="Avatar"
                    className="w-10 h-10 object-cover rounded-full border-2 border-[#FEE96E]"
                  />
                </div>
              ) : (
                <Link to="/Profile">
                  <img
                    src={userStats.avatarUrl}
                    alt="Avatar"
                    className="w-10 h-10 object-cover rounded-full border-2 border-[#FEE96E] hover:scale-105 transition-transform"
                  />
                </Link>
              )}
            </>
          ) : (
            <Link to="/Login">
              <div
                className={`w-12 h-12 flex items-center justify-center rounded-full transition-all cursor-pointer ${
                  isActive("/Login")
                    ? "bg-[#FEE96E] text-[#8B5A3C] shadow-lg"
                    : "bg-[#FEE96E]/80 text-[#8B5A3C] hover:bg-[#FEE96E]/100"
                }`}
                title={authStatus === "loading" ? "Vérification..." : "Se connecter"}
              >
                <User className="HeaderIcone" />
              </div>
            </Link>
          )}
        </nav>

      </div>
    </header>
  );
}

