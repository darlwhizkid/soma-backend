require('dotenv').config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Create Review Schema
const reviewSchema = new mongoose.Schema({
  name: String,
  rating: Number,
  review: String,
  date: { type: Date, default: Date.now },
});

const Review = mongoose.model("Review", reviewSchema);

// Routes
app.get("/api/reviews", async (req, res) => {
  const reviews = await Review.find().sort({ date: -1 });
  res.json(reviews);
});

app.post("/api/reviews", async (req, res) => {
  const review = new Review(req.body);
  await review.save();
  res.status(201).json(review);
});
console.log("MONGODB _URI", process.env.MONGODB_URI);
// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
