const asyncHandler = require('express-async-handler');
const User    = require('../models/User');
const Book    = require('../models/Book');
const Review  = require('../models/Review');
const Request = require('../models/Request');

// @route GET /api/admin/stats
const getStats = asyncHandler(async (req, res) => {
  const [totalBooks, totalUsers, pendingBooks, totalReviews] = await Promise.all([
    Book.countDocuments({ isApproved: true }),
    User.countDocuments({ role: 'student' }),
    Book.countDocuments({ isApproved: false, isRejected: false }),
    Review.countDocuments(),
  ]);

  // Total downloads sum
  const dlResult = await Book.aggregate([{ $group: { _id: null, total: { $sum: '$downloads' } } }]);
  const totalDownloads = dlResult[0]?.total || 0;

  // Pending requests
  const pendingRequests = await Request.countDocuments({ status: 'pending' });

  res.json({
    success: true,
    totalBooks,
    totalUsers,
    totalDownloads,
    pendingBooks,
    pendingRequests,
    totalReviews,
  });
});

// @route GET /api/admin/books/pending
const getPendingBooks = asyncHandler(async (req, res) => {
  const books = await Book.find({ isApproved: false, isRejected: false })
    .populate('uploadedBy', 'name email department')
    .sort({ createdAt: -1 });

  res.json({ success: true, books });
});

// @route GET /api/admin/books
// Returns ALL books regardless of approval status, for the admin "Manage Books" table.
// (The public GET /api/books only ever returns isApproved:true books, so admins need
// this separate endpoint to see pending/rejected books too.)
const getAllBooksAdmin = asyncHandler(async (req, res) => {
  const books = await Book.find({})
    .populate('uploadedBy', 'name email department')
    .sort({ createdAt: -1 });

  res.json({ success: true, books });
});

// @route PUT /api/admin/books/:id/approve
const approveBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) { res.status(404); throw new Error('Book not found'); }

  book.isApproved = true;
  book.isRejected = false;
  await book.save();

  res.json({ success: true, message: 'Book approved successfully', book });
});

// @route PUT /api/admin/books/:id/reject
const rejectBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) { res.status(404); throw new Error('Book not found'); }

  book.isApproved = false;
  book.isRejected = true;
  await book.save();

  res.json({ success: true, message: 'Book rejected', book });
});

// @route GET /api/admin/users
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password').sort({ createdAt: -1 });
  res.json({ success: true, users });
});

// @route DELETE /api/admin/users/:id
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  if (user.role === 'admin') { res.status(400); throw new Error('Cannot delete admin user'); }

  await user.deleteOne();
  res.json({ success: true, message: 'User deleted' });
});

// @route PUT /api/admin/users/:id/role
const changeUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['student', 'faculty', 'admin'].includes(role)) {
    res.status(400); throw new Error('Invalid role');
  }

  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
  if (!user) { res.status(404); throw new Error('User not found'); }

  res.json({ success: true, user });
});

// @route GET /api/admin/requests
const getRequests = asyncHandler(async (req, res) => {
  const requests = await Request.find({})
    .populate('requestedBy', 'name email department')
    .sort({ createdAt: -1 });

  res.json({ success: true, requests });
});

// @route PUT /api/admin/requests/:id
const updateRequestStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const request = await Request.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!request) { res.status(404); throw new Error('Request not found'); }
  res.json({ success: true, request });
});

module.exports = {
  getStats, getPendingBooks, getAllBooksAdmin, approveBook, rejectBook,
  getAllUsers, deleteUser, changeUserRole,
  getRequests, updateRequestStatus,
};
