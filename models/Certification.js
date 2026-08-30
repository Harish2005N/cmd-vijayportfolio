const mongoose = require('mongoose');

const certificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  issuer: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    default: "2024",
  },
  credential_id: {
    type: String,
    default: "",
  },
  link: {
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

module.exports = mongoose.model('Certification', certificationSchema);
