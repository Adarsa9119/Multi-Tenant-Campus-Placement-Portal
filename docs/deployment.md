# Deployment

1. Provision MongoDB (Atlas or self-hosted) and an SMTP account.
2. Backend: copy `backend/.env.example` → `.env`; set `NODE_ENV=production`, `MONGO_URI`, distinct long random `JWT_SECRET` and `OTP_PEPPER` values, `CLIENT_URL` (comma-separated allowed origins), working SMTP settings, and `UPLOAD_DIR` on a persistent private volume. Production startup rejects missing SMTP or OTP secrets. `npm ci && npm start`.
3. Set `SEED_SUPER_ADMIN_EMAIL`, `SEED_SUPER_ADMIN_NAME`, and a strong `SEED_DEMO_PASSWORD`. Run `npm run seed:admin` from `backend/` to create or reset only that Super Admin account without changing other records. Never run the demo seed in production; it wipes application data.
4. Frontend: set `VITE_API_URL` to the public API URL, `npm ci && npm run build`, serve `frontend/dist` from any static host / reverse proxy.
5. Terminate TLS at a reverse proxy (`trust proxy` is enabled), restrict CORS to the frontend origin, back up MongoDB and `UPLOAD_DIR`.
6. Health check: `GET /api/health`.
