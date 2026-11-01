const mongoose = require('mongoose');

const roverSchema = new mongoose.Schema(
  {
    roverId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    status: {
      type: String,
      enum: ['idle', 'active', 'returning', 'warning', 'failed'],
      default: 'idle',
    },
    battery: { type: Number, default: 100, min: 0, max: 100 },
    position: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },
    targetPosition: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    speed: { type: Number, default: 0 },
    communication: {
      type: String,
      enum: ['stable', 'degraded', 'critical', 'disconnected'],
      default: 'stable',
    },
    currentTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mission',
      default: null,
    },
    distanceFromBase: { type: Number, default: 0 },
    path: {
      type: [
        {
          lat: Number,
          lng: Number,
        },
      ],
      default: [],
    },
    currentWaypointIndex: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Rover', roverSchema);