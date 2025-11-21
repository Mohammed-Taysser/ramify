import authApi from '@/api/auth.api';
import { LOCAL_STORAGE_KEYS, SITEMAP } from '@/apps/config';
import AuthContext from '@/context/auth.context';
import useApiMessage from '@/hooks/useApiMessage';
import { App, Button, Card, Form, Input, Space, Typography } from 'antd';
import { MessageSquare } from 'lucide-react';
import { useContext, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

function RegisterPage() {
  const navigateTo = useNavigate();

  const [searchParams] = useSearchParams();

  const { displayErrorMessages } = useApiMessage();

  const app = App.useApp();

  const [form] = Form.useForm<RegisterFormFields>();

  const authContext = useContext(AuthContext);

  const [loading, setLoading] = useState(false);

  const onFinish = async (values: RegisterFormFields) => {
    setLoading(true);

    try {
      const payload: RegisterRequestPayload = {
        name: values.name,
        email: values.email,
        password: values.password,
      };

      const response = await authApi.register(payload);
      const registerResponse = response.data.data;

      app.message.success(`Welcome, ${registerResponse.user.name}`);

      localStorage.setItem(LOCAL_STORAGE_KEYS.accessToken, registerResponse.accessToken);

      localStorage.setItem(LOCAL_STORAGE_KEYS.refreshToken, registerResponse.refreshToken);

      localStorage.setItem(LOCAL_STORAGE_KEYS.user, JSON.stringify(registerResponse.user));

      authContext.setUser(registerResponse.user);

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
          <Typography.Title level={3}>Create an account</Typography.Title>
          <Typography.Title level={5} className="!mb-0 !mt-2" type="secondary">
            Start exploring mathematical discussions
          </Typography.Title>

          <Form layout="vertical" onFinish={onFinish} className="!mt-3" size="large" form={form}>
            <Form.Item<RegisterFormFields> label="Name" name="name" rules={[{ required: true }]}>
              <Input placeholder="John Doe" />
            </Form.Item>

            <Form.Item<RegisterFormFields>
              label="Email"
              name="email"
              rules={[{ required: true }, { type: 'email' }]}
            >
              <Input placeholder="you@example.com" />
            </Form.Item>

            <Form.Item<RegisterFormFields>
              label="Password"
              name="password"
              rules={[{ required: true }, { min: 8 }]}
            >
              <Input.Password placeholder="••••••••" />
            </Form.Item>

            <Form.Item<RegisterFormFields>
              label="Confirm Password"
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                {
                  required: true,
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error('The new password that you entered do not match!')
                    );
                  },
                }),
              ]}
            >
              <Input.Password placeholder="••••••••" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
                Create Account
              </Button>
            </Form.Item>
          </Form>

          <div className="text-center mt-4">
            <Typography.Text type="secondary">
              Already have an account? <Link to="/login">Sign in</Link>
            </Typography.Text>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default RegisterPage;
