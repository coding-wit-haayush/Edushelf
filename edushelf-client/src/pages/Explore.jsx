import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { HiOutlineSearch, HiOutlineRefresh, HiX, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';
import BookCard from '../components/BookCard';
import { getBooks } from '../services/api';
import { DEPARTMENTS, SEMESTER_LIST } from '../constants';

const LIMIT = 12;
const SORTS = [
  { value: 'createdAt', label: 'Newest' },
  { value: 'likes',     label: 'Most liked' },
  { value: 'views',     label: 'Most viewed' },
  { value: 'downloads', label: 'Most downloaded' },
  { value: 'rating',    label: 'Top rated' },
];

export default function Explore() {
  const [params, setParams] = useSearchParams();
  const search = params.get('search') || '';
  const department = params.get('department') || '';
  const semester = params.get('semester') || '';
  const sort = params.get('sort') || 'createdAt';
  const page = Math.max(1, Number(params.get('page')) || 1);

  const [searchVal, setSearchVal] = useState(search);
  const [books, setBooks] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => { setSearchVal(search); }, [search]);

  // Update one or more URL params; any filter change resets to page 1.
  const update = (changes, keepPage = false) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!keepPage) next.delete('page');
    setParams(next);
  };

  const fetchBooks = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await getBooks({
        search: search || undefined, department: department || undefined,
        semester: semester || undefined, sort, page, limit: LIMIT,
      });
      setBooks(res.data.books || []);
      setTotal(res.data.total || 0);
    } catch {
      setError(true); setBooks([]); setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBooks(); /* eslint-disable-next-line */ }, [search, department, semester, sort, page]);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const hasFilters = search || department || semester || sort !== 'createdAt';
  const clearAll = () => setParams({});

  return (
    <div className="page-container mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="font-display font-extrabold text-ink text-3xl">Explore the library</h1>
        <p className="text-gray-500 mt-1">Search and filter every book by department, semester and popularity.</p>
      </div>

      {/* Filters */}
      <div className="card p-4 sm:p-5 mb-6">
        <form onSubmit={(e) => { e.preventDefault(); update({ search: searchVal.trim() }); }} className="flex gap-2 mb-4" role="search">
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input type="text" value={searchVal} onChange={(e) => setSearchVal(e.target.value)}
              aria-label="Search books" placeholder="Search books, authors, subjects, tags…" className="input-field !pl-11" />
          </div>
          <button type="submit" className="btn-primary px-5">Search</button>
        </form>

        {/* Department chips (scrollable on small screens) */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <button onClick={() => update({ department: '' })} className={`chip ${!department ? 'active' : ''}`}>All departments</button>
          {DEPARTMENTS.map(d => (
            <button key={d.name} onClick={() => update({ department: d.name })} className={`chip ${department === d.name ? 'active' : ''}`}>
              {d.icon} {d.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 mt-4">
          <label className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 text-sm text-gray-500 min-w-0">
            <span className="shrink-0 font-medium">Semester</span>
            <select value={semester} onChange={(e) => update({ semester: e.target.value })} className="input-field !py-2 w-full sm:!w-auto min-w-0">
              <option value="">All</option>
              {SEMESTER_LIST.map(s => <option key={s} value={s}>Sem {s}</option>)}
            </select>
          </label>
          <label className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 text-sm text-gray-500 min-w-0">
            <span className="shrink-0 font-medium">Sort by</span>
            <select value={sort} onChange={(e) => update({ sort: e.target.value === 'createdAt' ? '' : e.target.value })} className="input-field !py-2 w-full sm:!w-auto min-w-0">
              {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </label>
          {hasFilters && (
            <button onClick={clearAll} className="col-span-2 sm:col-span-1 sm:ml-auto inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl px-3 py-2 transition-colors">
              <HiX className="w-4 h-4" /> Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Result count */}
      {!loading && !error && (
        <p className="text-sm text-gray-500 mb-4">
          <span className="font-bold text-ink">{total}</span> {total === 1 ? 'book' : 'books'} found
          {search && <> for “<span className="font-semibold text-ink">{search}</span>”</>}
        </p>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {Array(8).fill(0).map((_, i) => <div key={i} className="card h-72 animate-pulse" />)}
        </div>
      ) : error ? (
        <div className="card text-center py-14 px-4">
          <p className="text-4xl mb-3">⚠️</p>
          <p className="font-bold text-ink">Couldn't load books</p>
          <p className="text-gray-500 text-sm mt-1 mb-5">Check that the backend server is running and try again.</p>
          <button onClick={fetchBooks} className="btn-primary text-sm"><HiOutlineRefresh className="w-4 h-4" /> Retry</button>
        </div>
      ) : books.length === 0 ? (
        <div className="card text-center py-14 px-4">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-bold text-ink">No books match your search</p>
          <p className="text-gray-500 text-sm mt-1 mb-5">Try different keywords or clear your filters — or request the book.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {hasFilters && <button onClick={clearAll} className="btn-secondary text-sm">Clear filters</button>}
            <Link to="/request-book" className="btn-primary text-sm">Request this book</Link>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {books.map(book => <BookCard key={book._id} book={book} />)}
          </div>

          {totalPages > 1 && (
            <nav className="flex items-center justify-center gap-3 mt-10" aria-label="Pagination">
              <button disabled={page <= 1} onClick={() => update({ page: String(page - 1) }, true)}
                className="btn-secondary !px-3.5 !py-2 text-sm"><HiOutlineChevronLeft className="w-4 h-4" /> Prev</button>
              <span className="text-sm text-gray-500">Page <b className="text-ink">{page}</b> of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => update({ page: String(page + 1) }, true)}
                className="btn-secondary !px-3.5 !py-2 text-sm">Next <HiOutlineChevronRight className="w-4 h-4" /></button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
