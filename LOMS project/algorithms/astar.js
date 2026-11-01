// A* Pathfinding on a grid
// Grid: 0 = walkable, 1 = obstacle (crater, rock, hazard)

class Node {
  constructor(row, col, parent = null) {
    this.row = row;
    this.col = col;
    this.parent = parent;
    this.g = 0; // cost from start to this node
    this.h = 0; // heuristic cost from this node to target
    this.f = 0; // total cost (g + h)
  }
}

// Heuristic: straight-line (Euclidean) distance
function heuristic(a, b) {
  return Math.sqrt((a.row - b.row) ** 2 + (a.col - b.col) ** 2);
}

// Get walkable neighbors (8-directional movement)
function getNeighbors(node, grid) {
  const neighbors = [];
  const dirs = [
    [-1, 0], [1, 0], [0, -1], [0, 1], // straight
    [-1, -1], [-1, 1], [1, -1], [1, 1], // diagonal
  ];

  for (const [dr, dc] of dirs) {
    const newRow = node.row + dr;
    const newCol = node.col + dc;

    if (
      newRow >= 0 &&
      newRow < grid.length &&
      newCol >= 0 &&
      newCol < grid[0].length &&
      grid[newRow][newCol] === 0 // 0 = walkable, 1 = obstacle
    ) {
      neighbors.push(new Node(newRow, newCol));
    }
  }

  return neighbors;
}

// Main A* function
// grid: 2D array (0 = walkable, 1 = obstacle)
// start/target: {row, col}
function findPath(grid, start, target) {
  const openList = [];
  const closedList = new Set();

  const startNode = new Node(start.row, start.col);
  const targetNode = new Node(target.row, target.col);

  openList.push(startNode);

  while (openList.length > 0) {
    // Find node with lowest f in openList
    let currentIndex = 0;
    for (let i = 1; i < openList.length; i++) {
      if (openList[i].f < openList[currentIndex].f) {
        currentIndex = i;
      }
    }
    const currentNode = openList[currentIndex];

    // Reached target
    if (currentNode.row === targetNode.row && currentNode.col === targetNode.col) {
      const path = [];
      let temp = currentNode;
      while (temp) {
        path.push({ row: temp.row, col: temp.col });
        temp = temp.parent;
      }
      return path.reverse(); // start → target order
    }

    // Move current node from open to closed
    openList.splice(currentIndex, 1);
    closedList.add(`${currentNode.row},${currentNode.col}`);

    const neighbors = getNeighbors(currentNode, grid);

    for (const neighbor of neighbors) {
      const key = `${neighbor.row},${neighbor.col}`;
      if (closedList.has(key)) continue;

      const tentativeG =
        currentNode.g + heuristic(currentNode, neighbor); // cost to move here

      const existingNode = openList.find(
        (n) => n.row === neighbor.row && n.col === neighbor.col
      );

      if (!existingNode) {
        neighbor.parent = currentNode;
        neighbor.g = tentativeG;
        neighbor.h = heuristic(neighbor, targetNode);
        neighbor.f = neighbor.g + neighbor.h;
        openList.push(neighbor);
      } else if (tentativeG < existingNode.g) {
        existingNode.parent = currentNode;
        existingNode.g = tentativeG;
        existingNode.f = existingNode.g + existingNode.h;
      }
    }
  }

  return null; // no path found
}

module.exports = { findPath };