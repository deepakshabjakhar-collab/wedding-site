import { useEffect, useState } from 'react';
import { timeLeft } from '@/lib/format';
import { t, type InvitationLang } from './i18n';

export function Countdown({
  date,
  time,
  lang,
  compact,
}: {
  date: string;
  time: string;
  lang: InvitationLang;
  compact?: boolean;
}) {
  const [left, setLeft] = useState(() => timeLeft(date, time));

  useEffect(() => {
    const tick = () => setLeft(timeLeft(date, time));
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [date, time]);

  if (!date) return null;

  if (left.past) {
    return (
      <p className="inv-scripture text-center">
        Today is the day. We are so glad you are here.
      </p>
    );
  }

  const units = [
    { value: left.days, label: t(lang, 'days') },
    { value: left.hours, label: t(lang, 'hours') },
    { value: left.minutes, label: t(lang, 'minutes') },
    { value: left.seconds, label: t(lang, 'seconds') },
  ];

  return (
    <div className={compact ? 'inv-countdown' : 'inv-countdown gap-2'}>
      {units.map((unit) => (
        <div key={unit.label} className="min-w-0">
          <p className="inv-countdown-num tabular-nums">{String(unit.value).padStart(2, '0')}</p>
          <p className="inv-label mt-1.5">{unit.label}</p>
        </div>
      ))}
    </div>
  );
}
