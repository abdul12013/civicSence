
import mongoose from "mongoose";

const issueSchema =  mongoose.Schema({

  title: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  photoUrl: [String], // array of image URLs (multiple photos allowed)
  audioUrl: String,

  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number],  // [longitude, latitude]
      required: true
    },
    address: String    // optional human-readable address
  },

  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },


  category: {
    type: String,
    enum: [
      "pothole",
      "streetlight",
      "garbage",
      "water_supply",
      "other"
    ],
    default: "other"
  },

  status: {
    type: String,
    enum: [
      "submitted",      // just reported by citizen
      "acknowledged",   // staff acknowledged & notified citizen
      "in_progress",    // task assigned and being worked on
      "resolved"        // issue resolved & citizen notified
    ],
    default: "submitted"
  },

  assignedDepartment: {
    type: String,  // e.g., "Public Works", "Sanitation"
    trim: true
  },

  assignedStaff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"     // references staff/admin user if needed
  },

  // --- Audit / Tracking ---
  history: [{
    action: {
      type: String,
      enum: ["acknowledged", "assigned", "status_update", "resolved"]
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    remarks: String,
    timestamp: { type: Date, default: Date.now }
  }],

  // For analytics: how long it took to resolve
  reportedAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: Date
},
{
  timestamps: true // adds createdAt and updatedAt
});

// For Geo queries like "find issues near me"
issueSchema.index({ location: "2dsphere" });

// Auto-assign department based on category (can be overridden by admin)
issueSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('category')) {
    switch (this.category) {
      case 'pothole': this.assignedDepartment = 'Public Works'; break;
      case 'streetlight': this.assignedDepartment = 'Utilities'; break;
      case 'garbage': this.assignedDepartment = 'Sanitation'; break;
      case 'water_supply': this.assignedDepartment = 'Water Department'; break;
      default: this.assignedDepartment = 'General';
    }
  }
  next();
});

export const issueModel=mongoose.model('issue',issueSchema)
