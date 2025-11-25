import authApi from '@/api/auth.api';
import userApi from '@/api/user.api';
import { LOCAL_STORAGE_KEYS, SITEMAP } from '@/apps/config';
import AuthContext from '@/context/auth.context';
import useApiMessage from '@/hooks/useApiMessage';
import { SwapOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, message, Space, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface UserListItem {
  id: number;
  name: string;
  email: string;
}

function SwitchUserPage() {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);
  const { displayErrorMessages } = useApiMessage();

  const [users, setUsers] = useState<UserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [switchingUserId, setSwitchingUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);

    try {
      const response = await userApi.getList();

      // The API returns data directly in response.data.data as an array
      const userList = response.data.data;
      console.log('Users:', userList);
      setUsers(userList);
    } catch (error) {
      displayErrorMessages(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchUser = async (userId: number) => {
    setSwitchingUserId(userId);

    try {
      const response = await authApi.switchUser(userId);
      const { accessToken, refreshToken, user } = response.data.data;

      // Save tokens and user
      localStorage.setItem(LOCAL_STORAGE_KEYS.accessToken, accessToken);
      localStorage.setItem(LOCAL_STORAGE_KEYS.refreshToken, refreshToken);
      localStorage.setItem(LOCAL_STORAGE_KEYS.user, JSON.stringify(user));

      // Update context
      setUser(user);

      message.success(`Switched to ${user.name}`);
      navigate(SITEMAP.homepage.path);
    } catch (error) {
      displayErrorMessages(error);
    } finally {
      setSwitchingUserId(null);
    }
  };

  const columns: ColumnsType<UserListItem> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Action',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Button
          type="primary"
          icon={<SwapOutlined />}
          loading={switchingUserId === record.id}
          onClick={() => handleSwitchUser(record.id)}
        >
          Switch
        </Button>
      ),
    },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Card>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Typography.Title level={2}>
                <UserOutlined /> Switch User
              </Typography.Title>
              <Typography.Text type="secondary">
                Select a user to log in as (Development/Admin Feature)
              </Typography.Text>
            </div>

            <Table
              columns={columns}
              dataSource={users}
              rowKey="id"
              loading={isLoading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} users`,
              }}
            />
          </Space>
        </Card>
      </div>
    </div>
  );
}

export default SwitchUserPage;
