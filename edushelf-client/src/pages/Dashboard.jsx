import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import BookCard from '../components/BookCard';
import { useAuth } from '../context/AuthContext';
import { getMyStats, getRecentBooks } from '../services/api';
import { HiOutlineBookOpen, HiOutlineHeart, HiOutlineDownload, HiOutlineClock,
         HiOutlineCollection, HiOutlineAcademicCap, HiOutlineInbox, HiOutlineBookmark } from 'react-icons/hi';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ booksRead: 0, savedBooks: 0, downloads: 0, readingHours: 0 });
  const [continueReading, setContinueReading] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [statsRes, recentRes] = await Promise.all([getMyStats(), getRecentBooks()]);
        setStats(statsRes.data);
        setContinueReading((recentRes.data.books || []).slice(0, 3));
      } catch {
        // leave defaults at 0 rather than showing invented numbers
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const STATS = [
    { icon: HiOutlineBookOpen, label: 'Books Read',    value: stats.booksRead,                color: 'text-brand-600',  bg: 'bg-brand-500/10' },
    { icon: HiOutlineHeart,    label: 'Books Saved',   value: stats.savedBooks,               color: 'text-pink-600',    bg: 'bg-pink-500/10' },
    { icon: HiOutlineDownload, label: 'Downloads',     value: stats.downloads,                color: 'text-cyan-600',    bg: 'bg-cyan-500/10' },
    { icon: HiOutlineClock,    label: 'Reading Hours', value: `${stats.readingHours || 0}h`,  color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar />

      <main className="flex-1 min-w-0 px-4 sm:px-6 py-8 pb-24 lg:pb-8 page-container w-full mx-auto">
        {/* Welcome */}
        <div className="mb-8">
          <p className="text-gray-500 text-sm">Welcome back,</p>
          <h1 className="font-display text-3xl font-extrabold text-ink">
            {user?.name || 'Student'} 👋
          </h1>
          <p className="text-gray-500 mt-1">{[user?.department, user?.semester ? `Semester ${user.semester}` : null].filter(Boolean).join(' • ')}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STATS.map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="stat-card">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className={`font-display text-2xl font-extrabold ${color}`}>{loading ? '—' : value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Quick actions */}
          <div className="card p-5">
            <h3 className="font-display font-bold text-ink mb-4">Quick actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { to: '/explore', icon: HiOutlineCollection, label: 'Browse library' },
                { to: user?.department ? `/department/${encodeURIComponent(user.department)}` : '/explore', icon: HiOutlineAcademicCap, label: 'My department' },
                { to: '/request-book', icon: HiOutlineInbox, label: 'Request a book' },
                { to: '/my-library', icon: HiOutlineBookmark, label: 'My library' },
              ].map(({ to, icon: Icon, label }) => (
                <Link key={label} to={to} className="flex flex-col items-start gap-2 p-4 rounded-xl border border-navy-border hover:border-brand-300 hover:bg-brand-50 transition-colors">
                  <span className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center"><Icon className="w-5 h-5" /></span>
                  <span className="text-sm font-semibold text-ink">{label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Recently Viewed — real data from the backend (no per-book reading-progress
              tracking exists yet, so this shows recency rather than a fake % complete) */}
          <div className="card p-5">
            <h3 className="font-semibold text-ink mb-4">Continue Reading</h3>
            {loading ? (
              <div className="flex flex-col gap-3">
                {Array(3).fill(0).map((_, i) => <div key={i} className="h-14 rounded-xl bg-navy animate-pulse" />)}
              </div>
            ) : continueReading.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-6">No recently viewed books yet — go explore the library!</p>
            ) : (
              <div className="flex flex-col gap-3">
                {continueReading.map(book => (
                  <Link key={book._id} to={`/book/${book._id}`} className="flex items-center gap-3 p-3 bg-navy rounded-xl hover:bg-navy-card transition-colors">
                    <div className="w-9 h-11 rounded-lg bg-gradient-to-br from-brand-600 to-blue-700 flex items-center justify-center text-lg shrink-0">
                      📖
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink truncate">{book.title}</p>
                      <p className="text-xs text-gray-500">{book.author}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
