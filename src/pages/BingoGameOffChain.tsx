import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAccount } from 'wagmi';

// @ts-ignore
import { SERVER_URL } from '../utils/config.js';

// Define types
type GameStateType = 'Waiting' | 'playing' | 'finished';

type LatestNumberType = {
  letter: string;
  number: number;
} | null;

type BingoCardType = {
  B: (number | string)[];
  I: (number | string)[];
  N: (number | string)[];
  G: (number | string)[];
  O: (number | string)[];
} | null;

interface SelectedCellsType {
  [key: string]: boolean;
}

interface PlayerType {
  id: number;
  name: string;
  score: number;
  bingos: number;
}

interface ApiError {
  error: string;
}

interface StartGameResponse {
  message: string;
  status: 'Waiting' | 'In Progress' | 'Finished';
}

interface ChatMessageType {
  id: number;
  user: string;
  message: string;
  timestamp: string;
}

interface CallNumberResponse {
  message: string;
  calledNumbers: number[];
  latestNumber: { letter: string; number: number };
}

interface BingoCard {
  B: (number | string)[];
  I: (number | string)[];
  N: (number | string)[];
  G: (number | string)[];
  O: (number | string)[];
}

interface Player {
  userId: string;
  username: string;
  score: number;
  bingos: number;
  bingoCard: BingoCard;
}

interface GameRoom {
  _id?: string;
  roomId: string;
  name: string;
  maxPlayers: number;
  players: Player[];
  status: 'Waiting' | 'In Progress' | 'Finished';
  calledNumbers: number[];
  latestNumber?: { letter: string; number: number };
  winner?: string;
  createdAt?: string;
}

interface CheckBingoResponse {
  message: string;
  hasBingo: boolean;
  winner?: string;
  status?: 'Waiting' | 'In Progress' | 'Finished';
}

