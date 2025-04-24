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

    // Check if the user is already in the room
    const existingPlayer = gameRoom.players.find((player) => player.username === username);
    if (existingPlayer) {
      // User is already in the room; return success without adding them again
      return res.json({ message: 'Joined room successfully', roomId });
    }

    // Add new player
    const bingoCard = generateBingoCard();
    gameRoom.players.push({ userId: username, username, bingoCard });
    await gameRoom.save();
    res.json({ message: 'Joined room successfully', roomId });
  } catch (err) {
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

// Get all rooms (regardless of status)
router.get('/all-rooms', async (req, res) => {
  try {
    const rooms = await GameRoom.find().select('roomId name players maxPlayers status');
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch all rooms' });
  }
});

// Get game state for a specific room
router.get('/room/:roomId', async (req, res) => {
  const { roomId } = req.params;
  try {
    const gameRoom = await GameRoom.findOne({ roomId });
    if (!gameRoom) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json(gameRoom);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch game state' });
  }
});

// Start the game
router.post('/room/:roomId/start', async (req, res) => {
  const { roomId } = req.params;
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    const gameRoom = await GameRoom.findOne({ roomId });
    if (!gameRoom) {
      return res.status(404).json({ error: 'Room not found' });
    }
    if (gameRoom.status !== 'Waiting') {
      return res.status(400).json({ error: 'Game is already started or finished' });
    }
    if (gameRoom.players[0].username !== username) {
      return res.status(403).json({ error: 'Only the room creator can start the game' });
    }

    gameRoom.status = 'In Progress';
    await gameRoom.save();

    res.json({ message: 'Game started successfully', status: gameRoom.status });
  } catch (err) {
    res.status(500).json({ error: 'Failed to start game' });
  }
});

// Call a random number
router.post('/room/:roomId/call', async (req, res) => {
  const { roomId } = req.params;
  const { username } = req.body;

  // Validate input
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    const gameRoom = await GameRoom.findOne({ roomId });
    if (!gameRoom) {
      return res.status(404).json({ error: 'Room not found' });
    }
    if (gameRoom.status !== 'In Progress') {
      return res.status(400).json({ error: 'Game is not in progress' });
    }
    if (gameRoom.players[0].username !== username) {
      return res.status(403).json({ error: 'Only the room creator can call numbers' });
    }

    // Generate a random number from remaining uncalled numbers
    const allNumbers = Array.from({ length: 75 }, (_, i) => i + 1);
    const uncalledNumbers = allNumbers.filter((num) => !gameRoom.calledNumbers.includes(num));
    if (uncalledNumbers.length === 0) {
      return res.status(400).json({ error: 'No numbers left to call' });
    }

    const randomIndex = Math.floor(Math.random() * uncalledNumbers.length);
    const number = uncalledNumbers[randomIndex];
    const letter = getLetterForNumber(number);

    // Update calledNumbers and latestNumber
    gameRoom.calledNumbers.push(number);
    gameRoom.latestNumber = { letter, number };

    await gameRoom.save();

    res.json({
      message: 'Number called successfully',
      calledNumbers: gameRoom.calledNumbers,
      latestNumber: gameRoom.latestNumber,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to call number' });
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

// Helper function to get the letter for a number
const getLetterForNumber = (number) => {
  if (number <= 15) return 'B';
  if (number <= 30) return 'I';
  if (number <= 45) return 'N';
  if (number <= 60) return 'G';
  return 'O';
};

export default router;