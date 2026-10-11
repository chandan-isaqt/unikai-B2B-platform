# UNIKAI B2B Product Catalogue + Wholesale Ordering Platform

Complete full-stack local development B2B FMCG catalogue and ordering platform for **Unikai Foods PJSC** (Oman & GCC).

All three client applications (**React Customer Website**, **React Admin Panel**, and **Flutter Android/iOS App**) connect to **ONE Node.js + Express Backend** backed by **ONE Local MongoDB Database (`unikai_db`)**.

```text
Flutter App (Android / iOS)
      |
      | REST API / HTTP (http://10.0.2.2:5000/api or http://localhost:5000/api)
      v
React Website -----> Node.js + Express Backend (http://localhost:5000)
                           |
                           v
                     Local MongoDB (mongodb://127.0.0.1:27017/unikai_db)
                           ^
                           |
                     React Admin Panel (http://localhost:5173/admin)
```

---

## 1. Prerequisites

Ensure the following tools are installed on your machine:
- **Node.js** (v18+ or v20/v22 LTS) & **npm**
- **MongoDB Community Server** (v6.0 / v7.0 / v8.0+) running locally on port `27017`
- **Flutter SDK** (v3.16+ / Dart 3.2+) for running the mobile app

---

## 2. Project Structure

```text
unikai-platform/
├── web/
│   ├── frontend/          # React + Vite + Tailwind CSS Customer Website & Admin Panel
│   │   ├── src/
│   │   ├── public/
│   │   ├── package.json
│   │   └── .env.example
│   └── backend/           # Node.js + Express + Mongoose REST API
│       ├── src/
│       │   ├── config/
│       │   ├── controllers/
│       │   ├── models/
│       │   ├── routes/
│       │   ├── middleware/
│       │   ├── services/
│       │   ├── utils/
│       │   └── seed/
│       ├── uploads/
│       ├── API.md
│       ├── package.json
│       ├── .env
│       └── .env.example
├── flutter_app/           # Separate Flutter Android/iOS Customer Application
│   ├── lib/
│   │   ├── core/
│   │   ├── models/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── providers/
│   │   ├── screens/
│   │   ├── widgets/
│   │   ├── routing/
│   │   └── theme/
│   ├── assets/
│   ├── pubspec.yaml
│   └── .env.example
├── README.md
└── .gitignore
```

---

## 3. Step-by-Step Local Development Setup

### STEP 1: Install MongoDB Community Server
Install MongoDB Community Server for your operating system:
- **macOS (Homebrew):** `brew tap mongodb/brew && brew install mongodb-community`
- **Windows / Linux:** Download from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)

### STEP 2: Start MongoDB Locally
Start the local MongoDB service on `127.0.0.1:27017`:
```bash
# macOS (Homebrew)
brew services start mongodb-community

# Or run mongod directly
mongod --dbpath /opt/homebrew/var/mongodb
```

### STEP 3: Navigate to Backend
```bash
cd unikai-platform/web/backend
```

### STEP 4: Install Backend Dependencies
```bash
npm install
```

### STEP 5: Configure `/web/backend/.env`
Copy `.env.example` to `.env` (already pre-created for local development):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/unikai_db
JWT_SECRET=change_this_in_local_environment
FRONTEND_URL=http://localhost:5173
WHATSAPP_NUMBER=+96891234567
SALESMAN_NAME=Sachin
SALESMAN_PHONE=+96891234567
SALESMAN_EMAIL=sachin.sales@unikai.local
ADMIN_EMAIL=admin@unikai.local
ADMIN_PASSWORD=Admin@12345
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### STEP 6: Verify MongoDB is Running
Ensure `mongod` is active on `127.0.0.1:27017`.

### STEP 7: Seed the Local MongoDB Database (`unikai_db`)
```bash
npm run seed
```
To clear and reset all demo data at any time:
```bash
npm run seed:reset
```
This populates `mongodb://127.0.0.1:27017/unikai_db` with:
- **Admin User** (`admin@unikai.local` / `Admin@12345`)
- **Demo B2B Customer** (`customer@unikai.local` / `Customer@12345`) + 2 additional Oman B2B accounts
- **Salesman Sachin** (`+96891234567`)
- **6 Categories** (`Yoghurt & Laban`, `Juices & Beverages`, `Dairy & Milk`, `Ice Cream & Frozen`, `Cheese, Butter & Ghee`, `Food & Grocery`)
- **6 Brands** (`Unikai`, `Unikai Fresh`, `Unikai Pure`, `Unikai Silk`, `Unikai Areej`, `Unikai Foods`)
- **18 Unikai Products** (including **Meethi Lassi** `12 × 10ml` at `OMR 0.104` / Invoice `OMR 1.250`, **Orange** `180 ml` & `1 L`, **Yoghurt** `100 g` to `10 Kg`, Fresh Milk, Laban, Pure Cow Ghee, etc. with full nutrition facts and local SVG product images in `/uploads/`)
- **Sample B2B Orders & OrderItems**

### STEP 8: Start the Backend Server
```bash
npm run dev
```
- **Backend URL:** `http://localhost:5000`
- **Health Check:** `http://localhost:5000/api/health`

### STEP 9: Start the React Website & Admin Panel
Open a new terminal window:
```bash
cd unikai-platform/web/frontend
npm install
npm run dev
```
- **Customer Website:** `http://localhost:5173`
- **React Admin Panel:** `http://localhost:5173/admin`

### STEP 10: Run the Flutter Mobile App Separately
Open another terminal window:
```bash
cd unikai-platform/flutter_app
flutter pub get
flutter run
```

---

## 4. Default Local Credentials

| Role | Email | Password | Portal URL |
| :--- | :--- | :--- | :--- |
| **Admin (`ADMIN`)** | `admin@unikai.local` | `Admin@12345` | `http://localhost:5173/admin` |
| **Customer (`CUSTOMER`)** | `customer@unikai.local` | `Customer@12345` | `http://localhost:5173/login` |

---

## 5. Flutter App Backend Connectivity Guide

The Flutter app automatically selects the appropriate default API URL and also includes an in-app **Settings & API Server Config** screen (`/settings`) where you can switch URLs at runtime without rebuilding:

1. **Android Emulator:**
   Uses `http://10.0.2.2:5000/api` (maps emulator loopback to host machine's `127.0.0.1:5000`).
2. **iOS Simulator / macOS:**
   Uses `http://localhost:5000/api`.
3. **Physical Android / iOS Phone (on same Wi-Fi network):**
   Find your computer's local LAN IP (e.g., `ipconfig getifaddr en0` on macOS -> `192.168.1.50`), then either:
   - Enter `http://192.168.1.50:5000/api` inside the Flutter app's **Settings** screen, OR
   - Run with `--dart-define=API_BASE_URL=http://192.168.1.50:5000/api`:
     ```bash
     flutter run --dart-define=API_BASE_URL=http://192.168.1.50:5000/api
     ```

---

## 6. REST API Documentation

Full endpoint documentation is available in [`web/backend/API.md`](./web/backend/API.md).
# unikai-B2B-platform
