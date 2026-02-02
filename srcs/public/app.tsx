import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './client/vue/ts/header';
import HomePage from './client/vue/home/homePage';
import GamePage from './client/vue/game/gamePage';
import ChatPage from './client/vue/messages/messagesPage';
import ProfilePage from './client/vue/profil/profilPage';
import LoginPage from './client/vue/access/loginPage';
import RegisterPage from './client/vue/access/registerPage';
import SettingsPage from './client/vue/access/settings';
import FriendsPage from './client/vue/friends/friend';



import { Settings } from 'lucide-react';

export default function App() {
  return (
    <Router>
      <div 
        className="min-h-screen bg-[#FFFAED]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(254, 233, 110, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(254, 233, 110, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 40% 20%, rgba(139, 90, 60, 0.05) 0%, transparent 50%)
          `,
        }}
      >
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/friends" element={<FriendsPage />} />

        </Routes>
      </div>
    </Router>
  );
}
