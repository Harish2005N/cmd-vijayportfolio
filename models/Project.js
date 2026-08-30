const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    default: "2024"
  },
  technologies: {
    type: [String], // Array of strings like "React", "Node.js"
    default: [],
  },
  number: {
    type: String,
    default: "01",
  },
  image: {
    type: String, // Primary image path
    default: "",
  },
  images: {
    type: [String], // Array of uploaded image paths
    default: [],
  },
  link: {
    type: String, // Project URL or GitHub link
    default: "",
  }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
