export interface Boss {
  id: number;
  name: string;
  server: string;
  attackType: 'melee' | 'magic';
  level: number;
  respawnHours: number;
  location: string;
  lastKillAt: string | null;
  nextSpawnAt: string | null;
  isScheduled: boolean;
}

export interface CreateBossInput {
  name: string;
  attackType: 'melee' | 'magic';
  level: number;
  respawnHours: number;
  location: string;
  lastKillAt?: string;
  nextSpawnAt?: string;
  isScheduled?: boolean;
}

export interface UpdateBossInput {
  lastKillAt?: string;
  nextSpawnAt?: string;
  respawnHours?: number;
}
