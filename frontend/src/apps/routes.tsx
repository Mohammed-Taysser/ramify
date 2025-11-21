import { createBrowserRouter } from 'react-router-dom';
import ProtectedAuthRoutes from '@/components/permission/ProtectedAuthRoutes';
import PublicRouteGuard from '@/components/permission/PublicRouteGuard';
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
    ],
    errorElement: <ErrorBoundary />,
  },
  {
    path: '*',
    element: <lazyPages.pageNotFound />,
  },
]);

export default routes;
