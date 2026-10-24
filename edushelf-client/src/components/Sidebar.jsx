import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineHome, HiOutlineBookOpen, HiOutlineHeart, HiOutlineClock,
  HiOutlineDownload, HiOutlineInbox, HiOutlineCog, HiOutlineLogout,
  HiOutlineViewGrid, HiOutlineUsers, HiOutlineUpload, HiOutlineCollection,
} from 'react-icons/hi';

const studentLinks = [
  { icon: HiOutlineHome,     label: 'Dashboard',    short: 'Home',     path: '/dashboard' },
  { icon: HiOutlineBookOpen, label: 'My Library',   short: 'Library',  path: '/my-library' },
  { icon: HiOutlineHeart,    label: 'Liked Books',  path: '/my-library?tab=liked' },
  { icon: HiOutlineClock,    label: 'Recent Reads', path: '/my-library?tab=recent' },
  { icon: HiOutlineDownload, label: 'Downloads',    path: '/my-library?tab=downloads' },
  { icon: HiOutlineInbox,    label: 'Request a Book', short: 'Request', path: '/request-book' },
  { icon: HiOutlineCog,      label: 'Settings',     short: 'Settings', path: '/settings' },
];

const facultyExtra = { icon: HiOutlineUpload, label: 'Upload Book', short: 'Upload', path: '/upload' };

const adminLinks = [
  { icon: HiOutlineViewGrid,  label: 'Dashboard',  short: 'Home',     path: '/admin' },
  { icon: HiOutlineBookOpen,  label: 'Books',      short: 'Books',    path: '/admin/books' },
  { icon: HiOutlineUsers,     label: 'Users',      short: 'Users',    path: '/admin/users' },
  { icon: HiOutlineInbox,     label: 'Requests',   short: 'Requests', path: '/admin/requests' },
  { icon: HiOutlineUpload,    label: 'Upload Book', short: 'Upload',  path: '/upload' },
  { icon: HiOutlineCollection,label: 'Browse Library', path: '/explore' },
  { icon: HiOutlineCog,       label: 'Settings',   short: 'Settings', path: '/settings' },
];

export default function Sidebar({ adminMode = false }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  let links = adminMode ? adminLinks : studentLinks;
  if (!adminMode && (user?.role === 'faculty' || user?.role === 'admin')) {
    // Faculty/admin viewing the student pages also get an Upload shortcut
    links = [...studentLinks.slice(0, 6), facultyExtra, studentLinks[6]];
  }

  // Exactly one link is active. Links with a query string must match path+tab;
  // plain links match the pathname (and /my-library only when no other tab is selected).
  const isActive = (path) => {
    const [p, q] = path.split('?');
    if (location.pathname !== p) return false;
    const tab = new URLSearchParams(location.search).get('tab');
    if (q) return tab === new URLSearchParams(q).get('tab');
    return p === '/my-library' ? (!tab || tab === 'saved') : true;
  };

  const handleLogout = () => { logout(); navigate('/login'); };
  const mobileLinks = links.filter(l => l.short).slice(0, 5);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="w-64 shrink-0 hidden lg:flex flex-col h-[calc(100vh-4rem)] sticky top-16 bg-white border-r border-navy-border py-6 px-4 gap-1 overflow-y-auto">
        <div className="rounded-2xl bg-gradient-to-br from-brand-50 to-white border border-brand-100 px-4 py-3.5 mb-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center font-bold text-white shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-ink truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate capitalize">{user?.department ? `${user.department} · ` : ''}{user?.role}</p>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-1" aria-label="Dashboard">
          {links.map(({ icon: Icon, label, path }) => (
            <Link key={path + label} to={path} aria-current={isActive(path) ? 'page' : undefined}
              className={`sidebar-link ${isActive(path) ? 'active' : ''}`}>
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-sm">{label}</span>
            </Link>
          ))}
        </nav>

        <button onClick={handleLogout} className="sidebar-link !text-red-600 hover:!bg-red-50 mt-2">
          <HiOutlineLogout className="w-5 h-5 shrink-0" />
          <span className="text-sm">Logout</span>
        </button>
      </aside>

      {/* Mobile / tablet bottom navigation */}
      <nav aria-label="Dashboard"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-navy-border grid"
        style={{ gridTemplateColumns: `repeat(${mobileLinks.length}, minmax(0, 1fr))`, paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {mobileLinks.map(({ icon: Icon, short, path }) => {
          const active = isActive(path);
          return (
            <Link key={path} to={path} aria-current={active ? 'page' : undefined}
              className={`flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-semibold transition-colors ${active ? 'text-brand-600' : 'text-gray-500'}`}>
              <span className={`px-4 py-1 rounded-full transition-colors ${active ? 'bg-brand-50' : ''}`}><Icon className="w-5 h-5" /></span>
              {short}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
