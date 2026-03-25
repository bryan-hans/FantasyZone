import { useState } from 'react';
import { Link } from 'react-router-dom';
import { searchPlayers } from '../api/client';
import { Search } from 'lucide-react';

interface SearchResult {
  playerId: number;
  player: string;
  pos: string;
  team: string;
}

export default function Players() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    const data = await searchPlayers(query);
    setResults(data.local || []);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Players</h1>
        <p className="text-gray-400 mt-1">Search for any NHL player</p>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search by player name..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors"
        >
          Search
        </button>
      </div>

      {loading && <p className="text-gray-500">Searching...</p>}

      {!loading && searched && results.length === 0 && (
        <p className="text-gray-500">No players found for "{query}"</p>
      )}

      {results.length > 0 && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-left border-b border-gray-800">
                <th className="px-4 py-3 font-medium">Player</th>
                <th className="px-4 py-3 font-medium">Position</th>
                <th className="px-4 py-3 font-medium">Team</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {results.map(p => (
                <tr key={p.playerId} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="px-4 py-3">
                    <Link to={`/players/${p.playerId}`} className="text-blue-400 hover:underline font-medium">
                      {p.player}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{p.pos}</td>
                  <td className="px-4 py-3 text-gray-400">{p.team}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/players/${p.playerId}`}
                      className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-md text-xs font-medium transition-colors"
                    >
                      View Profile
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
