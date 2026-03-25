import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getProjections } from '../api/client';
import type { PlayerProjection } from '../types';
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

const POSITIONS = ['All', 'C', 'LW', 'RW', 'D'];
const SORTABLE_COLS = [
  { key: 'fantasy_points', label: 'FP' },
  { key: 'fp_per_game', label: 'FP/G' },
  { key: 'goals', label: 'G' },
  { key: 'assists', label: 'A' },
  { key: 'points', label: 'PTS' },
  { key: 'pp_points', label: 'PPP' },
  { key: 'sog', label: 'SOG' },
  { key: 'hits', label: 'HIT' },
  { key: 'blk', label: 'BLK' },
] as const;

const PAGE_SIZE = 50;

export default function Projections() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [players, setPlayers] = useState<PlayerProjection[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const position = searchParams.get('pos') || 'All';
  const sortBy = searchParams.get('sort') || 'fantasy_points';
  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('q') || '';

  const fetchData = useCallback(async () => {
    setLoading(true);
    const data = await getProjections({
      position: position === 'All' ? undefined : position,
      sort_by: sortBy,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
      search: search || undefined,
    });
    setPlayers(data.players);
    setTotal(data.total);
    setLoading(false);
  }, [position, sortBy, page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set(key, value);
    if (key !== 'page') params.set('page', '1');
    setSearchParams(params);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Projections</h1>
        <p className="text-gray-400 mt-1">{total} players ranked by projected fantasy points</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 bg-gray-900 rounded-lg p-1">
          {POSITIONS.map(pos => (
            <button
              key={pos}
              onClick={() => setParam('pos', pos)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                position === pos
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {pos}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search player..."
          value={search}
          onChange={e => setParam('q', e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 w-48"
        />
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-left border-b border-gray-800 bg-gray-900/80">
                <th className="px-4 py-3 font-medium w-10">#</th>
                <th className="px-4 py-3 font-medium">Player</th>
                <th className="px-4 py-3 font-medium">Pos</th>
                <th className="px-4 py-3 font-medium">Team</th>
                <th className="px-4 py-3 font-medium text-right">GP</th>
                {SORTABLE_COLS.map(col => (
                  <th
                    key={col.key}
                    className="px-4 py-3 font-medium text-right cursor-pointer hover:text-blue-400 select-none"
                    onClick={() => setParam('sort', col.key)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {sortBy === col.key && <ArrowUpDown size={12} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={14} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : players.map((p, i) => (
                <tr key={p.playerId} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="px-4 py-2.5 text-gray-500">{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td className="px-4 py-2.5">
                    <Link to={`/players/${p.playerId}`} className="text-blue-400 hover:underline font-medium">
                      {p.player}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-gray-400">{p.pos}</td>
                  <td className="px-4 py-2.5 text-gray-400">{p.team}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-gray-300">{p.gp}</td>
                  <td className="px-4 py-2.5 text-right font-mono font-semibold text-green-400">{p.fantasy_points}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-gray-300">{p.fp_per_game}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-gray-300">{p.goals}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-gray-300">{p.assists}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-gray-300">{p.points}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-gray-300">{p.pp_points}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-gray-300">{p.sog}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-gray-300">{p.hits}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-gray-300">{p.blk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setParam('page', String(page - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg bg-gray-800 text-sm disabled:opacity-30 hover:bg-gray-700"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 py-1.5 text-sm text-gray-400">Page {page} of {totalPages}</span>
            <button
              onClick={() => setParam('page', String(page + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg bg-gray-800 text-sm disabled:opacity-30 hover:bg-gray-700"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
