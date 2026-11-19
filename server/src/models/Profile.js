const mongoose = require('mongoose');

const entry = {
  from: { type: Date, required: true },
  to: Date,
  current: { type: Boolean, default: false },
  description: String,
};

const profileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  status: { type: String, required: true },
  company: String,
  website: String,
  location: String,
  skills: { type: [String], required: true },
  bio: String,
  githubUsername: String,
  experience: [{ title: { type: String, required: true }, company: { type: String, required: true }, location: String, ...entry }],
  education: [{ school: { type: String, required: true }, degree: { type: String, required: true }, fieldOfStudy: String, ...entry }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Profile', profileSchema);
