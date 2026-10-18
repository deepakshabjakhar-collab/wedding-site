import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useMemo, useState, } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, Info, X } from 'lucide-react';
const ToastContext = createContext(null);
let nextId = 1;
export function ToastProvider({ children }) {
    const [items, setItems] = useState([]);
    const reduce = useReducedMotion();
    const push = useCallback((message, tone = 'success') => {
        const id = nextId++;
        setItems((prev) => [...prev.slice(-3), { id, message, tone }]);
        window.setTimeout(() => {
            setItems((prev) => prev.filter((item) => item.id !== id));
        }, 4200);
    }, []);
    const value = useMemo(() => ({ push }), [push]);
    return (_jsxs(ToastContext.Provider, { value: value, children: [children, _jsx("div", { className: "pointer-events-none fixed inset-x-0 bottom-5 z-[100] flex flex-col items-center gap-2 px-4", role: "status", "aria-live": "polite", children: _jsx(AnimatePresence, { children: items.map((item) => (_jsxs(motion.div, { initial: reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: reduce ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }, transition: { duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }, className: "pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-xl border border-[#3a3028] bg-[#241d18] px-4 py-3 text-sm text-[#f7f0e6] shadow-2xl", children: [_jsx("span", { className: `mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full ${item.tone === 'error'
                                    ? 'bg-[#8a3f31] text-[#ffe9e4]'
                                    : item.tone === 'info'
                                        ? 'bg-[#4a4137] text-[#f7f0e6]'
                                        : 'bg-[#6e7f62] text-[#f2f7ee]'}`, children: item.tone === 'error' ? _jsx(X, { size: 12 }) : item.tone === 'info' ? _jsx(Info, { size: 12 }) : _jsx(Check, { size: 12 }) }), _jsx("span", { className: "leading-snug", children: item.message }), _jsx("button", { type: "button", onClick: () => setItems((prev) => prev.filter((i) => i.id !== item.id)), className: "ml-auto flex-none rounded p-0.5 text-[#b9ac9c] transition hover:text-white", "aria-label": "Dismiss notification", children: _jsx(X, { size: 14 }) })] }, item.id))) }) })] }));
}
export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx)
        throw new Error('useToast must be used inside ToastProvider');
    return ctx;
}
