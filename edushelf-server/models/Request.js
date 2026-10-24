const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookTitle:   { type: String, required: true },
  author:      { type: String, default: '' },
  department:  { type: String, required: true },
  semester:    { type: Number },
  reason:      { type: String, default: '' },
  priority:    { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  status:      { type: String, enum: ['pending', 'accepted', 'uploaded', 'rejected'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);
