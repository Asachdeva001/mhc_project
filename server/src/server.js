import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import moodRoutes from "./routes/moodRoutes.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" })); // large base64 frames

mongoose.connect("mongodb://127.0.0.1:27017/moodDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.once("open", () => console.log("Connected to MongoDB"));

// Use the mood route
app.use("/api/mood", moodRoutes);

const PORT = 3000;
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
