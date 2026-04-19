import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-navy-900/80 backdrop-blur border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/30 group-hover:shadow-brand-500/50 transition-shadow">
              <span className="text-navy-900 font-bold text-sm">SQ</span>
            </div>
            <span className="font-display font-bold text-white text-lg">
              SMART <span className="text-brand-400">Q</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/"      className={isActive('/')      ? 'nav-link-active' : 'nav-link'}>Home</Link>
            <Link to="/track" className={isActive('/track') ? 'nav-link-active' : 'nav-link'}>Track Request</Link>

            {user ? (
              <>
                {isAdmin ? (
                  <Link to="/admin" className={isActive('/admin') ? 'nav-link-active' : 'nav-link'}>Admin Panel</Link>
                ) : (
                  <Link to="/dashboard" className={isActive('/dashboard') ? 'nav-link-active' : 'nav-link'}>My Requests</Link>
                )}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-400">
                    {user.name.split(' ')[0]}
                    {isAdmin && <span className="ml-1.5 badge badge-approved">Admin</span>}
                  </span>
                  <button onClick={handleLogout} className="btn-secondary !py-2 !px-4 text-sm">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login"    className="btn-secondary !py-2 !px-4 text-sm">Login</Link>
                <Link to="/register" className="btn-primary  !py-2 !px-4 text-sm">Register</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-slate-400 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-800 py-4 space-y-3 animate-fade-in">
            <Link to="/"      className="block nav-link py-2" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to="/track" className="block nav-link py-2" onClick={() => setMenuOpen(false)}>Track Request</Link>
            {user ? (
              <>
                {isAdmin
                  ? <Link to="/admin" className="block nav-link py-2" onClick={() => setMenuOpen(false)}>Admin Panel</Link>
                  : <Link to="/dashboard" className="block nav-link py-2" onClick={() => setMenuOpen(false)}>My Requests</Link>}
                <button onClick={handleLogout} className="btn-secondary w-full text-sm">Logout</button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link to="/login"    className="btn-secondary text-center text-sm" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/register" className="btn-primary  text-center text-sm" onClick={() => setMenuOpen(false)}>Register</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
