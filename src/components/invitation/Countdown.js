import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { timeLeft } from '@/lib/format';
import { t } from './i18n';
export function Countdown({ date, time, lang, compact, }) {
    const [left, setLeft] = useState(() => timeLeft(date, time));
    useEffect(() => {
        const tick = () => setLeft(timeLeft(date, time));
        tick();
        const interval = window.setInterval(tick, 1000);
        return () => window.clearInterval(interval);
    }, [date, time]);
    if (!date)
        return null;
    if (left.past) {
        return (_jsx("p", { className: "inv-scripture text-center", children: "Today is the day. We are so glad you are here." }));
    }
    const units = [
        { value: left.days, label: t(lang, 'days') },
        { value: left.hours, label: t(lang, 'hours') },
        { value: left.minutes, label: t(lang, 'minutes') },
        { value: left.seconds, label: t(lang, 'seconds') },
    ];
    return (_jsx("div", { className: compact ? 'inv-countdown' : 'inv-countdown gap-2', children: units.map((unit) => (_jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "inv-countdown-num tabular-nums", children: String(unit.value).padStart(2, '0') }), _jsx("p", { className: "inv-label mt-1.5", children: unit.label })] }, unit.label))) }));
}
