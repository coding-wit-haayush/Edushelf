const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:   { type: String, required: true, minlength: 6 },
  role:       { type: String, enum: ['student', 'faculty', 'admin'], default: 'student' },
  department: { type: String, default: '' },
  semester:   { type: Number, min: 1, max: 8 },
  rollNumber: { type: String, default: '' },
  avatar:     { type: String, default: '' },

  savedBooks:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
  likedBooks:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
  dislikedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
  downloads:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
  recentlyViewed:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
