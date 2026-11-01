const { findPath } = require('./algorithms/astar');

// Simple 10x10 grid — 0 = walkable, 1 = obstacle
const grid = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const start = { row: 0, col: 0 };
const target = { row: 5, col: 8 };

console.log('🗺️  Grid (0 = walkable, 1 = obstacle):');
grid.forEach(row => console.log(row.join(' ')));

console.log('\n🚀 Finding path from', start, 'to', target);

const path = findPath(grid, start, target);

if (path) {
  console.log('\n✅ Path found! Length:', path.length, 'steps');
  console.log(path);

  // Visualize the path on the grid
  const visualGrid = grid.map(row => [...row]);
  path.forEach(({ row, col }) => {
    if (visualGrid[row][col] === 0) visualGrid[row][col] = 2; // mark path
  });

  console.log('\n🛰️  Path visualization (2 = rover path):');
  visualGrid.forEach(row => console.log(row.join(' ')));
} else {
  console.log('❌ No path found!');
}