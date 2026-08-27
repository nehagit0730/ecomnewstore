# Database setup on Windows (without working Docker)

If `docker compose up -d` fails with **500 Internal Server Error** on `dockerDesktopLinuxEngine`, Docker Desktop is not healthy. Use **native PostgreSQL** below, or fix Docker first.

---

## Option A — Fix Docker Desktop (if you want Docker)

1. **Quit Docker Desktop** completely (tray icon → Quit).
2. **Start Docker Desktop** again and wait until it says **Engine running** (not "Starting…").
3. In PowerShell:

   ```powershell
   docker version
   ```

   Both **Client** and **Server** must print without errors.

4. If it still fails:
   - Docker Desktop → **Settings** → **General** → enable **Use the WSL 2 based engine**
   - **Settings** → **Resources** → **WSL integration** → enable your default distro
   - Restart Windows if WSL was just installed
   - **Troubleshoot** → **Restart Docker Desktop**, then **Clean / Purge data** only as last resort

5. Then from the project folder:

   ```powershell
   docker compose up -d
   ```

---

## Option B — Install PostgreSQL locally (recommended when Docker is broken)

### 1. Install

- Download: https://www.postgresql.org/download/windows/
- Or: `winget install PostgreSQL.PostgreSQL.16`
- Remember the **postgres superuser password** you set during install.

### 2. Create database and user

Open **SQL Shell (psql)** or **pgAdmin**, connect as `postgres`, then run:

```sql
CREATE USER veloire WITH PASSWORD 'veloire_secret';
CREATE DATABASE veloire OWNER veloire;
GRANT ALL PRIVILEGES ON DATABASE veloire TO veloire;
```

### 3. Configure the app

In `.env.local`:

```env
DATABASE_URL="postgresql://veloire:veloire_secret@localhost:5432/veloire?schema=public"
AUTH_SECRET="your-32-char-or-longer-secret-here"
AUTH_URL="http://localhost:3000"
```

Generate a secret (PowerShell):

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
```

### 4. Migrate and seed

```powershell
cd I:\ONLINE_SHOP_WEBSITE
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

### 5. Verify connection

```powershell
npx prisma db pull
```

If that succeeds, the store and `/api/products` can use the database.

---

## Default credentials (after seed)

| Role     | Email                 | Password     |
|----------|-----------------------|--------------|
| Admin    | admin@veloire.com     | Admin@123    |
| Customer | customer@veloire.com  | Customer@123 |

---

## Port 5432 already in use?

Another Postgres or a stuck Docker container may own the port:

```powershell
netstat -ano | findstr :5432
```

Stop the conflicting service or change the port in `DATABASE_URL` and your Postgres install.
