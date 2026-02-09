export function calculateTimeRemaining(targetDate: string | null): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
  isAlive: boolean;
} {
  if (!targetDate) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0, isAlive: true };
  }

  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const difference = target - now;

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0, isAlive: true };
  }

  const seconds = Math.floor((difference / 1000) % 60);
  const minutes = Math.floor((difference / 1000 / 60) % 60);
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const days = Math.floor(difference / (1000 * 60 * 60 * 24));

  return { days, hours, minutes, seconds, total: difference, isAlive: false };
}

export function formatTimeRemaining(time: ReturnType<typeof calculateTimeRemaining>): string {
  if (time.isAlive) {
    return 'ALIVE';
  }

  const parts: string[] = [];
  
  if (time.days > 0) {
    parts.push(`${time.days}d`);
  }
  if (time.hours > 0 || time.days > 0) {
    parts.push(`${time.hours}h`);
  }
  if (time.minutes > 0 || time.hours > 0 || time.days > 0) {
    parts.push(`${time.minutes}m`);
  }
  parts.push(`${time.seconds}s`);

  return parts.join(' ');
}

export function getTimerColor(totalMs: number): string {
  const minutes = totalMs / (1000 * 60);
  
  if (minutes <= 10) {
    return 'text-red-300 font-bold';
  } else if (minutes <= 60) {
    return 'text-yellow-300 font-semibold';
  } else {
    return 'text-blue-200';
  }
}

export function formatDateTime(dateString: string | null): string {
  if (!dateString) return 'Not set';
  
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
