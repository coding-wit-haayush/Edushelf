# EduShelf — Fix Log

This documents everything that was reviewed and fixed in this pass. Keep this file (or fold the
highlights into your README/resume bullets) — "found and fixed N real bugs across a full MERN
stack, including auth, security, and mock-vs-real-data issues" is a legitimate, specific thing to
say in an interview.

## Security
- **Added `.gitignore`** — there was none. `.env` (which holds your Mongo URI, JWT secret, and
  Cloudinary keys) was one `git add .` away from being committed to a public repo.
- **Added `helmet`** for standard HTTP security headers.
- **Added rate limiting** (`express-rate-limit`) on `/api/auth` — without it, login/register had
  no protection against brute-force password guessing.
- **Fixed the "Demo Login" button** — it was setting `localStorage` to the literal string
  `"demo-token"` instead of a real JWT. This silently logged the demo user back out on every
  page refresh (since the backend correctly rejected the fake token) and would have looked
  broken in a live demo/interview. It now logs in through the real `/api/auth/login` endpoint
  against a seeded demo account (`npm run seed` in `edushelf-server`).

## Backend bugs
- **`GET /api/books/:id` couldn't track "recently viewed"** — the controller checked `req.user`,
  but the route had no auth middleware at all, so `req.user` was always `undefined`. Added a new
  `optionalAuth` middleware: attaches the user if a valid token is present, but never blocks
  guests. Recently-viewed tracking now actually works.
- **Sorting by "Most Popular" was broken** — `likes` is an array of user IDs, not a count, so
  `.sort({ likes: -1 })` sorted by ObjectId value, not popularity. Replaced with an aggregation
  pipeline that sorts by actual like-count.
- **Admins had no way to see non-approved books** — the public `GET /api/books` only ever
  returns `isApproved: true` books (by design, for regular users). But the admin "Manage Books"
  page needs to see pending/rejected books too, and no endpoint existed for that. Added
  `GET /api/admin/books`.

## Frontend — real data instead of permanent mock data
Several admin/user-facing pages were built against hardcoded arrays and never actually called
the (fully working) backend endpoints. Fixed:

| Page | Before | After |
|---|---|---|
| `RequestBook.jsx` | Fake `setTimeout` success, static request history | Real `POST /api/requests`, real `GET /api/requests/my` |
| `AdminDashboard.jsx` | Hardcoded pending-books list | Real `GET /api/admin/books/pending`; errors no longer show a fake "success" toast |
| `ManageBooks.jsx` | Hardcoded 5-book list, non-functional Edit button, decorative pagination | Real book list via new admin endpoint, working Edit modal (`PUT /api/books/:id`), real pagination |
| `Dashboard.jsx` | Hardcoded "23 books read" etc. for every user | Real `GET /api/users/me/stats` and `/me/recent` |
| *(new)* `AdminUsers.jsx` | Didn't exist — sidebar link pointed at the wrong page | New page wired to the existing (already-built) list/delete/role-change endpoints |

## Frontend — misleading fallback behavior
- `Home.jsx` / `DepartmentPage.jsx` only replaced mock books `if (results.length)` — meaning a
  real, correctly-empty result from the backend was ignored and stale demo books stayed on
  screen forever. You could never see a true empty state. Now the real result (including empty)
  is always trusted; mock data only appears if the backend is genuinely unreachable, and that's
  now labeled in the UI.
- `BookDetail.jsx` silently swapped in a fake "Clean Code" book on **any** fetch error, including
  a truly invalid book ID — hiding real 404s. Now shows a proper "Book not found" state.
- `BookDetail.jsx`'s review submission added a fake duplicate review to the list even when the
  actual POST failed (e.g. "you already reviewed this book"). Now shows the real error.

## Frontend — dead UI, now wired up
- Home page search box and filter chips ("Most Popular", "Semester 3", etc.) didn't do anything.
  Now submit real queries to the backend.
- Sidebar links like `/my-library?tab=liked` didn't work — `MyLibrary.jsx` never read the `tab`
  query param, so it always opened on "Saved Books". Fixed.
- `/upload` was reachable by any logged-in student, who'd fill out the whole form only to get a
  403 from the backend (which correctly requires faculty/admin). Now blocked at the route level.
- "Download PDF" bypassed the backend entirely, so the download counter and per-user download
  history never updated. Now calls `POST /api/books/:id/download` before opening the file.
  (Note: the browser's `download` attribute is still ignored for the cross-origin Cloudinary URL
  itself — a true forced download would need the file proxied through the backend. Left as a
  known limitation, documented in the code.)

## New: demo/seed data
`edushelf-server/seed.js` — run `npm run seed` after setting up your `.env` to create three real
accounts for testing/demos:
- `demo.student@edushelf.app` / `DemoStudent123`
- `demo.faculty@edushelf.app` / `DemoFaculty123`
- `demo.admin@edushelf.app` / `DemoAdmin123`

## New: zero-signup local file storage
Previously, uploading a book required a real Cloudinary account with no fallback — if
`CLOUDINARY_*` env vars weren't set, uploads would just fail. `config/cloudinary.js` now
auto-detects whether real Cloudinary credentials are present:
- **Configured** → uploads go to Cloudinary (recommended for real deployment, since most hosts
  wipe local disk on redeploy).
- **Not configured** (blank or left as placeholder) → uploads are automatically stored on local
  disk under `edushelf-server/uploads/` and served by the backend itself via a new `/uploads`
  static route. The startup log tells you which mode is active.

This means the whole app — including book uploads — works with **zero external signups**
beyond MongoDB (which is unavoidable; every dynamic app needs a database somewhere).
`uploads/` is gitignored (with `.gitkeep` placeholders) so uploaded files themselves never get
committed, but the folder structure does.

## New: setup verification script
`edushelf-server/verify-setup.js` (`npm run verify`) checks your `.env`, attempts a real
connection to your database, and reports clear pass/fail with actionable fixes — run this before
a demo instead of guessing whether your setup is correct. See `DATABASE_SETUP.md` at the project
root for the full MongoDB Atlas walkthrough.

## Still worth doing (not done in this pass — larger scope)
- In-app PDF viewer (e.g. `react-pdf`) instead of opening raw Cloudinary URLs.
- True forced PDF download by proxying the file through the backend instead of linking directly
  to Cloudinary (fixes the cross-origin `download` attribute limitation above).
- Automated tests (Jest/Supertest for the API is a quick, high-value addition for a resume repo).
- Forgot-password flow (the button exists in the UI but isn't wired to anything).
- A Reading Activity heatmap that reflects real data — it's currently randomized placeholder
  data since there's no per-day activity log in the schema yet.
