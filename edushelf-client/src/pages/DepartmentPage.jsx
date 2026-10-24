import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiOutlineChevronLeft, HiOutlineRefresh } from 'react-icons/hi';
import BookCard from '../components/BookCard';
import { getBooks } from '../services/api';
import { DEPT_BY_NAME, SEMESTER_LIST } from '../constants';

export default function DepartmentPage() {
  const { name } = useParams();
  const [semester, setSemester] = useState('');
  const [books, setBooks] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const dept = DEPT_BY_NAME[name] || { icon: '📚', desc: 'Department', grad: 'from-slate-500 to-slate-700' };

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await getBooks({ department: name, semester: semester || undefined, limit: 24 });
      setBooks(res.data.books || []);
      setTotal(res.data.total ?? (res.data.books || []).length);
    } catch {
      setError(true); setBooks([]); setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setSemester(''); }, [name]);
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [name, semester]);

  return (
    <div className="page-container mx-auto px-4 sm:px-6 py-8">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-brand-600 transition-colors mb-5">
        <HiOutlineChevronLeft className="w-4 h-4" /> Back to home
      </Link>

      {/* Header */}
      <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${dept.grad} p-6 sm:p-8 mb-6`}>
        <div aria-hidden="true" className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10" />
        <div className="relative flex items-center gap-4 sm:gap-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-4xl shrink-0">{dept.icon}</div>
          <div className="min-w-0">
            <h1 className="font-display font-extrabold !text-white text-2xl sm:text-3xl truncate">{name}</h1>
            <p className="text-white/85 mt-1 text-sm sm:text-base">{dept.desc}</p>
          </div>
        </div>
      </div>

      {/* Semester chips (visible on every screen size) */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1" role="tablist" aria-label="Filter by semester">
        <button role="tab" aria-selected={!semester} onClick={() => setSemester('')} className={`chip ${!semester ? 'active' : ''}`}>All semesters</button>
        {SEMESTER_LIST.map(s => (
          <button key={s} role="tab" aria-selected={semester === String(s)} onClick={() => setSemester(String(s))}
            className={`chip ${semester === String(s) ? 'active' : ''}`}>Semester {s}</button>
        ))}
      </div>

      {!loading && !error && (
        <p className="text-sm text-gray-500 mb-4">
          <span className="font-bold text-ink">{total}</span> {total === 1 ? 'book' : 'books'}
          {semester && <> in Semester {semester}</>}
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {Array(8).fill(0).map((_, i) => <div key={i} className="card h-72 animate-pulse" />)}
        </div>
      ) : error ? (
        <div className="card text-center py-14 px-4">
          <p className="text-4xl mb-3">⚠️</p>
          <p className="font-bold text-ink">Couldn't load books</p>
          <p className="text-gray-500 text-sm mt-1 mb-5">Check that the backend server is running.</p>
          <button onClick={load} className="btn-primary text-sm"><HiOutlineRefresh className="w-4 h-4" /> Retry</button>
        </div>
      ) : books.length === 0 ? (
        <div className="card text-center py-14 px-4">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-bold text-ink">No books here yet</p>
          <p className="text-gray-500 text-sm mt-1 mb-5">Try a different semester, or request the book you need.</p>
          <Link to="/request-book" className="btn-primary text-sm">Request a book</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {books.map(book => <BookCard key={book._id} book={book} />)}
        </div>
      )}
    </div>
  );
}
