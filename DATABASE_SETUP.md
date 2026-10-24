# Database Setup — MongoDB Atlas (Free, ~5 minutes)

I can't create this account for you — it needs your own email/signup — but here is the exact,
minimal path. Follow it top to bottom and you'll have a working `MONGO_URI` at the end.

## 1. Create your cluster
1. Go to https://www.mongodb.com/cloud/atlas/register and sign up (free, no credit card).
2. When asked to create a cluster, choose the **M0 Free** tier.
3. Pick any cloud provider/region close to you and click **Create**.
4. Wait ~1–3 minutes for the cluster to finish provisioning.

## 2. Create a database user
1. You'll be prompted to create a user during setup — if not, go to **Security → Database Access → Add New Database User**.
2. Choose **Password** auth, set a username and password (avoid special characters like `@` or `/` in the password — they break connection strings unless URL-encoded).
3. Give it **Read and write to any database**.

## 3. Allow your IP to connect
1. Go to **Security → Network Access → Add IP Address**.
2. For a class project/demo, the simplest reliable option is **Allow Access from Anywhere** (`0.0.0.0/0`) — click that button. (For a real production app you'd restrict this, but for a student project this avoids the #1 cause of "it worked yesterday, now it doesn't" when your IP changes.)

## 4. Get your connection string
1. Go to **Database → Connect** on your cluster → **Drivers**.
2. Copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
3. Replace `<username>` and `<password>` with the database user you made in step 2.
4. Add a database name before the `?` — call it `edushelf`:
   ```
   mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/edushelf?retryWrites=true&w=majority
   ```

## 5. Put it in your `.env`
In `edushelf-server/.env`:
```
MONGO_URI=mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/edushelf?retryWrites=true&w=majority
JWT_SECRET=make_up_any_long_random_string_here
```

## 6. Verify it actually works
Don't just assume it's right — check it:
```bash
cd edushelf-server
npm install
npm run verify
```
You should see:
```
✅ MONGO_URI is set
✅ JWT_SECRET is set
✅ MongoDB connection successful
   → Found 0 user(s) in the database.
   → No users yet — run "npm run seed" to create demo accounts.
🎉 Everything looks good — you're ready to run the app!
```
If you see a ❌, the script tells you exactly what's wrong and how to fix it — read the `→` line under the failed check.

## 7. Seed demo data and start the app
```bash
npm run seed   # creates demo student/faculty/admin accounts
npm run dev    # starts the backend on http://localhost:5000
```
In a second terminal:
```bash
cd edushelf-client
npm install
npm run dev    # starts the frontend on http://localhost:5173
```

## About file storage (Cloudinary)
You do **not** need Cloudinary to get a fully working demo. If you leave the `CLOUDINARY_*`
values in `.env` blank or as placeholders, the backend automatically stores uploaded PDFs and
cover images on local disk (in `edushelf-server/uploads/`) and serves them itself. Uploads,
downloads, covers — all of it works with just MongoDB configured.

Only set up Cloudinary if you're deploying somewhere the local disk isn't persistent (most
hosting platforms wipe the filesystem on redeploy). If/when you do:
1. https://cloudinary.com → Sign Up Free
2. Dashboard → copy **Cloud Name**, **API Key**, **API Secret**
3. Paste into `edushelf-server/.env`
4. Restart the backend — it auto-detects Cloudinary is configured and switches storage modes (check the startup log line: `🗂 File storage: ...`)
