import { SITEMAP } from '@/apps/config';
import { useContext, type PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthContext from '@/context/auth.context';
 
const ProtectedAuthRoutes = (props: PropsWithChildren) => {
  const { children,   } = props;

  const authContext = useContext(AuthContext);
  const location = useLocation();

  if (!authContext.user) {
    return (
      <Navigate
        to={`${SITEMAP.login.path}?nextUrl=${location.pathname}`}
        replace
      />
    );
  }
 

  return children;
};

export default ProtectedAuthRoutes;
