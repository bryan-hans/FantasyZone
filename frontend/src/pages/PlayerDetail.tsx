import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPlayer, getPlayerGamelog } from '../api/client';
import { ArrowLeft } from 'lucide-react';

export default function PlayerDetail() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [projection, setProjection] = useState<any>(null);
  const [gamelog, setGamelog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const pid = parseInt(id);

    Promise.all([
      getPlayer(pid),
      getPlayerGamelog(pid).catch(() => null),
    ]).then(([playerData, logData]) => {
      setProfile(playerData.profile);
      setProjection(playerData.projection);
      if (logData?.gameLog) setGamelog(logData.gameLog);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <p className="text-gray-500">Loading player...</p>;
  if (!profile && !projection) return <p className="text-gray-500">Player not found</p>;

  const name = profile
    ? `${profile.firstName?.default || ''} ${profile.lastName?.default || ''}`
    : projection?.player || 'Unknown';

  return (
    <div className="space-y-6">
      <Link to="/players" className="inline-flex items-center gap-1 text-gray-400 hover:text-white text-sm">
        <ArrowLeft size={16} /> Back to search
      </Link>

      <div className="flex items-start gap-6">
        {profile?.headshot && (
          <img src={profile.headshot} alt={name} className="w-24 h-24 rounded-xl bg-gray-800" />
        )}
        <div>
          <h1 className="text-3xl font-bold">{name}</h1>
          <div className="flex items-center gap-3 mt-1 text-gray-400">
            {profile && (
              <>
                <span>{profile.position || projection?.pos}</span>
                <span className="text-gray-600">|</span>
                <span>{profile.currentTeamAbbrev || projection?.team}</span>
                <span className="text-gray-600">|</span>
                <span>#{profile.sweaterNumber}</span>
              </>
            )}
          </div>
          {profile && (
            <div className="flex gap-4 mt-2 text-sm text-gray-500">
              {profile.heightInInches && <span>{Math.floor(profile.heightInInches / 12)}'{profile.heightInInches % 12}"</span>}
              {profile.weightInPounds && <span>{profile.weightInPounds} lbs</span>}
              {profile.birthDate && <span>Born {profile.birthDate}</span>}
              {profile.shootsCatches && <span>Shoots {profile.shootsCatches}</span>}
            </div>
          )}
        </div>
      </div>

      {projection && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h2 className="text-lg font-semibold mb-4">Season Projections</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            <StatBox label="FP" value={projection.fantasy_points} highlight />
            <StatBox label="GP" value={projection.gp} />
            <StatBox label="G" value={projection.goals} />
            <StatBox label="A" value={projection.assists} />
            <StatBox label="PTS" value={projection.points} />
            <StatBox label="PPP" value={projection.pp_points} />
            <StatBox label="SOG" value={projection.sog} />
            <StatBox label="+/-" value={projection.plus_minus} />
            <StatBox label="HIT" value={projection.hits} />
            <StatBox label="BLK" value={projection.blk} />
            <StatBox label="PIM" value={projection.pim} />
            <StatBox label="FOW" value={projection.fow} />
            <StatBox label="TOI" value={projection.total_toi?.toFixed(1)} />
            <StatBox label="SHP" value={projection.shp} />
          </div>
        </div>
      )}

      {gamelog.length > 0 && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h2 className="text-lg font-semibold mb-4">Recent Game Log</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-left border-b border-gray-800">
                  <th className="px-3 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 font-medium">Opp</th>
                  <th className="px-3 py-2 font-medium text-right">G</th>
                  <th className="px-3 py-2 font-medium text-right">A</th>
                  <th className="px-3 py-2 font-medium text-right">PTS</th>
                  <th className="px-3 py-2 font-medium text-right">+/-</th>
                  <th className="px-3 py-2 font-medium text-right">SOG</th>
                  <th className="px-3 py-2 font-medium text-right">TOI</th>
                </tr>
              </thead>
              <tbody>
                {gamelog.slice(0, 20).map((g: any, i: number) => (
                  <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-3 py-2 text-gray-400">{g.gameDate}</td>
                    <td className="px-3 py-2 text-gray-400">{g.opponentAbbrev?.default || g.opponentAbbrev}</td>
                    <td className="px-3 py-2 text-right font-mono">{g.goals}</td>
                    <td className="px-3 py-2 text-right font-mono">{g.assists}</td>
                    <td className="px-3 py-2 text-right font-mono font-semibold">{g.points}</td>
                    <td className="px-3 py-2 text-right font-mono">{g.plusMinus}</td>
                    <td className="px-3 py-2 text-right font-mono">{g.shots}</td>
                    <td className="px-3 py-2 text-right font-mono text-gray-400">{g.toi}</td>
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

function StatBox({ label, value, highlight }: { label: string; value: any; highlight?: boolean }) {
  return (
    <div className="text-center">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`text-lg font-bold mt-0.5 ${highlight ? 'text-green-400' : 'text-gray-100'}`}>
        {value ?? '—'}
      </p>
    </div>
  );
}
