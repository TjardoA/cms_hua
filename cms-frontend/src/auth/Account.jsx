import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function Account() {
  const { user, isAuthenticated, updateUser } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [password, setPassword] = useState(user?.password ?? "");
  const [message, setMessage] = useState("");

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const handleSubmit = (event) => {
    event.preventDefault();
    updateUser(user.id, { name, password });
    setMessage("Account opgeslagen.");
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-card__head">
          <p className="auth-title">Account beheren</p>
          <p className="auth-subtitle">Werk je naam of wachtwoord bij.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>Naam</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <label className="auth-field">
            <span>Wachtwoord</span>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {message ? <p className="auth-success">{message}</p> : null}

          <button type="submit" className="cms-btn cms-btn--primary auth-submit">
            Opslaan
          </button>
        </form>
      </div>
    </div>
  );
}
