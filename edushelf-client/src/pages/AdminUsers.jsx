import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { adminGetUsers, adminDeleteUser, adminChangeUserRole } from '../services/api';
import { HiOutlineSearch, HiOutlineTrash } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ROLES = ['student', 'faculty', 'admin'];

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await adminGetUsers();
      setUsers(res.data.users || []);
    } catch {
      toast.error('Could not load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleRoleChange = async (id, role) => {
    const prev = users;
    setUsers(users.map(u => u._id === id ? { ...u, role } : u));
    try {
      await adminChangeUserRole(id, role);
      toast.success('Role updated');
    } catch (err) {
      setUsers(prev);
      toast.error(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    const prev = users;
    setUsers(users.filter(u => u._id !== id));
    try {
      await adminDeleteUser(id);
      toast.success('User deleted');
    } catch (err) {
      setUsers(prev);
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar adminMode />

      <main className="flex-1 min-w-0 px-4 sm:px-6 py-8 pb-24 lg:pb-8 page-container w-full mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-extrabold text-ink">Manage Users</h1>
          <p className="text-gray-500 mt-1">View, promote, or remove users</p>
        </div>

        <div className="relative max-w-sm mb-6">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..." className="input-field pl-9 py-2.5 text-sm" />
        </div>

        <p className="sm:hidden text-xs text-gray-500 mb-2">← Swipe sideways to see all columns →</p>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] admin-table">
              <thead>
                <tr className="border-b border-navy-border">
                  <th>Name</th><th>Email</th><th>Department</th><th>Role</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}><td colSpan={5}><div className="h-10 rounded-lg bg-navy animate-pulse my-1" /></td></tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="text-center text-gray-500 py-8">No users found.</td></tr>
                ) : filtered.map(u => (
                  <tr key={u._id} className="hover:bg-navy/30 transition-colors">
                    <td className="font-medium text-ink">{u.name}</td>
                    <td className="text-gray-400">{u.email}</td>
                    <td>{u.department || '—'}</td>
                    <td>
                      <select
                        value={u.role}
                        disabled={u._id === currentUser?._id}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="input-field py-1.5 text-xs w-auto appearance-none disabled:opacity-50">
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDelete(u._id)}
                        disabled={u.role === 'admin'}
                        title={u.role === 'admin' ? "Admins can't be deleted" : 'Delete user'}
                        className="p-1.5 text-red-600 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
