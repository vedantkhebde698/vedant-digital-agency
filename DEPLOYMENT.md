# Deploying V. Studio for free

The included [Render Blueprint](./render.yaml) hosts the website, admin dashboard,
and API on Render's free web-service plan. Render's local filesystem is temporary,
so production inquiries use a PostgreSQL database rather than the local SQLite file.

## 1. Create the free PostgreSQL database

1. Create a free project at [Supabase](https://supabase.com/).
2. In **Connect**, select the **Session pooler** connection string and copy its URI.
   Use the connection string as `DATABASE_URL`; keep its password private.

## 2. Publish the site

1. Push this project to a GitHub repository.
2. In [Render](https://render.com/), choose **New → Blueprint** and connect the repository.
3. When prompted, set `ADMIN_PASSWORD` to a unique password of at least 16 characters.
   Set `DATABASE_URL` to the Supabase session-pooler URI from step 1.
4. Deploy the Blueprint. Render provides the public `*.onrender.com` URL.
5. Open `<your-render-url>/admin` and sign in with your admin password.

The free Render web service can take a short time to wake up after inactivity. The
Supabase free database has its own quotas and inactivity policies; check its current
plan limits and retain a backup before relying on it for business records.

## Local development

This workspace has a private, ignored `backend/.env` with a randomly generated local
admin password. Open that file to retrieve or change the password for `/admin`.
For a fresh checkout, copy `backend/.env.example` to `backend/.env` and replace the
sample password with a unique value of at least 16 characters, then run:

```powershell
cd backend
npm install
npm start
```

Open `http://localhost:5051/` for this workspace's running preview, or use
`http://localhost:5000/` when starting with the example configuration. Add `/admin`
to the URL to open the dashboard. Local inquiries are stored in
`backend/data/inquiries.sqlite`; keep that file private and do not commit it.
