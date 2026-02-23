# Crash inspection – possible causes and fixes

## 1. Backend “exits” when run in a script

**What we saw:** When the backend was started in the background (`node start-with-env.js &`) and the script then exited, the Node process stopped.

**Cause:** The shell sends **SIGHUP** to background jobs when the script exits, so the Node process was being terminated by the shell, not by a crash.

**Fix:** Run the backend in a way that keeps it in the foreground or immune to SIGHUP:

- In a terminal: `cd whitelight-backend && node start-with-env.js` (leave this terminal open).
- Or: `nohup node start-with-env.js & disown` (still can be affected in some environments).
- On a server: use **PM2** (e.g. `pm2 start start-with-env.js --name whitelight-backend`) so the process is not tied to a shell.

**Verification:** With `timeout 15 node start-with-env.js &` and repeated `curl /api/products`, the backend answered 500 for each request and stayed up for the full 15 seconds. So the app does **not** crash when the DB is down; it returns 500 and keeps running.

---

## 2. Frontend dev server: “ENOSPC: file watchers reached”

**Cause:** Vite’s dev server uses many file watchers; the system limit (e.g. 65536) was exceeded.

**Fix:**

- Use: `npm run dev:safe` (uses `CHOKIDAR_USEPOLLING=1` so it doesn’t rely on the default watcher limit).
- Or raise the limit (Linux):  
  `echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p`

---

## 3. Unhandled promise rejections (defensive)

**Change made:** In `server.js` we added:

- `process.on('unhandledRejection', ...)`  
- `process.on('uncaughtException', ...)`  

so that any future unhandled rejection or uncaught exception is logged instead of taking down the process by default.

**Also:** Async route handlers are wrapped with `asyncHandler()` in:

- `routes/products.js`
- `routes/banners.js`
- `routes/orders.js`
- `routes/admin.js`  

so that rejections are passed to Express and handled by the error middleware instead of becoming unhandled rejections.

---

## 4. Database connection refused (local only)

**Symptom:** `❌ Database connection failed: connect ECONNREFUSED 127.0.0.1:3306`

**Cause:** MySQL is not running (or not reachable) on the machine where you start the backend.

**Effect:** The server still starts and responds. Routes that need the DB (e.g. `/api/products`, `/api/banners/hero`) return 500 with a clear error. The process does **not** crash.

**Fix for local:** Start MySQL and set `DB_*` in `whitelight-backend/.env`, or ignore if you only need to run the frontend.

---

## Summary

| Issue                         | Cause                          | Fix / status                                      |
|------------------------------|---------------------------------|---------------------------------------------------|
| Backend “crash” in script    | Shell SIGHUP on script exit     | Run in foreground or with PM2; not an app bug    |
| Frontend dev crash           | File watcher limit (ENOSPC)     | `npm run dev:safe` or increase inotify limit      |
| Unhandled rejections        | Async routes not wrapped        | `asyncHandler` + global handlers added            |
| DB connection refused       | MySQL not running / wrong .env  | Start MySQL or adjust .env; server stays up       |

Running both backend and frontend locally (backend in one terminal, `npm run dev:safe` in another) and hitting the API shows no crash; the only “exit” we saw was from the script/shell, not from the app itself.
