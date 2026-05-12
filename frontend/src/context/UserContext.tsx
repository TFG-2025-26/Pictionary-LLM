import {createContext, useEffect, useMemo, useState, type ReactNode} from "react";
import type { User } from "./auth.ts";

// const API_BASE_URL = "http://localhost:8000";

const getApiUrl = () => {
  // if (import.meta.env.PROD) {
  //   return "";
  // }

  return `http://${window.location.hostname}:8000`;
}

const API_BASE_URL = getApiUrl();

interface UserContextType {
  session: User | null;
  isLoading: boolean;
  login: (username: string, pass: string) => Promise<void>;
  register: (username: string, email: string, pass: string) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => void;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  
  const [session, setSession] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("user_data");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user_data");
    
    if (!token || token === "undefined" || token === "null" || !userData) {
      setIsLoading(false);
      return;
    }

    fetch(`${API_BASE_URL}/auth`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (r.status === 401) {
          // SOLAMENTE si es 401 (Expirado/Inválido) lanzamos error para el catch
          throw new Error("EXPIRED");
        }
        if (!r.ok) {
          // Si es un error 500 o de red, no hacemos nada, 
          // dejamos que el usuario siga con su sesión local.
          return; 
        }
        return r.json();
      })
      .catch((err) => {
        if (err.message === "EXPIRED") { logout(); }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);



  const saveSession = (data: any) => {
    const tokenToSave = data.token || data.access_token; 
    
    if (!tokenToSave) {
      console.error("¡El servidor no ha enviado ningún token!");
      return;
    }

    localStorage.setItem("token", tokenToSave);
    localStorage.setItem("user_data", JSON.stringify(data.user));
    setSession(data.user);
  };

  const apiFetch = async (endpoint: string, body: object) => {
    
    const token = localStorage.getItem("token");

    const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { "Authorization": `Bearer ${token}` })};
    
    const r = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: headers,
      body: body ? JSON.stringify(body) : undefined
    });

    if (r.status === 401) {
      logout();
      throw new Error("Sesión expirada");
    }

    if (!r.ok) throw new Error(await r.text());
    return r.json();
  };

  const register = async (username: string, email: string, pass: string) =>
    await apiFetch("/register", { username, email, password: pass });

  const login = async (username: string, pass: string) =>
    saveSession(await apiFetch("/login", { username, password: pass }));

  const loginAsGuest = async () =>
    saveSession(await apiFetch("/login_guest", {}));

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_data");
    setSession(null);
  };

  const value = useMemo(
    () => ({ session, isLoading, login, register, loginAsGuest, logout }),
    [session, isLoading]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}