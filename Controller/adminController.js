import issueModel from "../models/issueModel.js";
import notificationModel from "../models/notificationModel.js";
import userModel from "../models/userModel.js";

// Acknowledge issue
export const acknowledge = async (req, res) => {
  try {
    const { issueId, remarks } = req.body;
    const issue = await issueModel.findById(issueId);
    if (!issue) return res.status(404).json({ msg: "Issue not found" });

    issue.status = "acknowledged";
    issue.history.push({
      action: "acknowledged",
      updatedBy: req.user.id,
      remarks,
    });
    await issue.save();

    // Notify citizen
    const notif = new notificationModel({
      user: issue.reportedBy,
      issue: issue._id,
      message: `Your issue "${issue.title}" has been acknowledged.`,
    });
    await notif.save();

    const user = await userModel.findById(issue.reportedBy);
    user.notifications.push(notif._id);
    await user.save();

    res.json(issue);
  } catch (err) {
    res.status(500).json({ err });
  }
};

// Assign staff/department
export const assign = async (req, res) => {
  try {
    const { issueId, staffId, department } = req.body;
    const issue = await issueModel.findById(issueId);
    if (!issue) return res.status(404).json({ msg: "Issue not found" });

    issue.assignedStaff = staffId;
    if (department) issue.assignedDepartment = department;
    issue.history.push({
      action: "assigned",
      updatedBy: req.user.id,
    });
    await issue.save();

    res.json(issue);
  } catch (err) {
    res.status(500).json({ err });
  }
};

// Update status
export const updateStatus = async (req, res) => {
  try {
    const { issueId, status, remarks } = req.body;
    const issue = await issueModel.findById(issueId);
    if (!issue) return res.status(404).json({ msg: "Issue not found" });

    issue.status = status;
    if (status === "resolved") issue.resolvedAt = Date.now();
    issue.history.push({
      action: "status_update",
      updatedBy: req.user.id,
      remarks,
    });
    await issue.save();

    // Notify citizen
    const notif = new notificationModel({
      user: issue.reportedBy,
      issue: issue._id,
      message: `Your issue "${issue.title}" status updated to ${status}.`,
    });
    await notif.save();

    const user = await userModel.findById(issue.reportedBy);
    user.notifications.push(notif._id);
    await user.save();

    res.json(issue);
  } catch (err) {
    res.status(500).json({ err });
  }
};

// Resolve issue
export const resolve = async (req, res) => {
  try {
    const { issueId, remarks } = req.body;
    const issue = await issueModel.findById(issueId);
    if (!issue) return res.status(404).json({ msg: "Issue not found" });

    issue.status = "resolved";
    issue.resolvedAt = Date.now();
    issue.history.push({
      action: "resolved",
      updatedBy: req.user.id,
      remarks,
    });
    await issue.save();

    // Final notification
    const notif = new notificationModel({
      user: issue.reportedBy,
      issue: issue._id,
      message: `Your issue "${issue.title}" has been resolved.`,
    });
    await notif.save();

    const user = await userModel.findById(issue.reportedBy);
    user.notifications.push(notif._id);
    await user.save();

    res.json(issue);
  } catch (err) {
    res.status(500).json({ err });
  }
};
