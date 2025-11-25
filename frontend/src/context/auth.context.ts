import { createContext } from 'react';

interface ContextAuthInfo {
  user: Maybe<AuthenticatedUser>;
  setUser: (user: Maybe<AuthenticatedUser>) => void;
  logout: () => void;
}

const AuthContext = createContext<ContextAuthInfo>({
  user: undefined,
  setUser: () => {},
  logout: () => {},
});

AuthContext.displayName = 'Auth Context';

export default AuthContext;
