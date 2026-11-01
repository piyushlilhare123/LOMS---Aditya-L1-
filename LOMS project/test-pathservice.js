const { calculateRoute } = require('./services/pathService');

const start = { lat: 12.4, lng: 45.2 };
const target = { lat: 16.0, lng: 52.0 };

console.log('🚀 Calculating route from', start, 'to', target);

const waypoints = calculateRoute(start, target);

if (waypoints) {
  console.log(`\n✅ Route found! ${waypoints.length} waypoints:\n`);
  waypoints.forEach((point, i) => {
    console.log(`  ${i + 1}. lat: ${point.lat.toFixed(4)}, lng: ${point.lng.toFixed(4)}`);
  });
} else {
  console.log('❌ No route found — start or target might be blocked, or unreachable.');
}