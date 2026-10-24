// ─────────────────────────────────────────────────────────
//  EduShelf — Setup Verification
//  Run with: node verify-setup.js
//
//  Checks the things that most commonly go wrong before a demo:
//  missing .env values, an unreachable database, and which file
//  storage mode is active — and tells you in plain language.
// ─────────────────────────────────────────────────────────
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config();

const check = (label, pass, hint) => {
  console.log(`${pass ? '✅' : '❌'} ${label}${!pass && hint ? `\n   → ${hint}` : ''}`);
  return pass;
};

const run = async () => {
  console.log('\n── EduShelf Setup Check ──────────────────────────\n');
  let allGood = true;

  // .env existence / required vars
  allGood &= check('MONGO_URI is set', !!process.env.MONGO_URI,
    'Add MONGO_URI to edushelf-server/.env (see README for MongoDB Atlas setup)');
  allGood &= check('JWT_SECRET is set', !!process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 10,
    'Add a long random JWT_SECRET to .env — this signs login tokens');

  // Storage mode
  const { storageMode } = require('./config/cloudinary');
  if (storageMode === 'cloudinary') {
    check('File storage: Cloudinary configured', true);
  } else {
    console.log('ℹ️  File storage: using LOCAL DISK fallback (no Cloudinary configured).');
    console.log('   This is fine for a local demo — uploads will work and be served from this server.');
    console.log('   Add CLOUDINARY_* to .env only if you need cloud-hosted storage.\n');
  }

  // Actual DB connection attempt
  if (process.env.MONGO_URI) {
    process.stdout.write('⏳ Connecting to MongoDB...\n');
    try {
      await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 });
      check('MongoDB connection successful', true);
      const User = require('./models/User');
      const userCount = await User.countDocuments();
      console.log(`   → Found ${userCount} user(s) in the database.`);
      if (userCount === 0) {
        console.log('   → No users yet — run "npm run seed" to create demo accounts.');
      }
      await mongoose.disconnect();
    } catch (err) {
      allGood = false;
      check('MongoDB connection successful', false,
        `Connection failed: ${err.message}\n   Check your MONGO_URI, and that your IP is whitelisted in MongoDB Atlas (Network Access → Add Current IP, or 0.0.0.0/0 for testing).`);
    }
  } else {
    allGood = false;
  }

  console.log('\n──────────────────────────────────────────────────');
  console.log(allGood ? '🎉 Everything looks good — you\'re ready to run the app!' : '⚠️  Fix the items marked ❌ above before demoing.');
  console.log('──────────────────────────────────────────────────\n');
  process.exit(allGood ? 0 : 1);
};

run();
