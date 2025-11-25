import { SITEMAP } from '@/apps/config';
import AuthContext from '@/context/auth.context';
import { Avatar, Button, Layout, Menu, Space, Typography } from 'antd';
import { Home, LogOut, User } from 'lucide-react';
import { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const { Header } = Layout;

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  const menuItems = [
    {
      key: SITEMAP.homepage.path,
      icon: <Home size={18} />,
      label: 'Home',
      onClick: () => navigate(SITEMAP.homepage.path),
    },
  ];

  return (
    <Header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderBottom: '1px solid #f0f0f0',
        padding: '0 24px',
      }}
    >
      <Menu
        mode="horizontal"
        selectedKeys={[location.pathname]}
        items={menuItems}
        style={{
          flex: 1,
          minWidth: 0,
          border: 'none',
        }}
      />

      <Space size="middle">
        <Space
          style={{ cursor: 'pointer' }}
          onClick={() => navigate(SITEMAP.portfolio.path)}
        >
          <Avatar icon={<User size={16} />} />
          <Typography.Text strong>{user?.name}</Typography.Text>
        </Space>

        <Button
          type="text"
          danger
          icon={<LogOut size={18} />}
          onClick={logout}
        >
          Logout
        </Button>
      </Space>
    </Header>
  );
}

export default Navbar;
