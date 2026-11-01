const Rover = require('../models/Rover');
const Mission = require('../models/Mission');
const { allocateMission } = require('./taskAllocation');
const { calculateRoute } = require('./pathService');
const { emitUpdate } = require('../socket/socketManager');

// Base position — where rovers return to when recalled
const BASE_POSITION = { lat: 12.4, lng: 45.2 };

// Threshold below which we consider a rover "in trouble"
const CRITICAL_BATTERY_THRESHOLD = 30;

// Send a rover back to base (if it still has some battery)
async function recallRoverToBase(rover) {
  if (rover.battery <= 0) {
    // Rover is fully dead — can't move, just mark it failed and leave it
    await Rover.findByIdAndUpdate(rover._id, {
      status: 'failed',
      currentTask: null,
      path: [],
      currentWaypointIndex: 0,
    });
    console.log(`💀 ${rover.roverId} is fully depleted and stranded`);
    return;
  }

  const waypoints = calculateRoute(rover.position, BASE_POSITION);

  const updatedRover = await Rover.findByIdAndUpdate(
    rover._id,
    {
      status: 'returning',
      targetPosition: BASE_POSITION,
      path: waypoints || [],
      currentWaypointIndex: 0,
      currentTask: null,
    },
    { new: true }
  );

  emitUpdate('rover:update', updatedRover);
  console.log(`🔄 ${rover.roverId} recalled to base (battery: ${rover.battery.toFixed(1)}%)`);
}

// Try to find a new rover for an orphaned mission
async function reassignMission(mission) {
  const allocation = await allocateMission(mission);

  if (allocation.success) {
    await Mission.findByIdAndUpdate(mission._id, {
      status: 'active',
      assignedRover: allocation.rover._id,
      estimatedEnergyCost: allocation.energyCost,
      reassignAttempts: 0,
    });

    emitUpdate('mission:reassigned', {
      missionId: mission._id,
      missionName: mission.name,
      newRover: allocation.rover.roverId,
    });

    console.log(
      `✅ Mission "${mission.name}" reassigned to ${allocation.rover.roverId}`
    );
  } else {
    const attempts = (mission.reassignAttempts || 0) + 1;
    const FAIL_THRESHOLD = 5;

    if (attempts >= FAIL_THRESHOLD) {
      await Mission.findByIdAndUpdate(mission._id, {
        status: 'failed',
        assignedRover: null,
      });

      emitUpdate('mission:failed', {
        missionId: mission._id,
        missionName: mission.name,
        reason: allocation.reason,
      });

      console.log(`❌ Mission "${mission.name}" marked as FAILED: ${allocation.reason}`);
    } else {
      await Mission.findByIdAndUpdate(mission._id, {
        status: 'pending',
        assignedRover: null,
        reassignAttempts: attempts,
      });

      console.log(
        `⏳ Mission "${mission.name}" could not be reassigned (attempt ${attempts}/${FAIL_THRESHOLD}): ${allocation.reason}`
      );
    }
  }
}

// Main replanning check — runs periodically
async function replanningTick() {
  try {
    // Find rovers that are in trouble: critically low battery or already failed,
    // but still have an active mission assigned to them
    const troubledRovers = await Rover.find({
      $or: [
        { battery: { $lte: CRITICAL_BATTERY_THRESHOLD }, status: { $in: ['active', 'warning'] } },
        { status: 'failed' },
      ],
      currentTask: { $ne: null },
    });

    for (const rover of troubledRovers) {
      const mission = await Mission.findById(rover.currentTask);

      console.log(
        `⚠️  Disruption detected: ${rover.roverId} (battery ${rover.battery.toFixed(
          1
        )}%, status ${rover.status})`
      );

      // Step 1: recall the troubled rover
      await recallRoverToBase(rover);

      // Step 2: reassign its mission to another rover, if one exists
      if (mission) {
        await reassignMission(mission);
      }
    }

    // Retry any pending missions — a rover that was busy/dead earlier may be free now
    const pendingMissions = await Mission.find({ status: 'pending' });

    if (pendingMissions.length > 0) {
      const anyRoverAvailable = await Rover.exists({ status: 'idle', battery: { $gt: 15 } });

      if (anyRoverAvailable) {
        for (const mission of pendingMissions) {
          await reassignMission(mission);
        }
      }
      // If no rover is available at all, skip silently — avoids spamming the
      // console every 3s when the fleet is simply out of usable rovers.
    }
  } catch (err) {
    console.error('Replanning tick error:', err.message);
  }
}

// Start the replanning engine — checks every 3 seconds
function startReplanningEngine() {
  console.log('🧠 Dynamic replanning engine started (checks every 3s)');
  setInterval(replanningTick, 3000);
}

module.exports = startReplanningEngine;