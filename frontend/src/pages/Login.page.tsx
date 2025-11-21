import authApi from '@/api/auth.api';
import { LOCAL_STORAGE_KEYS, SITEMAP } from '@/apps/config';
import AuthContext from '@/context/auth.context';
import useApiMessage from '@/hooks/useApiMessage';
import { App, Button, Card, Form, Input, Space, Typography } from 'antd';
import { MessageSquare } from 'lucide-react';
import { useContext, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

function LoginPage() {
  const navigateTo = useNavigate();

  const [searchParams] = useSearchParams();

  const { displayErrorMessages } = useApiMessage();

  const app = App.useApp();

  const [form] = Form.useForm<LoginFormFields>();

  const authContext = useContext(AuthContext);

  const [loading, setLoading] = useState(false);

  const onFinish = async (values: LoginFormFields) => {
    setLoading(true);

    try {
      const response = await authApi.login(values);
      const loginResponse = response.data.data;

      app.message.success(`Welcome back, ${loginResponse.user.name}`);

      localStorage.setItem(LOCAL_STORAGE_KEYS.accessToken, loginResponse.accessToken);

      localStorage.setItem(LOCAL_STORAGE_KEYS.refreshToken, loginResponse.refreshToken);

      localStorage.setItem(LOCAL_STORAGE_KEYS.user, JSON.stringify(loginResponse.user));

      authContext.setUser(loginResponse.user);

      const nextUrl = searchParams.get('nextUrl');

      if (nextUrl && nextUrl !== SITEMAP.login.path) {
        navigateTo(nextUrl);
      } else {
        navigateTo('/');
      }
    } catch (error) {
      displayErrorMessages(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#f5f5f5]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Space>
            <MessageSquare className="h-8 w-8 text-aurora" />
            <span className="text-2xl font-bold">Discussion Trees</span>
          </Space>
        </div>

        <Card>
          <Typography.Title level={3} className="!mb-0">
            Welcome back
          </Typography.Title>
          <Typography.Title level={5} className="!mt-1" type="secondary">
            Sign in to your account to continue
          </Typography.Title>

          <Form layout="vertical" onFinish={onFinish} className="!mt-4" size="large" form={form}>
            <Form.Item<LoginFormFields> label="Email" name="email" rules={[{ required: true }, { type: 'email' }]}>
              <Input placeholder="you@example.com" />
            </Form.Item>

            <Form.Item<LoginFormFields> label="Password" name="password" rules={[{ required: true }]}>
              <Input.Password placeholder="••••••••" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
                Sign In
              </Button>
            </Form.Item>
          </Form>

          <div className="text-center mt-4">
            <Typography.Text type="secondary">
              Don't have an account? <Link to="/register">Sign up</Link>
            </Typography.Text>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default LoginPage;
