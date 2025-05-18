import React, { useState, useEffect } from 'react';

import { SERVER_URL } from '../utils/config';
import { formatAddress } from '../utils/format';
import { PlayerStats, ApiError } from '../types';

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await fetch(SERVER_URL + 'api/game/leaderboard');
        if (!response.ok) {
          const error: ApiError = await response.json();
          throw new Error(error.error || 'Failed to fetch leaderboard');
        }
        const data: PlayerStats[] = await response.json();
        setLeaderboard(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
        setError('Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-gray-600">Loading leaderboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-medium mb-4">Leaderboard</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bingos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Games Played
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leaderboard.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No players on the leaderboard yet.
                </td>
              </tr>
            ) : (
              leaderboard.map((player, index) => (
                <tr key={player._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                        index === 0
                          ? 'bg-yellow-400 text-white'
                          : index === 1
                          ? 'bg-gray-400 text-white'
                          : index === 2
                          ? 'bg-amber-600 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{formatAddress(player.username)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{player.totalScore}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{player.totalBingos}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{player.gamesPlayed}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
