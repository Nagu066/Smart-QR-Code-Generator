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
- `GET /api/qrs` - list all QRs and scan counts<img width="1440" height="900" alt="Screenshot 2026-02-27 at 9 36 11 AM" src="https://github.com/user-attachments/assets/7363d41a-424d-4318-aa2a-51b3d03ead92" />

- `GET /r/:shortCode` - increment scan co<img width="1440" height="900" alt="Screenshot 2026-02-27 at 9 35 57 AM" src="https://github.com/user-attachments/assets/d28aa313-f319-485f-b23a-53fcc96f711d" />
unt and redirect
<img width="1440" height="900" alt="Screenshot 2026-02-27 at 9 33 33 AM" src="https://github.com/user-attachments/assets/8dc84c88-969f-4ea0-bac8-4359a04ca64d" />

