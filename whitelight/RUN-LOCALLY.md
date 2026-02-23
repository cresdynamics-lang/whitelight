# Run the app locally

## If `npm run dev` crashes with "ENOSPC: System limit for number of file watchers reached"

Your system’s file watcher limit is too low for Vite’s dev server. Use one of these:

### Option 1: Use the safe dev script (no sudo)

```bash
npm run dev:safe
```

This runs Vite with polling instead of native file watchers, so it doesn’t hit the limit.

### Option 2: Raise the limit (Linux, one-time)

```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

Then `npm run dev` should work as usual.

---

## Run backend + frontend

**Terminal 1 – backend** (needs MySQL and `whitelight-backend/.env`):

```bash
cd whitelight-backend
node start-with-env.js
```

**Terminal 2 – frontend**:

```bash
cd whitelight
npm run dev:safe
# or: npm run dev   (if you increased the watcher limit)
```

Frontend: http://localhost:8080  
Backend API: http://localhost:5000
