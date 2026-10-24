import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { adminGetStats, adminGetPendingBooks, adminApproveBook, adminRejectBook } from '../services/api';
import { HiOutlineBookOpen, HiOutlineUsers, HiOutlineDownload, HiOutlineInbox,
         HiOutlineTrendingUp, HiOutlineCheck, HiOutlineX } from 'react-icons/hi';
import toast from 'react-hot-toast';

const EMPTY_STATS = { totalBooks: 0, totalUsers: 0, totalDownloads: 0, pendingRequests: 0 };

const TOP_DEPTS = [
  { name: 'BCA',    pct: 35, color: 'bg-blue-500' },
  { name: 'B.Tech', pct: 28, color: 'bg-brand-500' },
  { name: 'BBA',    pct: 15, color: 'bg-orange-500' },
  { name: 'Pharma', pct: 10, color: 'bg-green-500' },
  { name: 'Others', pct: 12, color: 'bg-gray-500' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [pending, setPending] = useState([]);
  const [loadingPending, setLoadingPending] = useState(true);

  const loadPending = async () => {
    setLoadingPending(true);
    try {
      const res = await adminGetPendingBooks();
      setPending(res.data.books || []);
    } catch {
      toast.error('Could not load pending books');
    } finally {
      setLoadingPending(false);
    }
  };

  useEffect(() => {
    adminGetStats().then(r => setStats(r.data)).catch(() => {});
    loadPending();
  }, []);

  const handleApprove = async (id) => {
    try {
      await adminApproveBook(id);
      setPending(pending.filter(p => p._id !== id));
      toast.success('Book approved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve book');
    }
  };

  const handleReject = async (id) => {
    try {
      await adminRejectBook(id);
      setPending(pending.filter(p => p._id !== id));
      toast.success('Book rejected.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject book');
    }
  };

  const STAT_CARDS = [
    { icon: HiOutlineBookOpen, label: 'Total Books',      value: stats.totalBooks?.toLocaleString(),    change: '+0.3%',  positive: true,  color: 'text-brand-600', bg: 'bg-brand-500/10' },
    { icon: HiOutlineUsers,    label: 'Total Users',      value: stats.totalUsers?.toLocaleString(),    change: '+18.2%', positive: true,  color: 'text-cyan-600',   bg: 'bg-cyan-500/10' },
    { icon: HiOutlineDownload, label: 'Total Downloads',  value: stats.totalDownloads?.toLocaleString(),change: '+20.4%', positive: true,  color: 'text-emerald-600',bg: 'bg-emerald-500/10' },
    { icon: HiOutlineInbox,    label: 'Pending Requests', value: stats.pendingRequests,                 change: '-5.7%',  positive: false, color: 'text-orange-600', bg: 'bg-orange-500/10' },
  ];

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar adminMode />

      <main className="flex-1 min-w-0 px-4 sm:px-6 py-8 pb-24 lg:pb-8 page-container w-full mx-auto">
        <div className="mb-8">
          <p className="text-gray-500 text-sm">Welcome Admin! 👑</p>
          <h1 className="font-display text-3xl font-extrabold text-ink">Here's what's happening today.</h1>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STAT_CARDS.map(({ icon: Icon, label, value, change, positive, color, bg }) => (
            <div key={label} className="stat-card">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className="font-display text-2xl font-extrabold text-ink">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
              <span className={`text-xs font-medium ${positive ? 'text-emerald-600' : 'text-red-600'}`}>{change}</span>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Downloads Chart (simple bar) */}
          <div className="card p-5">
            <h3 className="font-semibold text-ink mb-4 flex items-center gap-2">
              <HiOutlineTrendingUp className="w-5 h-5 text-brand-600" /> Downloads Overview
            </h3>
            <div className="flex items-end gap-2 h-32">
              {[30, 50, 40, 70, 60, 85, 75].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-sm bg-gradient-to-t from-brand-600 to-brand-400 transition-all"
                    style={{ height: `${h}%` }} />
                  <span className="text-xs text-gray-600">{['J','F','M','A','M','Ju','Jl'][i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Departments Donut-style */}
          <div className="card p-5">
            <h3 className="font-semibold text-ink mb-4">Top Departments</h3>
            <div className="flex flex-col gap-3">
              {TOP_DEPTS.map(({ name, pct, color }) => (
                <div key={name} className="flex items-center gap-3">
                  <span className="text-sm text-gray-400 w-16 shrink-0">{name}</span>
                  <div className="flex-1 h-2 bg-navy rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 w-8 text-right">{pct}%</span>
                </div>
              ))}
              <p className="text-center text-2xl font-bold text-ink mt-2">12,450 <span className="text-xs text-gray-500 font-normal">Total</span></p>
            </div>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="card p-5">
          <h3 className="font-semibold text-ink mb-4">Pending Approvals ({pending.length})</h3>
          {loadingPending ? (
            <div className="flex flex-col gap-2">
              {Array(3).fill(0).map((_, i) => <div key={i} className="h-10 rounded-lg bg-navy animate-pulse" />)}
            </div>
          ) : pending.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">All caught up! No pending approvals. ✅</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] admin-table">
                <thead>
                  <tr>
                    <th>Book Name</th><th>Department</th><th>Semester</th><th>Uploaded By</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map(book => (
                    <tr key={book._id}>
                      <td className="font-medium text-ink">{book.title}</td>
                      <td>{book.department}</td>
                      <td>Sem {book.semester}</td>
                      <td>{book.uploadedBy?.name}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleApprove(book._id)}
                            className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 bg-emerald-400/10 px-2.5 py-1.5 rounded-lg transition-colors">
                            <HiOutlineCheck className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button onClick={() => handleReject(book._id)}
                            className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 bg-red-400/10 px-2.5 py-1.5 rounded-lg transition-colors">
                            <HiOutlineX className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
