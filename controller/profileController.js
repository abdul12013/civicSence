// controllers/userController.js
import User from "../models/User.js";

// Update Profile
export const updateProfile = async (req, res) => {
  const { address, phone } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    user.profile = { address, phone };
    await user.save();

    res.json(user);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
