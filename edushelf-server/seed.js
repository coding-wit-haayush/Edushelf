// ─────────────────────────────────────────────────────────
//  EduShelf — Demo Data Seeder
//  Run with: node seed.js
//
//  Creates three real accounts (with real, verifiable JWTs —
//  unlike the old "demo-token" hack) so the "Demo Student Login"
//  button on the frontend, and manual testing, both work against
//  the real backend instead of faking a logged-in state.
// ─────────────────────────────────────────────────────────
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');

dotenv.config();

const DEMO_USERS = [
  {
    name: 'Arjun Singh',
    email: 'demo.student@edushelf.app',
    password: 'DemoStudent123',
    role: 'student',
    department: 'BCA',
    semester: 5,
    rollNumber: 'BCA-2024-021',
  },
  {
    name: 'Prof. Sharma',
    email: 'demo.faculty@edushelf.app',
    password: 'DemoFaculty123',
    role: 'faculty',
    department: 'BCA',
  },
  {
    name: 'Admin',
    email: 'demo.admin@edushelf.app',
    password: 'DemoAdmin123',
    role: 'admin',
    department: 'Administration',
  },
];

const run = async () => {
  await connectDB();

  for (const demo of DEMO_USERS) {
    const existing = await User.findOne({ email: demo.email });
    if (existing) {
      console.log(`↷ Skipping ${demo.email} — already exists`);
      continue;
    }
    await User.create(demo);
    console.log(`✅ Created ${demo.role}: ${demo.email} / ${demo.password}`);
  }

  console.log('\nDone. You can now log in with any of the emails/passwords above.');
  process.exit(0);
};

run().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
