import { useState, useEffect, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import { adminGetAllBooks, deleteBook, adminApproveBook, adminRejectBook, updateBook } from '../services/api';
import { HiOutlineSearch, HiOutlinePencil, HiOutlineTrash, HiOutlineCheck, HiOutlinePlus, HiX } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const PAGE_SIZE = 10;

const bookStatus = (b) => b.isApproved ? 'approved' : b.isRejected ? 'rejected' : 'pending';

export default function ManageBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All Departments');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [page, setPage] = useState(1);
  const [editingBook, setEditingBook] = useState(null); // book object or null

  const loadBooks = async () => {
    setLoading(true);
    try {
      const res = await adminGetAllBooks();
      setBooks(res.data.books || []);
    } catch {
      toast.error('Could not load books');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBooks(); }, []);

  const filtered = useMemo(() => books.filter(b => {
    const matchSearch = b.title.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'All Departments' || b.department === deptFilter;
    const matchStatus = statusFilter === 'All Status' || bookStatus(b) === statusFilter.toLowerCase();
    return matchSearch && matchDept && matchStatus;
  }), [books, search, deptFilter, statusFilter]);

  // Reset to page 1 whenever the filters change, otherwise you can get stuck on an empty page
  useEffect(() => { setPage(1); }, [search, deptFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async (id) => {
    if (!confirm('Delete this book? This cannot be undone.')) return;
    const prev = books;
    setBooks(books.filter(b => b._id !== id)); // optimistic
    try {
      await deleteBook(id);
      toast.success('Book deleted');
    } catch (err) {
      setBooks(prev); // roll back on failure instead of pretending it worked
      toast.error(err.response?.data?.message || 'Failed to delete book');
    }
  };

  const handleApprove = async (id) => {
    const prev = books;
    setBooks(books.map(b => b._id === id ? { ...b, isApproved: true, isRejected: false } : b));
    try {
      await adminApproveBook(id);
      toast.success('Book approved!');
    } catch (err) {
      setBooks(prev);
      toast.error(err.response?.data?.message || 'Failed to approve book');
    }
  };

  const handleReject = async (id) => {
    const prev = books;
    setBooks(books.map(b => b._id === id ? { ...b, isApproved: false, isRejected: true } : b));
    try {
      await adminRejectBook(id);
      toast.success('Book rejected');
    } catch (err) {
      setBooks(prev);
      toast.error(err.response?.data?.message || 'Failed to reject book');
    }
  };

  const handleSaveEdit = async (updated) => {
    try {
      const res = await updateBook(editingBook._id, updated);
      setBooks(books.map(b => b._id === editingBook._id ? res.data.book : b));
      toast.success('Book updated');
      setEditingBook(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update book');
    }
  };

  const statusBadge = (status) => {
    if (status === 'approved') return <span className="badge-approved">Approved</span>;
    if (status === 'pending')  return <span className="badge-pending">Pending</span>;
    return <span className="badge-rejected">Rejected</span>;
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar adminMode />

      <main className="flex-1 min-w-0 px-4 sm:px-6 py-8 pb-24 lg:pb-8 page-container w-full mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-ink">Manage Books</h1>
            <p className="text-gray-500 mt-1">View, edit and manage all books in the library</p>
          </div>
          <Link to="/upload" className="btn-primary whitespace-nowrap shrink-0">
            <HiOutlinePlus className="w-4 h-4" /> Add New Book
          </Link>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search books..." className="input-field pl-9 py-2.5 text-sm" />
          </div>
          <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}
            className="input-field py-2.5 text-sm w-auto min-w-[160px] appearance-none">
            {['All Departments', 'BCA', 'BBA', 'B.Tech', 'Pharma', 'Agriculture', 'MBA'].map(d =>
              <option key={d}>{d}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field py-2.5 text-sm w-auto min-w-[130px] appearance-none">
            {['All Status', 'Approved', 'Pending', 'Rejected'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* Table */}
        <p className="sm:hidden text-xs text-gray-500 mb-2">← Swipe sideways to see all columns →</p>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] admin-table">
              <thead>
                <tr className="border-b border-navy-border">
                  <th>Book</th><th>Department</th><th>Semester</th><th>Likes</th><th>Downloads</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}><td colSpan={7}><div className="h-10 rounded-lg bg-navy animate-pulse my-1" /></td></tr>
                  ))
                ) : paged.length === 0 ? (
                  <tr><td colSpan={7} className="text-center text-gray-500 py-8">No books match your filters.</td></tr>
                ) : paged.map(book => {
                  const status = bookStatus(book);
                  return (
                    <tr key={book._id} className="hover:bg-navy/30 transition-colors">
                      <td className="font-medium text-ink max-w-[200px]">
                        <p className="truncate">{book.title}</p>
                      </td>
                      <td>{book.department}</td>
                      <td>Sem {book.semester}</td>
                      <td>{(book.likes?.length || 0).toLocaleString()}</td>
                      <td>{(book.downloads || 0).toLocaleString()}</td>
                      <td>{statusBadge(status)}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          {status === 'pending' && (
                            <button onClick={() => handleApprove(book._id)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-400/10 rounded-lg transition-colors" title="Approve">
                              <HiOutlineCheck className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => setEditingBook(book)}
                            className="p-1.5 text-blue-600 hover:bg-blue-400/10 rounded-lg transition-colors" title="Edit">
                            <HiOutlinePencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(book._id)}
                            className="p-1.5 text-red-600 hover:bg-red-400/10 rounded-lg transition-colors" title="Delete">
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination — now driven by real filtered results instead of decorative buttons */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-navy-border">
            <p className="text-xs text-gray-500">Showing {paged.length} of {filtered.length} books</p>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                    page === p ? 'bg-brand-600 text-white' : 'text-gray-500 hover:text-ink hover:bg-navy-card'}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {editingBook && (
        <EditBookModal book={editingBook} onClose={() => setEditingBook(null)} onSave={handleSaveEdit} />
      )}
    </div>
  );
}

function EditBookModal({ book, onClose, onSave }) {
  const [form, setForm] = useState({
    title: book.title || '',
    author: book.author || '',
    department: book.department || '',
    semester: book.semester || '',
    subject: book.subject || '',
    description: book.description || '',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="card p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-bold text-ink">Edit Book</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-ink"><HiX className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Title</label>
            <input name="title" value={form.title} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Author</label>
            <input name="author" value={form.author} onChange={handleChange} className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Department</label>
              <input name="department" value={form.department} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Semester</label>
              <input name="semester" type="number" min="1" max="8" value={form.semester} onChange={handleChange} className="input-field" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Subject</label>
            <input name="subject" value={form.subject} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Description</label>
            <textarea name="description" rows={3} value={form.description} onChange={handleChange} className="input-field resize-none" />
          </div>
          <button type="submit" disabled={saving} className="btn-primary py-2.5 mt-1 disabled:opacity-60">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
