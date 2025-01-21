require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Atlas Connection
const MONGODB_URI = process.env.MONGODB_URI;
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Review Schema
const reviewSchema = new mongoose.Schema({
  name: String,
  rating: Number,
  review: String,
  date: { type: Date, default: Date.now },
  adminResponse: String,
});

const Review = mongoose.model("Review", reviewSchema);

// Routes
app.get("/api/reviews", async (req, res) => {
  const reviews = await Review.find().sort("-date");
  res.json(reviews);
});

app.post("/api/reviews", async (req, res) => {
  const review = new Review(req.body);
  await review.save();
  res.json(review);
});

app.put("/api/reviews/:id", async (req, res) => {
  const { id } = req.params;
  const { review } = req.body;
  const updatedReview = await Review.findByIdAndUpdate(
    id,
    { review },
    { new: true }
  );
  res.json(updatedReview);
});

app.post("/api/reviews/:id/respond", async (req, res) => {
  const { id } = req.params;
  const { adminResponse } = req.body;

  const review = await Review.findByIdAndUpdate(
    id,
    { adminResponse },
    { new: true }
  );

  res.json(review);
});

const adminRouter = express.Router();

adminRouter.post("/login", (req, res) => {
  const { username, password } = req.body;
  // Add proper authentication here
  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false });
  }
});

app.use("/admin", adminRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
