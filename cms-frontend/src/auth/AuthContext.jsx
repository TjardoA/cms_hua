import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const USERS_KEY = "cms-auth-users";

const INITIAL_USERS = [
  {
    id: "user-super",
    name: "Super Admin",
    email: "super@demo.nl",
    password: "superadmin",
    role: "super",
  },
  {
    id: "user-admin",
    name: "Admin",
    email: "admin@demo.nl",
    password: "admin",
    role: "admin",
  },
];

const AuthContext = createContext(null);

function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return INITIAL_USERS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length) return parsed;
    return INITIAL_USERS;
  } catch (error) {
    console.warn("Kon gebruikers niet laden, terug naar defaults", error);
    return INITIAL_USERS;
  }
}

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(() => loadUsers());
  const [user, setUser] = useState(() => null);

  // clean up legacy session storage so every visit starts on login
  useEffect(() => {
    localStorage.removeItem("cms-auth-session");
  }, []);

  // keep session in sync with user list
  useEffect(() => {
    setUser((current) => {
      if (!current) return null;
      const updated = users.find((u) => u.id === current.id);
      return updated ?? null;
    });
  }, [users]);

  // persist users
  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }, [users]);

  const login = useCallback(
    (email, password) => {
      const found = users.find(
        (candidate) =>
          candidate.email.toLowerCase() === email.toLowerCase() &&
          candidate.password === password,
      );
      if (!found) return false;
      setUser(found);
      return true;
    },
    [users],
  );

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const updateUser = useCallback(
    (userId, data) => {
      setUsers((prev) =>
        prev.map((entry) => (entry.id === userId ? { ...entry, ...data } : entry)),
      );
      setUser((current) => {
        if (current?.id === userId) {
          return { ...current, ...data };
        }
        return current;
      });
    },
    [],
  );

  const addUser = useCallback(
    ({ name, email, password, role }) => {
      const emailExists = users.some(
        (existing) => existing.email.toLowerCase() === email.toLowerCase(),
      );
      if (emailExists) {
        throw new Error("E-mailadres bestaat al");
      }
      const newUser = {
        id: `user-${Date.now()}`,
        name: name || email,
        email,
        password,
        role: role === "super" ? "super" : "admin",
      };
      setUsers((prev) => [...prev, newUser]);
      return newUser;
    },
    [users],
  );

  const deleteUser = useCallback(
    (userId) => {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      // auto logout if you delete yourself
      setUser((current) => {
        if (current?.id === userId) {
          return null;
        }
        return current;
      });
    },
    [],
  );

  const value = useMemo(
    () => ({
      user,
      users,
      login,
      logout,
      addUser,
      updateUser,
      deleteUser,
      isAuthenticated: Boolean(user),
      isSuper: user?.role === "super",
      canEdit: user?.role === "super",
    }),
    [user, users, login, logout, addUser, updateUser, deleteUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
