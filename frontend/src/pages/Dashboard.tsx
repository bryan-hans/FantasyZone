import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProjections, getHealth } from '../api/client';
import type { PlayerProjection } from '../types';
import { TrendingUp, Trophy, Star } from 'lucide-react';

export default function Dashboard() {
  const [topPlayers, setTopPlayers] = useState<PlayerProjection[]>([]);
  const [topD, setTopD] = useState<PlayerProjection[]>([]);
  const [health, setHealth] = useState<{ projections_loaded: number } | null>(null);

  useEffect(() => {
    getProjections({ limit: 10, sort_by: 'fantasy_points' }).then(d => setTopPlayers(d.players));
    getProjections({ position: 'D', limit: 5, sort_by: 'fantasy_points' }).then(d => setTopD(d.players));
    getHealth().then(setHealth);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-400 mt-1">
          {health ? `${health.projections_loaded} players loaded` : 'Loading...'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={20} className="text-yellow-400" />
            <h2 className="text-lg font-semibold">Top 10 Skaters</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-left border-b border-gray-800">
                <th className="pb-2 font-medium">#</th>
                <th className="pb-2 font-medium">Player</th>
                <th className="pb-2 font-medium">Pos</th>
                <th className="pb-2 font-medium">Team</th>
                <th className="pb-2 font-medium text-right">FP</th>
                <th className="pb-2 font-medium text-right">FP/G</th>
              </tr>
            </thead>
            <tbody>
              {topPlayers.map((p, i) => (
                <tr key={p.playerId} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="py-2 text-gray-500">{i + 1}</td>
                  <td className="py-2">
                    <Link to={`/players/${p.playerId}`} className="text-blue-400 hover:underline font-medium">
                      {p.player}
                    </Link>
                  </td>
                  <td className="py-2 text-gray-400">{p.pos}</td>
                  <td className="py-2 text-gray-400">{p.team}</td>
                  <td className="py-2 text-right font-mono font-semibold text-green-400">{p.fantasy_points}</td>
                  <td className="py-2 text-right font-mono text-gray-300">{p.fp_per_game}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Link to="/projections" className="text-blue-400 hover:underline text-sm mt-3 inline-block">
            View all projections →
          </Link>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Star size={20} className="text-blue-400" />
            <h2 className="text-lg font-semibold">Top 5 Defensemen</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-left border-b border-gray-800">
                <th className="pb-2 font-medium">#</th>
                <th className="pb-2 font-medium">Player</th>
                <th className="pb-2 font-medium">Team</th>
                <th className="pb-2 font-medium text-right">PTS</th>
                <th className="pb-2 font-medium text-right">FP</th>
              </tr>
            </thead>
            <tbody>
              {topD.map((p, i) => (
                <tr key={p.playerId} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="py-2 text-gray-500">{i + 1}</td>
                  <td className="py-2">
                    <Link to={`/players/${p.playerId}`} className="text-blue-400 hover:underline font-medium">
                      {p.player}
                    </Link>
                  </td>
                  <td className="py-2 text-gray-400">{p.team}</td>
                  <td className="py-2 text-right font-mono text-gray-300">{p.points}</td>
                  <td className="py-2 text-right font-mono font-semibold text-green-400">{p.fantasy_points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/projections" className="bg-gray-900 rounded-xl border border-gray-800 p-5 hover:border-blue-600 transition-colors group">
          <TrendingUp size={24} className="text-blue-400 mb-2" />
          <h3 className="font-semibold group-hover:text-blue-400 transition-colors">Projections</h3>
          <p className="text-sm text-gray-500 mt-1">Full rankings with custom scoring</p>
        </Link>
        <Link to="/players" className="bg-gray-900 rounded-xl border border-gray-800 p-5 hover:border-blue-600 transition-colors group">
          <Star size={24} className="text-green-400 mb-2" />
          <h3 className="font-semibold group-hover:text-blue-400 transition-colors">Players</h3>
          <p className="text-sm text-gray-500 mt-1">Search and browse player profiles</p>
        </Link>
        <Link to="/settings" className="bg-gray-900 rounded-xl border border-gray-800 p-5 hover:border-blue-600 transition-colors group">
          <Trophy size={24} className="text-yellow-400 mb-2" />
          <h3 className="font-semibold group-hover:text-blue-400 transition-colors">Settings</h3>
          <p className="text-sm text-gray-500 mt-1">Configure your league scoring</p>
        </Link>
      </div>
    </div>
  );
}
