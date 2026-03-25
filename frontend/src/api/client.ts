import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const api = axios.create({ baseURL: API_BASE });

export async function getProjections(params: {
  position?: string;
  sort_by?: string;
  limit?: number;
  offset?: number;
  search?: string;
}) {
  const { data } = await api.get('/projections', { params });
  return data;
}

export async function getProjection(playerId: number) {
  const { data } = await api.get(`/projections/${playerId}`);
  return data;
}

export async function searchPlayers(q: string) {
  const { data } = await api.get('/players/search', { params: { q } });
  return data;
}

export async function getPlayer(playerId: number) {
  const { data } = await api.get(`/players/${playerId}`);
  return data;
}

export async function getPlayerGamelog(playerId: number) {
  const { data } = await api.get(`/players/${playerId}/gamelog`);
  return data;
}

export async function getScoringSettings() {
  const { data } = await api.get('/settings/scoring');
  return data;
}

export async function saveScoringSettings(settings: { skater: Record<string, number>; goalie: Record<string, number> }) {
  const { data } = await api.put('/settings/scoring', settings);
  return data;
}

export async function getScoringPresets() {
  const { data } = await api.get('/settings/scoring/presets');
  return data;
}

export async function uploadProjections(file: File) {
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post('/projections/upload', form);
  return data;
}

export async function getHealth() {
  const { data } = await api.get('/health');
  return data;
}

export async function getTeam() {
  const { data } = await api.get('/team');
  return data;
}

export async function addToTeam(playerId: number) {
  const { data } = await api.post('/team/add', { playerId });
  return data;
}

export async function removeFromTeam(playerId: number) {
  const { data } = await api.delete(`/team/${playerId}`);
  return data;
}

export async function clearTeam() {
  const { data } = await api.delete('/team');
  return data;
}
