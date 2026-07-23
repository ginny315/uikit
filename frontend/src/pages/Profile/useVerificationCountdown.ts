import { useEffect, useState } from 'react';

export function useVerificationCountdown(duration = 60) {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!active || secondsLeft <= 0) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [active, secondsLeft]);

  function start() {
    setSecondsLeft(duration);
    setActive(true);
  }

  return { secondsLeft, active, start };
}

export const DEMO_VERIFICATION_CODE = '123456';
export const DEMO_PASSWORD = 'admin123';
