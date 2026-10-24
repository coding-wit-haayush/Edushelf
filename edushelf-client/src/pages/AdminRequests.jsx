import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { adminGetRequests, adminUpdateRequest } from '../services/api';
import { HiOutlineRefresh } from 'react-icons/hi';
import toast from 'react-hot-toast';

const STATUSES = ['pending', 'accepted', 'uploaded', 'rejected'];
const BADGE = { pending: 'badge-pending', accepted: 'badge-info', uploaded: 'badge-approved', rejected: 'badge-rejected' };
const FILTERS = ['all', ...STATUSES];

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  const load = async () => {
    setLoading(true); setError(false);
    try {
      const res = await adminGetRequests();
      setRequests(res.data.requests || []);
    } catch { setError(true); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const changeStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await adminUpdateRequest(id, status);
      setRequests(rs => rs.map(r => (r._id === id ? { ...r, status } : r)));
      toast.success(`Marked as ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update request');
    } finally { setUpdatingId(null); }
  };

  const visible = filter === 'all' ? requests : requests.filter(r => r.status === filter);
  const count = (s) => (s === 'all' ? requests.length : requests.filter(r => r.status === s).length);

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar adminMode />
      <main className="flex-1 min-w-0 px-4 sm:px-6 py-8 pb-24 lg:pb-8 page-container w-full mx-auto">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
          <div>
            <h1 className="font-display font-extrabold text-ink text-3xl">Book Requests</h1>
            <p className="text-gray-500 mt-1">Books that students have asked for</p>
          </div>
          <button onClick={load} className="btn-secondary text-sm !py-2"><HiOutlineRefresh className="w-4 h-4" /> Refresh</button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 mb-5">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`chip capitalize ${filter === f ? 'active' : ''}`}>
              {f} ({count(f)})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">{Array(4).fill(0).map((_, i) => <div key={i} className="card h-24 animate-pulse" />)}</div>
        ) : error ? (
          <div className="card text-center py-14 px-4">
            <p className="text-4xl mb-3">⚠️</p>
            <p className="font-bold text-ink">Couldn't load requests</p>
            <button onClick={load} className="btn-primary text-sm mt-4">Try again</button>
          </div>
        ) : visible.length === 0 ? (
          <div className="card text-center py-14 px-4">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-bold text-ink">No {filter === 'all' ? '' : filter} requests</p>
            <p className="text-gray-500 text-sm mt-1">New student requests will appear here.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {visible.map(r => (
              <div key={r._id} className="card p-4 sm:p-5 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-display font-bold text-ink">{r.bookTitle}</h3>
                    <span className={BADGE[r.status] || 'badge-pending'}>{r.status}</span>
                    {r.priority && r.priority !== 'Medium' && (
                      <span className={r.priority === 'High' ? 'badge-rejected' : 'badge-info'}>{r.priority} priority</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {r.author ? `by ${r.author} · ` : ''}{r.department}{r.semester ? ` · Sem ${r.semester}` : ''}
                  </p>
                  {r.reason && <p className="text-sm text-gray-400 mt-2 italic">“{r.reason}”</p>}
                  <p className="text-xs text-gray-500 mt-2">
                    Requested by <b className="text-gray-300">{r.requestedBy?.name || 'Unknown'}</b>
                    {r.requestedBy?.email ? ` (${r.requestedBy.email})` : ''} · {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <label className="sr-only" htmlFor={`st-${r._id}`}>Update status</label>
                  <select id={`st-${r._id}`} value={r.status} disabled={updatingId === r._id}
                    onChange={(e) => changeStatus(r._id, e.target.value)} className="input-field !py-2 !w-auto capitalize">
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
