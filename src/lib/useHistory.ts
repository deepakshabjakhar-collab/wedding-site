import { useCallback, useRef, useState } from 'react';

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

const LIMIT = 60;

/** Undo/redo state with light coalescing so typing does not fill the history. */
export function useHistory<T>(initial: T) {
  const [state, setState] = useState<HistoryState<T>>({ past: [], present: initial, future: [] });
  const lastKey = useRef<string | null>(null);
  const lastTime = useRef(0);

  const set = useCallback((updater: T | ((prev: T) => T), coalesceKey?: string) => {
    setState((current) => {
      const next =
        typeof updater === 'function' ? (updater as (prev: T) => T)(current.present) : updater;
      if (Object.is(next, current.present)) return current;
      const now = Date.now();
      const coalesce =
        Boolean(coalesceKey) && coalesceKey === lastKey.current && now - lastTime.current < 900;
      lastKey.current = coalesceKey ?? null;
      lastTime.current = now;
      if (coalesce) {
        return { ...current, present: next, future: [] };
      }
      return {
        past: [...current.past, current.present].slice(-LIMIT),
        present: next,
        future: [],
      };
    });
  }, []);

  const reset = useCallback((value: T) => {
    lastKey.current = null;
    setState({ past: [], present: value, future: [] });
  }, []);

  const undo = useCallback(() => {
    setState((current) => {
      if (!current.past.length) return current;
      const previous = current.past[current.past.length - 1];
      lastKey.current = null;
      return {
        past: current.past.slice(0, -1),
        present: previous,
        future: [current.present, ...current.future].slice(0, LIMIT),
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState((current) => {
      if (!current.future.length) return current;
      const [next, ...rest] = current.future;
      lastKey.current = null;
      return {
        past: [...current.past, current.present].slice(-LIMIT),
        present: next,
        future: rest,
      };
    });
  }, []);

  return {
    value: state.present,
    set,
    reset,
    undo,
    redo,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  };
}
