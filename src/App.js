import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { PageLoader } from './components/ui/Misc';
import { RequireAuth } from './context/AuthContext';
import { Landing } from './pages/Landing';
import { TemplatesPage } from './pages/TemplatesPage';
import { TemplatePreviewPage } from './pages/TemplatePreviewPage';
import { AuthPage } from './pages/AuthPage';
import { InvitationPage } from './pages/InvitationPage';
import { AlbumPage } from './pages/AlbumPage';
import { PrivatePreviewPage } from './pages/PrivatePreviewPage';
import { NotFound } from './pages/NotFound';
const StudioPage = lazy(() => import('./pages/StudioPage'));
const DashboardLayout = lazy(() => import('./pages/dashboard/DashboardLayout'));
const DashboardHome = lazy(() => import('./pages/dashboard/DashboardHome'));
const InvitationOverview = lazy(() => import('./pages/dashboard/InvitationOverview'));
const GuestsPage = lazy(() => import('./pages/dashboard/GuestsPage'));
const RsvpPage = lazy(() => import('./pages/dashboard/RsvpPage'));
const MessagesPage = lazy(() => import('./pages/dashboard/MessagesPage'));
const OwnerAlbumPage = lazy(() => import('./pages/dashboard/OwnerAlbumPage'));
const SeatingPage = lazy(() => import('./pages/dashboard/SeatingPage'));
function ScrollToTop() {
    const { pathname } = useLocation();
    useEffect(() => {
        if (window.location.hash)
            return;
        window.scrollTo({ top: 0, behavior: 'auto' });
    }, [pathname]);
    return null;
}
export function App() {
    return (_jsxs(_Fragment, { children: [_jsx(ScrollToTop, {}), _jsx(Suspense, { fallback: _jsx(PageLoader, {}), children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Landing, {}) }), _jsx(Route, { path: "/templates", element: _jsx(TemplatesPage, {}) }), _jsx(Route, { path: "/templates/:templateId", element: _jsx(TemplatePreviewPage, {}) }), _jsx(Route, { path: "/login", element: _jsx(AuthPage, { mode: "login" }) }), _jsx(Route, { path: "/signup", element: _jsx(AuthPage, { mode: "signup" }) }), _jsx(Route, { path: "/i/:slug", element: _jsx(InvitationPage, {}) }), _jsx(Route, { path: "/i/:slug/g/:token", element: _jsx(InvitationPage, {}) }), _jsx(Route, { path: "/i/:slug/album", element: _jsx(AlbumPage, {}) }), _jsx(Route, { path: "/preview/:id", element: _jsx(PrivatePreviewPage, {}) }), _jsx(Route, { path: "/studio/:id", element: _jsx(RequireAuth, { children: _jsx(StudioPage, {}) }) }), _jsxs(Route, { path: "/dashboard", element: _jsx(RequireAuth, { children: _jsx(DashboardLayout, {}) }), children: [_jsx(Route, { index: true, element: _jsx(DashboardHome, {}) }), _jsx(Route, { path: "i/:id", element: _jsx(InvitationOverview, {}) }), _jsx(Route, { path: "i/:id/guests", element: _jsx(GuestsPage, {}) }), _jsx(Route, { path: "i/:id/rsvps", element: _jsx(RsvpPage, {}) }), _jsx(Route, { path: "i/:id/messages", element: _jsx(MessagesPage, {}) }), _jsx(Route, { path: "i/:id/album", element: _jsx(OwnerAlbumPage, {}) }), _jsx(Route, { path: "i/:id/seating", element: _jsx(SeatingPage, {}) })] }), _jsx(Route, { path: "*", element: _jsx(NotFound, {}) })] }) })] }));
}
