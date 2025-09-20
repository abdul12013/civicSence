import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import { generateToken } from "../config/jwt.js";

// Register
export const register = async (req, res) => {
  const { name, email, password, role, department } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ success:false, error:"user already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      department: role === "staff" ? department : undefined,
    });

    await user.save();
    const token = generateToken(user);
    res.json({ success:true, token, user: { id: user._id, role: user.role } });
  } catch (err) {
    res.status(500).json({ success:false, error:err.message });
  }
};

// Login
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success:false,error:'user not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success:false,error:'invalid credentials' });

    const token = generateToken(user);
    res.json({ success:true, token, user: { id: user._id, role: user.role } });
  } catch (err) {
    res.status(500).json({ success:false, error:err.message });
  }
};
