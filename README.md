# EduShelf — Complete Setup Guide

## 📁 Folder Structure
```
edushelf/
├── edushelf-client/   ← React Frontend (run on port 5173)
└── edushelf-server/   ← Express Backend (run on port 5000)
```

---

## ⚡ QUICK START (Follow this exact order)

### Step 1 — Get MongoDB Atlas URI (5 min)
1. Go to: https://mongodb.com/atlas
2. Sign Up Free → Create Project → Build a Database → M0 Free
3. Create username + password (save these!)
4. Network Access → Add IP → Allow from Anywhere (0.0.0.0/0)
5. Connect → Drivers → Copy connection string
6. It looks like: `mongodb+srv://youruser:yourpass@cluster0.xxxxx.mongodb.net/edushelf`

### Step 2 — Get Cloudinary Keys (OPTIONAL — skip this for local demos)
Cloudinary is only needed for cloud file storage (e.g. real deployment). If you skip this,
uploaded books/covers are automatically stored on local disk and served by the backend — the
app is fully functional without it. Full details in `DATABASE_SETUP.md` at the project root.
1. Go to: https://cloudinary.com
2. Sign Up Free → Dashboard
3. Copy: Cloud Name, API Key, API Secret

### Step 3 — Setup Backend
```bash
# Open Terminal 1
cd edushelf-server

# Create .env file (copy from example)
# Windows:
copy .env.example .env
# Mac/Linux:
cp .env.example .env

# Now open .env in VS Code and fill in your values:
# MONGO_URI=mongodb+srv://youruser:yourpass@cluster0.xxxxx.mongodb.net/edushelf
# JWT_SECRET=any_random_string_you_want_123
# CLOUDINARY_CLOUD_NAME=your_cloud_name
# CLOUDINARY_API_KEY=your_api_key
# CLOUDINARY_API_SECRET=your_api_secret

npm install

# Verify your setup BEFORE starting the server — this catches a wrong
# MONGO_URI or missing JWT_SECRET immediately with a clear fix instead of a
# vague crash later:
npm run verify

# Create demo accounts (student/faculty/admin) for testing:
npm run seed

npm run dev
# You should see: 🚀 EduShelf Server running on http://localhost:5000
```

### Step 4 — Setup Frontend
```bash
# Open Terminal 2 (keep Terminal 1 running!)
cd edushelf-client

npm install
npm run dev
# You should see: Local: http://localhost:5173/
```

### Step 5 — Open Browser
Go to: http://localhost:5173

---

## ✅ Test Everything Works
1. Visit http://localhost:5000/api/health → should show: ✅ EduShelf API is running!
2. Visit http://localhost:5173 → should show the EduShelf homepage

---

## 🔑 How to Make Yourself Admin
1. Register normally on the website
2. Go to MongoDB Atlas → Browse Collections → users
3. Find your user → click the role field → change "student" to "admin"
4. Save → Logout → Login again
5. Admin panel will appear in your sidebar ✅

---

## ❓ Common Errors

| Error | Fix |
|-------|-----|
| `main.jsx does not exist` | You're in the wrong folder! cd into `edushelf-client` first |
| `Cannot connect to MongoDB` | Check your MONGO_URI in .env — password must not have special chars |
| `Port 5173 in use` | The app auto-picks 5174 — that's fine, still works |
| `CORS error in browser` | Make sure backend is running on port 5000 |
| `npm not found` | Install Node.js from nodejs.org first |

---

## 🚀 Deploy (After Local Testing Works)
- **Frontend** → Vercel.com (free) — connect GitHub repo
- **Backend** → Render.com (free) — connect GitHub repo  
- **Database** → Already on cloud (MongoDB Atlas)
- **Files** → Already on cloud (Cloudinary)
