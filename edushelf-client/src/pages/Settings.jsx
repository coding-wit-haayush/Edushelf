import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/api';
import toast from 'react-hot-toast';

const DEPARTMENTS = ['BCA', 'BBA', 'B.Tech', 'Pharma', 'Agriculture', 'MBA', 'BCA (AI/ML)', 'B.Sc', 'B.Com'];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function Settings() {
  const { user, token, login } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    department: user?.department || '',
    semester: user?.semester || '',
    rollNumber: user?.rollNumber || '',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name cannot be empty'); return; }
    setSaving(true);
    try {
      const res = await updateProfile({ ...form, semester: form.semester ? Number(form.semester) : undefined });
      login(res.data.user, token || localStorage.getItem('edushelf_token'));
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  const label = 'text-sm font-medium text-gray-300 mb-1.5 block';

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar adminMode={user?.role === 'admin'} />
      <main className="flex-1 min-w-0 px-4 sm:px-6 py-8 pb-24 lg:pb-8 max-w-3xl w-full mx-auto">
        <div className="mb-6">
          <h1 className="font-display font-extrabold text-ink text-3xl">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your profile information</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-5 sm:p-7 flex flex-col gap-5">
          <div className="flex items-center gap-4 pb-5 border-b border-navy-border">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-2xl font-bold text-white shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-ink truncate">{user?.name}</p>
              <p className="text-sm text-gray-500 truncate">{user?.email}</p>
              <span className="badge-info capitalize inline-block mt-1.5">{user?.role}</span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="name" className={label}>Full name</label>
              <input id="name" name="name" value={form.name} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label htmlFor="department" className={label}>Department</label>
              <select id="department" name="department" value={form.department} onChange={handleChange} className="input-field">
                <option value="">Select</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="semester" className={label}>Semester</label>
              <select id="semester" name="semester" value={form.semester} onChange={handleChange} className="input-field">
                <option value="">Select</option>
                {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="rollNumber" className={label}>Roll number <span className="text-gray-500 font-normal">(optional)</span></label>
              <input id="rollNumber" name="rollNumber" value={form.rollNumber} onChange={handleChange} className="input-field" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="email" className={label}>Email</label>
              <input id="email" value={user?.email || ''} disabled className="input-field !bg-navy cursor-not-allowed text-gray-500" />
              <p className="text-xs text-gray-500 mt-1.5">Email can't be changed.</p>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="btn-primary px-8">{saving ? 'Saving…' : 'Save changes'}</button>
          </div>
        </form>
      </main>
    </div>
  );
}
