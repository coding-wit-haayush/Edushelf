const asyncHandler = require('express-async-handler');
const Request = require('../models/Request');

// @route POST /api/requests
const createRequest = asyncHandler(async (req, res) => {
  const { bookTitle, author, department, semester, reason, priority } = req.body;

  if (!bookTitle || !department) {
    res.status(400);
    throw new Error('Book title and department are required');
  }

  const request = await Request.create({
    requestedBy: req.user._id,
    bookTitle, author, department, semester, reason,
    priority: ['Low', 'Medium', 'High'].includes(priority) ? priority : 'Medium',
  });

  res.status(201).json({ success: true, request, message: 'Request submitted! We will upload it within 48 hours.' });
});

// @route GET /api/requests/my
const getMyRequests = asyncHandler(async (req, res) => {
  const requests = await Request.find({ requestedBy: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, requests });
});

module.exports = { createRequest, getMyRequests };
