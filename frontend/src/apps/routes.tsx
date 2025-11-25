import ProtectedAuthRoutes from '@/components/permission/ProtectedAuthRoutes';
import PublicRouteGuard from '@/components/permission/PublicRouteGuard';
import { createBrowserRouter } from 'react-router-dom';
import { SITEMAP } from './config';
import ErrorBoundary from './ErrorBoundary';
import lazyPages from './LazyPages';

const routes = createBrowserRouter([
  {
    children: [
      {
        path: SITEMAP.login.path,
        element: (
          <PublicRouteGuard>
            <lazyPages.login />
          </PublicRouteGuard>
        ),
      },
      {
        path: SITEMAP.register.path,
        element: (
          <PublicRouteGuard>
            <lazyPages.register />
          </PublicRouteGuard>
        ),
      },

      {
        path: SITEMAP.homepage.path,
        element: (
          <ProtectedAuthRoutes>
            <lazyPages.homepage />
          </ProtectedAuthRoutes>
        ),
      },
      {
        path: 'discussions/:discussionId',
        element: (
          <ProtectedAuthRoutes>
            <lazyPages.discussionDetail />
          </ProtectedAuthRoutes>
        ),
      },
      {
        path: SITEMAP.portfolio.path,
        element: (
          <ProtectedAuthRoutes>
            <lazyPages.portfolio />
          </ProtectedAuthRoutes>
        ),
      },
      {
        path: SITEMAP.switchUser.path,
        element: (
          <ProtectedAuthRoutes>
            <lazyPages.switchUser />
          </ProtectedAuthRoutes>
        ),
      },
    ],
    errorElement: <ErrorBoundary />,
  },
  {
    path: '*',
    element: <lazyPages.pageNotFound />,
  },
]);

export default routes;
