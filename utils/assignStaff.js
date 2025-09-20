// assignStaff.js
import User from "../models/User.js";

// Simple random assignment to staff in department
const assignStaff = async (department) => {
  const staff = await User.find({ role: "staff", department });
  if (staff.length === 0) return null;

  // Pick a random staff from the list
  return staff[Math.floor(Math.random() * staff.length)];
};

export default assignStaff;
