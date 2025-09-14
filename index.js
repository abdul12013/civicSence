import express from "express";
import { config } from "dotenv";
import connectDB from "./config/mongoDB.js";
import citizenRoutes from "./routes/citizenRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
// import analyticsRoutes from "./routes/analytics.routes.js";

config();
connectDB();

const app = express();
app.use(express.json());

app.use("/api/citizen", citizenRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/analytics", analyticsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
