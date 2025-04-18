import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  type BaseError,
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt
} from 'wagmi';

import { ConnectMenu } from '../components/ConnectMenu';
// @ts-ignore
import { CONTRACT_ADDRESS, BingoABI } from '../utils/contractdata';

const Lobby = () => {
  const { address } = useAccount();
  const navigate = useNavigate();

  const { data: hash, error, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
  useWaitForTransactionReceipt({
    hash,
  });

  const { data: rooms = [] } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: BingoABI,
    functionName: 'getAllRooms',
  });

  const [roomCode, setRoomCode] = useState('');
  const [activeTab, setActiveTab] = useState('join'); // 'join' or 'create'
  const [activeSection, setActiveSection] = useState('actions'); // 'actions' or 'rooms' for mobile toggle

  const handleCreateRoom = async (e: any) => {
    e.preventDefault();
    try {
      const roomName = e.target.roomName.value;
      const roomSize = e.target.roomSize.value;
      console.log(roomName, roomSize);
     
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: BingoABI,
        functionName: 'createRoom',
        args: [roomName, roomName, roomSize, 0],
      });
    } catch (error) {
      console.error('Failed to create game:', error);
    }
  };


  const handleJoinRoom = (e: any) => {
    e.preventDefault();
    navigate('/game/' + roomCode);
  };

  const handleQuickJoin = () => {
    navigate('/game/test');
  };

  return (
    <div className="flex flex-col min-h-screen bg-indigo-50 text-gray-800">
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
          <div className="mb-4">
            <ConnectMenu />
          </div>

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
                Quick Join
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
                  <option value="1">1 Players</option>
                  <option value="10">10 Players</option>
                  <option value="20">20 Players</option>
                  <option value="30">30 Players</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={!address}
                className="w-full py-2 px-4 bg-indigo-600 text-white font-medium rounded hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
              >
                Create Room
              </button>
              {isConfirming && <div>Waiting for confirmation...</div>}
              {isConfirmed && <div>Transaction confirmed.</div>}
              {error && (
                <div>Error: {(error as BaseError).shortMessage || error.message}</div>
              )}
            </form>
          )}
        </div>

        <div 
          className={`w-full md:w-2/3 bg-white rounded-lg shadow p-3 ${
            activeSection === 'rooms' || window.innerWidth >= 768 ? 'block' : 'hidden'
          }`}
        >
          <h2 className="text-lg font-medium mb-3">Available Rooms</h2>
          
          <div className="md:hidden space-y-3">
            {rooms.map((room: string, index: number) => (
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
            ))}
          </div>

          <div className="hidden md:block overflow-x-auto">
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
                {rooms.map((room: string, index: number) => (
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
                          setActiveTab('join');
                        }}
                        disabled={!address}
                        className="text-sm px-3 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 disabled:bg-gray-100 disabled:text-gray-400"
                      >
                        Join
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Lobby;