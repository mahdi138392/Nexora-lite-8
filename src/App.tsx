import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WalletProvider, useWallet } from './context/WalletContext';
import { ToastProvider } from './context/ToastContext';
import { GameProvider } from './context/GameContext';
import GameNotifications from './components/ui/GameNotifications';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Challenge from './pages/Challenge';
import Leaderboard from './pages/Leaderboard';
import Shop from './pages/Shop';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isConnected } = useWallet();
  return isConnected ? <>{children}</> : <Navigate to="/" replace />;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route
          path="/shop"
          element={
            <ProtectedRoute>
              <Shop />
            </ProtectedRoute>
          }
        />
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
        <WalletProvider>
          <GameNotifications />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </WalletProvider>
      </GameProvider>
    </ToastProvider>
  );
}

export default App;
