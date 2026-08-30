const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  icon: {
    type: String,
    default: "🏆",
  },
  text: {
    type: String,
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Achievement', achievementSchema);
