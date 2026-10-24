const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Book = require('../models/Book');

// @route GET /api/users/me/saved
const getSavedBooks = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('savedBooks');
  res.json({ success: true, books: user.savedBooks });
});

// @route GET /api/users/me/liked
const getLikedBooks = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('likedBooks');
  res.json({ success: true, books: user.likedBooks });
});

// @route GET /api/users/me/downloads
const getDownloadedBooks = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('downloads');
  res.json({ success: true, books: user.downloads });
});

// @route GET /api/users/me/recent
const getRecentBooks = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('recentlyViewed');
  res.json({ success: true, books: user.recentlyViewed.slice(-10).reverse() });
});

// @route GET /api/users/me/stats
const getMyStats = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({
    success: true,
    booksRead:    user.recentlyViewed.length,
    savedBooks:   user.savedBooks.length,
    downloads:    user.downloads.length,
    readingHours: Math.floor(user.recentlyViewed.length * 0.5 * 10) / 10,
  });
});

// @route PUT /api/users/profile
const updateProfile = asyncHandler(async (req, res) => {
  const { name, department, semester, rollNumber } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) { res.status(404); throw new Error('User not found'); }

  user.name       = name       || user.name;
  user.department = department || user.department;
  user.semester   = semester   || user.semester;
  user.rollNumber = rollNumber || user.rollNumber;

  const updated = await user.save();
  res.json({ success: true, user: updated });
});

module.exports = { getSavedBooks, getLikedBooks, getDownloadedBooks, getRecentBooks, getMyStats, updateProfile };
