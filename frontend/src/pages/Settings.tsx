import { useEffect, useState } from 'react';
import { getScoringSettings, saveScoringSettings, getScoringPresets, uploadProjections } from '../api/client';
import { Save, Upload, Check } from 'lucide-react';

const SKATER_LABELS: Record<string, string> = {
  goals: 'Goals (G)',
  assists: 'Assists (A)',
  plus_minus: 'Plus/Minus (+/-)',
  pp_points: 'Power Play Points (PPP)',
  shp: 'Short-Handed Points (SHP)',
  sog: 'Shots on Goal (SOG)',
  hits: 'Hits (HIT)',
  blk: 'Blocks (BLK)',
  pim: 'Penalty Minutes (PIM)',
  fow: 'Faceoff Wins (FOW)',
};

const GOALIE_LABELS: Record<string, string> = {
  wins: 'Wins (W)',
  saves: 'Saves (SV)',
  goals_against: 'Goals Against (GA)',
  shutouts: 'Shutouts (SO)',
  otl: 'OT Losses (OTL)',
};

export default function Settings() {
  const [skater, setSkater] = useState<Record<string, number>>({});
  const [goalie, setGoalie] = useState<Record<string, number>>({});
  const [presets, setPresets] = useState<Record<string, any>>({});
  const [saved, setSaved] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');

  useEffect(() => {
    getScoringSettings().then(data => {
      setSkater(data.skater);
      setGoalie(data.goalie);
    });
    getScoringPresets().then(setPresets);
  }, []);

  const handleSave = async () => {
    await saveScoringSettings({ skater, goalie });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const applyPreset = (key: string) => {
    const preset = presets[key];
    if (preset) {
      setSkater(preset.skater);
      setGoalie(preset.goalie);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadMsg('Uploading...');
    try {
      const result = await uploadProjections(file);
      setUploadMsg(result.message || 'Upload complete');
    } catch {
      setUploadMsg('Upload failed');
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-400 mt-1">Configure your league's scoring system</p>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
        <h2 className="text-lg font-semibold mb-4">Scoring Presets</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(presets).map(([key, preset]: [string, any]) => (
            <button
              key={key}
              onClick={() => applyPreset(key)}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
        <h2 className="text-lg font-semibold mb-4">Skater Scoring</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(SKATER_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <label className="text-sm text-gray-300">{label}</label>
              <input
                type="number"
                step="0.1"
                value={skater[key] ?? 0}
                onChange={e => setSkater(prev => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))}
                className="w-24 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-right font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
        <h2 className="text-lg font-semibold mb-4">Goalie Scoring</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(GOALIE_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <label className="text-sm text-gray-300">{label}</label>
              <input
                type="number"
                step="0.1"
                value={goalie[key] ?? 0}
                onChange={e => setGoalie(prev => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))}
                className="w-24 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-right font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
      >
        {saved ? <Check size={18} /> : <Save size={18} />}
        {saved ? 'Saved!' : 'Save Scoring Settings'}
      </button>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
        <h2 className="text-lg font-semibold mb-2">Upload Projections CSV</h2>
        <p className="text-sm text-gray-500 mb-4">Replace the current projections with a new CSV file from your spreadsheet</p>
        <label className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium cursor-pointer transition-colors w-fit">
          <Upload size={16} />
          Choose CSV File
          <input type="file" accept=".csv" onChange={handleUpload} className="hidden" />
        </label>
        {uploadMsg && <p className="text-sm text-gray-400 mt-2">{uploadMsg}</p>}
      </div>
    </div>
  );
}
