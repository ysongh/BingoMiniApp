import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  type BaseError,
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt
} from 'wagmi';

// @ts-ignore
import { CONTRACT_ADDRESS, BingoABI } from '../utils/contractdata';

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

interface ChatMessageType {
  id: number;
  user: string;
  message: string;
  timestamp: string;
}

const BingoGame: React.FC = () => {
  const { gameid } = useParams();
  const { address } = useAccount();

  // Game state
  const [calledNumbers, setCalledNumbers] = useState<number[]>([]);
  const [latestNumber, setLatestNumber] = useState<LatestNumberType>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [bingoCard, setBingoCard] = useState<BingoCardType>(null);
  const [selectedCells, setSelectedCells] = useState<SelectedCellsType>({});
  const [players] = useState<PlayerType[]>([
    { id: 1, name: "JohnDoe", score: 0, bingos: 0 },
    { id: 2, name: "BingoQueen", score: 120, bingos: 1 },
    { id: 3, name: "LuckyPlayer", score: 80, bingos: 0 },
    { id: 4, name: "GameMaster", score: 50, bingos: 0 },
  ]);
  const [chat, setChat] = useState<ChatMessageType[]>([
    { id: 1, user: "BingoQueen", message: "Good luck everyone!", timestamp: "12:01" },
    { id: 2, user: "GameMaster", message: "I need just one more number!", timestamp: "12:02" },
    { id: 3, user: "System", message: "Game will start in 30 seconds", timestamp: "12:03" },
  ]);
  const [chatInput, setChatInput] = useState<string>('');

  const { data: roomdata } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: BingoABI,
    functionName: 'rooms',
    args: [gameid]
  });

  const { data: isJoined } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: BingoABI,
    functionName: 'playerCards',
    args: [address, gameid]
  });


  const { data: playerCard } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: BingoABI,
    functionName: 'getPlayerCard',
    args: [gameid],
    account: address
  });

  const { data: joinHash, error: joinError, writeContract: joinRoomContract } = useWriteContract();
  const { isLoading: joinLoading, isSuccess: joinSuccess } = 
    useWaitForTransactionReceipt({
      hash: joinHash,
    });

  const { data: startGameHash, error: startGameError, writeContract: startGameContract } = useWriteContract();
  const { isLoading: startGameLoading, isSuccess: startGameSuccess } = 
    useWaitForTransactionReceipt({
      hash: startGameHash,
    });

  const { data: callNumberHash, error: callNumberError, writeContract: callNumberContract } = useWriteContract();
  const { isLoading: callNumberLoading, isSuccess: callNumberSuccess } = 
    useWaitForTransactionReceipt({
      hash: callNumberHash,
    });

  console.log(roomdata, isJoined, playerCard);

  const handleJoinGame = (): void => {
    try {
      joinRoomContract({
        address: CONTRACT_ADDRESS,
        abi: BingoABI,
        functionName: 'joinRoom',
        args: [gameid],
      });
    } catch (error) {
      console.error('Failed to join the game:', error);
    }
  };

  const handleStartGame = (): void => {
    try {
      startGameContract({
        address: CONTRACT_ADDRESS,
        abi: BingoABI,
        functionName: 'startGame',
        args: [gameid],
      });
    } catch (error) {
      console.error('Failed to start the game:', error);
    }
  };

  const handlecallNumber = (): void => {
    try {
      callNumberContract({
        address: CONTRACT_ADDRESS,
        abi: BingoABI,
        functionName: 'callNumber',
        args: [gameid],
      });
    } catch (error) {
      console.error('Failed to call the number:', error);
    }
  };


  // Get array of unique random numbers within a range
  const getRandomNumbers = (min: number, max: number, count: number): number[] => {
    const numbers: number[] = [];
    while (numbers.length < count) {
      const num = Math.floor(Math.random() * (max - min + 1)) + min;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    return numbers;
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

  // Call bingo button handler
  const handleCallBingo = (): void => {
    alert("BINGO! Verifying your card...");
    // In a real implementation, this would trigger validation of the player's card
  };

  // Render bingo card cell
  const renderCell = (letter: string, index: number): JSX.Element => {
    if (!playerCard) return <div>Loading...</div>;

    const letterToNumber = {
      "B": 0,
      "I": 1,
      "N": 2,
      "G": 3,
      "O": 4,
    };
    
    const value = playerCard[letterToNumber[letter as keyof BingoCardType]][index];
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

  if (!isJoined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-indigo-50">
        <div>
          <button 
            onClick={handleJoinGame}
            className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full text-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            Join Game
          </button>
          {joinLoading && <div>Waiting for confirmation...</div>}
          {joinSuccess && <div>Transaction confirmed.</div>}
          {joinError && (
            <div>Error: {(joinError as BaseError).shortMessage || joinError.message}</div>
          )}
        </div>
      </div>
    );
  }

  if (!playerCard) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-indigo-50">
        <div className="text-xl">Loading bingo card...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-indigo-50">
      {/* Main game area */}
      <main className="flex flex-col lg:flex-row flex-1 p-3 gap-3">
        {/* Left side - Bingo card and game controls */}
        <div className="w-full lg:w-2/3 flex flex-col gap-3">
          {/* Latest called number display */}
          <div className="bg-white rounded-lg shadow p-3 flex flex-col items-center">
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
              roomdata[4] === false ? (
                <div className="py-2">
                  <p className="text-gray-500">
                    Waiting for game to start...
                  </p>
                  <button 
                    onClick={handleStartGame}
                    className="mt-2 px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full text-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    Start Game
                  </button>
                  {startGameLoading && <div>Waiting for confirmation...</div>}
                  {startGameSuccess && <div>Transaction confirmed.</div>}
                  {startGameError && (
                    <div>Error: {(startGameError as BaseError).shortMessage || startGameError.message}</div>
                  )}
                </div>
              ) : (
                <div className="py-2 text-gray-500">
                  <p className="text-gray-500">
                    First number coming up...
                  </p>
                  <button 
                    onClick={handlecallNumber}
                    className="mt-2 px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full text-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    Call Number
                  </button>
                  {callNumberLoading && <div>Waiting for confirmation...</div>}
                  {callNumberSuccess && <div>Transaction confirmed.</div>}
                  {callNumberError && (
                    <div>Error: {(callNumberError as BaseError).shortMessage || callNumberError.message}</div>
                  )}
                </div>
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
            <h2 className="text-sm font-medium text-gray-500 mb-2">Players</h2>
            <div className="space-y-2">
              {players.map(player => (
                <div key={player.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div className="font-medium">{player.name}</div>
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

export default BingoGame;