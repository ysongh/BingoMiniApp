import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import {
//   type BaseError,
//   useAccount,
//   useReadContract,
//   useWriteContract,
//   useWaitForTransactionReceipt
// } from 'wagmi';
import { useAccount } from 'wagmi';

// @ts-ignore
import { CONTRACT_ADDRESS, BingoABI } from '../utils/contractdata';
// @ts-ignore
import { SERVER_URL } from '../utils/config.js';
import { GameRoom } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner.js';
import ErrorAlert from '../components/ErrorAlert.js';

const Lobby = () => {
  const { address } = useAccount();
  const navigate = useNavigate();

  // Fetch available rooms on mount
  useEffect(() => {
    fetchAvailableRooms();
  }, []);

  // const { data: hash, error, writeContract } = useWriteContract();
  // const { isLoading: isConfirming, isSuccess: isConfirmed } = 
  // useWaitForTransactionReceipt({
  //   hash,
  // });

  // const { data: rooms = [] } = useReadContract({
  //   address: CONTRACT_ADDRESS,
  //   abi: BingoABI,
  //   functionName: 'getAllRooms',
  // });

  const [gameRooms, setGameRooms] =useState<GameRoom[]>([]);
  const [roomCode, setRoomCode] = useState('');
  const [gameType, setGameType] = useState('');
  const [filterOption, setFilterOption] = useState('available');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('join'); // 'join' or 'create'
  const [activeSection, setActiveSection] = useState('actions'); // 'actions' or 'rooms' for mobile toggle
  const [errorMessage, setErrorMessage] = useState<string>("");

  // const handleCreateRoomOnChain = async (e: any) => {
  //   e.preventDefault();
  //   try {
  //     const roomName = e.target.roomName.value;
  //     const roomSize = e.target.roomSize.value;
  //     console.log(roomName, roomSize);
     
  //     writeContract({
  //       address: CONTRACT_ADDRESS,
  //       abi: BingoABI,
  //       functionName: 'createRoom',
  //       args: [roomName, roomName, roomSize, 0],
  //     });
  //   } catch (error) {
  //     console.error('Failed to create game:', error);
  //   }
  // };

  const handleCreateRoom = async (e: any) => {
    e.preventDefault();
    try {
      const roomName = e.target.roomName.value;
      const roomSize = e.target.roomSize.value;

      const response = await fetch(SERVER_URL + 'api/game/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: address, roomName, maxPlayers: roomSize }),
      });
      if (!response.ok) {
        throw new Error('Failed to create room');
      }
      const data = await response.json();
      navigate(`/game/offchain/${data.roomId}`);
    } catch (err) {
      console.error('Failed to create room:', err);
      alert('Failed to create room');
    }
  };


  const handleJoinRoom = async (e: any) => {
    e.preventDefault();

    try {
      if (gameType === 'onchain') {
        navigate('/game/' + roomCode);
      }
      else {
        navigate('/game/offchain/' + roomCode);
      }
    } catch (err) {
      console.error('Failed to join room:', err);
      alert('Failed to join room');
    }
  };

  const handleFilterRoom = async (e: any) => {
    setFilterOption(e.target.value);

    if (e.target.value === "all") fetchRooms();
    else if (e.target.value === "available") fetchAvailableRooms();
    else fetchInProgressRooms();
  }

  const fetchRooms = async () => {
    try {
      setErrorMessage("");
      setIsLoading(true);

      const response = await fetch(SERVER_URL + 'api/game/all-rooms');
      if (!response.ok) {
        throw new Error('Failed to fetch rooms');
      }
      const data = await response.json();
      console.log(data);
      setGameRooms(data);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
      setErrorMessage('Error fetching rooms');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInProgressRooms = async () => {
    try {
      setErrorMessage("");
      setIsLoading(true);

      const response = await fetch(SERVER_URL + 'api/game/in-progress-rooms');
      if (!response.ok) {
        throw new Error('Failed to fetch rooms');
      }
      const data = await response.json();
      console.log(data);
      setGameRooms(data);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
      setErrorMessage('Error fetching rooms');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableRooms = async () => {
    try {
      setErrorMessage("");
      setIsLoading(true);

      const response = await fetch(SERVER_URL + 'api/game/rooms');
      if (!response.ok) {
        throw new Error('Failed to fetch rooms');
      }
      const data = await response.json();
      console.log(data);
      setGameRooms(data);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
      setErrorMessage('Error fetching rooms');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickJoin = () => {
    navigate('/game/test');
  };

  return (
    <div className="flex flex-col min-h-screen bg-indigo-50 text-gray-800">
      {errorMessage && <ErrorAlert message={errorMessage} />}
      <div className="flex bg-indigo-100 md:hidden">
        <button
          onClick={() => setActiveSection('actions')}
          className={`py-2 px-4 text-center w-1/2 ${
            activeSection === 'actions'
              ? 'bg-white font-medium text-indigo-600'
              : 'text-gray-600'
          }`}
        >
          Play Game
        </button>
        <button
          onClick={() => setActiveSection('rooms')}
          className={`py-2 px-4 text-center w-1/2 ${
            activeSection === 'rooms'
              ? 'bg-white font-medium text-indigo-600'
              : 'text-gray-600'
          }`}
        >
          Browse Rooms
        </button>
      </div>

      <main className="flex flex-col md:flex-row flex-grow p-3">
        <div 
          className={`w-full md:w-1/3 bg-white rounded-lg shadow p-4 mb-3 md:mb-0 md:mr-3 ${
            activeSection === 'actions' || window.innerWidth >= 768 ? 'block' : 'hidden'
          }`}
        >
          <div className="flex border-b border-gray-200 mb-4">
            <button
              onClick={() => setActiveTab('join')}
              className={`py-2 px-2 text-center w-1/2 text-sm ${
                activeTab === 'join'
                  ? 'border-b-2 border-indigo-500 text-indigo-600 font-medium'
                  : 'text-gray-500'
              }`}
            >
              Join a Room
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`py-2 px-2 text-center w-1/2 text-sm ${
                activeTab === 'create'
                  ? 'border-b-2 border-indigo-500 text-indigo-600 font-medium'
                  : 'text-gray-500'
              }`}
            >
              Create a Room
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'join' ? (
            <form onSubmit={handleJoinRoom}>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Room Code</label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter room code"
                />
              </div>
              <button
                type="submit"
                disabled={!address || !roomCode}
                className="w-full py-2 px-4 bg-indigo-600 text-white font-medium rounded hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
              >
                Join Room
              </button>
              <button
                type="button"
                onClick={handleQuickJoin}
                disabled={!address}
                className="w-full mt-2 py-2 px-4 bg-green-600 text-white font-medium rounded hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed"
              >
                Single Player
              </button>
            </form>
          ) : (
            <form onSubmit={handleCreateRoom}>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Room Name</label>
                <input
                  id="roomName"
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter room name"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Room Size</label>
                <select id="roomSize" className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="2">2 Players</option>
                  <option value="3">3 Players</option>
                  <option value="4">4 Players</option>
                  <option value="5">5 Players</option>
                  <option value="10">10 Players</option>
                  <option value="20">20 Players</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={!address}
                className="w-full py-2 px-4 bg-indigo-600 text-white font-medium rounded hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
              >
                Create Room
              </button>
              {/* {isConfirming && <div>Waiting for confirmation...</div>}
              {isConfirmed && <div>Transaction confirmed.</div>}
              {error && (
                <div>Error: {(error as BaseError).shortMessage || error.message}</div>
              )} */}
            </form>
          )}
        </div>

        <div 
          className={`w-full md:w-2/3 bg-white rounded-lg shadow p-3 ${
            activeSection === 'rooms' || window.innerWidth >= 768 ? 'block' : 'hidden'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
            <h2 className="text-lg font-medium mb-3">Games</h2>

            {/* Search and Filter Options */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <select
                value={filterOption}
                onChange={handleFilterRoom}
                className="p-1 border border-gray-300 rounded text-sm w-full sm:w-auto"
              >
                <option value="all">All Games</option>
                <option value="available">Available Games</option>
                <option value="in progress">In Progress Games</option>
              </select>
            </div>
          </div>

          {isLoading && <LoadingSpinner />}
          
          {!isLoading && <div className="md:hidden space-y-3">
            {/* {rooms.map((room: string, index: number) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{room}</h3>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      room === 'Waiting'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    Waiting
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    0/2 players
                  </div>
                  <button
                    onClick={() => navigate('/game/' + room)}
                    disabled={!address}
                    className="text-sm px-3 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    Join
                  </button>
                </div>
              </div>
            ))} */}
            {gameRooms.map((room) => (
              <div key={room.roomId} className="border rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{room.name}</h3>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      room.status === 'Waiting'
                        ? 'bg-green-100 text-green-800'
                        : room.status === 'Finished'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {room.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    {room.players.length}/{room.maxPlayers}
                  </div>
                  <button
                    onClick={() => navigate('/game/offchain/' + room.roomId)}
                    disabled={!address}
                    className="text-sm px-3 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    Join
                  </button>
                </div>
              </div>
            ))}

            {!gameRooms.length && <p className="text-red-400 text-2xl mt-3">No Bingo game yet. Try to create one.</p>}
          </div>}

          {!isLoading && <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Players</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* {rooms.map((room: string, index: number) => (
                  <tr key={index}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium">{room}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      0/2
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          room === 'Waiting'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        Waiting
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setRoomCode(room);
                          setGameType('onchain');
                          setActiveTab('join');
                        }}
                        disabled={!address}
                        className="text-sm px-3 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 disabled:bg-gray-100 disabled:text-gray-400"
                      >
                        Join
                      </button>
                    </td>
                  </tr>
                ))} */}
                {gameRooms.map((room) => (
                  <tr key={room.roomId}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-medium">{room.name}</div>
                      <div className="text-xs text-gray-500">ID: {room.roomId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {room.players.length}/{room.maxPlayers}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          room.status === 'Waiting'
                            ? 'bg-green-100 text-green-800'
                            : room.status === 'Finished'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {room.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setRoomCode(room.roomId);
                          setGameType('offchain');
                        }}
                        disabled={!address}
                        className="text-sm px-3 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 disabled:bg-gray-100 disabled:text-gray-400"
                      >
                        Join
                      </button>
                    </td>
                  </tr>
                ))}

                {!gameRooms.length && <p className="text-red-400 text-2xl mt-3">No Bingo game yet. Try to create one.</p>}
              </tbody>
            </table>
          </div>}
        </div>
      </main>
    </div>
  );
};

export default Lobby;