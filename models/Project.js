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
    type: [String],
    default: [],
  },
  image: {
    type: String,
    default: "",
  },
  images: {
    type: [String],
    default: [],
  },
  link: {
    type: String,
    default: "",
  }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
