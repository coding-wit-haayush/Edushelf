import { useState, useEffect } from 'react';
import { HiOutlineInbox } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { createBookRequest, getMyRequests } from '../services/api';
import { useAuth } from '../context/AuthContext';

const DEPARTMENTS = ['BCA', 'BBA', 'B.Tech', 'Pharma', 'Agriculture', 'MBA'];
const PRIORITIES = ['Low', 'Medium', 'High'];

export default function RequestBook() {
  const { user } = useAuth();
  const [form, setForm] = useState({ bookName: '', author: '', department: '', priority: 'Medium', reason: '' });
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const fetchRequests = async () => {
    if (!user) return; // /requests/my requires auth — nothing to show for guests
    setLoadingRequests(true);
    try {
      const res = await getMyRequests();
      setRequests(res.data.requests || []);
    } catch {
      // leave list empty rather than showing fake data
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => { fetchRequests(); }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.bookName || !form.department) { toast.error('Fill required fields'); return; }
    if (!user) { toast.error('Please login to request a book'); return; }

    setLoading(true);
    try {
      // Backend field is "bookTitle", not "bookName" — mapped here to keep the form UX unchanged
      await createBookRequest({
        bookTitle: form.bookName,
        author: form.author,
        department: form.department,
        reason: form.reason,
        priority: form.priority,
      });
      toast.success('Request submitted! We\'ll upload it within 48 hours 📚');
      setForm({ bookName: '', author: '', department: '', priority: 'Medium', reason: '' });
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (status) => {
    const map = { pending: 'badge-pending', accepted: 'badge-approved', uploaded: 'bg-brand-400/10 text-brand-600 border border-brand-400/20 text-xs px-2.5 py-1 rounded-full', rejected: 'badge-rejected' };
    return <span className={map[status] || 'badge-pending'}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-extrabold text-ink">Request a Book 📩</h1>
        <p className="text-gray-500 mt-1">Can't find your book? Request it — we'll upload it within 48 hours.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Form */}
        <div className="card p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Book Name *</label>
              <input type="text" name="bookName" value={form.bookName} onChange={handleChange}
                placeholder="Enter book name" className="input-field" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Author (optional)</label>
              <input type="text" name="author" value={form.author} onChange={handleChange}
                placeholder="Enter author name" className="input-field" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Department *</label>
              <select name="department" value={form.department} onChange={handleChange} className="input-field appearance-none">
                <option value="">Select department</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Priority</label>
              <div className="flex gap-2">
                {PRIORITIES.map(p => (
                  <button key={p} type="button" onClick={() => setForm({ ...form, priority: p })}
                    className={`flex-1 py-2 rounded-xl text-sm border transition-all ${
                      form.priority === p
                        ? p === 'High' ? 'border-red-500 bg-red-500/10 text-red-600'
                          : p === 'Medium' ? 'border-yellow-500 bg-yellow-500/10 text-amber-500'
                          : 'border-green-500 bg-green-500/10 text-green-600'
                        : 'border-navy-border text-gray-500 hover:border-gray-500'
                    }`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Reason (optional)</label>
              <textarea name="reason" value={form.reason} onChange={handleChange}
                rows={3} placeholder="Why do you need this book?" className="input-field resize-none" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary py-3 text-base font-semibold">
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>

        {/* Previous Requests */}
        <div>
          <h3 className="font-semibold text-ink mb-4 flex items-center gap-2">
            <HiOutlineInbox className="w-5 h-5 text-brand-600" /> Your Requests
          </h3>
          {!user ? (
            <p className="text-gray-500 text-sm">Login to see your past requests.</p>
          ) : loadingRequests ? (
            <div className="flex flex-col gap-3">
              {Array(3).fill(0).map((_, i) => <div key={i} className="card h-16 animate-pulse" />)}
            </div>
          ) : requests.length === 0 ? (
            <p className="text-gray-500 text-sm">You haven't requested any books yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {requests.map(req => (
                <div key={req._id} className="card p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-ink">{req.bookTitle}</p>
                    {statusBadge(req.status)}
                  </div>
                  <p className="text-xs text-gray-500">{req.department} • {new Date(req.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
