import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, Info, X } from 'lucide-react';

type Tone = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  tone: Tone;
}

interface ToastContextValue {
  push: (message: string, tone?: Tone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);
let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const reduce = useReducedMotion();

  const push = useCallback((message: string, tone: Tone = 'success') => {
    const id = nextId++;
    setItems((prev) => [...prev.slice(-3), { id, message, tone }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }, 4200);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-5 z-[100] flex flex-col items-center gap-2 px-4"
        role="status"
        aria-live="polite"
      >
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
              className="pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-xl border border-[#3a3028] bg-[#241d18] px-4 py-3 text-sm text-[#f7f0e6] shadow-2xl"
            >
              <span
                className={`mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full ${
                  item.tone === 'error'
                    ? 'bg-[#8a3f31] text-[#ffe9e4]'
                    : item.tone === 'info'
                      ? 'bg-[#4a4137] text-[#f7f0e6]'
                      : 'bg-[#6e7f62] text-[#f2f7ee]'
                }`}
              >
                {item.tone === 'error' ? <X size={12} /> : item.tone === 'info' ? <Info size={12} /> : <Check size={12} />}
              </span>
              <span className="leading-snug">{item.message}</span>
              <button
                type="button"
                onClick={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
                className="ml-auto flex-none rounded p-0.5 text-[#b9ac9c] transition hover:text-white"
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
