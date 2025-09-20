// controllers/notificationController.js
import Issue from "../models/Issue.js";

// Get Notifications (Status updates for citizens)
export const getNotifications = async (req, res) => {
  if (req.user.role !== "citizen") {
    return res.status(403).json({ success: false, error: "Access denied" });
  }

  try {
    const issues = await Issue.find({ submittedBy: req.user.id }).select(
      "status updatedAt"
    );

    // Simulate notifications as status changes
    res.json(
      issues.map((issue) => ({
        message: `Issue status: ${issue.status}`,
        time: issue.updatedAt,
      }))
    );
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
