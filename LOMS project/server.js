require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const http = require("http");

const connectDB = require("./config/db");
const { initSocket } = require("./socket/socketManager");

const roverRoutes = require("./routes/rovers");
const missionRoutes = require("./routes/missions");
const solarRoutes = require("./routes/solar");

const startSimulator = require("./simulator/roverSimulator");
const startReplanningEngine = require("./services/replanningEngine");

const app = express();
const server = http.createServer(app);

/* =========================================================
   SOCKET.IO
========================================================= */

initSocket(server);

/* =========================================================
   MIDDLEWARE
========================================================= */

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (origin && origin.endsWith(".vercel.app")) return callback(null, true);
      return callback(new Error("CORS not allowed: " + origin));
    },
    credentials: true,
  })
);

app.use(express.json());

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    system: "LOMS",
    status: "Backend is running",
    frontend: "http://localhost:3000",
    solarApi: "http://localhost:5000/api/solar",
  });
});

/* =========================================================
   API ROUTES
========================================================= */

app.use("/api/rovers", roverRoutes);
app.use("/api/missions", missionRoutes);
app.use("/api/solar", solarRoutes);

// --- L1 AI FORECAST & ROVER PLAN ROUTES ---

app.get("/api/solar-forecast", (req, res) => {
  const filePath = path.join(__dirname, "data", "unified_solar_forecast.json");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Failed to read forecast data" });
    res.json(JSON.parse(data));
  });
});

app.get("/api/rover-plan", (req, res) => {
  const filePath = path.join(__dirname, "data", "rover_action_plan.json");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Failed to read rover plan data" });
    res.json(JSON.parse(data));
  });
});

/* =========================================================
   404 HANDLER
========================================================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "API endpoint not found",
    path: req.originalUrl,
  });
});

/* =========================================================
   ERROR HANDLER
========================================================= */

app.use((err, req, res, next) => {
  console.error("❌ Backend error:", err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

/* =========================================================
   DATABASE & SERVER STARTUP
========================================================= */

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log("");
    console.log("=================================================");
    console.log("🚀 LOMS BACKEND STARTED");
    console.log("=================================================");
    console.log(`🛰️   Backend  : http://localhost:${PORT}`);
    console.log("🌐 Frontend : http://localhost:3000");
    console.log(`☀️   Solar API: http://localhost:${PORT}/api/solar`);
    console.log("=================================================");
    console.log("");

    /* Start background services safely after DB connection */
    try {
      startSimulator();
      console.log("🤖 Rover simulator started");
    } catch (error) {
      console.error("❌ Rover simulator failed:", error);
    }

    try {
      startReplanningEngine();
      console.log("🧠 Dynamic replanning engine started");
    } catch (error) {
      console.error("❌ Replanning engine failed:", error);
    }
  });
}).catch((err) => {
  console.error("❌ Failed to connect to MongoDB:", err);
});