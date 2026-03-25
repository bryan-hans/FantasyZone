import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getTeam, removeFromTeam, clearTeam, searchPlayers, addToTeam } from '../api/client';
import type { PlayerProjection } from '../types';
import { UserPlus, Trash2, X, Search, Users } from 'lucide-react';

interface TeamTotals {
  player_count: number;
  fantasy_points: number;
  gp: number;
  goals: number;
  assists: number;
  points: number;
  pp_points: number;
  shp: number;
  sog: number;
  hits: number;
  blk: number;
  pim: number;
  fow: number;
  plus_minus: number;
}

export default function MyTeam() {
  const [players, setPlayers] = useState<PlayerProjection[]>([]);
  const [totals, setTotals] = useState<TeamTotals | null>(null);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searching, setSearching] = useState(false);

  const fetchTeam = useCallback(async () => {
    setLoading(true);
    const data = await getTeam();
    setPlayers(data.players);
    setTotals(data.totals);
    setLoading(false);
  }, []);

  useEffect(() => { fetchTeam(); }, [fetchTeam]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    const data = await searchPlayers(searchQuery);
    const teamIds = new Set(players.map(p => p.playerId));
    setSearchResults((data.local || []).filter((p: any) => !teamIds.has(p.playerId)));
    setSearching(false);
  };

  const handleAdd = async (playerId: number) => {
    await addToTeam(playerId);
    setSearchResults(prev => prev.filter(p => p.playerId !== playerId));
    await fetchTeam();
  };

  const handleRemove = async (playerId: number) => {
    await removeFromTeam(playerId);
    await fetchTeam();
  };

  const handleClear = async () => {
    if (!confirm('Remove all players from your team?')) return;
    await clearTeam();
    await fetchTeam();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Team</h1>
          <p className="text-gray-400 mt-1">
            {totals ? `${totals.player_count} players on roster` : 'Loading...'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors"
          >
            <UserPlus size={16} />
            Add Player
          </button>
          {players.length > 0 && (
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-red-900/50 hover:text-red-400 rounded-lg text-sm font-medium transition-colors"
            >
              <Trash2 size={16} />
              Clear
            </button>
          )}
        </div>
      </div>

      {showSearch && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Search player to add..."
                className="w-full pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </div>
            <button onClick={handleSearch} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium">
              Search
            </button>
            <button onClick={() => { setShowSearch(false); setSearchResults([]); setSearchQuery(''); }}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg">
              <X size={16} />
            </button>
          </div>
          {searching && <p className="text-sm text-gray-500">Searching...</p>}
          {searchResults.length > 0 && (
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {searchResults.map(p => (
                <div key={p.playerId} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-800">
                  <div>
                    <span className="font-medium text-sm">{p.player}</span>
                    <span className="text-gray-500 text-sm ml-2">{p.pos} - {p.team}</span>
                  </div>
                  <button
                    onClick={() => handleAdd(p.playerId)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded-md text-xs font-medium"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          )}
          {!searching && searchResults.length === 0 && searchQuery && (
            <p className="text-sm text-gray-500">No results. Try a different name.</p>
          )}
        </div>
      )}

      {totals && totals.player_count > 0 && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users size={20} className="text-blue-400" />
            <h2 className="text-lg font-semibold">Team Totals</h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-4">
            <TotalBox label="Fantasy Pts" value={totals.fantasy_points} highlight />
            <TotalBox label="Goals" value={totals.goals} />
            <TotalBox label="Assists" value={totals.assists} />
            <TotalBox label="Points" value={totals.points} />
            <TotalBox label="PPP" value={totals.pp_points} />
            <TotalBox label="SOG" value={totals.sog} />
            <TotalBox label="Hits" value={totals.hits} />
            <TotalBox label="Blocks" value={totals.blk} />
            <TotalBox label="PIM" value={totals.pim} />
            <TotalBox label="FOW" value={totals.fow} />
            <TotalBox label="SHP" value={totals.shp} />
            <TotalBox label="GP (avg)" value={totals.player_count > 0 ? Math.round(totals.gp / totals.player_count) : 0} />
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading team...</p>
      ) : players.length === 0 ? (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-10 text-center">
          <Users size={48} className="mx-auto text-gray-700 mb-3" />
          <h3 className="text-lg font-semibold text-gray-400">No players on your team yet</h3>
          <p className="text-sm text-gray-500 mt-1">Click "Add Player" above to start building your roster</p>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-left border-b border-gray-800 bg-gray-900/80">
                  <th className="px-4 py-3 font-medium">Player</th>
                  <th className="px-4 py-3 font-medium">Pos</th>
                  <th className="px-4 py-3 font-medium">Team</th>
                  <th className="px-4 py-3 font-medium text-right">GP</th>
                  <th className="px-4 py-3 font-medium text-right">G</th>
                  <th className="px-4 py-3 font-medium text-right">A</th>
                  <th className="px-4 py-3 font-medium text-right">PTS</th>
                  <th className="px-4 py-3 font-medium text-right">PPP</th>
                  <th className="px-4 py-3 font-medium text-right">SOG</th>
                  <th className="px-4 py-3 font-medium text-right">HIT</th>
                  <th className="px-4 py-3 font-medium text-right">BLK</th>
                  <th className="px-4 py-3 font-medium text-right">FP</th>
                  <th className="px-4 py-3 font-medium text-right">FP/G</th>
                  <th className="px-4 py-3 font-medium w-10"></th>
                </tr>
              </thead>
              <tbody>
                {players.map(p => (
                  <tr key={p.playerId} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-4 py-2.5">
                      <Link to={`/players/${p.playerId}`} className="text-blue-400 hover:underline font-medium">
                        {p.player}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-gray-400">{p.pos}</td>
                    <td className="px-4 py-2.5 text-gray-400">{p.team}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-gray-300">{p.gp}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-gray-300">{p.goals}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-gray-300">{p.assists}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-gray-300">{p.points}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-gray-300">{p.pp_points}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-gray-300">{p.sog}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-gray-300">{p.hits}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-gray-300">{p.blk}</td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold text-green-400">{p.fantasy_points}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-gray-300">{p.fp_per_game}</td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => handleRemove(p.playerId)}
                        className="p-1 rounded hover:bg-red-900/40 hover:text-red-400 text-gray-600 transition-colors"
                        title="Remove from team"
                      >
                        <X size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function TotalBox({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="text-center bg-gray-800/50 rounded-lg p-3">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`text-xl font-bold mt-1 ${highlight ? 'text-green-400' : 'text-gray-100'}`}>
        {typeof value === 'number' && !Number.isInteger(value) ? value.toFixed(1) : value}
      </p>
    </div>
  );
}
