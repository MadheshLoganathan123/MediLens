
# MediLens Patient Mobile App

This is a code bundle for MediLens Patient Mobile App. The original project is available at `https://www.figma.com/design/nt5RX6hb0BBA7aPMTV5fNd/MediLens-Patient-Mobile-App`.

## Running the frontend

- **Install dependencies**: `npm install`
- **Start dev server**: `npm run dev`

The frontend expects the following environment variables (in a `.env` file at the project root):

- `VITE_SUPABASE_URL` – your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` – Supabase anon public key
- `VITE_API_BASE_URL` – FastAPI base URL, e.g. `http://localhost:5000/api`

## Running the backend

The FastAPI backend lives in the `backend` directory.

1. Create and activate a virtual environment.
2. Install dependencies:

```bash
pip install -r backend/requirements.txt
```

3. Create a `backend/.env` file with:

- `SUPABASE_URL` – your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` – Supabase service role key (used only on the backend)
- `SUPABASE_JWT_SECRET` – Supabase JWT secret (Project Settings → Authentication → JWT)
- `BACKEND_CORS_ORIGINS` – comma-separated list of allowed origins (e.g. `http://localhost:5173`)

4. Run the API:

```bash
cd backend
uvicorn main:app --reload --port 5000
```

## Auth and API behavior

- Authentication is handled by **Supabase Auth** on the frontend using `@supabase/supabase-js`.
- The frontend sends the Supabase **access token** to the FastAPI backend via the `Authorization: Bearer <token>` header.
- FastAPI verifies this token using `SUPABASE_JWT_SECRET` and exposes:
  - Public routes: `/`, `/health`, `/api/map-style`, `/api/hospitals`
  - Protected routes under `/api/*` (e.g. `/api/profile`, `/api/me`, `/api/admin/dashboard`)

On auth failures, the backend returns structured errors like:

```json
{
  "detail": {
    "code": "TOKEN_EXPIRED",
    "message": "Token has expired"
  }
}
```

The frontend parses these error codes to handle cases like expired tokens, missing profiles, or insufficient permissions.
