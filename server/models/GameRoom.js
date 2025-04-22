import mongoose from 'mongoose';

const gameRoomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  maxPlayers: { type: Number, required: true },
  players: [{
    userId: String,
    username: String,
    score: { type: Number, default: 0 },
    bingos: { type: Number, default: 0 },
    bingoCard: Object,
  }],
  status: { type: String, enum: ['Waiting', 'In Progress', 'Finished'], default: 'Waiting' },
  calledNumbers: [{ type: Number }],
  latestNumber: { letter: String, number: Number },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('GameRoom', gameRoomSchema);