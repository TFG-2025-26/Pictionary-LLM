import { type ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import { useUser } from "./context/useUser";

// Páginas
import LandingPage from "./pages/Landing/LandingPage";
import LoginPage from "./pages/Login/LoginPage";
import RegisterPage from "./pages/Register/RegisterPage";
import MainMenuPage from "./pages/MainMenu/MainMenuPage";
import PracticePage from "./pages/Practice/PracticePage";
// import MultiplayerPage from "./pages/Multiplayer/MultiplayerPage";
// import ListRoomsPage from "./pages/ListRooms/ListRoomsPage";
// import GamePage from "./pages/Game/GamePage";
// ... el resto de tus imports

// --- GUARDS ---
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isLoading, session } = useUser();
  if (isLoading) return <div className="loader">Cargando...</div>;
  return session ? <>{children}</> : <Navigate to="/" replace />;
}

function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { isLoading, session } = useUser();
  if (isLoading) return <div className="loader">Cargando...</div>;
  return session ? <Navigate to="/menu" replace /> : <>{children}</>;
}

// --- APP ---
export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          {/* Públicas puras */}
          <Route path="/" element={<LandingPage />} />

          {/* Rutas solo públicas*/}
          <Route path="/login_guest" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
          <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
          <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />

          {/* Rutas solo privadas para usuarios logueados */}
          <Route path="/menu" element={<ProtectedRoute><MainMenuPage /></ProtectedRoute>} />
          <Route path="/practice" element={<ProtectedRoute><PracticePage /></ProtectedRoute>} />
          {/* <Route path="/multiplayer" element={<ProtectedRoute><MultiplayerPage /></ProtectedRoute>} />
          <Route path="/list-rooms" element={<ProtectedRoute><ListRoomsPage /></ProtectedRoute>} /> */}
          {/* <Route path="/room/:roomId" element={<ProtectedRoute><GamePage /></ProtectedRoute>} /> */}
          
          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}