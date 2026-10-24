const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  author:      { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  publisher:   { type: String, default: '' },
  language:    { type: String, default: 'English' },
  pages:       { type: Number },
  publishedDate: { type: String, default: '' },

  coverImage:  { type: String, default: '' },  // Cloudinary URL
  pdfUrl:      { type: String, required: true }, // Cloudinary URL
  fileSize:    { type: String, default: '' },

  department:  { type: String, required: true },
  subject:     { type: String, default: '' },
  semester:    { type: Number, required: true, min: 1, max: 8 },
  tags:        [{ type: String }],

  uploadedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isApproved:  { type: Boolean, default: false },
  isRejected:  { type: Boolean, default: false },

  likes:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dislikes:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  savedBy:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  views:       { type: Number, default: 0 },
  downloads:   { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  totalRatings:  { type: Number, default: 0 },
}, { timestamps: true });

// Text search index
bookSchema.index({ title: 'text', author: 'text', subject: 'text', tags: 'text' });

module.exports = mongoose.model('Book', bookSchema);
