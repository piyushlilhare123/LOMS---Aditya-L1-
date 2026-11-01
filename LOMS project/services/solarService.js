const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");

const EVENTS_FILE = path.join(
  DATA_DIR,
  "solexs_loms_api_events.json"
);

const LATEST_FILE = path.join(
  DATA_DIR,
  "solexs_loms_latest_events.json"
);

const SUMMARY_FILE = path.join(
  DATA_DIR,
  "solexs_loms_api_summary.json"
);

function loadJson(file) {
  if (!fs.existsSync(file)) {
    throw new Error(`Solar data file not found: ${file}`);
  }

  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function getAllEvents() {
  return loadJson(EVENTS_FILE);
}

function getLatestEvents() {
  return loadJson(LATEST_FILE);
}

function getSummary() {
  return loadJson(SUMMARY_FILE);
}

function getEventById(id) {
  const events = getAllEvents();

  return events.find(
    event => String(event.eventId) === String(id)
  );
}

function getCriticalEvents() {
  const events = getAllEvents();

  return events
    .filter(
      event =>
        event.loms &&
        event.loms.severity === "CRITICAL"
    )
    .sort(
      (a, b) =>
        (b.loms?.priorityScore || 0) -
        (a.loms?.priorityScore || 0)
    );
}

module.exports = {
  getAllEvents,
  getLatestEvents,
  getSummary,
  getEventById,
  getCriticalEvents,
};