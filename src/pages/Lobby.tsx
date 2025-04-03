import React, { useState } from 'react';

const Lobby = () => {
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [activeTab, setActiveTab] = useState('join'); // 'join' or 'create'
  const [activeSection, setActiveSection] = useState('actions'); // 'actions' or 'rooms' for mobile toggle
  const [gameRooms, setGameRooms] = useState([
    { id: 'ABC123', name: 'Friendly Bingo', players: 12, maxPlayers: 30, status: 'In Progress' },
    { id: 'XYZ789', name: 'Tournament Room', players: 8, maxPlayers: 20, status: 'Waiting' },
    { id: 'DEF456', name: 'Casual Players', players: 5, maxPlayers: 15, status: 'Waiting' },
  ]);

  const handleCreateRoom = (e) => {
    e.preventDefault();
    alert(`Room created with name: ${username}`);
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    alert(`Joining room: ${roomCode} as ${username}`);
  };

  const handleQuickJoin = () => {
    const availableRoom = gameRooms.find(room => room.status === 'Waiting');
    if (availableRoom && username) {
      alert(`Quick joining room: ${availableRoom.id} as ${username}`);
    } else if (!username) {
      alert('Please enter a username first');
    } else {
      alert('No available rooms to join');
    }
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
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your username"
            />
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
                disabled={!username || !roomCode}
                className="w-full py-2 px-4 bg-indigo-600 text-white font-medium rounded hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
              >
                Join Room
              </button>
              <button
                type="button"
                onClick={handleQuickJoin}
                disabled={!username}
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
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter room name"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Room Size</label>
                <select className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="10">10 Players</option>
                  <option value="20">20 Players</option>
                  <option value="30">30 Players</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={!username}
                className="w-full py-2 px-4 bg-indigo-600 text-white font-medium rounded hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
              >
                Create Room
              </button>
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
            {gameRooms.map((room) => (
              <div key={room.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{room.name}</h3>
                    <p className="text-xs text-gray-500">ID: {room.id}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      room.status === 'Waiting'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {room.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    {room.players}/{room.maxPlayers} players
                  </div>
                  <button
                    onClick={() => {
                      setRoomCode(room.id);
                      setActiveSection('actions');
                      setActiveTab('join');
                    }}
                    disabled={room.status !== 'Waiting' || !username}
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
                {gameRooms.map((room) => (
                  <tr key={room.id}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium">{room.name}</div>
                      <div className="text-xs text-gray-500">ID: {room.id}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {room.players}/{room.maxPlayers}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          room.status === 'Waiting'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {room.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setRoomCode(room.id);
                          setActiveTab('join');
                        }}
                        disabled={room.status !== 'Waiting' || !username}
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