import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// ----------------- MongoDB -----------------
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error(err));

// ----------------- Schema -----------------
const imageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  data: { type: Buffer, required: true },
  contentType: { type: String, required: true },
}, { timestamps: true });

const Image = mongoose.model("Image", imageSchema);

// ----------------- Multer -----------------
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ----------------- Routes -----------------

// Upload
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Image name is required" });

    const img = new Image({
      name,
      data: req.file.buffer,
      contentType: req.file.mimetype
    });

    await img.save();
    res.status(201).json({ message: "Image uploaded successfully", id: img._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all images (metadata only)
app.get("/images", async (req, res) => {
  try {
    const images = await Image.find().sort({ createdAt: -1 });
    res.json(images.map(img => ({
      _id: img._id,
      name: img.name,
      contentType: img.contentType,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// View (direct link)
app.get("/images/:id/view", async (req, res) => {
  try {
    const img = await Image.findById(req.params.id);
    if (!img) return res.status(404).json({ error: "Image not found" });
    res.contentType(img.contentType);
    res.send(img.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update name
app.put("/images/:id", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    const img = await Image.findByIdAndUpdate(req.params.id, { name }, { new: true });
    if (!img) return res.status(404).json({ error: "Image not found" });

    res.json(img);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete
app.delete("/images/:id", async (req, res) => {
  try {
    const img = await Image.findByIdAndDelete(req.params.id);
    if (!img) return res.status(404).json({ error: "Image not found" });
    res.json({ message: "Image deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ----------------- Start Server -----------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
