import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, LogOut, Menu, Plus, X } from 'lucide-react';
import type { InvitationSummary } from '@shared/types';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/ui/Misc';
import { buttonClass } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/Misc';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [invitations, setInvitations] = useState<InvitationSummary[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    api.invitations
      .list()
      .then((result) => alive && setInvitations(result.invitations))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [location.pathname]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const nav = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 px-4 py-4">
        <Logo />
      </div>

      <div className="px-3">
        <Link to="/templates" className={buttonClass('primary', 'sm', 'w-full')}>
          <Plus size={13} /> New invitation
        </Link>
      </div>

      <nav className="mt-4 flex-1 overflow-y-auto px-3 pb-4" aria-label="Dashboard">
        <NavLink
          to="/dashboard"
          end
          className={({ isActive }) => `dash-link ${isActive ? '' : ''}`}
          data-active={location.pathname === '/dashboard'}
        >
          <LayoutDashboard size={15} /> All invitations
        </NavLink>

        <p className="mt-5 px-2 pb-1 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-muted">
          Your weddings
        </p>
        {invitations.length === 0 && (
          <p className="px-2 py-1 text-[0.75rem] text-muted">Nothing yet — start with a design.</p>
        )}
        <ul className="space-y-1">
          {invitations.map((invitation) => {
            const active = location.pathname.includes(invitation.id);
            return (
              <li key={invitation.id}>
                <Link
                  to={`/dashboard/i/${invitation.id}`}
                  className="flex flex-col gap-1 rounded-lg px-2 py-2 transition hover:bg-ink/5"
                  data-active={active}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate font-display text-[1.02rem] leading-tight text-ink">
                      {invitation.data.coupleA} &amp; {invitation.data.coupleB}
                    </span>
                  </span>
                  <span className="flex items-center gap-2">
                    <StatusPill status={invitation.status} />
                    <span className="truncate text-[0.66rem] text-muted">
                      {invitation.counts.attending} attending · {invitation.counts.pending} waiting
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-line/70 p-3">
        <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
          <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-ink text-[0.62rem] font-semibold text-paper">
            {(user?.name ?? 'V').slice(0, 1).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[0.78rem] font-medium text-ink">{user?.name}</span>
            <span className="block truncate text-[0.66rem] text-muted">{user?.email}</span>
          </span>
        </div>
        <button
          type="button"
          onClick={async () => {
            await logout();
            navigate('/');
          }}
          className="dash-link w-full"
        >
          <LogOut size={15} /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="dash-shell">
      <div className="mx-auto flex min-h-svh w-full max-w-[100rem]">
        <aside className="sticky top-0 hidden h-svh w-[260px] flex-none border-r border-line/70 bg-[#fbf7ef]/80 lg:block">
          {nav}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-line/70 bg-[#f6f1e7]/95 px-4 py-3 backdrop-blur lg:hidden">
            <Logo compact />
            <button type="button" className="icon-btn" onClick={() => setOpen(true)} aria-label="Open menu">
              <Menu size={17} />
            </button>
          </header>

          <main className="min-w-0 flex-1">
            <Outlet />
          </main>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[80] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-[#1b1510]/50"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            />
            <motion.aside
              className="absolute inset-y-0 left-0 w-[280px] border-r border-line bg-[#fbf7ef]"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
            >
              <button
                type="button"
                className="icon-btn absolute right-3 top-3 z-10"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <X size={16} />
              </button>
              {nav}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
