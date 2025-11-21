import { createContext } from 'react';

interface ContextAuthInfo {
  user: Maybe<AuthenticatedUser>;
  setUser: (user: Maybe<AuthenticatedUser>) => void;
}


const AuthContext = createContext<ContextAuthInfo>({
  user: undefined,
  setUser: () => {},
});

AuthContext.displayName = 'Auth Context';

export default AuthContext;
