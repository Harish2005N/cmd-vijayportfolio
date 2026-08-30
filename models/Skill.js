const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: '⚙️',
  },
  items: {
    type: [String],
    default: [],
  }
}, { timestamps: true });

module.exports = mongoose.model('Skill', skillSchema);
