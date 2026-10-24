const express  = require('express');
const cors     = require('cors');
const dotenv   = require('dotenv');
const helmet   = require('helmet');
const path     = require('path');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { storageMode } = require('./config/cloudinary');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();
connectDB();

const app = express();

// ─── Security ────────────────────────────────────────────
app.use(helmet());

// Limit repeated auth attempts to reduce brute-force risk on /login and /register.
// Applied only to /api/auth so normal browsing/reading traffic is unaffected.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                  // 20 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again in a few minutes.' },
});
app.use('/api/auth', authLimiter);

// ─── Middleware ───────────────────────────────────────────
// CORS origins can be extended via CORS_ORIGINS in .env (comma-separated) for production
// deployments (e.g. your Vercel domain) without touching this file.
const extraOrigins = (process.env.CORS_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean);
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    ...extraOrigins,
  ],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve locally-stored uploads (used when Cloudinary isn't configured — see
// config/cloudinary.js). Explicitly allow cross-origin loading of these files
// since helmet's default Cross-Origin-Resource-Policy would otherwise block the
// frontend (a different port/origin in dev) from loading PDFs/cover images.
app.use('/uploads', (req, res, next) => {
  res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// ─── Routes ──────────────────────────────────────────────
app.use('/api/auth',     require('./routes/authRoutes'));
app.use('/api/books',    require('./routes/bookRoutes'));
app.use('/api/users',    require('./routes/userRoutes'));
app.use('/api/admin',    require('./routes/adminRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api/public',   require('./routes/publicRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: '✅ EduShelf API is running!', time: new Date().toISOString(), storageMode });
});

// ─── Error Handlers ──────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 EduShelf Server running on http://localhost:${PORT}`);
  console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗂  File storage: ${storageMode === 'cloudinary' ? 'Cloudinary (cloud)' : 'Local disk (./uploads) — set CLOUDINARY_* in .env to switch to cloud storage'}\n`);
});
