import { Layout } from 'antd';
import type { PropsWithChildren } from 'react';
import Navbar from './Navbar';

const { Content } = Layout;

function MainLayout({ children }: PropsWithChildren) {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navbar />
      <Content>{children}</Content>
    </Layout>
  );
}

export default MainLayout;
