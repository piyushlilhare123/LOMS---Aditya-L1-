const express = require('express');
const router = express.Router();
const Mission = require('../models/Mission');
const { allocateMission } = require('../services/taskAllocation');
const { emitUpdate } = require('../socket/socketManager');
router.get('/', async (req, res) => {
  try {
    const missions = await Mission.find().populate('assignedRover');
    res.json(missions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/missions — creates a mission AND automatically assigns the best rover
router.post('/', async (req, res) => {
  try {
    const mission = new Mission(req.body);
    await mission.save();

    // Try to allocate a rover immediately
    const allocation = await allocateMission(mission);

    if (allocation.success) {
      mission.status = 'active';
      mission.assignedRover = allocation.rover._id;
      mission.estimatedEnergyCost = allocation.energyCost;
      await mission.save();

      // Broadcast rover update immediately
      emitUpdate('rover:update', allocation.rover);

      return res.status(201).json({
        message: 'Mission created and rover assigned automatically',
        mission,
        assignedRover: allocation.rover,
        waypointCount: allocation.waypointCount,
      });
   } else {
      // Mission created but stays pending — no suitable rover right now
      emitUpdate('mission:pending', {
        missionId: mission._id,
        missionName: mission.name,
        reason: allocation.reason,
      });

      return res.status(201).json({
        message: `Mission created but not yet assigned: ${allocation.reason}`,
        mission,
      });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const mission = await Mission.findByIdAndUpdate(req.params.id, req.body, {
   new: true, runValidators: true 
    });
    if (!mission) return res.status(404).json({ error: 'Mission not found' });
    res.json(mission);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const mission = await Mission.findByIdAndDelete(req.params.id);
    if (!mission) return res.status(404).json({ error: 'Mission not found' });
    res.json({ message: 'Mission deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// DELETE /api/missions — remove all missions (for testing/reset)
router.delete('/', async (req, res) => {
  try {
    await Mission.deleteMany({});
    res.json({ message: 'All missions deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;