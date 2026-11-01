const Rover = require('../models/Rover');
const { calculateRoute } = require('./pathService');

// Simple distance helper (reused from simulator logic)
function calculateDistance(pos1, pos2) {
  const dx = pos2.lat - pos1.lat;
  const dy = pos2.lng - pos1.lng;
  return Math.sqrt(dx * dx + dy * dy) * 111; // rough km conversion
}

// Estimate energy cost for a rover to complete a mission (simplified model)
function estimateEnergyCost(distanceKm) {
  return distanceKm * 0.05; // % battery per km, tuned for our demo-scale distances
}

// Score a single rover for a given mission — higher score = better fit
function scoreRover(rover, mission) {
  const distance = calculateDistance(rover.position, mission.targetLocation);
  const energyCost = estimateEnergyCost(distance);

  // Disqualify rovers that can't realistically complete the mission
  if (rover.battery < energyCost + 10) {
    // +10% safety margin so rover isn't stranded
    return { rover, score: -Infinity, distance, energyCost, disqualified: true };
  }

  const priorityWeight = mission.priority * 5;
  const scientificWeight = mission.scientificValue * 3;
  const distancePenalty = distance * 2;
  const energyPenalty = energyCost * 1.5;

  const score = priorityWeight + scientificWeight - distancePenalty - energyPenalty;

  return { rover, score, distance, energyCost, disqualified: false };
}

// Find the best available rover for a mission
async function findBestRover(mission) {
  // Only consider rovers that are free and healthy
  const availableRovers = await Rover.find({
    status: 'idle',
    battery: { $gt: 15 }, // don't even consider critically low battery rovers
  });

  if (availableRovers.length === 0) {
    return { success: false, reason: 'No idle rovers available' };
  }

  const scoredRovers = availableRovers.map((rover) => scoreRover(rover, mission));

  const qualifiedRovers = scoredRovers.filter((r) => !r.disqualified);

  if (qualifiedRovers.length === 0) {
    return { success: false, reason: 'No rover has enough battery for this mission' };
  }

  // Pick the highest-scoring rover
  qualifiedRovers.sort((a, b) => b.score - a.score);
  const best = qualifiedRovers[0];

  return {
    success: true,
    rover: best.rover,
    score: best.score,
    distance: best.distance,
    energyCost: best.energyCost,
  };
}

// Main function: assign a mission to the best available rover, with A* route
async function allocateMission(mission) {
  const result = await findBestRover(mission);

  if (!result.success) {
    return { success: false, reason: result.reason };
  }

  const { rover, distance, energyCost } = result;

  const waypoints = calculateRoute(rover.position, mission.targetLocation);

  if (!waypoints) {
    return {
      success: false,
      reason: 'Selected rover cannot reach target — path blocked by obstacle',
    };
  }

  // Assign the rover: update its status and path
  const updatedRover = await Rover.findByIdAndUpdate(
    rover._id,
    {
      status: 'active',
      targetPosition: mission.targetLocation,
      path: waypoints,
      currentWaypointIndex: 0,
      currentTask: mission._id,
    },
  { new: true }
  );

  return {
    success: true,
    rover: updatedRover,
    distance,
    energyCost,
    waypointCount: waypoints.length,
  };
}

module.exports = { allocateMission, findBestRover, scoreRover };