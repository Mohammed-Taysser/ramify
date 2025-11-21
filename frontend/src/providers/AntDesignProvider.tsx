import { LIGHT_ANT_THEME } from '@/apps/config';
import { App as AntDesignApp, ConfigProvider } from 'antd';
import { type PropsWithChildren } from 'react';

function AntDesignProvider(props: Readonly<PropsWithChildren>) {
  const { children } = props;

  return (
    <ConfigProvider
      theme={LIGHT_ANT_THEME}
    >
      <AntDesignApp>{children}</AntDesignApp>
    </ConfigProvider>
  );
}

export default AntDesignProvider;
