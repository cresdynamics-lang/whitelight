# Capturing server environment variables

To mirror the server environment locally (167.172.126.204), use one of the options below.

## Option 1: Run the capture script (recommended)

From the repo root:

```bash
./scripts/capture-server-env.sh root@167.172.126.204
```

If your server user is not `root`, replace it:

```bash
./scripts/capture-server-env.sh ubuntu@167.172.126.204
```

You will be prompted for the SSH password (or use your SSH key if already set up). The script will:

1. SSH to the server and run `printenv` and try to read any `.env` files in common paths.
2. Save raw output to `/tmp/whitelight_server_env.txt`.
3. Extract known variable names and write `whitelight-backend/.env`.

**After capture:** Open `whitelight-backend/.env` and set `DB_HOST=localhost` (and optionally `DB_PORT=3306`) so the app talks to your local MySQL instead of the server’s.

---

## Option 2: Manual SSH and copy

1. Connect and print env:

   ```bash
   ssh root@167.172.126.204 "printenv"
   ```

2. Or, if the app runs from a project folder, cat the backend .env:

   ```bash
   ssh root@167.172.126.204 "cat /path/to/whitelight-backend/.env"
   ```

3. Copy the relevant lines into `whitelight-backend/.env` locally (create the file if it doesn’t exist).

---

## Variables used by the app

**Backend** (`whitelight-backend/.env`):

| Variable | Purpose |
|----------|---------|
| `PORT` | Server port (default 5000) |
| `NODE_ENV` | development / production |
| `FRONTEND_URL` | Frontend origin for CORS |
| `DB_HOST` | MySQL host |
| `DB_PORT` | MySQL port (3306) |
| `DB_USER` | MySQL user |
| `DB_PASSWORD` | MySQL password |
| `DB_NAME` | Database name |
| `JWT_SECRET` | Secret for admin JWT |
| `DO_SPACES_ENDPOINT` | DigitalOcean Spaces endpoint |
| `DO_SPACES_KEY` | Spaces access key |
| `DO_SPACES_SECRET` | Spaces secret key |
| `DO_SPACES_BUCKET` | Bucket name |
| `DO_SPACES_CDN_URL` | Optional CDN URL for uploads |

**Frontend** (`whitelight/.env`):

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | Backend API base URL (e.g. `http://localhost:5000/api`) |

Use `whitelight-backend/.env.example` and `whitelight/.env.example` as templates if you prefer to fill values by hand.

---

## If SSH fails with “Too many authentication failures”

Use a single key and disable other keys for this host:

```bash
ssh -o IdentitiesOnly=yes -i /path/to/your/private_key root@167.172.126.204 "printenv"
```

Or run the capture script with the same options:

```bash
ssh -o IdentitiesOnly=yes -i /path/to/your/private_key root@167.172.126.204 "printenv" > /tmp/whitelight_server_env.txt
```

Then run the script’s “filter” logic manually, or copy from `/tmp/whitelight_server_env.txt` into `whitelight-backend/.env`.
