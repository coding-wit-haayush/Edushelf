const express = require('express');
const asyncHandler = require('express-async-handler');
const Book = require('../models/Book');
const User = require('../models/User');

const router = express.Router();

// @route GET /api/public/stats
// Real, public numbers for the homepage (no auth). Only counts approved books.
router.get('/stats', asyncHandler(async (req, res) => {
  const [books, students, downloadAgg, byDept] = await Promise.all([
    Book.countDocuments({ isApproved: true }),
    User.countDocuments({}),
    Book.aggregate([
      { $match: { isApproved: true } },
      { $group: { _id: null, total: { $sum: { $ifNull: ['$downloads', 0] } } } },
    ]),
    Book.aggregate([
      { $match: { isApproved: true } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
    ]),
  ]);

  const departments = {};
  byDept.forEach(d => { if (d._id) departments[d._id] = d.count; });

  res.json({
    success: true,
    books,
    students,
    downloads: downloadAgg[0]?.total || 0,
    departments,
  });
}));

module.exports = router;
