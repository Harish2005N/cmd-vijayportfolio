const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  platform: {
    type: String,
    default: "",
  },
  date: {
    type: String,
    default: "2024",
  },
  link: {
    type: String,
    default: "",
  },
  certificate_url: {
    type: String,
    default: "",
  },
  image: {
    type: String,
    default: "",
  },
  images: {
    type: [String],
    default: [],
  }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
