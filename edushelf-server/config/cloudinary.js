const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ─────────────────────────────────────────────────────────
//  Storage mode auto-detection
//
//  If real Cloudinary credentials are present in .env, files are uploaded
//  to Cloudinary (recommended for a real deployment). If they are missing
//  or left as placeholder values, EduShelf automatically falls back to
//  storing files on local disk under /uploads and serving them from this
//  same server. This means the app is fully functional (uploads, PDFs,
//  cover images — everything) with ZERO external signups required for a
//  local demo. Cloudinary only needs to be configured when you're ready
//  to deploy somewhere the disk isn't persistent (e.g. most PaaS hosts).
// ─────────────────────────────────────────────────────────
const PLACEHOLDER_VALUES = ['', 'your_cloud_name', 'your_api_key', 'your_api_secret', 'test', 'undefined'];

const hasCloudinaryConfig =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET &&
  !PLACEHOLDER_VALUES.includes(process.env.CLOUDINARY_CLOUD_NAME) &&
  !PLACEHOLDER_VALUES.includes(process.env.CLOUDINARY_API_KEY) &&
  !PLACEHOLDER_VALUES.includes(process.env.CLOUDINARY_API_SECRET);

const storageMode = hasCloudinaryConfig ? 'cloudinary' : 'local';

let uploadBookFiles;

if (hasCloudinaryConfig) {
  // ── Cloudinary mode ──────────────────────────────────
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  uploadBookFiles = multer({
    storage: new CloudinaryStorage({
      cloudinary,
      params: (req, file) => {
        if (file.fieldname === 'pdf') {
          return { folder: 'edushelf/pdfs', resource_type: 'raw', allowed_formats: ['pdf'] };
        }
        return { folder: 'edushelf/covers', resource_type: 'image', transformation: [{ width: 400, height: 500, crop: 'fill' }] };
      },
    }),
    limits: { fileSize: 50 * 1024 * 1024 },
  });
} else {
  // ── Local disk fallback mode ─────────────────────────
  const uploadsRoot = path.join(__dirname, '..', 'uploads');
  const pdfDir   = path.join(uploadsRoot, 'pdfs');
  const coverDir = path.join(uploadsRoot, 'covers');
  [uploadsRoot, pdfDir, coverDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, file.fieldname === 'pdf' ? pdfDir : coverDir);
    },
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
      cb(null, unique);
    },
  });

  uploadBookFiles = multer({ storage: diskStorage, limits: { fileSize: 50 * 1024 * 1024 } });
}

// Runs after multer. Cloudinary already gives file.path as a full URL — leave it alone.
// Local disk storage only gives an absolute filesystem path — rewrite it into a URL
// this server can actually serve (via the /uploads static route registered in server.js).
const attachFileUrls = (req, res, next) => {
  if (storageMode === 'local' && req.files) {
    const base = `${req.protocol}://${req.get('host')}`;
    Object.keys(req.files).forEach((field) => {
      req.files[field].forEach((file) => {
        const folder = field === 'pdf' ? 'pdfs' : 'covers';
        file.path = `${base}/uploads/${folder}/${file.filename}`;
      });
    });
  }
  next();
};

module.exports = { cloudinary, uploadBookFiles, attachFileUrls, storageMode };
