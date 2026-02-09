import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import pool from './db';
import bcrypt from 'bcrypt';
import { Boss, UpdateBossInput } from './types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());

// Dynamic CORS configuration to support Vercel deployments automatically
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL || ''
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin); // Log blocked origins for debugging
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get all bosses
app.get('/api/bosses', async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM bosses ORDER BY CASE WHEN next_spawn_at IS NULL THEN 1 ELSE 0 END, next_spawn_at ASC, name ASC'
    );
    
    const bosses: Boss[] = rows.map(row => ({
      id: row.id,
      name: row.name,
      attackType: row.attack_type,
      level: row.level,
      respawnHours: row.respawn_hours,
      location: row.location,
      lastKillAt: row.last_kill_at ? new Date(row.last_kill_at).toISOString() : null,
      nextSpawnAt: row.next_spawn_at ? new Date(row.next_spawn_at).toISOString() : null,
      isScheduled: Boolean(row.is_scheduled)
    }));
    
    res.json(bosses);
  } catch (error) {
    console.error('Error fetching bosses:', error);
    res.status(500).json({ error: 'Failed to fetch bosses' });
  }
});

// Get single boss
app.get('/api/bosses/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM bosses WHERE id = ?', 
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Boss not found' });
    }
    
    const row = rows[0];
    const boss: Boss = {
      id: row.id,
      name: row.name,
      attackType: row.attack_type,
      level: row.level,
      respawnHours: row.respawn_hours,
      location: row.location,
      lastKillAt: row.last_kill_at ? new Date(row.last_kill_at).toISOString() : null,
      nextSpawnAt: row.next_spawn_at ? new Date(row.next_spawn_at).toISOString() : null,
      isScheduled: Boolean(row.is_scheduled)
    };
    
    res.json(boss);
  } catch (error) {
    console.error('Error fetching boss:', error);
    res.status(500).json({ error: 'Failed to fetch boss' });
  }
});

// Validate password
app.post('/api/auth/check', async (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: 'Password required' });
    }
    
    // Get password hash from settings table
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT value FROM settings WHERE `key` = ?',
      ['admin_password_hash']
    );
    
    if (rows.length === 0) {
      return res.status(500).json({ error: 'Password not configured' });
    }
    
    const passwordHash = rows[0].value;
    const isValid = await bcrypt.compare(password, passwordHash);
    
    res.json({ valid: isValid });
  } catch (error) {
    console.error('Error validating password:', error);
    res.status(500).json({ error: 'Failed to validate password' });
  }
});

// Update boss
app.post('/api/bosses/:id/update', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { password, updates }: { password: string; updates: UpdateBossInput } = req.body;
    
    if (!password) {
      return res.status(401).json({ error: 'Password required' });
    }
    
    // Validate password
    const [settingsRows] = await pool.query<RowDataPacket[]>(
      'SELECT value FROM settings WHERE `key` = ?',
      ['admin_password_hash']
    );
    
    if (settingsRows.length === 0) {
      return res.status(500).json({ error: 'Password not configured' });
    }
    
    const passwordHash = settingsRows[0].value;
    const isValid = await bcrypt.compare(password, passwordHash);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    // Build update query
    const updateFields: string[] = [];
    const values: any[] = [];
    
    if (updates.lastKillAt !== undefined) {
      updateFields.push('last_kill_at = ?');
      values.push(updates.lastKillAt ? new Date(updates.lastKillAt) : null);
    }
    
    if (updates.nextSpawnAt !== undefined) {
      updateFields.push('next_spawn_at = ?');
      values.push(updates.nextSpawnAt ? new Date(updates.nextSpawnAt) : null);
      
      updateFields.push('is_scheduled = ?');
      values.push(updates.nextSpawnAt !== null);
    }
    
    if (updates.respawnHours !== undefined) {
      updateFields.push('respawn_hours = ?');
      values.push(updates.respawnHours);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    
    values.push(id);
    const query = `
      UPDATE bosses 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;
    
    await pool.query<ResultSetHeader>(query, values);
    
    // Fetch updated boss
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM bosses WHERE id = ?',
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Boss not found' });
    }
    
    const row = rows[0];
    const boss: Boss = {
      id: row.id,
      name: row.name,
      attackType: row.attack_type,
      level: row.level,
      respawnHours: row.respawn_hours,
      location: row.location,
      lastKillAt: row.last_kill_at ? new Date(row.last_kill_at).toISOString() : null,
      nextSpawnAt: row.next_spawn_at ? new Date(row.next_spawn_at).toISOString() : null,
      isScheduled: Boolean(row.is_scheduled)
    };
    
    res.json(boss);
  } catch (error) {
    console.error('Error updating boss:', error);
    res.status(500).json({ error: 'Failed to update boss' });
  }
});

// Mark boss as killed (auto-calculate next spawn)
app.post('/api/bosses/:id/kill', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    
    if (!password) {
      return res.status(401).json({ error: 'Password required' });
    }
    
    // Validate password
    const [settingsRows] = await pool.query<RowDataPacket[]>(
      'SELECT value FROM settings WHERE `key` = ?',
      ['admin_password_hash']
    );
    
    if (settingsRows.length === 0) {
      return res.status(500).json({ error: 'Password not configured' });
    }
    
    const passwordHash = settingsRows[0].value;
    const isValid = await bcrypt.compare(password, passwordHash);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    // Get boss to calculate next spawn
    const [bossRows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM bosses WHERE id = ?', 
      [id]
    );
    
    if (bossRows.length === 0) {
      return res.status(404).json({ error: 'Boss not found' });
    }
    
    const boss = bossRows[0];
    const now = new Date();
    const nextSpawn = new Date(now.getTime() + boss.respawn_hours * 60 * 60 * 1000);
    
    // Update boss
    await pool.query<ResultSetHeader>(`
      UPDATE bosses 
      SET last_kill_at = ?,
          next_spawn_at = ?,
          is_scheduled = true,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [now, nextSpawn, id]);
    
    // Fetch updated boss
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM bosses WHERE id = ?',
      [id]
    );
    
    const row = rows[0];
    const updatedBoss: Boss = {
      id: row.id,
      name: row.name,
      attackType: row.attack_type,
      level: row.level,
      respawnHours: row.respawn_hours,
      location: row.location,
      lastKillAt: row.last_kill_at ? new Date(row.last_kill_at).toISOString() : null,
      nextSpawnAt: row.next_spawn_at ? new Date(row.next_spawn_at).toISOString() : null,
      isScheduled: Boolean(row.is_scheduled)
    };
    
    res.json(updatedBoss);
  } catch (error) {
    console.error('Error marking boss as killed:', error);
    res.status(500).json({ error: 'Failed to mark boss as killed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
