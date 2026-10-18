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
    if (window.location.hash) return;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}

export function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/templates/:templateId" element={<TemplatePreviewPage />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/signup" element={<AuthPage mode="signup" />} />
          <Route path="/i/:slug" element={<InvitationPage />} />
          <Route path="/i/:slug/g/:token" element={<InvitationPage />} />
          <Route path="/i/:slug/album" element={<AlbumPage />} />
          <Route path="/preview/:id" element={<PrivatePreviewPage />} />
          <Route
            path="/studio/:id"
            element={
              <RequireAuth>
                <StudioPage />
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <DashboardLayout />
              </RequireAuth>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="i/:id" element={<InvitationOverview />} />
            <Route path="i/:id/guests" element={<GuestsPage />} />
            <Route path="i/:id/rsvps" element={<RsvpPage />} />
            <Route path="i/:id/messages" element={<MessagesPage />} />
            <Route path="i/:id/album" element={<OwnerAlbumPage />} />
            <Route path="i/:id/seating" element={<SeatingPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}
