import express from 'express';
import GameRoom from '../models/GameRoom.js';
import PlayerStats from '../models/PlayerStats.js';

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

    // Initialize player stats if not exists
    await PlayerStats.findOneAndUpdate(
      { username },
      { $setOnInsert: { username, totalScore: 0, totalBingos: 0, gamesPlayed: 1 } },
      { upsert: true }
    );
    
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
    if (gameRoom.status === 'Finished') {
      return res.status(400).json({ error: 'Game already or finished' });
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

    // Increment gamesPlayed for the player
    await PlayerStats.findOneAndUpdate(
      { username },
      { $setOnInsert: { username, totalScore: 0, totalBingos: 0, gamesPlayed: 0 }, $inc: { gamesPlayed: 1 } },
      { upsert: true }
    );

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

// Get all in progress rooms
router.get('/in-progress-rooms', async (req, res) => {
  try {
    const rooms = await GameRoom.find({ status: 'In Progress' }).select('roomId name players maxPlayers status');
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

    // Check cooldown (5 seconds)
    const COOLDOWN_MS = 5 * 1000; // 5 seconds in milliseconds
    const now = new Date();
    if (gameRoom.lastCallTimestamp) {
      const timeElapsed = now - gameRoom.lastCallTimestamp;
      if (timeElapsed < COOLDOWN_MS) {
        const remainingSeconds = Math.ceil((COOLDOWN_MS - timeElapsed) / 1000);
        return res.status(429).json({
          error: `Please wait ${remainingSeconds} seconds before calling another number`,
          remainingSeconds,
        });
      }
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

    // Update timestamp
    gameRoom.lastCallTimestamp = now;

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

// Check for Bingo
router.post('/room/:roomId/check-bingo', async (req, res) => {
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
    if (gameRoom.status !== 'In Progress') {
      return res.status(400).json({ error: 'Game is not in progress' });
    }

    const player = gameRoom.players.find((p) => p.username === username);
    if (!player) {
      return res.status(400).json({ error: 'Player not found in room' });
    }

    // Check for Bingo
    const hasBingo = checkBingo(player.bingoCard, gameRoom.calledNumbers);
    if (hasBingo) {
      // Update game state
      gameRoom.status = 'Finished';
      gameRoom.winner = username;
      player.bingos += 1;
      player.score += 100; // Optional: Award points for Bingo

      // Update PlayerStats
      await PlayerStats.findOneAndUpdate(
        { username },
        {
          $inc: { totalScore: 100, totalBingos: 1 },
          $setOnInsert: { username, gamesPlayed: 0 },
        },
        { upsert: true }
      );

      await gameRoom.save();

      return res.json({
        message: 'Bingo confirmed!',
        hasBingo: true,
        winner: username,
        status: gameRoom.status,
      });
    }

    return res.json({
      message: 'No Bingo found',
      hasBingo: false,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to check Bingo' });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await PlayerStats.find()
      .select('username totalScore totalBingos gamesPlayed')
      .sort({ totalScore: -1 })
      .limit(10); // Top 10 players
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
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

// Helper function to check for Bingo
const checkBingo = (bingoCard, calledNumbers) => {
  // Convert calledNumbers to a Set for O(1) lookup
  const calledSet = new Set(calledNumbers);

  // Check rows
  for (let i = 0; i < 5; i++) {
    if (
      ['B', 'I', 'N', 'G', 'O'].every((letter) => {
        const value = bingoCard[letter][i];
        return value === 'FREE' || calledSet.has(value);
      })
    ) {
      return true;
    }
  }

  // Check columns
  for (const letter of ['B', 'I', 'N', 'G', 'O']) {
    if (
      bingoCard[letter].every((value, index) => {
        return value === 'FREE' || calledSet.has(value);
      })
    ) {
      return true;
    }
  }

  // Check diagonals
  // Top-left to bottom-right: B0, I1, N2, G3, O4
  if (
    [0, 1, 2, 3, 4].every((i) => {
      const letter = ['B', 'I', 'N', 'G', 'O'][i];
      const value = bingoCard[letter][i];
      return value === 'FREE' || calledSet.has(value);
    })
  ) {
    return true;
  }

  // Top-right to bottom-left: B4, I3, N2, G1, O0
  if (
    [0, 1, 2, 3, 4].every((i) => {
      const letter = ['B', 'I', 'N', 'G', 'O'][4 - i];
      const value = bingoCard[letter][i];
      return value === 'FREE' || calledSet.has(value);
    })
  ) {
    return true;
  }

  return false;
};

export default router;