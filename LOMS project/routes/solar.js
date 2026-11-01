const express = require("express");

const router = express.Router();

const {
  getAllEvents,
  getLatestEvents,
  getSummary,
  getEventById,
  getCriticalEvents,
} = require("../services/solarService");

// ======================================================
// GET /api/solar/summary
// ======================================================

router.get("/summary", (req, res) => {
  try {
    const summary = getSummary();

    res.json({
      success: true,
      data: summary,
    });
  } catch (err) {
    console.error("Solar summary error:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// ======================================================
// GET /api/solar/events
// ======================================================

router.get("/events", (req, res) => {
  try {
    let events = getAllEvents();

    // Optional filters
    const severity = req.query.severity;
    const validated = req.query.validated;

    if (severity) {
      events = events.filter(
        event =>
          event.loms?.severity?.toLowerCase() ===
          severity.toLowerCase()
      );
    }

    if (validated === "true") {
      events = events.filter(
        event =>
          event.scientific?.scientificallyValidated === true
      );
    }

    res.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (err) {
    console.error("Solar events error:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// ======================================================
// GET /api/solar/events/:id
// ======================================================

router.get("/events/:id", (req, res) => {
  try {
    const event = getEventById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: "Solar event not found",
      });
    }

    res.json({
      success: true,
      data: event,
    });
  } catch (err) {
    console.error("Solar event detail error:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// ======================================================
// GET /api/solar/latest
// ======================================================

router.get("/latest", (req, res) => {
  try {
    const events = getLatestEvents();

    res.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (err) {
    console.error("Latest solar events error:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// ======================================================
// GET /api/solar/critical
// ======================================================

router.get("/critical", (req, res) => {
  try {
    const events = getCriticalEvents();

    res.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (err) {
    console.error("Critical solar events error:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;