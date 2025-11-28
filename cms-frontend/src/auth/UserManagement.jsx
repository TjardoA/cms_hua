import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function UserManagement() {
  const { users, addUser, deleteUser, isSuper, user } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  if (!isSuper) return <Navigate to="/cms" replace />;

  const handleSubmit = (event) => {
    event.preventDefault();
    try {
      if (!form.email || !form.password) {
        setError("E-mail en wachtwoord zijn verplicht");
        return;
      }
      addUser(form);
      setForm({ name: "", email: "", password: "", role: "admin" });
      setError("");
      setMessage("Gebruiker aangemaakt");
    } catch (err) {
      setMessage("");
      setError(err.message ?? "Kon gebruiker niet aanmaken");
    }
  };

  const handleDelete = (id) => {
    if (id === user.id) {
      setError("Je kunt je eigen account niet verwijderen.");
      return;
    }
    const target = users.find((u) => u.id === id);
    if (target?.role === "super") {
      const superCount = users.filter((u) => u.role === "super").length;
      if (superCount <= 1) {
        setError("Laat minstens één super admin bestaan.");
        return;
      }
    }
    setError("");
    setMessage("");
    deleteUser(id);
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-card__head">
          <p className="auth-title">Gebruikersbeheer</p>
          <p className="auth-subtitle">
            Alleen super admins kunnen accounts aanmaken of verwijderen.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>Naam</span>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Naam (optioneel)"
            />
          </label>
          <label className="auth-field">
            <span>E-mailadres</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              required
            />
          </label>
          <label className="auth-field">
            <span>Wachtwoord</span>
            <input
              type="text"
              value={form.password}
              onChange={(e) =>
                setForm((p) => ({ ...p, password: e.target.value }))
              }
              required
            />
          </label>
          <label className="auth-field">
            <span>Rol</span>
            <select
              value={form.role}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
            >
              <option value="admin">Admin (alleen lezen)</option>
              <option value="super">Super admin (beheer)</option>
            </select>
          </label>

          {error ? <p className="auth-error">{error}</p> : null}
          {message ? <p className="auth-success">{message}</p> : null}

          <button type="submit" className="cms-btn cms-btn--primary auth-submit">
            Gebruiker toevoegen
          </button>
        </form>

        <div className="auth-userlist">
          <p className="auth-subtitle">Bestaande gebruikers</p>
          <div className="auth-userlist__grid">
            {users.map((entry) => (
              <div key={entry.id} className="auth-usercard">
                <div>
                  <p className="auth-usercard__name">
                    {entry.name || entry.email}{" "}
                    <span className="auth-badge">{entry.role}</span>
                  </p>
                  <p className="auth-usercard__meta">{entry.email}</p>
                </div>
                <div className="auth-usercard__actions">
                  <button
                    type="button"
                    className="cms-btn cms-btn--ghost auth-delete"
                    onClick={() => handleDelete(entry.id)}
                  >
                    Verwijderen
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
