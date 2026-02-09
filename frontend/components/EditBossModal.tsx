'use client';

import { useState, useEffect } from 'react';
import { Boss, UpdateBossInput } from '@/types';
import { formatDateTime } from '@/lib/utils';

interface EditBossModalProps {
  boss: Boss;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: UpdateBossInput) => Promise<void>;
}

export default function EditBossModal({
  boss,
  isOpen,
  onClose,
  onSave,
}: EditBossModalProps) {
  const [lastKillAt, setLastKillAt] = useState('');
  const [nextSpawnAt, setNextSpawnAt] = useState('');
  const [respawnHours, setRespawnHours] = useState(boss.respawnHours);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (boss.lastKillAt) {
      const date = new Date(boss.lastKillAt);
      // Get local time components and format for datetime-local input
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      setLastKillAt(`${year}-${month}-${day}T${hours}:${minutes}`);
    } else {
      setLastKillAt('');
    }
    
    if (boss.nextSpawnAt) {
      const date = new Date(boss.nextSpawnAt);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      setNextSpawnAt(`${year}-${month}-${day}T${hours}:${minutes}`);
    } else {
      setNextSpawnAt('');
    }
    
    setRespawnHours(boss.respawnHours);
  }, [boss]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const updates: UpdateBossInput = {
        respawnHours,
      };

      if (lastKillAt) {
        updates.lastKillAt = new Date(lastKillAt).toISOString();
      }
      if (nextSpawnAt) {
        updates.nextSpawnAt = new Date(nextSpawnAt).toISOString();
      }

      await onSave(updates);
      onClose();
    } catch (err) {
      setError('Failed to update boss');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoCalculate = () => {
    if (respawnHours) {
      let killDate: Date;
      
      if (lastKillAt) {
        // Use the provided last kill time
        killDate = new Date(lastKillAt);
      } else if (nextSpawnAt) {
        // If no last kill time but we have next spawn, calculate backwards
        // Assume boss was killed right when it spawned (common scenario when updating missed kills)
        const spawnDate = new Date(nextSpawnAt);
        killDate = new Date(spawnDate.getTime() - (respawnHours * 60 * 60 * 1000));
        
        // Set the calculated kill time in the input
        const year = killDate.getFullYear();
        const month = String(killDate.getMonth() + 1).padStart(2, '0');
        const day = String(killDate.getDate()).padStart(2, '0');
        const hours = String(killDate.getHours()).padStart(2, '0');
        const minutes = String(killDate.getMinutes()).padStart(2, '0');
        setLastKillAt(`${year}-${month}-${day}T${hours}:${minutes}`);
        return; // nextSpawnAt already set, no need to recalculate
      } else {
        // No data at all, cannot calculate
        return;
      }
      
      // Calculate next spawn time from kill time
      const spawnDate = new Date(killDate.getTime() + (respawnHours * 60 * 60 * 1000));
      
      // Format to datetime-local input format
      const year = spawnDate.getFullYear();
      const month = String(spawnDate.getMonth() + 1).padStart(2, '0');
      const day = String(spawnDate.getDate()).padStart(2, '0');
      const hours = String(spawnDate.getHours()).padStart(2, '0');
      const minutes = String(spawnDate.getMinutes()).padStart(2, '0');
      
      setNextSpawnAt(`${year}-${month}-${day}T${hours}:${minutes}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Edit {boss.name}
        </h2>

        <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-semibold">Level:</span> {boss.level}
            </div>
            <div>
              <span className="font-semibold">Type:</span>{' '}
              <span
                className={
                  boss.attackType === 'melee' ? 'text-melee' : 'text-magic'
                }
              >
                {boss.attackType}
              </span>
            </div>
            <div className="col-span-2">
              <span className="font-semibold">Location:</span> {boss.location}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
              Respawn Hours
            </label>
            <input
              type="number"
              value={respawnHours}
              onChange={(e) => setRespawnHours(Number(e.target.value))}
              min="1"
              className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
              Last Kill Time (Local)
            </label>
            <input
              type="datetime-local"
              value={lastKillAt}
              onChange={(e) => setLastKillAt(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
              Next Spawn Time (Local)
            </label>
            <div className="flex gap-2">
              <input
                type="datetime-local"
                value={nextSpawnAt}
                onChange={(e) => setNextSpawnAt(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
              />
              <button
                type="button"
                onClick={handleAutoCalculate}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
              >
                Auto
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Click Auto to calculate from last kill time, or calculate backwards from spawn time if kill time is empty
            </p>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
