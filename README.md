# PRERNA - The Innovation Collective

PRERNA is a three-part full-stack innovation platform:

- `frontend/`: public React website
- `admin/`: separate React administration console
- `backend/`: Express REST API and MongoDB models

## Local setup

1. Install Node.js 18 or newer.
2. Start MongoDB locally or create a MongoDB Atlas cluster.
3. Copy environment examples:
   - `backend/.env.example` to `backend/.env`
   - `frontend/.env.example` to `frontend/.env`
   - `admin/.env.example` to `admin/.env`
4. Install dependencies and run each application:

```powershell
cd backend && npm install && npm run dev
cd ../frontend && npm install && npm run dev
cd ../admin && npm install && npm run dev
```

Default local ports:

- Public frontend: `http://localhost:5173`
- Admin: `http://localhost:5174`
- API: `http://localhost:5000`

## Initial admin

Set `INITIAL_ADMIN_*` in `backend/.env`. The first login request creates the initial account when no admins exist.

## Gmail SMTP OTP verification

Enable 2-Step Verification on the Gmail account, then create a Google App Password for **Mail**.

Set these values in `backend/.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-google-account@gmail.com
SMTP_APP_PASSWORD=your-google-app-password
SMTP_FROM=PRERNA Community <your-google-account@gmail.com>
```

Do not commit the app password. Restart the backend after changing SMTP settings.

## Production

- Deploy the backend to Render or Railway.
- Deploy `frontend/` and `admin/` as separate Vercel projects.
- Set MongoDB, JWT, frontend, and admin environment variables in each service.
- Set `FRONTEND_URL` and `ADMIN_URL` to exact deployed origins for CORS.
- Use HTTPS and a persistent upload service; local disk uploads are suitable only for development.
