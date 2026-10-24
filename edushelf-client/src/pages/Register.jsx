import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { registerUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AuthShell from '../components/AuthShell';
import toast from 'react-hot-toast';

const DEPARTMENTS = ['BCA', 'BBA', 'B.Tech', 'Pharma', 'Agriculture', 'MBA', 'BCA (AI/ML)', 'B.Sc', 'B.Com'];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '', semester: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.department) {
      toast.error('Please fill all required fields');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await registerUser(form);
      login(res.data.user || res.data, res.data.token);
      toast.success('Account created! Welcome to EduShelf 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Check that the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const label = 'text-sm font-medium text-gray-300 mb-1.5 block';

  return (
    <AuthShell
      title="Create your account ✨"
      subtitle="Join EduShelf and start studying smarter"
      footer={<>Already have an account? <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">Login here</Link></>}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div>
          <label htmlFor="name" className={label}>Full name *</label>
          <input id="name" type="text" name="name" value={form.name} onChange={handleChange} autoComplete="name"
            placeholder="Your full name" className="input-field" />
        </div>
        <div>
          <label htmlFor="email" className={label}>Email address *</label>
          <input id="email" type="email" name="email" value={form.email} onChange={handleChange} autoComplete="email"
            placeholder="you@college.edu" className="input-field" />
        </div>
        <div>
          <label htmlFor="password" className={label}>Password * <span className="text-gray-500 font-normal">(min. 6 characters)</span></label>
          <div className="relative">
            <input id="password" type={showPwd ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
              autoComplete="new-password" placeholder="Create a password" className="input-field !pr-11" />
            <button type="button" onClick={() => setShowPwd(s => !s)} aria-label={showPwd ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-ink p-1">
              {showPwd ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3">
          <div>
            <label htmlFor="department" className={label}>Department *</label>
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
        </div>

        <button type="submit" disabled={loading} className="btn-primary !py-3 text-base mt-1">
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthShell>
  );
}
