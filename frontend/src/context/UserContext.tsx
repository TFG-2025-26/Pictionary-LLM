import { createContext, useEffect, useMemo, useState, type ReactNode,} from "react";
import type { User, AuthResponse } from "./auth.ts";

const API_BASE_URL = "http://localhost:8000";

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
  const [session, setSession] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setIsLoading(false); return; }

    fetch(`${API_BASE_URL}/auth`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => setSession(data.user))
      .catch(() => {
        localStorage.removeItem("token");
        setSession(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const saveSession = (data: AuthResponse) => {
    localStorage.setItem("token", data.token);
    setSession(data.user);
  };

  const apiFetch = async (endpoint: string, body: object) => {
    
    const token = localStorage.getItem("token");

    /*
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    */

    // mismo código que el comentado pero más limpio
    const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { "Authorization": `Bearer ${token}` })};
    
    const r = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: headers,
      body: body ? JSON.stringify(body) : undefined
    });

    // SEÑALIZACIÓN: Si el backend devuelve 401 (No autorizado), cerramos sesión
    if (r.status === 401) {
      logout();
      throw new Error("Sesión expirada");
    }

    if (!r.ok) throw new Error(await r.text());
    return r.json();
  };

  const register = async (username: string, email: string, pass: string) =>
    //saveSession(await apiFetch("/register", { username, email, password: pass }));
    await apiFetch("/register", { username, email, password: pass });

  const login = async (username: string, pass: string) =>
    saveSession(await apiFetch("/login", { username, password: pass }));

  const loginAsGuest = async () =>
    saveSession(await apiFetch("/login_guest", {}));

  const logout = () => {
    localStorage.removeItem("token");
    setSession(null);
  };

  const value = useMemo(
    () => ({ session, isLoading, login, register, loginAsGuest, logout }),
    [session, isLoading]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}