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

// Admin credentials
const ADMIN_USERNAME = "somaadmin";
const ADMIN_PASSWORD = "soma2024";

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

// Admin login endpoint
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Generate a simple token
    const token = "admin-" + Date.now();
    res.json({ token });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
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

app.delete("/api/reviews/:id", async (req, res) => {
  try {
    const reviewId = req.params.id;
    const deletedReview = await Review.findByIdAndDelete(reviewId);

    if (!deletedReview) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ message: "Error deleting review" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
