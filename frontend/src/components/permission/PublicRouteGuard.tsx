import { type PropsWithChildren, useContext } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import AuthContext from '@/context/auth.context';
import { SITEMAP } from '@/apps/config';
 
const PublicRouteGuard = (props: PropsWithChildren) => {
  const { children } = props;

  const authContext = useContext(AuthContext);

  const [searchParams] = useSearchParams();

  const nextUrl = searchParams.get('nextUrl');

  if (authContext.user) {
    return <Navigate to={nextUrl ?? SITEMAP.homepage.path} />;
  }

  return children;
};

export default PublicRouteGuard;
