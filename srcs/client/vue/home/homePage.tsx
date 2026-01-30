import { Link } from "react-router-dom";
import { Gamepad2, MessageCircle, User } from "lucide-react";
import { useEffect, useState } from "react";
import Footer from "../ts/Footer";
import { isAuthenticated } from "../access/authenticator"; // <-- adapte le chemin si besoin

type AuthStatus = "loading" | "authenticated" | "anonymous";

export default function HomePage() {
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
    <div className="flex flex-col">
      <main className="flex-grow flex flex-col items-center mt-25">
        <div className="text-center">
          <div className="inline-block">
            <img
              src="./shared-assets/pompompurin/profil/main.jpeg"
              alt="personnage Home image"
              className="w-25 h-25 object-cover rounded-full"
            />
          </div>
          <h1 className="text-6xl mb-4 text-[#8B5A3C]">Bienvenue !</h1>
          <p className="text-2xl text-[#A67C52]">Jouez, chattez et amusez-vous !</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-1xl mt-10">
          <Link to="/game">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 border-4 border-[#FEE96E] cursor-pointer">
              <div className="bg-[#FEE96E] rounded-full p-6 w-20 h-20 flex items-center justify-center mb-4 mx-auto">
                <Gamepad2 className="w-10 h-10 text-[#8B5A3C]" />
              </div>
              <h2 className="text-2xl mb-2 text-center text-[#8B5A3C]">Jouer</h2>
              <p className="text-center text-[#A67C52]">Commencer une partie de Pong</p>
            </div>
          </Link>

          <Link to="/chat">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 border-4 border-[#FEE96E] cursor-pointer">
              <div className="bg-[#FEE96E] rounded-full p-6 w-20 h-20 flex items-center justify-center mb-4 mx-auto">
                <MessageCircle className="w-10 h-10 text-[#8B5A3C]" />
              </div>
              <h2 className="text-2xl mb-2 text-center text-[#8B5A3C]">Chat</h2>
              <p className="text-center text-[#A67C52]">Discuter avec vos amis</p>
            </div>
          </Link>

          {/* ✅ Ici : Login OU Profil selon l'auth */}
          {authStatus !== "authenticated" ? (
            <Link to="/login">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 border-4 border-[#FEE96E] cursor-pointer">
                <div className="bg-[#FEE96E] rounded-full p-6 w-20 h-20 flex items-center justify-center mb-4 mx-auto">
                  <User className="w-10 h-10 text-[#8B5A3C]" />
                </div>
                <h2 className="text-2xl mb-2 text-center text-[#8B5A3C]">Login</h2>
                <p className="text-center text-[#A67C52]">
                  {authStatus === "loading" ? "Vérification..." : "Connectez-vous"}
                </p>
              </div>
            </Link>
          ) : (
            <Link to="/profile">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 border-4 border-[#FEE96E] cursor-pointer">
                <div className="bg-[#FEE96E] rounded-full p-6 w-20 h-20 flex items-center justify-center mb-4 mx-auto">
                  <User className="w-10 h-10 text-[#8B5A3C]" />
                </div>
                <h2 className="text-2xl mb-2 text-center text-[#8B5A3C]">Profil</h2>
                <p className="text-center text-[#A67C52]">Voir votre profil</p>
              </div>
            </Link>
          )}
        <br />
          <img
            src="/uploads/gif/cookie.gif"
            alt="cookie"
            className="w-64 h-64 object-cover rounded-xl"
          />
        </div>
      </main>

      <footer className="absolute bottom-0 w-full">
        <Footer />
      </footer>
    </div>
  );
}
