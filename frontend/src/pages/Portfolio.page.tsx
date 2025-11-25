import discussionApi from '@/api/discussion.api';
import DiscussionCard from '@/components/DiscussionCard';
import AuthContext from '@/context/auth.context';
import useApiMessage from '@/hooks/useApiMessage';
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  MessageOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Card, Col, Divider, Empty, Row, Skeleton, Space, Statistic, Timeline, Typography } from 'antd';
import dayjs from 'dayjs';
import { useContext, useEffect, useState } from 'react';

function PortfolioPage() {
  const { user } = useContext(AuthContext);
  const { displayErrorMessages } = useApiMessage();

  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDiscussions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchDiscussions = async () => {
    setIsLoading(true);

    try {
      const response = await discussionApi.getList({
        userId: user?.id,
      });

      setDiscussions(response.data.data.data);
    } catch (error) {
      displayErrorMessages(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  const activeDiscussions = discussions.filter((d) => !d.endedAt).length;
  const completedDiscussions = discussions.filter((d) => d.endedAt).length;
  const totalDiscussions = discussions.length;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header Section */}
        <Card style={{ marginBottom: 24 }}>
          <Space size="large">
            <Avatar size={64} icon={<UserOutlined />} />
            <div>
              <Typography.Title level={2} style={{ margin: 0 }}>
                {user.name}
              </Typography.Title>
              <Typography.Text type="secondary">{user.email}</Typography.Text>
              <br />
              <Typography.Text type="secondary">
                <CalendarOutlined /> Member since {dayjs(user.createdAt).format('MMM YYYY')}
              </Typography.Text>
            </div>
          </Space>
        </Card>

        {/* Stats Section */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Total Discussions"
                value={totalDiscussions}
                prefix={<MessageOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Active"
                value={activeDiscussions}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Completed"
                value={completedDiscussions}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        <Divider />

        {/* Discussions Timeline */}
        <Typography.Title level={4}>
          <MessageOutlined /> Discussion Timeline
        </Typography.Title>

        <Card>
          {isLoading && <Skeleton active paragraph={{ rows: 6 }} />}

          {!isLoading && discussions.length === 0 && (
            <Empty description="You haven't created any discussions yet." />
          )}

          {!isLoading && discussions.length > 0 && (
            <Timeline
              mode="left"
              items={discussions.map((discussion) => ({
                color: discussion.endedAt ? 'gray' : 'blue',
                dot: discussion.endedAt ? <CheckCircleOutlined /> : <ClockCircleOutlined />,
                children: <DiscussionCard key={discussion.id} discussion={discussion} />,
                label: dayjs(discussion.createdAt).format('MMM D, YYYY'),
              }))}
            />
          )}
        </Card>
      </div>
    </div>
  );
}

export default PortfolioPage;
