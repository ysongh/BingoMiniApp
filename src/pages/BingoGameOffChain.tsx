import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { sdk } from '@farcaster/frame-sdk';

import ErrorAlert from '../components/ErrorAlert.js';
import BingoGameHeader from '../components/BingoGameHeader.js';
import PlayerList from '../components/PlayerList.js';

// @ts-ignore
import { SERVER_URL } from '../utils/config.js';
import {
  GameRoom,
  ApiError,
  CallNumberResponse,
  StartGameResponse,
  CheckBingoResponse,
  SelectedCellsType,
  Player
} from '../types';

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

const BingoGameOffChain: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { address } = useAccount();

  // Game state
  const [gameState, setGameState] = useState<'Waiting' | 'playing' | 'Finished'>('Waiting');
  const [name, setName] = useState<string>("");
  const [calledNumbers, setCalledNumbers] = useState<number[]>([]);
  const [latestNumber, setLatestNumber] = useState<LatestNumberType>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [bingoCard, setBingoCard] = useState<BingoCardType>(null);
  const [selectedCells, setSelectedCells] = useState<SelectedCellsType>({});
  const [players, setPlayers] = useState<Player[]>([]);
  const [maxPlayers, setMaxPlayers] = useState<number>(0);
  const [isRoomCreator, setIsRoomCreator] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [winner, setWinner] = useState<string | null>(null);

  useEffect(() => {
    fetchGameState();

    const interval = setInterval(() => {
      fetchGameState();
    }, 5000);

    return () => clearInterval(interval);

  }, [roomId])

  const fetchGameState = async () => {
    try {
      setErrorMessage("");

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
      setName(data.name);
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
      setErrorMessage("Failed to load the game");
    }
  };

  const handleComposeCast = async () => {
    try {
      const result = await sdk.actions.composeCast({
        text: 'Play with me in Bingo Mini App! 🎉',
        embeds: [`https://bingominiapp.netlify.app//#/game/offchain/${roomId}`],
        // Optional: parent cast reference
        // parent: { type: 'cast', hash: '0xabc123...' },
        // Optional: close the app after composing
        // close: true,
      });
  
      if (result) {
        console.log('Cast composed:', result.cast);
      } else {
        console.log('Cast composition was closed or canceled.');
      }
    } catch (error) {
      console.error('Error composing cast:', error);
    }
  };
  

  const handleJoinGame = async (e: any) => {
    e.preventDefault();

    try {
      setErrorMessage("");
      const response = await fetch(SERVER_URL + 'api/game/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: address, roomId: roomId }),
      });
      if (!response.ok) {
        throw new Error('Failed to join room');
      }
      await response.json();
      fetchGameState();
    } catch (err) {
      console.error('Failed to join room:', err);
      setErrorMessage('Failed to join room');
    }
  };

  const handleStartGame = async () => {
    try {
      setErrorMessage("");

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
      setErrorMessage('Failed to start game');
    }
  };

  const handleCallNumber = async () => {
    try {
      setErrorMessage("");

      const response = await fetch(`${SERVER_URL}api/game/room/${roomId}/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: address }),
      });
      if (!response.ok) {
        const error: ApiError = await response.json();
        if (response.status === 429 && error.remainingSeconds) {
          setErrorMessage(`Please wait ${error.remainingSeconds} seconds before calling another number`);
          return;
        }
        throw new Error(error.error || 'Failed to call number');
      }
      const data: CallNumberResponse = await response.json();
      setCalledNumbers(data.calledNumbers);
      setLatestNumber(data.latestNumber);
      setCountdown(5); // Reset countdown (adjust as needed)
    } catch (err) {
      console.error('Failed to call number:', err);
      setErrorMessage('Failed to call number');
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

  const handleCallBingo = async () => {
    try {
      setErrorMessage("");
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
        setGameState('Finished');
        setWinner(data.winner || null);
        alert(`Bingo! ${data.winner} wins!`);
      } else {
        setErrorMessage('No Bingo. Keep playing!');
      }
    } catch (err) {
      console.error('Failed to check Bingo:', err);
      setErrorMessage('Failed to check Bingo');
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
          flex items-center justify-center aspect-square text-black
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
      <div>
        {errorMessage && <ErrorAlert message={errorMessage} />}
        <div className="flex items-center justify-center min-h-screen bg-indigo-50">
          <div>
            <PlayerList maxPlayers={maxPlayers} players={players} />
            <button 
              onClick={handleJoinGame}
              className="px-8 py-3 mt-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full text-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              Join Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (maxPlayers === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-indigo-50">
        <div className="text-xl">Loading bingo card...</div>
      </div>
    );
  }

  console.log(isRoomCreator, gameState )

  return (
    <div className="flex flex-col min-h-screen bg-indigo-50">
      <BingoGameHeader name={name} />
      {errorMessage && <ErrorAlert message={errorMessage} />}

      {/* Main game area */}
      <main className="flex justify-center align-middle p-3 gap-3">
        {/* Status Banner */}
        <div className="w-[600px] flex flex-col gap-3">
          {gameState === 'Finished' &&  <div className="bg-white shadow-md rounded-lg p-2 w-full text-center text-gray-500">Game Over! ${winner ? `Winner: ${winner}` : '' }</div>}
          {gameState === 'Waiting' ? (
            <div className="bg-white shadow-md rounded-lg p-2 w-full text-center text-gray-500">Waiting for game to start...</div>
          ) : (
            <div className="bg-white shadow-md rounded-lg p-2 w-full text-center text-gray-500">First number coming up...</div>
          )}

          <div className='flex gap-3'>
            {/* Caller Panel */}
            {/* Latest called number display */}
            <div className="bg-white shadow-md rounded-lg p-4 w-full max-w-md text-center">
              {/* Start Game Button */}
              {gameState === 'Waiting' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-gray-500">Start Game</h2>
                  <button
                    onClick={handleStartGame}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold px-6 py-3 rounded transition"
                  >
                    Start Game
                  </button>
                </div>
              )}
              {gameState === 'playing' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-gray-500">🎱 Call a Number</h2>
                  <button
                    onClick={handleCallNumber}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold px-6 py-3 rounded transition"
                  >
                    Call
                  </button>
                </div>
              )}
              
              {latestNumber && (
                <div className='mt-8'>
                  <p className="font-semibold text-gray-500 mb-2">LATEST NUMBER</p>

                  <div className="flex items-center justify-center space-x-4">
                    <div className="bg-indigo-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold">
                      {latestNumber.letter}
                    </div>
                    <div className="text-4xl font-extrabold text-gray-900">{latestNumber.number}</div>
                  </div>
                  {countdown !== null && (
                    <div className="mt-1 text-sm">Next number in: {countdown}s</div>
                  )}
                </div>
              )}
            </div>

            <PlayerList maxPlayers={maxPlayers} players={players} />
          </div>

          <button
            onClick={handleComposeCast}
            className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded shadow"
          >
            Share on Warpcast 🚀
          </button>

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
      </main>
    </div>
  );
};

export default BingoGameOffChain;