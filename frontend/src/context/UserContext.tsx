// import {
//   createContext,
//   useContext,
//   useEffect,
//   useMemo,
//   useState,
//   type ReactNode,
// } from "react";
// import type { User, AuthResponse } from "./auth.ts";

// const API_BASE_URL = "http://localhost:8000";

// interface UserContextType {
//   session: User | null;
//   isLoading: boolean;
//   login: (email: string, pass: string) => Promise<void>;
//   register: (email: string, pass: string) => Promise<void>;
//   loginAsGuest: () => Promise<void>;
//   logout: () => void;
// }

// const UserContext = createContext<UserContextType | undefined>(undefined);

// export function UserProvider({ children }: { children: ReactNode }) {
//   const [session, setSession] = useState<User | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   // Al arrancar: si hay token guardado, lo validamos y restauramos la sesión
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (!token) { setIsLoading(false); return; }

//     fetch(`${API_BASE_URL}/auth/me`, {
//       headers: { Authorization: `Bearer ${token}` },
//     })
//       .then((r) => r.ok ? r.json() : Promise.reject())
//       .then((data) => setSession(data.user))
//       .catch(() => localStorage.removeItem("token"))
//       .finally(() => setIsLoading(false));
//   }, []);

//   const saveSession = (data: AuthResponse) => {
//     localStorage.setItem("token", data.token);
//     setSession(data.user);
//   };

//   const apiFetch = async (endpoint: string, body: object) => {
//     const r = await fetch(`${API_BASE_URL}${endpoint}`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(body),
//     });
//     if (!r.ok) throw new Error(await r.text());
//     return r.json();
//   };

//   const login = async (email: string, pass: string) =>
//     saveSession(await apiFetch("/auth/login", { email, password: pass }));

//   const register = async (email: string, pass: string) =>
//     saveSession(await apiFetch("/auth/register", { email, password: pass }));

//   const loginAsGuest = async () =>
//     saveSession(await apiFetch("/auth/guest", {}));

//   const logout = () => {
//     localStorage.removeItem("token");
//     setSession(null);
//   };

//   const value = useMemo(
//     () => ({ session, isLoading, login, register, loginAsGuest, logout }),
//     [session, isLoading]
//   );

//   return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
// }

// export const useUser = () => {
//   const context = useContext(UserContext);
//   if (!context) throw new Error("useUser debe usarse dentro de UserProvider");
//   return context;
// };
















import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
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

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setIsLoading(false); return; }

    fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => setSession(data.user))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setIsLoading(false));
  }, []);

  const saveSession = (data: AuthResponse) => {
    localStorage.setItem("token", data.token);
    setSession(data.user);
  };

  const apiFetch = async (endpoint: string, body: object) => {
    const r = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  };

  const login = async (username: string, pass: string) =>
    saveSession(await apiFetch("/auth/login", { username, password: pass }));

  const register = async (username: string, email: string, pass: string) =>
    saveSession(await apiFetch("/auth/register", { username, email, password: pass }));

  const loginAsGuest = async () =>
    saveSession(await apiFetch("/auth/guest", {}));

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

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser debe usarse dentro de UserProvider");
  return context;
};