# Database on Digital Ocean

This doc explains how to run the WhiteLight **MySQL database on your Digital Ocean server** so the app and DB are on the same droplet (or how to use a managed DB).

---

## Option A: MySQL on the same droplet (recommended to start)

The app and database run on one Digital Ocean server. Easiest and already supported by your deploy scripts.

### 1. On your Digital Ocean droplet (Ubuntu)

```bash
# From repo root (after clone), as root or with sudo:
sudo bash scripts/setup-mysql-digitalocean.sh
```

You’ll be prompted for a password for the app database user (`whitelight_user` by default), or set it before running:

```bash
export DB_PASSWORD='your_secure_password'
sudo -E bash scripts/setup-mysql-digitalocean.sh
```

The script will:

- Install MySQL server
- Start and enable MySQL
- Create database `whitelight_db` and user `whitelight_user` (or `DB_NAME` / `DB_USER` from env)
- Remind you to set `whitelight-backend/.env`

### 2. Backend .env on the server

In `whitelight-backend/.env` on the server set:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=whitelight_user
DB_PASSWORD=the_password_you_chose
DB_NAME=whitelight_db
```

### 3. Run migrations and deploy

```bash
cd /home/YOUR_USER/whitelight/whitelight-backend
node scripts/runMigrations.js
# Then deploy as usual (e.g. RUN-ON-SERVER.sh or deploy-server.sh)
```

After that, the **database is running on the server** and the backend uses it via `localhost`.

---

## Option B: DigitalOcean Managed Database (MySQL)

Use a separate Managed Database for MySQL and point the app to it.

1. In [DigitalOcean](https://cloud.digitalocean.com/) go to **Databases** → **Create Database Cluster** → choose **MySQL**.
2. Pick region (same as your droplet is best), plan, then create.
3. When it’s ready, open the cluster → **Connection details** (or **Users and databases** to create a DB and user).
4. Note: **Host**, **Port**, **User**, **Password**, and **Database** (or create one e.g. `whitelight_db`).
5. Add your **droplet** to the database’s **Trusted sources** so the app server can connect.
6. In `whitelight-backend/.env` on the **app server** set:

```env
DB_HOST=your-managed-db-host.db.ondigitalocean.com
DB_PORT=25060
DB_USER=your_managed_db_user
DB_PASSWORD=your_managed_db_password
DB_NAME=whitelight_db
```

7. Run migrations from the server (or from a machine that can reach the managed DB):

```bash
cd whitelight-backend
node scripts/runMigrations.js
```

Deploy the app as usual; the backend will use the managed database.

---

## Checklist (database on server)

- [ ] MySQL installed and running on droplet (`sudo systemctl status mysql`) **or** Managed Database created and droplet allowed in trusted sources.
- [ ] `whitelight-backend/.env` has correct `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (and `DB_PORT` if not 3306).
- [ ] Migrations run: `cd whitelight-backend && node scripts/runMigrations.js`.
- [ ] Backend can connect: after deploy, check `pm2 logs` or `curl http://localhost:5000/api/health`.

---

## Troubleshooting

- **Connection refused**  
  - Same droplet: MySQL not running → `sudo systemctl start mysql`.  
  - Managed DB: check trusted sources and firewall; use the exact host/port from the control panel.

- **Access denied**  
  Check `DB_USER` and `DB_PASSWORD` in `.env` match the MySQL user and that the user has privileges on `DB_NAME`.

- **.env not loaded**  
  Backend loads `.env` from `whitelight-backend/`. Run the app from that directory (e.g. `pm2 start server.js --cwd /path/to/whitelight-backend`) or ensure your process’s cwd is the backend directory.
