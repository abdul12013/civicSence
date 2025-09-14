import userModel from "../models/userModel.js";
import issueModel from "../models/issueModel.js";
import notificationModel from "../models/notificationModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Register citizen
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPw = await bcrypt.hash(password, 10);
    const user = new userModel({ name, email, password: hashedPw, role: "citizen" });
    await user.save();
    res.status(201).json({ msg: "Registered" });
  } catch (err) {
    res.status(500).json({ err });
  }
};

// Login (for all roles)
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token });
  } catch (err) {
    res.status(500).json({ err });
  }
};

// Submit report
export const submitReport = async (req, res) => {
  try {
    const { title, description, category, location } = req.body; // location: JSON string { coordinates: [lon, lat], address }
    const parsedLocation = JSON.parse(location);
    const issue = new issueModel({
      title,
      description,
      photoUrl: req.body.photoUrl || [],
      audioUrl: req.body.audioUrl,
      location: {
        type: "Point",
        coordinates: parsedLocation.coordinates,
        address: parsedLocation.address,
      },
      reportedBy: req.user.id,
      category,
    });
    await issue.save();

    const user = await userModel.findById(req.user.id);
    user.issues.push(issue._id);
    await user.save();

    // Send confirmation notification
    const notif = new notificationModel({
      user: req.user.id,
      issue: issue._id,
      message: "Your report has been submitted and is under review.",
    });
    await notif.save();
    user.notifications.push(notif._id);
    await user.save();

    res.status(201).json(issue);
  } catch (err) {
    res.status(500).json({ err });
  }
};

// Track issues
export const trackIssues = async (req, res) => {
  try {
    const issues = await issueModel.find({ reportedBy: req.user.id }).populate("history");
    res.json(issues);
  } catch (err) {
    res.status(500).json({ err });
  }
};

// Get notifications
export const getNotifications = async (req, res) => {
  try {
    const notifs = await notificationModel.find({ user: req.user.id }).sort({ timestamp: -1 });
    res.json(notifs);
  } catch (err) {
    res.status(500).json({ err });
  }
};
