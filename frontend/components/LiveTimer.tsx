'use client';

import { useState, useEffect } from 'react';
import { Boss } from '@/types';
import { calculateTimeRemaining, formatTimeRemaining, getTimerColor } from '@/lib/utils';

interface LiveTimerProps {
  boss: Boss;
  onAlive?: () => void;
}

export default function LiveTimer({ boss, onAlive }: LiveTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(
    calculateTimeRemaining(boss.nextSpawnAt)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const newTime = calculateTimeRemaining(boss.nextSpawnAt);
      setTimeRemaining(newTime);

      if (newTime.isAlive && !timeRemaining.isAlive && onAlive) {
        onAlive();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [boss.nextSpawnAt, onAlive, timeRemaining.isAlive]);

  if (timeRemaining.isAlive) {
    return (
      <span className="text-green-300 font-bold text-lg animate-pulse">
        � ALIVE
      </span>
    );
  }

  return (
    <span className={`font-bold text-lg ${getTimerColor(timeRemaining.total)}`}>
      {formatTimeRemaining(timeRemaining)}
    </span>
  );
}
