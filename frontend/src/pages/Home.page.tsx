import discussionApi from '@/api/discussion.api';
import CreateDiscussionModal from '@/components/CreateDiscussionModal';
import DiscussionCard from '@/components/DiscussionCard';
import AuthContext from '@/context/auth.context';
import useApiMessage from '@/hooks/useApiMessage';
import { Button, Card, Col, Empty, Row, Skeleton, Space, Typography } from 'antd';
import { MessageSquare, Plus } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';

function HomePage() {
  const authContext = useContext(AuthContext);

  const { displayErrorMessages } = useApiMessage();

  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDiscussions();
  }, []);

  const fetchDiscussions = async () => {
    setIsLoading(true);

    try {
      const response = await discussionApi.getList({
        userId: authContext.user?.id,
      });

      setDiscussions(response.data.data.data);
    } catch (error) {
      displayErrorMessages(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onCreateDiscussion = () => {
    fetchDiscussions();
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex items-center justify-between mb-8">
          <div className="mb-3 md:mb-3">
            <Space align="center">
              <MessageSquare className="h-10 w-10 text-aurora" />
              <Typography.Title level={1} style={{ margin: 0 }}>
                Discussion Trees
              </Typography.Title>
            </Space>

            <Typography.Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
              Create and explore mathematical operation discussions
            </Typography.Text>
          </div>

          <Space>
            <Button
              size="large"
              type="primary"
              onClick={() => setIsDialogOpen(true)}
              icon={<Plus className="h-5 w-5" />}
            >
              New Discussion
            </Button>
          </Space>
        </div>

        <Card>
          {isLoading && <Skeleton active />}

          {!isLoading && discussions.length === 0 && (
            <div className="text-center py-16">
              <Empty
                image={<MessageSquare className="h-16 w-16 mx-auto" style={{ color: '#d9d9d9' }} />}
                description={
                  <Space direction="vertical" size="small">
                    <Typography.Title level={3}>No discussions yet</Typography.Title>
                    <Typography.Text type="secondary">
                      Create your first discussion to start exploring mathematical operations
                    </Typography.Text>
                  </Space>
                }
              >
                <Button
                  size="large"
                  type="primary"
                  onClick={() => setIsDialogOpen(true)}
                  icon={<Plus className="h-5 w-5" />}
                >
                  Create First Discussion
                </Button>
              </Empty>
            </div>
          )}

          {!isLoading && discussions.length > 0 && (
            <Row gutter={[16, 16]} justify="center">
              {discussions.map((discussion) => (
                <Col xs={24} md={12} key={discussion.id}>
                  <DiscussionCard key={discussion.id} discussion={discussion} />
                </Col>
              ))}
            </Row>
          )}
        </Card>
      </div>

      <CreateDiscussionModal
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        onCreateDiscussion={onCreateDiscussion}
      />
    </div>
  );
}

export default HomePage;
