const mongoose = require('mongoose');

const missionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['exploration', 'sample-collection', 'mapping', 'construction'],
      required: true,
    },
    priority: { type: Number, min: 1, max: 10, default: 5 },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'failed', 'reassigned'],
      default: 'pending',
    },
    assignedRover: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rover',
      default: null,
    },
    targetLocation: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    estimatedEnergyCost: { type: Number, default: 0 },
    estimatedDuration: { type: Number, default: 0 },
       scientificValue: { type: Number, default: 5 },
    reassignAttempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Mission', missionSchema);