import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const SUPER_EMAIL = "superadmin@example.com";
const ADMIN_EMAIL = "admin@example.com";
const SUPER_PASSWORD = "superadmin";
const ADMIN_PASSWORD = "admin";

const SUPER_TOKEN = import.meta.env.VITE_SUPER_ADMIN_TOKEN || "";
const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN || "";
const API_TOKEN_FALLBACK = "";

/* if (import.meta.env.DEV) {
  console.info("VITE_SUPER_TOKEN", import.meta.env.VITE_SUPER_TOKEN);
  console.info("VITE_API_TOKEN", import.meta.env.VITE_API_TOKEN);
}
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => null);

  const login = useCallback((email, password) => {
    const lowered = email.toLowerCase();
    const isSuper = lowered === SUPER_EMAIL.toLowerCase();
    const isAdmin = lowered === ADMIN_EMAIL.toLowerCase();

    if (!isSuper && !isAdmin) return false;
    if (isSuper && password !== SUPER_PASSWORD) return false;
    if (isAdmin && password !== ADMIN_PASSWORD) return false;

    const token = isSuper ? SUPER_TOKEN : ADMIN_TOKEN;

    if (!token) {
      alert(
        "Geen API token gevonden. Zet VITE_SUPER_TOKEN of VITE_ADMIN_TOKEN."
      );
      return false;
    }

    setUser({
      id: isSuper ? "user-super" : "user-admin",
      name: isSuper ? "Super Admin" : "Admin",
      email: lowered,
      role: isSuper ? "super" : "admin",
      token,
    });
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      isAuthenticated: Boolean(user),
      isSuper: user?.role === "super",
      canEdit: user?.role === "super",
      authToken:
        user?.token || (user?.role === "super" ? SUPER_TOKEN : ADMIN_TOKEN),
    }),
    [user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
