import express from 'express';
import GameRoom from '../models/GameRoom.js';

const router = express.Router();

// Generate a random room ID
const generateRoomId = () => {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
};

// Create a new game room
router.post('/create', async (req, res) => {
  const { username, roomName, maxPlayers } = req.body;
  if (!username || !roomName || !maxPlayers) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const roomId = generateRoomId();
  const bingoCard = generateBingoCard(); // Implement this function (see below)

  const gameRoom = new GameRoom({
    roomId,
    name: roomName,
    maxPlayers,
    players: [{ userId: username, username, bingoCard }],
  });

  try {
    await gameRoom.save();
    res.status(201).json({ roomId, message: 'Room created successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// Join a game room
router.post('/join', async (req, res) => {
  const { username, roomId } = req.body;
  if (!username || !roomId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const gameRoom = await GameRoom.findOne({ roomId });
    if (!gameRoom) {
      return res.status(404).json({ error: 'Room not found' });
    }
    if (gameRoom.status !== 'Waiting') {
      return res.status(400).json({ error: 'Game already in progress or finished' });
    }
    if (gameRoom.players.length >= gameRoom.maxPlayers) {
      return res.status(400).json({ error: 'Room is full' });
    }

    const bingoCard = generateBingoCard();
    gameRoom.players.push({ userId: username, username, bingoCard });
    await gameRoom.save();
    res.json({ message: 'Joined room successfully', roomId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to join room' });
  }
});

// Get all available rooms
router.get('/rooms', async (req, res) => {
  try {
    const rooms = await GameRoom.find({ status: 'Waiting' }).select('roomId name players maxPlayers status');
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// Helper function to generate a bingo card
const generateBingoCard = () => {
  const getRandomNumbers = (min, max, count) => {
    const numbers = [];
    while (numbers.length < count) {
      const num = Math.floor(Math.random() * (max - min + 1)) + min;
      if (!numbers.includes(num)) numbers.push(num);
    }
    return numbers;
  };

  const card = {
    B: getRandomNumbers(1, 15, 5),
    I: getRandomNumbers(16, 30, 5),
    N: getRandomNumbers(31, 45, 5),
    G: getRandomNumbers(46, 60, 5),
    O: getRandomNumbers(61, 75, 5),
  };
  card.N[2] = 'FREE'; // Free space
  return card;
};

export default router;