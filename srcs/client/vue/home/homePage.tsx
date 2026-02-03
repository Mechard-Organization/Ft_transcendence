import { Link } from "react-router-dom";
import { Gamepad2, MessageCircle, User } from "lucide-react";
import { useEffect, useState } from "react";
import Footer from "../ts/Footer";
import { isAuthenticated } from "../access/authenticator";

type AuthStatus = "loading" | "authenticated" | "anonymous";

type UserStats = {
  id: number;
  username: string;
  mail: string;
  avatarUrl?: string;
  winRate: number;
  gamesPlayed: number;
  gamesWon: number;
  highScore: number;
  twofaEnabled?: boolean;
};

export default function HomePage() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
  const [userStats, setUserStats] = useState<UserStats>({
    id: 0,
    username: "",
    mail: "",
    avatarUrl: "./uploads/profil/default.jpeg",
    winRate: 0,
    gamesPlayed: 0,
    gamesWon: 0,
    highScore: 0,
  });

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const auth = await isAuthenticated();
        if (!mounted) return;

        if (auth?.authenticated) {
          setAuthStatus("authenticated");

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
            avatarUrl: userData.avatarUrl ?? "./uploads/profil/default.jpeg",
            winRate: userData.winRate,
            gamesPlayed: userData.gamesPlayed,
            gamesWon: userData.gamesWon,
            highScore: userData.highScore,
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

  // Composant pour un bloc cliquable
  const ActionCard = ({
    title,
    description,
    icon,
    link,
  }: {
    title: string;
    description: string;
    icon: JSX.Element;
    link: string;
  }) => (
    <Link to={link}>
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 border-4 border-[#FEE96E] cursor-pointer">
        <div className="bg-[#FEE96E] rounded-full p-6 w-20 h-20 flex items-center justify-center mb-4 mx-auto">
          {icon}
        </div>
        <h2 className="text-2xl mb-2 text-center text-[#8B5A3C]">{title}</h2>
        <p className="text-center text-[#A67C52]">{description}</p>
      </div>
    </Link>
  );

  return (
    <div className="flex flex-col min-h-screen relative">
      <main className="flex-grow flex flex-col items-center mt-20">
        {/* Header / Welcome */}
        <div className="text-center">
          <img
            src="./shared-assets/pompompurin/profil/main.jpeg"
            alt="personnage Home image"
            className="w-25 h-25 object-cover rounded-full mx-auto mb-6"
          />
          <h1 className="text-6xl mb-4 text-[#8B5A3C]">Bienvenue !</h1>
          <p className="text-2xl text-[#A67C52]">Jouez, chattez et amusez-vous !</p>
        </div>

        {/* Actions */}
        {authStatus === "authenticated" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mt-10">
            <ActionCard
              title="Jouer"
              description="Commencer une partie de Pong"
              icon={<Gamepad2 className="w-10 h-10 text-[#8B5A3C]" />}
              link="/game"
            />
            <ActionCard
              title="Chat"
              description="Discuter avec vos amis"
              icon={<MessageCircle className="w-10 h-10 text-[#8B5A3C]" />}
              link="/chat"
            />
            <ActionCard
              title="Profil"
              description="Voir votre profil"
              icon={<User className="w-10 h-10 text-[#8B5A3C]" />}
              link="/profile"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6 max-w-xs mt-10">
            <ActionCard
              title="Login"
              description={authStatus === "loading" ? "Vérification..." : "Connectez-vous"}
              icon={<User className="w-10 h-10 text-[#8B5A3C]" />}
              link="/login"
            />
          </div>
        )}

        {/* GIF */}
        <img
          src="/uploads/gif/cookie.gif"
          alt="cookie"
          className="w-64 h-64 object-cover rounded-xl mt-10"
        />
      </main>

      <footer className="w-full">
        <Footer />
      </footer>
    </div>
  );
}
