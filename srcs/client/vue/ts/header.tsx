import { Link, useLocation } from 'react-router-dom';
import { Gamepad2, MessageCircle, User } from 'lucide-react';

export default function Header() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <header
      className="w-full relative bg-cover bg-center bg-no-repeat"
      style={{ 
        backgroundImage: "url('/shared-assets/pompompurin/background/header.jpeg')",
        minHeight: '5px' // hauteur du header
      }}
    >
      {/* Overlay semi-transparent */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Contenu centré verticalement */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 flex items-center justify-between py-5">
        {/* Logo cliquable Home */}
            <div className="rounded-2xl transition-all transform hover:scale-150 cursor-pointer">

        <Link to="/">
          <img src="/shared-assets/pompompurin/profil/main.jpeg" alt="personnage Home link" className="w-15 h-15 object-cover cursor-pointer rounded-full" />
        </Link>
      </div>
        {/* Navigation icônes */}
        <nav className="flex items-center gap-4 h-full">
          {/* Jouer */}
          <Link to="/game">
            <div
              className={`w-12 h-12 flex items-center justify-center rounded-full transition-all cursor-pointer ${
                isActive('/game')
                  ? 'bg-[#FEE96E] text-[#8B5A3C] shadow-lg'
                  : 'bg-[#FEE96E]/80 text-[#8B5A3C] hover:bg-[#FEE96E]/100'
              }`}
            >
              <Gamepad2 className="w-6 h-6" />
            </div>
          </Link>

          {/* Chat */}
          <Link to="/chat">
            <div
              className={`w-12 h-12 flex items-center justify-center rounded-full transition-all cursor-pointer ${
                isActive('/chat')
                  ? 'bg-[#FEE96E] text-[#8B5A3C] shadow-lg'
                  : 'bg-[#FEE96E]/80 text-[#8B5A3C] hover:bg-[#FEE96E]/100'
              }`}
            >
              <MessageCircle className="w-6 h-6" />
            </div>
          </Link>

          {/* Profil */}
          <Link to="/profile">
            <div
              className={`w-12 h-12 flex items-center justify-center rounded-full transition-all cursor-pointer ${
                isActive('/profile')
                  ? 'bg-[#FEE96E] text-[#8B5A3C] shadow-lg'
                  : 'bg-[#FEE96E]/80 text-[#8B5A3C] hover:bg-[#FEE96E]/100'
              }`}
            >
              {isActive('/profile') ? (
                <img
                  src="../../shared-assets/pompompurin/profil/13.jpeg"
                  alt="personnage profil"
                  className="w-10 h-10 object-cover cursor-pointer rounded-full"
                />
              ) : (
                <User className="w-6 h-6" />
              )}
            </div>
          </Link>
        </nav>
      </div>
    </header>
  );
}
