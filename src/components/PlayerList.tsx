import { Users } from 'lucide-react';

import { formatAddress } from '../utils/format.js';
import { Player } from '../types.js';

interface PlayerProps {
  maxPlayers: number;
  players: Player[];
}

function PlayerList({ maxPlayers, players }: PlayerProps) {
  return (
    <div className="w-full flex flex-col gap-3">
      <div className="bg-white rounded-lg shadow p-3">
        <div className='flex'>
          <Users className="h-4 w-4 mr-1" />
          <h2 className="text-sm font-medium text-gray-500 mb-2">
            Players {players.length} / {maxPlayers}
          </h2>
        </div>
        
        <div className="space-y-2">
          {players.map(player => (
            <div key={player.userId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <div className="font-medium text-black">{formatAddress(player.username || "")}</div>
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
    </div>
  )
}

export default PlayerList