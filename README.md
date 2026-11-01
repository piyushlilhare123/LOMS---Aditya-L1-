<div align="center">

# 🛰️ LOMS — Lunar Operations Management System
### *Aditya-L1 Inspired AI Rover Mission Control Platform*

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-010101?style=for-the-badge&logo=socketdotio)](https://socket.io/)
[![Three.js](https://img.shields.io/badge/Three.js-3D-black?style=for-the-badge&logo=threedotjs)](https://threejs.org/)

> **A real-time, AI-powered mission control dashboard for managing autonomous lunar rovers — inspired by ISRO's Aditya-L1 solar observatory mission.**

</div>

---

## 🌟 What is LOMS?

LOMS (Lunar Operations Management System) is a full-stack web application that simulates the mission control experience for autonomous lunar rovers. It integrates **real-time solar weather data**, **AI-driven path planning**, and a **live 3D Earth visualization** to create an immersive space operations dashboard.

Built as a tribute to **ISRO's Aditya-L1 mission** — India's first solar observatory spacecraft — LOMS brings space tech to the browser.

---

## ✨ Features

### 🤖 AI Rover Auto-Pilot
- Autonomous rover management with dynamic mission assignment
- Real-time battery monitoring and recall-to-base logic
- AI-powered **dynamic replanning engine** — adapts rover missions every 3 seconds based on live solar conditions

### 🛤️ A\* Pathfinding
- Custom **A\* (A-Star) algorithm** implementation with Euclidean heuristic
- 8-directional movement across a planetary grid
- Obstacle avoidance (craters, rocks, hazards)
- Visual rover trail rendering on the 3D globe

### ☀️ Solar Weather Intelligence
- Live integration with **SOLEXS / HEL1OS solar X-ray data** (Aditya-L1 instruments)
- LOMS AI Forecast — predicts solar flare risk levels (Nominal → Critical)
- Automatic rover behavior adjustments during solar events
- Unified Solar Dashboard with real-time charts powered by **Recharts**

### 🌍 3D Earth Visualization
- Immersive **Three.js + React Three Fiber** powered 3D globe
- Live rover markers, mission waypoints, and satellite orbits
- Interactive camera rig with smooth controls
- Solar system view with planetary textures

### ⚡ Real-Time Everything
- **Socket.IO** powered live updates — zero page refresh needed
- Rover position, battery, and mission status stream live
- Solar event alerts pushed instantly to the dashboard

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript |
| **3D Rendering** | Three.js, React Three Fiber, Drei |
| **Styling** | Tailwind CSS v4 |
| **Charts** | Recharts |
| **Real-time** | Socket.IO Client |
| **Backend** | Node.js, Express v5 |
| **Database** | MongoDB Atlas + Mongoose |
| **Real-time Server** | Socket.IO |
| **Algorithms** | Custom A\* Pathfinding |

---

## 📁 Project Structure

```
LOMS---Aditya-L1/
│
├── 📂 LOMS project/              # Backend (Node.js + Express)
│   ├── algorithms/
│   │   └── astar.js              # A* pathfinding algorithm
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── data/                     # Solar forecast & rover plan JSON data
│   ├── models/
│   │   ├── Rover.js              # Rover schema
│   │   └── Mission.js            # Mission schema
│   ├── routes/
│   │   ├── rovers.js             # /api/rovers
│   │   ├── missions.js           # /api/missions
│   │   └── solar.js              # /api/solar
│   ├── services/
│   │   ├── replanningEngine.js   # AI dynamic replanning (every 3s)
│   │   ├── pathService.js        # Route calculation service
│   │   ├── solarService.js       # Solar data processing
│   │   └── taskAllocation.js     # Mission-to-rover allocation
│   ├── simulator/
│   │   └── roverSimulator.js     # Rover movement simulation (every 2s)
│   ├── socket/
│   │   └── socketManager.js      # Socket.IO event management
│   └── server.js                 # Express server entry point
│
└── 📂 loms-frontend/             # Frontend (Next.js + Three.js)
    └── app/
        ├── components/
        │   ├── SolarSystem.tsx           # 3D solar system view
        │   ├── RoverMarker.tsx           # Live rover pins on globe
        │   ├── RoverTrail.tsx            # Rover path visualization
        │   ├── MissionMarker.tsx         # Mission waypoint markers
        │   ├── TopHUD.tsx                # Mission control HUD overlay
        │   ├── UnifiedSolarDashboard.tsx # Full solar weather panel
        │   ├── SolarActivityPanel.tsx    # Solar X-ray activity chart
        │   ├── RoverReplanningDashboard.tsx # AI replanning status
        │   ├── SolarCriticalAlert.tsx    # Emergency solar alerts
        │   └── ...more components
        ├── hooks/
        │   └── useRoverSocket.ts         # Socket.IO real-time hook
        └── utils/
            ├── coordinates.ts            # Lat/lng ↔ 3D coordinate utils
            └── solarApi.ts               # Solar API client
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the Repository
```bash
git clone https://github.com/piyushlilhare123/LOMS---Aditya-L1-.git
cd LOMS---Aditya-L1-
```

### 2. Start the Backend
```bash
cd "LOMS project"

# Create .env file
echo PORT=5000 > .env
echo MONGO_URI=your_mongodb_connection_string >> .env

# Install dependencies
npm install

# Start server
node server.js
```
✅ Backend runs at: `http://localhost:5000`

### 3. Start the Frontend
```bash
cd loms-frontend

# Create .env.local
echo NEXT_PUBLIC_LOMS_API_URL=http://localhost:5000 > .env.local

# Install dependencies
npm install

# Start dev server
npx next dev
```
✅ Frontend runs at: `http://localhost:3000`

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check & system info |
| `GET` | `/api/rovers` | Get all rovers |
| `POST` | `/api/rovers` | Create a new rover |
| `GET` | `/api/missions` | Get all missions |
| `POST` | `/api/missions` | Create a new mission |
| `GET` | `/api/solar` | Live solar weather data |
| `GET` | `/api/solar-forecast` | AI solar forecast (Aditya-L1) |
| `GET` | `/api/rover-plan` | Rover action plan data |

---

## ⚡ Real-Time Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `rover:update` | Server → Client | Live rover position & battery |
| `mission:update` | Server → Client | Mission status changes |
| `solar:alert` | Server → Client | Critical solar event warning |
| `replan:triggered` | Server → Client | AI replanning activated |

---

## 🧠 How the AI Works

```
Solar Weather Data (Aditya-L1)
         ↓
  LOMS AI Forecast Engine
         ↓
  Risk Level Assessment
  (Nominal / Elevated / Critical)
         ↓
  Dynamic Replanning Engine (every 3s)
         ↓
  ┌──────────────────────────────┐
  │  Nominal   → Full Operations │
  │  Elevated  → Reduce speed    │
  │  Critical  → Recall to base  │
  └──────────────────────────────┘
         ↓
  A* Pathfinding recalculates route
         ↓
  Socket.IO pushes update to frontend
```

---

## 🌐 Deployment

| Service | Platform | URL |
|---------|----------|-----|
| 🌐 Frontend | Vercel | *coming soon* |
| 🔧 Backend | Render | *coming soon* |
| 🗄️ Database | MongoDB Atlas | ✅ Live |

---

## 👨‍💻 Built By

<div align="center">

**Aditya & Piyush**
*Inspired by ISRO's Aditya-L1 Solar Observatory Mission 🚀*

[![GitHub](https://img.shields.io/badge/GitHub-piyushlilhare123-181717?style=flat&logo=github)](https://github.com/piyushlilhare123)

</div>

---

<div align="center">

*"The cosmos is within us. We are made of star-stuff."* — Carl Sagan

⭐ **Star this repo if you found it cool!** ⭐

</div>
