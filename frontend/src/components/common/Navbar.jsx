import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useState } from 'react';
import SmartQLogo from './SmartQLogo';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const isActive = (path) => location.pathname === path;

  return (
    <header className="sys-header" id="site-header">
      {/* ── Logo ───────────────────────────────────────────────── */}
      <Link to="/" className="flex items-center gap-3 shrink-0" aria-label="SMARTQ Home">
        <SmartQLogo height={56} />
      </Link>

      {/* ── Divider ────────────────────────────────────────────── */}
      <div className="h-8 w-px bg-burgundy-700 mx-1" aria-hidden="true" />

      {/* ── System title ───────────────────────────────────────── */}
      <span className="sys-header-title hidden sm:block">
        Sacramental Records Request System
      </span>

      {/* ── Spacer ─────────────────────────────────────────────── */}
      <div className="flex-1" />

      {/* ── Desktop Nav ────────────────────────────────────────── */}
      <nav className="hidden md:flex items-center gap-5" aria-label="Main navigation">
        <Link
          to="/"
          className={isActive('/') ? 'nav-link-active' : 'nav-link'}
        >
          Home
        </Link>


        {user ? (
          <>
            {isAdmin ? (
              <>
                <Link
                  to="/admin"
                  className={isActive('/admin') ? 'nav-link-active' : 'nav-link'}
                >
                  Admin Panel
                </Link>
                <Link
                  to="/track"
                  className={isActive('/track') ? 'nav-link-active' : 'nav-link'}
                >
                  🔍 Track ID
                </Link>
              </>
            ) : (
              <Link
                to="/dashboard"
                className={isActive('/dashboard') ? 'nav-link-active' : 'nav-link'}
              >
                My Requests
              </Link>
            )}

            <div className="flex items-center gap-3 ml-2">
              <span className="text-cream-400 text-base font-bold">
                {user.name.split(' ')[0]}
                {isAdmin && (
                  <span className="ml-1.5 badge bg-cream-700/30 text-cream-200 border-cream-600/40 text-[10px]">
                    Admin
                  </span>
                )}
              </span>
              <button
                onClick={handleLogout}
                className="btn-secondary !py-2 !px-6 text-sm"
                id="header-logout-btn"
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3 ml-2">
            <Link to="/login"    className="btn-secondary !py-2 !px-6 text-sm" id="header-login-btn">Login</Link>
            <Link to="/register" className="btn-primary  !py-2 !px-6 text-sm" id="header-register-btn">Register</Link>
          </div>
        )}
      </nav>

      {/* ── Mobile Toggle ──────────────────────────────────────── */}
      <button
        className="md:hidden text-cream-300 hover:text-cream-100 ml-3"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {menuOpen
            ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
        </svg>
      </button>

      {/* ── Mobile Dropdown ────────────────────────────────────── */}
      {menuOpen && (
        <div className="absolute top-[80px] left-0 right-0 bg-burgundy-900 border-b-2 border-cream-700 px-6 py-5 space-y-3 z-50 md:hidden animate-fade-in shadow-lg">
          <Link to="/"      className="block nav-link py-1.5" onClick={() => setMenuOpen(false)}>Home</Link>

          {user ? (
            <>
              {isAdmin
                ? (
                  <>
                    <Link to="/admin" className="block nav-link py-1.5" onClick={() => setMenuOpen(false)}>Admin Panel</Link>
                    <Link to="/track" className="block nav-link py-1.5" onClick={() => setMenuOpen(false)}>🔍 Track ID</Link>
                  </>
                )
                : <Link to="/dashboard" className="block nav-link py-1.5" onClick={() => setMenuOpen(false)}>My Requests</Link>}
              <button onClick={handleLogout} className="btn-secondary w-full text-sm mt-2">Logout</button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-1">
              <Link to="/login"    className="btn-secondary text-center text-sm" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="btn-primary  text-center text-sm" onClick={() => setMenuOpen(false)}>Register</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
