import { useEffect, useState } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function useAnimatedNumber(target, duration = 650, active = true) {
  const [value, setValue] = useState(() => (active ? 0 : target));

  useEffect(() => {
    let frameId = 0;
    let cancelled = false;

    function commit(next) {
      if (!cancelled) {
        setValue(next);
      }
    }

    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;

    if (!active || reducedMotion) {
      frameId = requestAnimationFrame(() => commit(target));
      return () => {
        cancelled = true;
        cancelAnimationFrame(frameId);
      };
    }

    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      commit(target * eased);

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    }

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
    };
  }, [target, duration, active]);

  return value;
}
