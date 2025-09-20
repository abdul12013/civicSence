// controllers/issueController.js (ESM)

import Issue from "../models/Issue.js";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";
import assignStaff from "../utils/assignStaff.js";

// ---------------------------
// Submit Issue (Citizen only)
// ---------------------------
const submitIssue = async (req, res) => {
  const { description, type, lat, long } = req.body;
  const image = req.file; // From multer

  try {
    if (req.user.role !== "citizen") {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    let imageUrl = "";
    if (image) {
      const result = await cloudinary.uploader.upload(image.path);
      imageUrl = result.secure_url;
    }

    const issue = new Issue({
      description,
      type,
      image: imageUrl,
      location: [long, lat],
      submittedBy: req.user.id,
    });

    await issue.save();

    // Auto-assign to staff
    const assignedStaff = await assignStaff(type);
    if (assignedStaff) {
      issue.assignedTo = assignedStaff._id;
      issue.status = "assigned";
      await issue.save();
    }

    res.json(issue);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ---------------------------
// Get All Issues (for map)
// ---------------------------
const getAllIssues = async (req, res) => {
  try {
    const issues = await Issue.find().populate(
      "submittedBy assignedTo",
      "name"
    );
    res.json(issues);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ---------------------------
// Get My Submitted Issues (Citizen)
// ---------------------------
const getMyIssues = async (req, res) => {
  if (req.user.role !== "citizen")
    return res.status(403).json({ msg: "Access denied" });
  try {
    const issues = await Issue.find({ submittedBy: req.user.id });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ---------------------------
// Get Assigned Issues (Staff)
// ---------------------------
const getAssignedIssues = async (req, res) => {
  if (req.user.role !== "staff")
    return res.status(403).json({ msg: "Access denied" });
  try {
    const issues = await Issue.find({
      assignedTo: req.user.id,
      status: "assigned",
    });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ---------------------------
// Get Completed Issues (Staff)
// ---------------------------
const getCompletedIssues = async (req, res) => {
  if (req.user.role !== "staff")
    return res.status(403).json({ msg: "Access denied" });
  try {
    const issues = await Issue.find({
      assignedTo: req.user.id,
      status: "completed",
    });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ---------------------------
// Complete Issue (Staff)
// ---------------------------
const completeIssue = async (req, res) => {
  const { issueId, lat, long } = req.body;
  const image = req.file;

  if (req.user.role !== "staff")
    return res.status(403).json({ msg: "Access denied" });

  try {
    const issue = await Issue.findById(issueId);
    if (!issue || issue.assignedTo.toString() !== req.user.id)
      return res.status(404).json({ msg: "Issue not found" });

    let completionImageUrl = "";
    if (image) {
      const result = await cloudinary.uploader.upload(image.path);
      completionImageUrl = result.secure_url;
    }

    issue.status = "completed";
    issue.completionImage = completionImageUrl;
    issue.completionLocation = { lat, long };
    await issue.save();

    // Trigger notification (simplified)
    // In real app, use websockets or push notifications

    res.json(issue);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ---------------------------
// Exports
// ---------------------------
export {
  submitIssue,
  getAllIssues,
  getMyIssues,
  getAssignedIssues,
  getCompletedIssues,
  completeIssue,
};
