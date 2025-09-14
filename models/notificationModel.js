import mongoose from "mongoose";

const notificationSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  issue: { type: mongoose.Schema.Types.ObjectId, ref: 'issue' },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

export const notificationModel = mongoose.model('notification', notificationSchema);