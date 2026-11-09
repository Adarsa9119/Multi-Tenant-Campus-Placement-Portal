import { useEffect, useState } from 'react';

const DEFAULT_COOLDOWN_SECONDS = 45;

export default function useOtpCooldown() {
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (wait <= 0) return undefined;
    const timer = setTimeout(() => setWait((remaining) => Math.max(0, remaining - 1)), 1000);
    return () => clearTimeout(timer);
  }, [wait]);

  const start = (seconds = DEFAULT_COOLDOWN_SECONDS) => {
    const duration = Number(seconds);
    setWait(Number.isFinite(duration) && duration > 0 ? Math.ceil(duration) : DEFAULT_COOLDOWN_SECONDS);
  };

  const startFromError = (error) => {
    const status = error?.response?.status;
    if (status === 429) {
      const retryAfter = Number(
        error.response.data?.details?.retryAfter
        || error.response.headers?.['retry-after'],
      );
      start(retryAfter);
    } else if (!error?.response || status >= 500) {
      start();
    }
  };

  return { wait, start, startFromError };
}
