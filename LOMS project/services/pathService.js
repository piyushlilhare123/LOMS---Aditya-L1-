const { findPath } = require('../algorithms/astar');

// Define our "lunar terrain" as a grid
// We'll map a small lat/lng region to a grid for simplicity
const GRID_SIZE = 50; // 50x50 grid
const LAT_MIN = 10;   // covers our test coordinates (12.x)
const LAT_MAX = 20;
const LNG_MIN = 40;   // covers our test coordinates (45.x)
const LNG_MAX = 55;

// Fixed obstacles (craters/rocks) on the grid — hardcoded for now
// Later this can come from real terrain data
function generateLunarGrid() {
  const grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));

  // Add some obstacle clusters (simulate craters)
  const obstacleClusters = [
    { row: 15, col: 20, size: 4 },
    { row: 25, col: 30, size: 5 },
    { row: 10, col: 35, size: 3 },
    { row: 30, col: 15, size: 4 },
  ];

  obstacleClusters.forEach(({ row, col, size }) => {
    for (let r = row; r < row + size && r < GRID_SIZE; r++) {
      for (let c = col; c < col + size && c < GRID_SIZE; c++) {
        grid[r][c] = 1;
      }
    }
  });

  return grid;
}

// Convert real lat/lng to grid row/col
function latLngToGrid(lat, lng) {
  const row = Math.floor(
    ((lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * GRID_SIZE
  );
  const col = Math.floor(
    ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * GRID_SIZE
  );

  return {
    row: Math.max(0, Math.min(GRID_SIZE - 1, row)),
    col: Math.max(0, Math.min(GRID_SIZE - 1, col)),
  };
}

// Convert grid row/col back to lat/lng
function gridToLatLng(row, col) {
  const lat = LAT_MIN + (row / GRID_SIZE) * (LAT_MAX - LAT_MIN);
  const lng = LNG_MIN + (col / GRID_SIZE) * (LNG_MAX - LNG_MIN);
  return { lat, lng };
}

// Main function: given start and target lat/lng, return a path of lat/lng waypoints
function calculateRoute(startPos, targetPos) {
  const grid = generateLunarGrid();

  const startGrid = latLngToGrid(startPos.lat, startPos.lng);
  const targetGrid = latLngToGrid(targetPos.lat, targetPos.lng);
  // Safety check: if start or target is on an obstacle, no valid path exists
  if (grid[startGrid.row][startGrid.col] === 1) {
    console.warn('⚠️  Start position is on an obstacle');
    return null;
  }
  if (grid[targetGrid.row][targetGrid.col] === 1) {
    console.warn('⚠️  Target position is on an obstacle');
    return null;
  }
  // If start or target is on an obstacle, path planning will fail —
  // in a real system we'd snap to nearest free cell, but for now we assume clean input
  const path = findPath(grid, startGrid, targetGrid);

  if (!path) {
    return null;
  }

  // Convert grid path back to lat/lng waypoints
  const waypoints = path.map(({ row, col }) => gridToLatLng(row, col));

  return waypoints;
}

module.exports = { calculateRoute, generateLunarGrid, latLngToGrid, gridToLatLng };