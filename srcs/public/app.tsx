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
import FriendProfil from './client/vue/friends/friendsProfile'
import AdminPage from './client/vue/admin/AdminPage';
import AboutPage from './client/vue/access/about';
import RankPage from './client/vue/game/rangGame';
import Footer from './client/vue/ts/Footer';
import ProtectedRoute from './client/vue/access/accessRoutes';
export default function App() {
  return (
    <Router>
      <div 
        className="flex flex-col bg-[#FFFAED]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(254, 233, 110, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(254, 233, 110, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 40% 20%, rgba(139, 90, 60, 0.05) 0%, transparent 50%)
          `,
        }}
      >
        <Header />
        <main className= "flex-1 min-h-[calc(100dvh-60px-64px)]">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/Chat" element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          } />

          <Route path="/Friends" element={
            <ProtectedRoute>
              <FriendsPage />
            </ProtectedRoute>
          } />

          <Route path="/FriendsProfil/:id" element={
            <ProtectedRoute>
              <FriendProfil />
            </ProtectedRoute>
          } />

          <Route path="/Profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
            <SettingsPage />
            </ProtectedRoute>
          } />
          <Route path="/Rank" element={
            <ProtectedRoute>
            <RankPage />
            </ProtectedRoute>
          } />

          <Route path="/Game" element={
            <ProtectedRoute>
            <GamePage />
            </ProtectedRoute>
          } />
          <Route path="/Login" element={<LoginPage />} />
          <Route path="/Register" element={<RegisterPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
        </main>
        <Footer/>
      </div>
    </Router>
  );
}
