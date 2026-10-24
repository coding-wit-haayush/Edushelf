import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AuthShell from '../components/AuthShell';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const finishLogin = (res) => {
    const u = res.data.user || res.data;
    login(u, res.data.token);
    navigate(u.role === 'admin' ? '/admin' : '/dashboard');
    return u;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please enter your email and password'); return; }
    setLoading(true);
    try {
      const res = await loginUser(form);
      finishLogin(res);
      toast.success('Welcome back! 👋');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check your credentials and that the server is running.');
    } finally {
      setLoading(false);
    }
  };

  // Demo login — real login against the seeded demo account (run `npm run seed` once).
  const demoLogin = async () => {
    setDemoLoading(true);
    try {
      const res = await loginUser({ email: 'demo.student@edushelf.app', password: 'DemoStudent123' });
      finishLogin(res);
      toast.success('Logged in as Demo Student');
    } catch {
      toast.error('Demo account not found. Run "npm run seed" in edushelf-server first.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back 👋"
      subtitle="Login to continue to EduShelf"
      footer={<>Don't have an account? <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">Register here</Link></>}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div>
          <label htmlFor="email" className="text-sm font-medium text-gray-300 mb-1.5 block">Email address</label>
          <input id="email" type="email" name="email" value={form.email} onChange={handleChange} autoComplete="email"
            placeholder="you@college.edu" className="input-field" />
        </div>

        <div>
          <label htmlFor="password" className="text-sm font-medium text-gray-300 mb-1.5 block">Password</label>
          <div className="relative">
            <input id="password" type={showPwd ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
              autoComplete="current-password" placeholder="Enter your password" className="input-field !pr-11" />
            <button type="button" onClick={() => setShowPwd(s => !s)} aria-label={showPwd ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-ink p-1">
              {showPwd ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary !py-3 text-base mt-1">
          {loading ? 'Logging in…' : 'Login'}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-navy-border" /></div>
        <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-500">or</span></div>
      </div>

      <button onClick={demoLogin} disabled={demoLoading} className="w-full btn-secondary text-sm">
        <span aria-hidden="true">🎓</span> {demoLoading ? 'Logging in…' : 'Try the demo student account'}
      </button>
    </AuthShell>
  );
}
