# GigVerify — Verified Gig Worker Portfolio & Background Check Platform

> A mobile-first, full-stack web app where gig workers build verified digital identities and clients leave cryptographically-authenticated reviews via QR codes.

---

## 📁 Project Structure

```
hackathon-prompt engineers/
├── backend/               # Node.js + Express + MongoDB API
│   ├── src/
│   │   ├── config/        # DB connection
│   │   ├── controllers/   # Business logic
│   │   ├── middleware/    # JWT auth, file upload
│   │   ├── models/        # Mongoose schemas (User, Job, Review, Portfolio)
│   │   ├── routes/        # Express routers
│   │   └── utils/         # QR generator, reputation score, ID verification
│   ├── uploads/           # Uploaded files (auto-created)
│   ├── .env
│   └── server.js
└── frontend/              # React + Vite + Tailwind CSS (PWA)
    ├── src/
    │   ├── api/           # Axios client + API methods
    │   ├── components/    # Shared UI (BottomNav, WorkerCard, QRModal…)
    │   ├── context/       # AuthContext (JWT state)
    │   └── pages/         # All route-level pages
    ├── index.html
    ├── tailwind.config.js
    └── vite.config.js
```

---

## ⚙️ Prerequisites

- **Node.js** v18+ ([download](https://nodejs.org))
- **MongoDB** running locally on `mongodb://localhost:27017` ([download](https://www.mongodb.com/try/download/community))  
  *Or use a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster and update `MONGO_URI` in `.env`*

---

## 🚀 Running Locally

### 1. Start the Backend

```bash
cd backend
# Install dependencies (already done if you cloned fresh)
npm install

# Start the dev server (uses nodemon for hot-reload)
npm run dev
```

Backend runs on **http://localhost:5000**

> **Note:** The `.env` file is pre-configured for local development. Edit it if you use MongoDB Atlas or a different port.

---

### 2. Start the Frontend

Open a **new terminal**:

```bash
cd frontend
npm install   # Only needed once
npm run dev
```

Frontend runs on **http://localhost:5173**

---

### 3. Open the App

Navigate to **http://localhost:5173** in your browser.

---

## 🔑 Environment Variables (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | Express server port |
| `MONGO_URI` | `mongodb://localhost:27017/gigworker` | MongoDB connection string |
| `JWT_SECRET` | (set in file) | Secret key for JWT signing — **change in production** |
| `CLIENT_URL` | `http://localhost:5173` | Frontend URL (used for QR code links) |
| `NODE_ENV` | `development` | Environment (`development` enables auto-approve ID simulation) |

---

## 👥 User Roles & Flows

### Gig Worker
1. Register with role **"Gig Worker"** → set skills and location
2. Go to **Jobs** tab → **Add Job** → fill in job details → get QR code
3. Show / share QR code with client via the **Share Link** button
4. Client scans → submits review → reputation score auto-updates
5. Go to **Verify ID** → upload Aadhaar / PAN → auto-approved in ~3s (dev mode)

### Client
1. Register with role **"Client"**
2. Browse **Discover** tab → tap category or search worker by skill/location
3. Tap a worker → view profile, portfolio, verified reviews
4. Scan any QR link (shared by worker) to leave a verified review

---

## 🔐 API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | — | Register new user |
| `POST` | `/api/auth/login` | — | Login, get JWT |
| `GET` | `/api/auth/me` | ✅ | Get current user |
| `PUT` | `/api/auth/profile` | ✅ | Update profile + avatar |
| `GET` | `/api/workers` | — | Search workers (skill, location, rating) |
| `GET` | `/api/workers/:id` | — | Get worker profile + reviews |
| `GET` | `/api/workers/:id/reputation` | — | Export portable reputation JSON |
| `GET` | `/api/workers/skills` | — | List all unique skills |
| `POST` | `/api/jobs` | ✅ Worker | Create job + generate QR |
| `GET` | `/api/jobs` | ✅ Worker | Get my job history |
| `GET` | `/api/jobs/verify/:qrToken` | — | Validate QR token for review |
| `POST` | `/api/reviews/:qrToken` | — | Submit verified review |
| `GET` | `/api/reviews/worker/:workerId` | — | Get all reviews for worker |
| `GET` | `/api/portfolio/me` | ✅ Worker | Get my portfolio |
| `PUT` | `/api/portfolio/me` | ✅ Worker | Update portfolio |
| `POST` | `/api/portfolio/images` | ✅ Worker | Upload work image |
| `POST` | `/api/portfolio/certifications` | ✅ Worker | Add certification |
| `POST` | `/api/portfolio/verify-id` | ✅ Worker | Submit ID for verification |

---

## 🧮 Reputation Score Formula

```
score = (avgRating / 5 × 40) + min(completedJobs × 2, 30) + min(verifiedBadges × 10, 30)

Tiers:
  Bronze    →  0 – 40
  Silver    → 41 – 65
  Gold      → 66 – 80
  Platinum  → 81 – 100
```

**Auto-badges awarded at milestones:**
- 🎯 First Job (1 job)
- ⭐ Rising Star (5 jobs)
- 🏆 Pro Worker (10 jobs)
- 💎 Expert (25 jobs)
- 🥇 Top Rated (≥4.8 avg + 5 jobs)

---

## 📱 QR Verified Review Flow

```
Worker completes job
      ↓
POST /api/jobs → UUID qrToken generated + QR image created
      ↓
Worker shares QR or link with client
      ↓
Client opens /review/:qrToken
      ↓
GET /api/jobs/verify/:qrToken → validates token is unused
      ↓
Client submits rating, comment, tags
      ↓
POST /api/reviews/:qrToken
  ├─ Token marked as USED (cannot be resubmitted)
  ├─ SHA-256 integrity hash generated (blockchain simulation)
  ├─ Duplicate IP detection (fraud prevention)
  └─ Reputation score recalculated + badges awarded
```

---

## 🔒 Security Features

| Feature | Implementation |
|---|---|
| Fake review prevention | Each QR token is single-use; cannot be resubmitted |
| Duplicate detection | Reviews from same IP within 24h are flagged |
| Integrity verification | SHA-256 hash stored per review (displayed on profile) |
| JWT auth | 30-day tokens with role-based route guards |
| File size limits | Max 5MB per upload |

---

## 🪪 ID Verification (Simulated DigiLocker)

In `development` mode, submitted IDs are auto-approved after **3 seconds** (simulating the webhook callback from a real eKYC provider).

In production, replace `src/utils/idVerification.js` with calls to:
- **DigiLocker API** (India Government)
- **Aadhaar eKYC** (UIDAI)
- **Signzy / Hyperverge** (commercial KYC APIs)

---

## 📲 PWA / Mobile Install

The frontend is a full PWA:
- **Offline caching** via Workbox (API responses + static assets)
- **Installable** on Android/iOS from Chrome/Safari → "Add to Home Screen"
- **Bottom navigation** mimics native app feel
- **Safe area insets** for notch/home-bar devices

---

## 🏗️ Production Deployment

### Backend (e.g., Railway / Render)
```bash
# Set env vars on your platform:
MONGO_URI=<Atlas connection string>
JWT_SECRET=<strong random string>
CLIENT_URL=<your frontend URL>
NODE_ENV=production
npm start
```

### Frontend (e.g., Vercel / Netlify)
```bash
npm run build
# Upload the dist/ folder or connect GitHub repo
# Set VITE_API_URL if not using the Vite proxy
```

---

## 🧩 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6 |
| PWA | vite-plugin-pwa + Workbox |
| Backend | Node.js, Express 4 |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| QR Codes | `qrcode` (server) + `qrcode.react` (client) |
| File Upload | Multer (local disk, swap for S3/Cloudinary in prod) |
| Icons | Lucide React |
| Toasts | react-hot-toast |

---

## 📸 Key Pages

| Page | Route | Description |
|---|---|---|
| Landing | `/` | Hero + features + CTA |
| Auth | `/auth` | Login / Signup with role selection |
| Worker Dashboard | `/dashboard` | Stats, reputation, badges, quick actions |
| Client Dashboard | `/discover` | Categories + top-rated workers |
| Search | `/search` | Filter by skill, location, rating |
| Worker Profile | `/profile/:id` | Public portfolio + verified reviews |
| Job History | `/jobs` | Add jobs, generate & share QR |
| Review Page | `/review/:qrToken` | QR-authenticated review form (public) |
| ID Verification | `/verify-id` | Upload & verify government ID |
| Edit Profile | `/edit-profile` | Update profile, avatar, skills |
#   h p e  
 