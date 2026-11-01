const express = require('express');
const router = express.Router();
const Rover = require('../models/Rover');
const { calculateRoute } = require('../services/pathService');
router.get('/', async (req, res) => {
  try {
    const rovers = await Rover.find().populate('currentTask');
    res.json(rovers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const rover = await Rover.findById(req.params.id).populate('currentTask');
    if (!rover) return res.status(404).json({ error: 'Rover not found' });
    res.json(rover);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const rover = new Rover(req.body);
    await rover.save();
    res.status(201).json(rover);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const rover = await Rover.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      runValidators: true,
    });
    if (!rover) return res.status(404).json({ error: 'Rover not found' });
    res.json(rover);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const rover = await Rover.findByIdAndDelete(req.params.id);
    if (!rover) return res.status(404).json({ error: 'Rover not found' });
    res.json({ message: 'Rover deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// POST /api/rovers/:id/plan-route
// Calculates an A*-based path from the rover's current position to a target,
// then assigns that path to the rover and sets it active.
router.post('/:id/plan-route', async (req, res) => {
  try {
    const { targetLat, targetLng } = req.body;

    if (targetLat === undefined || targetLng === undefined) {
      return res.status(400).json({ error: 'targetLat and targetLng are required' });
    }

    const rover = await Rover.findById(req.params.id);
    if (!rover) return res.status(404).json({ error: 'Rover not found' });

    const waypoints = calculateRoute(rover.position, {
      lat: targetLat,
      lng: targetLng,
    });

    if (!waypoints) {
      return res.status(400).json({
        error: 'No valid path found — start or target may be blocked by an obstacle',
      });
    }

    const updatedRover = await Rover.findByIdAndUpdate(
      req.params.id,
      {
        status: 'active',
        targetPosition: { lat: targetLat, lng: targetLng },
        path: waypoints,
        currentWaypointIndex: 0,
      },
      { new: true }
    );

    res.json({
      message: 'Route planned successfully',
      waypointCount: waypoints.length,
      rover: updatedRover,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/rovers — remove all rovers (for testing/reset)
router.delete('/', async (req, res) => {
  try {
    await Rover.deleteMany({});
    res.json({ message: 'All rovers deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;