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
      setLastKillAt(date.toISOString().slice(0, 16));
    }
    if (boss.nextSpawnAt) {
      const date = new Date(boss.nextSpawnAt);
      setNextSpawnAt(date.toISOString().slice(0, 16));
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
    if (lastKillAt) {
      const kill = new Date(lastKillAt);
      // Create a new date object to avoid mutating the original
      const spawn = new Date(kill.getTime());
      
      // Add respawn hours
      spawn.setTime(spawn.getTime() + (respawnHours * 60 * 60 * 1000));
      
      // Adjust timezone offset to ensure ISO string works correctly in local time
      // This creates a date string that represents "Local Time" but in ISO format for the input
      const offset = spawn.getTimezoneOffset() * 60000;
      const localISOTime = new Date(spawn.getTime() - offset).toISOString().slice(0, 16);
      
      setNextSpawnAt(localISOTime);
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
              Click Auto to calculate from last kill time
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
