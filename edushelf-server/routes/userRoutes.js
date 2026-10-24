const express = require('express');
const router  = express.Router();
const {
  getSavedBooks, getLikedBooks, getDownloadedBooks,
  getRecentBooks, getMyStats, updateProfile,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/me/saved',     protect, getSavedBooks);
router.get('/me/liked',     protect, getLikedBooks);
router.get('/me/downloads', protect, getDownloadedBooks);
router.get('/me/recent',    protect, getRecentBooks);
router.get('/me/stats',     protect, getMyStats);
router.put('/profile',      protect, updateProfile);

module.exports = router;
