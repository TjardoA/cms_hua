import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("super@demo.nl");
  const [password, setPassword] = useState("superadmin");
  const [error, setError] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/cms" replace />;
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    const ok = login(email.trim(), password);
    if (!ok) {
      setError("Onjuiste combinatie. Probeer het opnieuw.");
      return;
    }
    setError("");
    navigate("/cms");
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-card__head">
          <p className="auth-title">Inloggen</p>
          <p className="auth-subtitle">
            Log in als admin (alleen lezen) of super admin (beheer).
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>E-mailadres</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="auth-field">
            <span>Wachtwoord</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error ? <p className="auth-error">{error}</p> : null}

          <button
            type="submit"
            className="cms-btn cms-btn--primary auth-submit"
          >
            Inloggen
          </button>

          <div className="auth-hint">
            <p>Super admin: superadmin@example.com / superadmin</p>
            <p>Admin: admin@example.com / admin</p>
          </div>
        </form>
      </div>
    </div>
  );
}
