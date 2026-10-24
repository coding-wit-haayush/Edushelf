import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiOutlineSearch, HiOutlineArrowRight, HiOutlineBookOpen, HiOutlineUsers,
  HiOutlineDownload, HiOutlineAcademicCap, HiOutlineCloudDownload,
  HiOutlineCollection, HiOutlineSparkles, HiOutlineRefresh,
} from 'react-icons/hi';
import BookCard from '../components/BookCard';
import { useAuth } from '../context/AuthContext';
import { getBooks, getPublicStats } from '../services/api';
import { DEPARTMENTS } from '../constants';

const fmt = (n) => (typeof n === 'number' ? n.toLocaleString('en-IN') : '—');

const STEPS = [
  { icon: HiOutlineAcademicCap, title: 'Pick your course', text: 'Choose your department and semester to see only the books you need.' },
  { icon: HiOutlineSearch,      title: 'Find any book',    text: 'Search by title, author or subject and open the PDF instantly.' },
  { icon: HiOutlineCloudDownload, title: 'Read or download', text: 'Read online or download for offline study. Save favourites to My Library.' },
];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState('');
  const [stats, setStats] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const [booksRes, statsRes] = await Promise.allSettled([
        getBooks({ sort: 'likes', limit: 8 }),
        getPublicStats(),
      ]);
      if (booksRes.status === 'fulfilled') setBooks(booksRes.value.data.books || []);
      else setError(true);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchVal.trim();
    navigate(q ? `/explore?search=${encodeURIComponent(q)}` : '/explore');
  };

  const STATS = [
    { icon: HiOutlineBookOpen, label: 'Books available', value: stats?.books },
    { icon: HiOutlineUsers,    label: 'Registered students', value: stats?.students },
    { icon: HiOutlineDownload, label: 'Total downloads', value: stats?.downloads },
    { icon: HiOutlineAcademicCap, label: 'Departments', value: DEPARTMENTS.length },
  ];

  return (
    <div>
      {/* ── HERO ───────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-navy">
        <div aria-hidden="true" className="absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-brand-200/50 blur-3xl" />
        <div aria-hidden="true" className="absolute top-40 -left-32 w-80 h-80 rounded-full bg-sky-200/40 blur-3xl" />

        <div className="relative page-container mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-16 sm:pb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 bg-white border border-brand-100 text-brand-700 rounded-full px-3.5 py-1.5 text-xs font-semibold shadow-card mb-6">
                <HiOutlineSparkles className="w-4 h-4" /> Free eBook library for college students
              </span>

              <h1 className="font-display font-extrabold text-ink text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.1] mb-5">
                Your college library,<br />
                <span className="gradient-text">anywhere, anytime.</span>
              </h1>

              <p className="text-gray-400 text-base sm:text-lg mb-8 max-w-lg leading-relaxed">
                Semester-wise books, notes and study material for every department — organised, searchable and free to read.
              </p>

              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-xl mb-6" role="search">
                <div className="relative flex-1">
                  <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input type="text" value={searchVal} onChange={(e) => setSearchVal(e.target.value)}
                    aria-label="Search books" placeholder="Search by title, author or subject…"
                    className="w-full bg-white border border-navy-border text-ink placeholder-gray-600 rounded-xl pl-12 pr-4 py-3.5 text-sm shadow-card focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-all" />
                </div>
                <button type="submit" className="btn-primary !py-3.5 px-7">Search</button>
              </form>

              <div className="flex flex-wrap items-center gap-3">
                <Link to="/explore" className="btn-secondary !py-2.5 text-sm">
                  <HiOutlineCollection className="w-4 h-4" /> Browse all books
                </Link>
                {!user && (
                  <Link to="/register" className="text-sm font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1">
                    Create free account <HiOutlineArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>

            {/* Decorative book stack */}
            <div className="hidden lg:block relative h-[24rem]" aria-hidden="true">
              <div className="absolute top-2 left-10 w-60 card p-4 rotate-[-6deg] shadow-lift">
                <div className="h-32 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-5xl">💻</div>
                <div className="h-3 w-3/4 bg-slate-200 rounded mt-4" /><div className="h-2.5 w-1/2 bg-slate-100 rounded mt-2" />
              </div>
              <div className="absolute top-14 right-6 w-60 card p-4 rotate-[5deg] shadow-lift">
                <div className="h-32 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-5xl">💊</div>
                <div className="h-3 w-2/3 bg-slate-200 rounded mt-4" /><div className="h-2.5 w-2/5 bg-slate-100 rounded mt-2" />
              </div>
              <div className="absolute bottom-0 left-28 w-60 card p-4 rotate-[-2deg] shadow-lift">
                <div className="h-32 rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-5xl">📈</div>
                <div className="h-3 w-4/5 bg-slate-200 rounded mt-4" /><div className="h-2.5 w-1/3 bg-slate-100 rounded mt-2" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS (live numbers from the database) ─── */}
      <section className="page-container mx-auto px-4 sm:px-6 -mt-2 mb-14">
        <div className="card grid grid-cols-2 lg:grid-cols-4 divide-navy-border lg:divide-x">
          {STATS.map(({ icon: Icon, label, value }, i) => (
            <div key={label} className={`flex items-center gap-3.5 p-5 ${i < 2 ? 'border-b border-navy-border lg:border-b-0' : ''} ${i % 2 === 0 ? 'border-r border-navy-border lg:border-r-0' : ''}`}>
              <span className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0"><Icon className="w-5 h-5" /></span>
              <div className="min-w-0">
                <p className="font-display font-extrabold text-ink text-xl sm:text-2xl leading-none">{fmt(value)}</p>
                <p className="text-xs text-gray-500 mt-1 truncate">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── DEPARTMENTS ───────────────────────────── */}
      <section className="page-container mx-auto px-4 sm:px-6 mb-16">
        <div className="flex items-end justify-between mb-6 gap-4">
          <div>
            <h2 className="section-title">Browse by department</h2>
            <p className="text-sm text-gray-500 mt-1">Jump straight to the books for your course</p>
          </div>
          <Link to="/explore" className="text-sm font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 shrink-0">
            View all <HiOutlineArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {DEPARTMENTS.map(dept => {
            const count = stats?.departments?.[dept.name];
            return (
              <Link key={dept.name} to={`/department/${encodeURIComponent(dept.name)}`}
                className="card p-4 group hover:border-brand-300 hover:-translate-y-1 hover:shadow-lift transition-all duration-200 block">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${dept.grad} flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform`}>
                  {dept.icon}
                </div>
                <p className="font-display font-bold text-ink">{dept.name}</p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{dept.desc}</p>
                {typeof count === 'number' && (
                  <p className="text-xs font-semibold text-brand-600 mt-2">{count} {count === 1 ? 'book' : 'books'}</p>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── POPULAR BOOKS ─────────────────────────── */}
      <section className="page-container mx-auto px-4 sm:px-6 mb-16">
        <div className="flex items-end justify-between mb-6 gap-4">
          <div>
            <h2 className="section-title">Most popular books</h2>
            <p className="text-sm text-gray-500 mt-1">Ranked by likes from students like you</p>
          </div>
          <Link to="/explore?sort=likes" className="text-sm font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 shrink-0">
            View all <HiOutlineArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {Array(8).fill(0).map((_, i) => <div key={i} className="card h-72 animate-pulse" />)}
          </div>
        ) : error ? (
          <div className="card text-center py-14 px-4">
            <p className="text-4xl mb-3">⚠️</p>
            <p className="font-bold text-ink">Couldn't reach the server</p>
            <p className="text-gray-500 text-sm mt-1 mb-5">Make sure the backend is running on port 5000, then try again.</p>
            <button onClick={load} className="btn-primary text-sm"><HiOutlineRefresh className="w-4 h-4" /> Retry</button>
          </div>
        ) : books.length === 0 ? (
          <div className="card text-center py-14 px-4">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-bold text-ink">No books yet</p>
            <p className="text-gray-500 text-sm mt-1">Books appear here once faculty upload them and an admin approves them.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {books.map(book => <BookCard key={book._id} book={book} />)}
          </div>
        )}
      </section>

      {/* ── HOW IT WORKS ──────────────────────────── */}
      <section className="page-container mx-auto px-4 sm:px-6 mb-16">
        <div className="text-center mb-8">
          <h2 className="section-title">How EduShelf works</h2>
          <p className="text-sm text-gray-500 mt-1">Three simple steps to start studying</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-5">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <div key={title} className="card p-6 relative">
              <span className="absolute top-5 right-5 font-display font-extrabold text-4xl text-brand-100">{i + 1}</span>
              <span className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4"><Icon className="w-6 h-6" /></span>
              <h3 className="font-display font-bold text-ink text-lg mb-1.5">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────── */}
      <section className="page-container mx-auto px-4 sm:px-6 mb-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 px-6 py-12 sm:py-14 text-center">
          <div aria-hidden="true" className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-white/10" />
          <div aria-hidden="true" className="absolute -bottom-24 -right-16 w-72 h-72 rounded-full bg-white/10" />
          <div className="relative">
            <h2 className="font-display font-extrabold !text-white text-2xl sm:text-3xl mb-3">Can't find the book you need?</h2>
            <p className="text-brand-100 mb-7 max-w-md mx-auto">Send us a request and we'll add it to the library for you.</p>
            <Link to="/request-book" className="inline-flex items-center gap-2 bg-white text-brand-700 font-bold px-7 py-3 rounded-xl hover:bg-brand-50 transition-colors shadow-lift">
              Request a book <HiOutlineArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
