export interface PlayerProjection {
  playerId: number;
  player: string;
  age: number;
  pos: string;
  team: string;
  salary: string;
  gp: number;
  goals: number;
  assists: number;
  points: number;
  ppg: number;
  ppa: number;
  pp_points: number;
  shg: number;
  sha: number;
  shp: number;
  hits: number;
  blk: number;
  pim: number;
  fow: number;
  fol: number;
  sog: number;
  plus_minus: number;
  total_toi: number;
  fantasy_points: number;
  fp_per_game: number;
  fantasy_team: string;
  source: string;
}

export interface ScoringSettings {
  skater: Record<string, number>;
  goalie: Record<string, number>;
}

export interface ScoringPreset {
  name: string;
  skater: Record<string, number>;
  goalie: Record<string, number>;
}
