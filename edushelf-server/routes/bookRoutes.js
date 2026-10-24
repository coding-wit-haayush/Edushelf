const express = require('express');
const router  = express.Router();
const {
  getBooks, getBookById, uploadBook, updateBook, deleteBook,
  likeBook, dislikeBook, saveBook, downloadBook,
  getReviews, addReview,
} = require('../controllers/bookController');
const { protect, optionalAuth, adminOnly, facultyOrAdmin } = require('../middleware/authMiddleware');
const { uploadBookFiles, attachFileUrls } = require('../config/cloudinary');

// Public (optionalAuth lets us record "recently viewed" for logged-in users
// without requiring a login for everyone else)
router.get('/',     getBooks);
router.get('/:id',  optionalAuth, getBookById);

// Protected
router.post('/',
  protect,
  facultyOrAdmin,
  uploadBookFiles.fields([{ name: 'pdf', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]),
  attachFileUrls,
  uploadBook
);
router.put('/:id',    protect, adminOnly, updateBook);
router.delete('/:id', protect, adminOnly, deleteBook);

// Like / Dislike / Save / Download
router.post('/:id/like',     protect, likeBook);
router.post('/:id/dislike',  protect, dislikeBook);
router.post('/:id/save',     protect, saveBook);
router.post('/:id/download', protect, downloadBook);

// Reviews
router.get ('/:id/reviews', getReviews);
router.post('/:id/reviews', protect, addReview);

module.exports = router;
