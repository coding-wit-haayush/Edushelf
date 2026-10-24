const asyncHandler = require('express-async-handler');
const Book = require('../models/Book');
const Review = require('../models/Review');
const User = require('../models/User');

// @route  GET /api/books
const getBooks = asyncHandler(async (req, res) => {
  const { search, department, semester, sort = 'createdAt', limit = 20, page = 1 } = req.query;

  const query = { isApproved: true };

  if (search) {
    query.$text = { $search: search };
  }
  if (department) query.department = department;
  if (semester)   query.semester = Number(semester);

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Book.countDocuments(query);

  // "likes" is an array of user ObjectIds, not a count — sorting a plain .find()
  // by that field sorts by ObjectId value, not by popularity. Use an aggregation
  // with a computed like-count for that one case; everything else can use a plain sort.
  let books;
  if (sort === 'likes') {
    books = await Book.aggregate([
      { $match: query },
      { $addFields: { likesCount: { $size: { $ifNull: ['$likes', []] } } } },
      { $sort: { likesCount: -1 } },
      { $skip: skip },
      { $limit: Number(limit) },
    ]);
    await Book.populate(books, { path: 'uploadedBy', select: 'name department' });
  } else {
    const sortOptions = {
      views:      { views: -1 },
      downloads:  { downloads: -1 },
      rating:     { averageRating: -1 },
      createdAt:  { createdAt: -1 },
    };
    books = await Book.find(query)
      .sort(sortOptions[sort] || { createdAt: -1 })
      .limit(Number(limit))
      .skip(skip)
      .populate('uploadedBy', 'name department');
  }

  res.json({ success: true, books, total, page: Number(page) });
});

// @route  GET /api/books/:id
const getBookById = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id)
    .populate('uploadedBy', 'name department');

  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  // Increment views
  book.views += 1;
  await book.save();

  // Track recently viewed for logged in users
  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { recentlyViewed: book._id },
    });
  }

  res.json({ success: true, book });
});

// @route  POST /api/books  (faculty/admin only)
const uploadBook = asyncHandler(async (req, res) => {
  const { title, author, description, department, subject, semester, tags, publisher, language } = req.body;

  if (!title || !author || !department || !semester) {
    res.status(400);
    throw new Error('Title, author, department and semester are required');
  }

  if (!req.files?.pdf) {
    res.status(400);
    throw new Error('PDF file is required');
  }

  const pdfUrl      = req.files.pdf[0].path;
  const coverImage  = req.files.coverImage ? req.files.coverImage[0].path : '';
  const fileSize    = req.files.pdf[0].size ? `${(req.files.pdf[0].size / 1024 / 1024).toFixed(1)} MB` : '';

  const tagsArray = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];

  const book = await Book.create({
    title, author, description, department, subject,
    semester: Number(semester),
    tags: tagsArray,
    publisher, language,
    pdfUrl, coverImage, fileSize,
    uploadedBy: req.user._id,
    isApproved: req.user.role === 'admin', // admin uploads are auto-approved
  });

  res.status(201).json({ success: true, book, message: 'Book uploaded! Pending admin approval.' });
});

// @route  PUT /api/books/:id  (admin only)
const updateBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) { res.status(404); throw new Error('Book not found'); }

  const { title, author, description, department, subject, semester, tags, publisher, language } = req.body;

  book.title       = title       || book.title;
  book.author      = author      || book.author;
  book.description = description || book.description;
  book.department  = department  || book.department;
  book.subject     = subject     || book.subject;
  book.semester    = semester    ? Number(semester) : book.semester;
  book.publisher   = publisher   || book.publisher;
  book.language    = language    || book.language;
  if (tags) book.tags = tags.split(',').map(t => t.trim()).filter(Boolean);

  const updated = await book.save();
  res.json({ success: true, book: updated });
});

// @route  DELETE /api/books/:id  (admin only)
const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) { res.status(404); throw new Error('Book not found'); }

  await Review.deleteMany({ book: book._id });
  await book.deleteOne();

  res.json({ success: true, message: 'Book deleted successfully' });
});

// @route  POST /api/books/:id/like  (toggle)
const likeBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) { res.status(404); throw new Error('Book not found'); }

  const userId = req.user._id;
  const alreadyLiked = book.likes.includes(userId);

  if (alreadyLiked) {
    book.likes.pull(userId);
  } else {
    book.likes.push(userId);
    book.dislikes.pull(userId); // remove dislike if exists
  }

  await book.save();

  // Sync user's likedBooks
  await User.findByIdAndUpdate(userId,
    alreadyLiked
      ? { $pull: { likedBooks: book._id } }
      : { $addToSet: { likedBooks: book._id } }
  );

  res.json({ success: true, likes: book.likes.length, isLiked: !alreadyLiked });
});

// @route  POST /api/books/:id/dislike  (toggle)
const dislikeBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) { res.status(404); throw new Error('Book not found'); }

  const userId = req.user._id;
  const alreadyDisliked = book.dislikes.includes(userId);

  if (alreadyDisliked) {
    book.dislikes.pull(userId);
  } else {
    book.dislikes.push(userId);
    book.likes.pull(userId);
  }

  await book.save();
  res.json({ success: true, dislikes: book.dislikes.length, isDisliked: !alreadyDisliked });
});

// @route  POST /api/books/:id/save  (toggle bookmark)
const saveBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) { res.status(404); throw new Error('Book not found'); }

  const userId = req.user._id;
  const alreadySaved = book.savedBy.includes(userId);

  if (alreadySaved) {
    book.savedBy.pull(userId);
    await User.findByIdAndUpdate(userId, { $pull: { savedBooks: book._id } });
  } else {
    book.savedBy.push(userId);
    await User.findByIdAndUpdate(userId, { $addToSet: { savedBooks: book._id } });
  }

  await book.save();
  res.json({ success: true, isSaved: !alreadySaved });
});

// @route  POST /api/books/:id/download
const downloadBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) { res.status(404); throw new Error('Book not found'); }

  book.downloads += 1;
  await book.save();

  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { downloads: book._id } });
  }

  res.json({ success: true, pdfUrl: book.pdfUrl });
});

// @route  GET /api/books/:id/reviews
const getReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ book: req.params.id })
    .populate('user', 'name department avatar')
    .sort({ createdAt: -1 });

  res.json({ success: true, reviews });
});

// @route  POST /api/books/:id/reviews
const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  if (!rating || !comment) {
    res.status(400);
    throw new Error('Rating and comment are required');
  }

  const book = await Book.findById(req.params.id);
  if (!book) { res.status(404); throw new Error('Book not found'); }

  // Check if already reviewed
  const existing = await Review.findOne({ book: book._id, user: req.user._id });
  if (existing) {
    res.status(400);
    throw new Error('You have already reviewed this book');
  }

  const review = await Review.create({
    book: book._id,
    user: req.user._id,
    rating: Number(rating),
    comment,
  });

  // Recalculate average rating
  const allReviews = await Review.find({ book: book._id });
  book.averageRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;
  book.totalRatings  = allReviews.length;
  await book.save();

  const populated = await review.populate('user', 'name department avatar');
  res.status(201).json({ success: true, review: populated });
});

module.exports = {
  getBooks, getBookById, uploadBook, updateBook, deleteBook,
  likeBook, dislikeBook, saveBook, downloadBook,
  getReviews, addReview,
};
