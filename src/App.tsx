import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { WalletProvider } from './context/WalletContext';
import { ToastProvider } from './context/ToastContext';
import { GameProvider } from './context/GameContext';
import { AvatarProvider } from './context/AvatarContext';
import GameNotifications from './components/ui/GameNotifications';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Challenge from './pages/Challenge';
import Leaderboard from './pages/Leaderboard';
import Shop from './pages/Shop';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

function GlobalCredit() {
  const location = useLocation();
  const [hideForFooter, setHideForFooter] = useState(false);

  const isHome = location.pathname === '/';
  const pagesWithBottomNav = [
    '/dashboard', '/challenge', '/leaderboard',
    '/shop', '/profile', '/settings',
  ];
  const hasBottomNav = pagesWithBottomNav.includes(location.pathname);

  useEffect(() => {
    if (!isHome) {
      setHideForFooter(false);
      return;
    }
    function onScroll() {
      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 150;
      setHideForFooter(nearBottom);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome, location.pathname]);

  if (isHome && hideForFooter) return null;

  return (
    <div
      className={`fixed left-0 w-full z-30 flex justify-center py-2 transition-opacity duration-300 ${
        hasBottomNav ? 'bottom-16 lg:bottom-0' : 'bottom-0'
      }`}
      style={{
        backgroundColor: 'rgba(15,23,42,0.92)',
        backdropFilter: 'blur(8px)',
        borderTop: '1px solid rgba(139,92,246,0.15)',
      }}
    >
      <span className="text-[11px] text-text-secondary opacity-70 pb-1 inline-block">
        Built by Meti pax
      </span>
    </div>
  );
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <GlobalCredit />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/challenge"
          element={
            <ProtectedRoute>
              <Challenge />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shop"
          element={
            <ProtectedRoute>
              <Shop />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <ToastProvider>
      <GameProvider>
        <AvatarProvider>
          <WalletProvider>
            <GameNotifications />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </WalletProvider>
        </AvatarProvider>
      </GameProvider>
    </ToastProvider>
  );
}

export default App;
