# Smart QR Code Generator MVP

Quick MVP with:

- React frontend (`frontend/`)
- Node.js + Express backend (`backend/`)
- QR creation for URLs
- QR list UI
- Scan count tracking via redirect route

## How scan tracking works

Each QR stores a backend redirect link like `http://localhost:5000/r/abc123`.
When scanned, the backend increments the scan count and then redirects to the original URL.

## Run the app

### 1. Start backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Backend runs on `http://localhost:5000`.

### 2. Start frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs on `http://localhost:5173`.

## MVP endpoints

- `POST /api/qrs` - create QR from URL
- `GET /api/qrs` - list all QRs and scan counts
- `GET /r/:shortCode` - increment scan count and redirect

