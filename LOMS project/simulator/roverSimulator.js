const Rover = require('../models/Rover');
const Mission = require('../models/Mission');
const { emitUpdate } = require('../socket/socketManager');

// Calculate distance between two lat/lng points (simplified, in km)
function calculateDistance(pos1, pos2) {
  const dx = pos2.lat - pos1.lat;
  const dy = pos2.lng - pos1.lng;
  return Math.sqrt(dx * dx + dy * dy) * 111; // rough km conversion
}

// Move a rover one step closer to its current waypoint (from its planned path)
function moveAlongPath(rover) {
  const { position, path, currentWaypointIndex } = rover;

  // No path assigned — nothing to do
  if (!path || path.length === 0) {
    return null;
  }

  // Reached the end of the path
  if (currentWaypointIndex >= path.length) {
    return {
      position,
      status: 'idle',
      speed: 0,
      path: [],
      currentWaypointIndex: 0,
      distanceFromBase: rover.distanceFromBase,
      arrived: true,
    };
  }

  const currentTarget = path[currentWaypointIndex];
  const distance = calculateDistance(position, currentTarget);

  // Close enough to this waypoint — move to the next one
  if (distance < 0.05) {
    const nextIndex = currentWaypointIndex + 1;

    if (nextIndex >= path.length) {
      // That was the final waypoint — mission complete
      return {
        position: currentTarget,
        status: 'idle',
        speed: 0,
        path: [],
        currentWaypointIndex: 0,
        distanceFromBase: rover.distanceFromBase,
        arrived: true,
      };
    }

    return {
      position: currentTarget,
      status: 'active',
      speed: 1.2,
      path,
      currentWaypointIndex: nextIndex,
      distanceFromBase: rover.distanceFromBase + distance,
      arrived: false,
    };
  }

  // Move a fraction of the way toward the current waypoint
  const stepFraction = 0.15; // 15% of remaining distance per tick (waypoints are close together)
  const newLat = position.lat + (currentTarget.lat - position.lat) * stepFraction;
  const newLng = position.lng + (currentTarget.lng - position.lng) * stepFraction;

  return {
    position: { lat: newLat, lng: newLng },
    status: 'active',
    speed: 1.2,
    path,
    currentWaypointIndex,
    distanceFromBase: rover.distanceFromBase + distance * stepFraction,
    arrived: false,
  };
}

// Drain battery based on movement and idle systems
function drainBattery(rover, isMoving) {
  const movementCost = isMoving ? 0.35 : 0.1;
  const newBattery = Math.max(0, rover.battery - movementCost);
  return newBattery;
}

// Determine communication quality (simple random simulation for now)
function updateCommunication() {
  const rand = Math.random();
  if (rand > 0.95) return 'critical';
  if (rand > 0.85) return 'degraded';
  return 'stable';
}

// Main simulation tick — runs for all active rovers
async function simulationTick() {
  try {
    const rovers = await Rover.find({
  status: { $in: ['active', 'returning', 'warning'] },
});

    for (const rover of rovers) {
      const movement = moveAlongPath(rover);

      if (!movement) continue; // no path assigned, skip

      const newBattery = drainBattery(rover, !movement.arrived);
      const communication = updateCommunication();

      let newStatus = movement.status;

      if (newBattery < 20 && newBattery > 0) {
        newStatus = 'warning';
      } else if (newBattery <= 0) {
        newStatus = 'failed';
      }

           const updateFields = {
        position: movement.position,
        status: newStatus,
        speed: movement.speed,
        battery: newBattery,
        distanceFromBase: movement.distanceFromBase,
        communication,
        path: movement.path,
        currentWaypointIndex: movement.currentWaypointIndex,
      };

      // On arrival, free the rover from its task and mark the mission complete
          // On arrival, free the rover from its task and mark the mission complete
      if (movement.arrived && rover.currentTask) {
        updateFields.currentTask = null;

        const completedMission = await Mission.findByIdAndUpdate(
          rover.currentTask,
          { status: 'completed' },
          { new: true }
        );

        console.log(`🎯 Mission for ${rover.roverId} marked as completed`);

        emitUpdate('mission:completed', {
          missionId: completedMission._id,
          missionName: completedMission.name,
          roverId: rover.roverId,
        });
      }

      const updatedRover = await Rover.findByIdAndUpdate(
        rover._id,
        updateFields,
        { new: true }
      );

      emitUpdate('rover:update', updatedRover);

      if (movement.arrived) {
        console.log(`✅ ${rover.roverId} completed its path and arrived`);
      }
    }
  } catch (err) {
    console.error('Simulation tick error:', err.message);
  }
}

// Start the simulator — runs every 2 seconds
function startSimulator() {
  console.log('🤖 Rover simulator started (tick every 2s)');
  setInterval(simulationTick, 500);
}

module.exports = startSimulator;