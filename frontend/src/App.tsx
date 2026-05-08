import { type ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import { ModelProvider } from "./context/ModelContext";
import { useUser } from "./context/useUser";

// Páginas
import LandingPage from "./pages/Landing/LandingPage";
import LoginPage from "./pages/Login/LoginPage";
import RegisterPage from "./pages/Register/RegisterPage";
import MainMenuPage from "./pages/MainMenu/MainMenuPage";
import SinglePlayerPage from "./pages/SinglePlayer/SinglePlayerPage";
import PracticePage from "./pages/Practice/PracticePage";
import DrawingPage from "./pages/Drawing/DrawingPage";
import GuessingPage from "./pages/Guessing/GuessingPage";
// import MultiplayerPage from "./pages/Multiplayer/MultiplayerPage";
// import ListRoomsPage from "./pages/ListRooms/ListRoomsPage";
// import GamePage from "./pages/Game/GamePage";
// ... el resto de tus imports

// --- GUARDAS ---
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
      <ModelProvider>
        <BrowserRouter>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<PublicOnlyRoute><LandingPage /></PublicOnlyRoute>} />
            <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
            <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />

            {/* Rutas sólo para usuarios logueados (con cuenta o como invitados)*/}
            <Route path="/menu" element={<ProtectedRoute><MainMenuPage /></ProtectedRoute>} />
            <Route path="/singleplayer" element={<ProtectedRoute><SinglePlayerPage /></ProtectedRoute>} />
            <Route path="/practice" element={<ProtectedRoute><PracticePage /></ProtectedRoute>} />
            <Route path="/drawing" element={<ProtectedRoute><DrawingPage /></ProtectedRoute>} />
            <Route path="/guessing" element={<ProtectedRoute><GuessingPage /></ProtectedRoute>} />
            {/* <Route path="/multiplayer" element={<ProtectedRoute><MultiplayerPage /></ProtectedRoute>} />
            <Route path="/list-rooms" element={<ProtectedRoute><ListRoomsPage /></ProtectedRoute>} /> */}
            {/* <Route path="/room/:roomId" element={<ProtectedRoute><GamePage /></ProtectedRoute>} /> */}
            
            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ModelProvider>
    </UserProvider>
  );
}