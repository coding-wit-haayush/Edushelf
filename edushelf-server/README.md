# EduShelf Backend — Setup Guide

## What's Inside
```
server/
├── config/
│   ├── db.js              ← MongoDB connection
│   └── cloudinary.js      ← PDF + Image upload config
├── controllers/
│   ├── authController.js  ← Register, Login, GetMe
│   ├── bookController.js  ← Full CRUD + Like/Save/Reviews
│   ├── userController.js  ← Saved, Liked, Downloads, Stats
│   ├── adminController.js ← Approve/Reject, User mgmt, Stats
│   └── requestController.js ← Student book requests
├── middleware/
│   ├── authMiddleware.js  ← JWT verify, admin check
│   └── errorMiddleware.js ← Global error handler
├── models/
│   ├── User.js
│   ├── Book.js
│   ├── Review.js
│   └── Request.js
├── routes/
│   ├── authRoutes.js
│   ├── bookRoutes.js
│   ├── userRoutes.js
│   ├── adminRoutes.js
│   └── requestRoutes.js
├── server.js              ← Main entry point
├── .env.example           ← Copy this to .env and fill values
└── package.json
```

---

## Step 1 — MongoDB Atlas Setup (5 min, FREE)

1. Go to **https://mongodb.com/atlas** → Click "Try Free"
2. Sign up (Google login works)
3. Choose **M0 Free Tier** → Region: AWS Mumbai → Create Cluster
4. Left sidebar → **Database Access** → Add New User
   - Username: `edushelf_admin`
   - Password: make something strong, save it
5. Left sidebar → **Network Access** → Add IP Address → **Allow Access from Anywhere** (0.0.0.0/0)
6. Click **Connect** → **Drivers** → Copy the connection string

It looks like:
```
mongodb+srv://edushelf_admin:<password>@cluster0.xxxxx.mongodb.net/edushelf
```

Replace `<password>` with your actual password.

---

## Step 2 — Cloudinary Setup (3 min, FREE)

1. Go to **https://cloudinary.com** → Sign Up Free
2. After login → Go to **Dashboard**
3. Copy these 3 values:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

---

## Step 3 — Setup .env File

```bash
# In the server/ folder:
cp .env.example .env
```

Open `.env` and fill in your values:
```
MONGO_URI=mongodb+srv://edushelf_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/edushelf
JWT_SECRET=any_random_long_string_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=5000
```

---

## Step 4 — Install & Run

```bash
cd server
npm install
npm run dev
```

You should see:
```
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
🚀 EduShelf Server running on http://localhost:5000
```

Test it: Open browser → http://localhost:5000/api/health
You should see: `{"status":"✅ EduShelf API is running!"}`

---

## Step 5 — Create First Admin User

After server is running, register normally through the frontend.
Then in MongoDB Atlas → Browse Collections → users collection →
Find your user → Change `role` from `"student"` to `"admin"` → Save.

Now login again — you'll have admin access!

---

## API Routes Reference

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user (JWT required) |

### Books
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/books | Get all books (with filters) |
| GET | /api/books/:id | Get single book |
| POST | /api/books | Upload book (faculty/admin) |
| PUT | /api/books/:id | Update book (admin) |
| DELETE | /api/books/:id | Delete book (admin) |
| POST | /api/books/:id/like | Like/Unlike toggle |
| POST | /api/books/:id/dislike | Dislike toggle |
| POST | /api/books/:id/save | Save/Unsave bookmark |
| POST | /api/books/:id/download | Track download |
| GET | /api/books/:id/reviews | Get reviews |
| POST | /api/books/:id/reviews | Add review |

### Users
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/users/me/saved | My saved books |
| GET | /api/users/me/liked | My liked books |
| GET | /api/users/me/downloads | My downloads |
| GET | /api/users/me/recent | Recently viewed |
| GET | /api/users/me/stats | My stats |
| PUT | /api/users/profile | Update profile |

### Admin
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/admin/stats | Dashboard stats |
| GET | /api/admin/books/pending | Pending approval |
| PUT | /api/admin/books/:id/approve | Approve book |
| PUT | /api/admin/books/:id/reject | Reject book |
| GET | /api/admin/users | All users |
| DELETE | /api/admin/users/:id | Delete user |
| PUT | /api/admin/users/:id/role | Change role |
| GET | /api/admin/requests | All book requests |

### Requests
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/requests | Submit book request |
| GET | /api/requests/my | My requests |

---

## Run Frontend + Backend Together

Terminal 1 (Backend):
```bash
cd server
npm run dev
```

Terminal 2 (Frontend):
```bash
cd client
npm run dev
```

Frontend: http://localhost:5173
Backend:  http://localhost:5000
