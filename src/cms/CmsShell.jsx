import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function CmsShell({ children }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout, isSuper } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNav = (path) => {
    setOpen(false);
    navigate(path);
  };

  useEffect(() => {
    if (!open) return;
    const handleOutside = (event) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [open]);

  return (
    <div className="cms-shell">
      <header className="cms-header">
        <img
          className="cms-header__logo"
          src="/img/logo-web.svg"
          alt="Logo Het Utrechts Archief"
        />

        <div className="cms-header__inner">
          <p className="cms-header__title">Het Utrechts Archief</p>
          <p className="cms-header__subtitle">Content Management Systeem</p>
        </div>

        <div className="cms-header__menu" ref={menuRef}>
          <button
            type="button"
            className={`cms-menu__toggle ${open ? "is-open" : ""}`}
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Menu"
            aria-expanded={open}
          >
            <span />
            <span />
            <span />
          </button>

          {open ? (
            <div className="cms-menu__panel">
              <div className="cms-menu__user">
                <p className="cms-menu__name">{user?.name || user?.email}</p>
                <p className="cms-menu__role">{user?.role}</p>
              </div>
              <button
                type="button"
                className="cms-menu__item"
                onClick={() => handleNav("/account")}
              >
                Account beheren
              </button>
              {isSuper ? (
                <button
                  type="button"
                  className="cms-menu__item"
                  onClick={() => handleNav("/admin/users")}
                >
                  Gebruikers beheren
                </button>
              ) : null}
              <button
                type="button"
                className="cms-menu__item cms-menu__item--danger"
                onClick={handleLogout}
              >
                Uitloggen
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <main className="cms-main">{children}</main>
    </div>
  );
}
