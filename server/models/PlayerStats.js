import mongoose from 'mongoose';

const playerStatsSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  totalScore: { type: Number, default: 0 },
  totalBingos: { type: Number, default: 0 },
  gamesPlayed: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

playerStatsSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('PlayerStats', playerStatsSchema);
