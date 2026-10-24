import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import {
  HiOutlineSearch, HiOutlineMenu, HiX, HiOutlineBookOpen, HiOutlineLogout,
  HiOutlineUser, HiOutlineUpload, HiOutlineViewGrid, HiOutlineCog, HiChevronDown,
} from 'react-icons/hi';

const NAV_LINKS = [
  { label: 'Home', path: '/', end: true },
  { label: 'Explore', path: '/explore' },
  { label: 'Request Book', path: '/request-book' },
];

export default function Navbar() {
  const { user, logout, isAdmin, isFaculty } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const profileRef = useRef(null);

  // Close menus on route change
  useEffect(() => { setMenuOpen(false); setProfileOpen(false); }, [location.pathname, location.search]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const onDown = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchVal.trim();
    navigate(q ? `/explore?search=${encodeURIComponent(q)}` : '/explore');
    setMenuOpen(false);
  };

  const handleLogout = () => { logout(); setProfileOpen(false); setMenuOpen(false); navigate('/login'); };

  const linkClass = ({ isActive }) =>
    `px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
      isActive ? 'text-brand-700 bg-brand-50' : 'text-gray-400 hover:text-ink hover:bg-navy'
    }`;

  const menuItem = 'flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-brand-700 hover:bg-brand-50 transition-colors';

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-navy-border">
      <div className="page-container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          <Logo />

          {/* Desktop links */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main">
            {NAV_LINKS.map(l => (
              <NavLink key={l.path} to={l.path} end={l.end} className={linkClass}>{l.label}</NavLink>
            ))}
          </nav>

          {/* Desktop search */}
          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-sm" role="search">
            <div className="relative w-full">
              <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input type="text" value={searchVal} onChange={(e) => setSearchVal(e.target.value)}
                placeholder="Search books, authors, subjects…" aria-label="Search books"
                className="w-full bg-navy border border-navy-border text-ink placeholder-gray-600 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100 transition-all" />
            </div>
          </form>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="relative" ref={profileRef}>
                <button onClick={() => setProfileOpen(o => !o)} aria-haspopup="menu" aria-expanded={profileOpen}
                  className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-full border border-navy-border hover:border-brand-400 bg-white transition-colors">
                  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-sm font-bold text-white">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden sm:block text-sm font-semibold text-ink max-w-[110px] truncate">{user.name?.split(' ')[0]}</span>
                  <HiChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileOpen && (
                  <div role="menu" className="absolute right-0 top-12 w-60 card shadow-lift py-2 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-navy-border">
                      <p className="text-sm font-bold text-ink truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1.5 badge-info capitalize">{user.role}</span>
                    </div>
                    <Link to={isAdmin ? '/admin' : '/dashboard'} className={menuItem}><HiOutlineViewGrid className="w-4 h-4" /> Dashboard</Link>
                    <Link to="/my-library" className={menuItem}><HiOutlineBookOpen className="w-4 h-4" /> My Library</Link>
                    {isFaculty && <Link to="/upload" className={menuItem}><HiOutlineUpload className="w-4 h-4" /> Upload Book</Link>}
                    <Link to="/settings" className={menuItem}><HiOutlineCog className="w-4 h-4" /> Settings</Link>
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-navy-border mt-1">
                      <HiOutlineLogout className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm px-3 py-2">Login</Link>
                <Link to="/register" className="btn-primary text-sm !py-2">Register</Link>
              </div>
            )}

            <button onClick={() => setMenuOpen(o => !o)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}
              className="md:hidden p-2 rounded-lg text-gray-400 hover:text-ink hover:bg-navy transition-colors">
              {menuOpen ? <HiX className="w-6 h-6" /> : <HiOutlineMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-navy-border">
            <form onSubmit={handleSearch} className="mb-3" role="search">
              <div className="relative">
                <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input type="text" value={searchVal} onChange={(e) => setSearchVal(e.target.value)}
                  placeholder="Search books…" aria-label="Search books" className="input-field !pl-10 !py-2.5" />
              </div>
            </form>
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map(l => (
                <NavLink key={l.path} to={l.path} end={l.end} className={linkClass}>{l.label}</NavLink>
              ))}
            </div>
            {!user && (
              <div className="grid grid-cols-2 gap-2 mt-4">
                <Link to="/login" className="btn-secondary text-sm !py-2.5">Login</Link>
                <Link to="/register" className="btn-primary text-sm !py-2.5">Register</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
