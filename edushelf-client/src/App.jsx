import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home           from './pages/Home';
import Explore        from './pages/Explore';
import Login          from './pages/Login';
import Register       from './pages/Register';
import DepartmentPage from './pages/DepartmentPage';
import BookDetail     from './pages/BookDetail';
import MyLibrary      from './pages/MyLibrary';
import Dashboard      from './pages/Dashboard';
import Settings       from './pages/Settings';
import UploadBook     from './pages/UploadBook';
import AdminDashboard from './pages/AdminDashboard';
import ManageBooks    from './pages/ManageBooks';
import AdminUsers     from './pages/AdminUsers';
import AdminRequests  from './pages/AdminRequests';
import RequestBook    from './pages/RequestBook';

const Spinner = () => (
  <div className="min-h-[60vh] flex items-center justify-center" role="status" aria-label="Loading">
    <div className="w-9 h-9 rounded-full border-[3px] border-brand-200 border-t-brand-600 animate-spin" />
  </div>
);

// Protected Route wrapper
const ProtectedRoute = ({ children, adminOnly = false, facultyOrAdmin = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  // Upload requires faculty or admin on the backend — block students here too.
  if (facultyOrAdmin && user.role !== 'faculty' && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

// Guest Route — redirect logged-in users away from login/register
const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  return children;
};

// Scroll to top whenever the page changes
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function AppRoutes() {
  return (
    <div className="min-h-screen flex flex-col bg-navy">
      <Navbar />
      <ScrollToTop />
      <div className="flex-1 min-w-0">
        <Routes>
          {/* Public */}
          <Route path="/"                 element={<Home />} />
          <Route path="/explore"          element={<Explore />} />
          <Route path="/department/:name" element={<DepartmentPage />} />
          <Route path="/book/:id"         element={<BookDetail />} />
          <Route path="/request-book"     element={<RequestBook />} />

          {/* Guest only */}
          <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

          {/* Protected — any logged-in user */}
          <Route path="/dashboard"  element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/my-library" element={<ProtectedRoute><MyLibrary /></ProtectedRoute>} />
          <Route path="/settings"   element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/upload"     element={<ProtectedRoute facultyOrAdmin><UploadBook /></ProtectedRoute>} />

          {/* Protected — Admin only */}
          <Route path="/admin"          element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/books"    element={<ProtectedRoute adminOnly><ManageBooks /></ProtectedRoute>} />
          <Route path="/admin/users"    element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/requests" element={<ProtectedRoute adminOnly><AdminRequests /></ProtectedRoute>} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#FFFFFF', color: '#0F172A', border: '1px solid #E3E8F2',
              borderRadius: '12px', fontSize: '14px', fontWeight: 500,
              boxShadow: '0 12px 30px rgba(15,23,42,0.12)',
            },
            success: { iconTheme: { primary: '#4F46E5', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#DC2626', secondary: '#fff' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
