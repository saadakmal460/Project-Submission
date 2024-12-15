const mongoose = require('mongoose');

const User = require('../Models/UserModel')
const DetectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true, // Ensures location is always provided
  },
  location: {
    type: String,
    required: true, // Ensures location is always provided
  },
  time: {
    type: String, // Store time as a string or use `Date` type if more precision is needed
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Resolved' , 'Confirm' , 'Unconfirmed'], // Define allowed status values
    default: 'Unconfirmed',
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically store the detection timestamp
  },
});

const Detections = mongoose.model('Detections', DetectionSchema);



module.exports = Detections;