const BingoGameOffChain: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { address } = useAccount();

  // Game state
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'finished'>('waiting');
  const [calledNumbers, setCalledNumbers] = useState<number[]>([]);
  const [latestNumber, setLatestNumber] = useState<LatestNumberType>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [bingoCard, setBingoCard] = useState<BingoCardType>(null);
  const [selectedCells, setSelectedCells] = useState<SelectedCellsType>({});
  const [players, setPlayers] = useState<Player[]>([]);
  const [maxPlayers, setMaxPlayers] = useState<number>(0);
  const [isRoomCreator, setIsRoomCreator] = useState<boolean>(false);
  const [chat, setChat] = useState<ChatMessageType[]>([
    { id: 1, user: "BingoQueen", message: "Good luck everyone!", timestamp: "12:01" },
    { id: 2, user: "GameMaster", message: "I need just one more number!", timestamp: "12:02" },
    { id: 3, user: "System", message: "Game will start in 30 seconds", timestamp: "12:03" },
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [winner, setWinner] = useState<string | null>(null);

  useEffect(() => {
    const fetchGameState = async () => {
      try {
        const response = await fetch(`${SERVER_URL}api/game/room/${roomId}`);
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to fetch game state');
        }
        const data: GameRoom = await response.json();
        console.log(data);
        setGameState(data.status === 'In Progress' ? 'playing' : data.status);
        setCalledNumbers(data.calledNumbers);
        setLatestNumber(data.latestNumber || null);
        setPlayers(data.players);
        setMaxPlayers(data.maxPlayers);
        setWinner(data.winner || null);
        const player = data.players.find((p) => p.username === address);
        if (player) {
          setBingoCard(player.bingoCard);
          setSelectedCells({ N2: true }); // Free space
        }
        setIsRoomCreator(data.players[0]?.username === address);
      } catch (err) {
        console.error('Failed to fetch game state:', err);
      }
    };

    fetchGameState();
  }, [roomId])

  const handleStartGame = async () => {
    try {
      const response = await fetch(`${SERVER_URL}api/game/room/${roomId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: address }),
      });
      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.error || 'Failed to start game');
      }
      const data: StartGameResponse = await response.json();
      setGameState(data.status === 'In Progress' ? 'playing' : data.status);
      alert(data.message);
    } catch (err) {
      console.error('Failed to start game:', err);
    }
  };

  const handleCallNumber = async () => {
    try {
      const response = await fetch(`${SERVER_URL}api/game/room/${roomId}/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: address }),
      });
      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.error || 'Failed to call number');
      }
      const data: CallNumberResponse = await response.json();
      setCalledNumbers(data.calledNumbers);
      setLatestNumber(data.latestNumber);
      setCountdown(15); // Reset countdown (adjust as needed)
    } catch (err) {
      console.error('Failed to call number:', err);
    }
  };
    
  // Get the corresponding BINGO letter for a number
  const getLetterForNumber = (number: number): string => {
    if (number <= 15) return 'B';
    if (number <= 30) return 'I';
    if (number <= 45) return 'N';
    if (number <= 60) return 'G';
    return 'O';
  };

  // Handle clicking on a bingo card cell
  const handleCellClick = (letter: string, index: number): void => {
    if (!bingoCard) return;
    
    const cellKey = `${letter}${index}`;
    const value = bingoCard[letter as keyof BingoCardType][index];
    
    // Can't select the free space again or non-called numbers
    if (value === "FREE") return;
    if (typeof value === 'number' && !calledNumbers.includes(value)) return;
    
    setSelectedCells(prev => ({
      ...prev,
      [cellKey]: !prev[cellKey]
    }));
    
    // Check for bingo after selection
    checkForBingo();
  };

  // Simple bingo check (would be more complex in real implementation)
  const checkForBingo = (): void => {
    // This is just a placeholder - real implementation would check rows, columns, diagonals
    const selectedCount = Object.values(selectedCells).filter(Boolean).length;
    if (selectedCount >= 5) {
      // For demo purposes, just check if enough cells are selected
      // In a real game you'd verify they form a valid bingo line
    }
  };

  // Handle sending a chat message
  const handleSendChat = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const newMessage: ChatMessageType = {
      id: chat.length + 1,
      user: "You",
      message: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setChat(prev => [...prev, newMessage]);
    setChatInput('');
  };

  const handleCallBingo = async () => {
    try {
      const response = await fetch(`${SERVER_URL}api/game/room/${roomId}/check-bingo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: address }),
      });
      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.error || 'Failed to check Bingo');
      }
      const data: CheckBingoResponse = await response.json();
      if (data.hasBingo) {
        setGameState('finished');
        setWinner(data.winner || null);
        alert(`Bingo! ${data.winner} wins!`);
      } else {
        alert('No Bingo. Keep playing!');
      }
    } catch (err) {
      console.error('Failed to check Bingo:', err);
    }
  };

  // Render bingo card cell
  const renderCell = (letter: string, index: number): JSX.Element => {
    if (!bingoCard) return <div>Loading...</div>;
    
    const value = bingoCard[letter as keyof BingoCardType][index];
    const isFree = value === "FREE";
    const isSelected = selectedCells[`${letter}${index}`];
    const isCalled = isFree || (typeof value === 'number' && calledNumbers.includes(value));
    
    return (
      <div 
        key={`${letter}${index}`}
        onClick={() => handleCellClick(letter, index)}
        className={`
          flex items-center justify-center aspect-square
          text-lg font-medium border border-gray-300
          ${isFree ? 'bg-yellow-100 text-yellow-800' : ''}
          ${isSelected ? 'bg-green-500 text-white' : ''}
          ${isCalled && !isSelected && !isFree ? 'bg-indigo-100' : ''}
          ${!isCalled && !isFree ? 'hover:bg-gray-100' : 'cursor-pointer hover:opacity-90'}
          transition-colors duration-200
        `}
      >
        {value}
      </div>
    );
  };

  if (!bingoCard) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-indigo-50">
        <div className="text-xl">Loading bingo card...</div>
      </div>
    );
  }

  console.log(isRoomCreator, gameState )

  return (
    <div className="flex flex-col min-h-screen bg-indigo-50">
      {/* Main game area */}
      <main className="flex flex-col lg:flex-row flex-1 p-3 gap-3">
        {/* Left side - Bingo card and game controls */}
        <div className="w-full lg:w-2/3 flex flex-col gap-3">
          {/* Latest called number display */}
          <div className="bg-white rounded-lg shadow p-3 flex flex-col items-center">
            {/* Start Game Button (only for room creator in waiting state) */}
            {isRoomCreator && gameState === 'Waiting' && (
              <div className="bg-white rounded-lg shadow p-3">
                <h2 className="text-sm font-medium text-gray-500 mb-2">Start Game</h2>
                <button
                  onClick={handleStartGame}
                  className="w-full py-2 px-4 bg-green-600 text-white font-medium rounded hover:bg-green-700"
                >
                  Start Game
                </button>
              </div>
            )}
            {gameState === 'playing' && (
              <div className="bg-white rounded-lg shadow p-3">
                <h2 className="text-sm font-medium text-gray-500 mb-2">Call a Number</h2>
                <button
                  onClick={handleCallNumber}
                  className="w-full py-2 px-4 bg-indigo-600 text-white font-medium rounded hover:bg-indigo-700"
                >
                  Call Random Number
                </button>
              </div>
            )}
            {gameState === 'finished' && `Game Over! ${winner ? `Winner: ${winner}` : ''}`}
            {latestNumber ? (
              <>
                <div className="text-sm uppercase font-medium text-gray-500">Latest Number</div>
                <div className="flex items-center gap-2">
                  <div className="bg-indigo-600 text-white text-2xl font-bold w-12 h-12 rounded-full flex items-center justify-center">
                    {latestNumber.letter}
                  </div>
                  <div className="text-4xl font-bold">{latestNumber.number}</div>
                </div>
                {countdown !== null && (
                  <div className="mt-1 text-sm">Next number in: {countdown}s</div>
                )}
              </>
            ) : (
              gameState === 'waiting' ? (
                <div className="py-2 text-gray-500">Waiting for game to start...</div>
              ) : (
                <div className="py-2 text-gray-500">First number coming up...</div>
              )
            )}
          </div>

          {/* Bingo card */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="grid grid-cols-5 gap-1 mb-3">
              {['B', 'I', 'N', 'G', 'O'].map(letter => (
                <div key={letter} className="flex items-center justify-center bg-indigo-600 text-white font-bold text-xl py-2">
                  {letter}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-5 gap-1">
              {['B', 'I', 'N', 'G', 'O'].map(letter => (
                Array(5).fill(0).map((_, index) => renderCell(letter, index))
              ))}
            </div>
            
            <div className="mt-4 flex justify-center">
              <button 
                onClick={handleCallBingo}
                className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full text-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                BINGO!
              </button>
            </div>
          </div>
          
          {/* Called numbers history */}
          <div className="bg-white rounded-lg shadow p-3">
            <h2 className="text-sm font-medium text-gray-500 mb-2">Called Numbers</h2>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1">
              {calledNumbers.map(num => {
                const letter = getLetterForNumber(num);
                return (
                  <div key={num} className="bg-gray-100 rounded p-1 text-center text-sm flex items-center justify-center">
                    <span className="font-bold text-xs text-indigo-600 mr-1">{letter}</span>
                    {num}
                  </div>
                );
              })}
              {calledNumbers.length === 0 && (
                <div className="col-span-5 sm:col-span-10 text-gray-400 text-sm py-1">No numbers called yet</div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right side - Players and chat */}
        <div className="w-full lg:w-1/3 flex flex-col gap-3">
          {/* Players list */}
          <div className="bg-white rounded-lg shadow p-3">
            <h2 className="text-sm font-medium text-gray-500 mb-2">Players {players.length} / {maxPlayers}</h2>
            <div className="space-y-2">
              {players.map(player => (
                <div key={player.userId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div className="font-medium">{player.username}</div>
                  <div className="text-sm">
                    <span className="text-indigo-600 font-medium">{player.score}</span> pts
                    {player.bingos > 0 && (
                      <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs">
                        {player.bingos} bingo
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Chat */}
          <div className="bg-white rounded-lg shadow p-3 flex flex-col flex-grow">
            <h2 className="text-sm font-medium text-gray-500 mb-2">Chat</h2>
            <div className="flex-grow overflow-y-auto mb-2 space-y-2 max-h-64">
              {chat.map(msg => (
                <div key={msg.id} className={`p-2 rounded ${msg.user === 'System' ? 'bg-gray-100 text-gray-600' : 'bg-indigo-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`font-medium ${msg.user === 'System' ? 'text-gray-500' : 'text-indigo-600'}`}>
                      {msg.user}
                    </span>
                    <span className="text-xs text-gray-400">{msg.timestamp}</span>
                  </div>
                  <p className="text-sm">{msg.message}</p>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendChat} className="flex">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-grow p-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 rounded-r"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BingoGameOffChain;