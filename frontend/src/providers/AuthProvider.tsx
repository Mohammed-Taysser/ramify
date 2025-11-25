

import authApi from '@/api/auth.api';
import { LOCAL_STORAGE_KEYS } from '@/apps/config';
import Loader from '@/components/common/Loader';
import AuthContext from '@/context/auth.context';
import useApiMessage from '@/hooks/useApiMessage';
import { type PropsWithChildren, useEffect, useMemo, useState } from 'react';

const getUserInfoFromLocalStorage = () => {
  try {
    const userInfo = localStorage.getItem(LOCAL_STORAGE_KEYS.user);

    if (userInfo) {
      return JSON.parse(userInfo) as AuthenticatedUser;
    }

    return undefined;
  } catch (error) {
    console.error('Failed to parse user info from localStorage:', error);
    return undefined;
  }
};

function AuthProvider(props: Readonly<PropsWithChildren>) {
  const { displayErrorMessages } = useApiMessage();

  const [user, setUser] = useState<Maybe<AuthenticatedUser>>(getUserInfoFromLocalStorage);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    setIsLoading(true);

    try {
      const response = await authApi.me();
      const userInfo = response.data.data;
      setUser(userInfo);
    } catch (error) {
      displayErrorMessages(error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.accessToken);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.refreshToken);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.user);
    setUser(undefined);
  };

  const value = useMemo(() => ({ user, setUser, logout }), [user]);

  return (
    <AuthContext.Provider value={value}>
      {isLoading ? <Loader /> : props.children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
