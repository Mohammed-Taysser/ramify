import { Card, Col, Row, Space, Typography } from 'antd';
import dayjs from 'dayjs';
import { Calculator, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DiscussionCardProps {
  discussion: Discussion;
}

function DiscussionCard(props: Readonly<DiscussionCardProps>) {
  const { discussion } = props;

  return (
    <Link to={`/discussions/${discussion.id}`}>
      <Card className="hover:!border-aurora hover:shadow-lg transition-all duration-300">
        <div className="md:flex items-start justify-between">
          <div className="flex-1">
            <Typography.Title ellipsis level={4} style={{ marginBottom: 8 }}>
              {discussion.title}
            </Typography.Title>

            <Row gutter={16} className="!block md:!flex">
              <Col>
                <Space size="small">
                  <Calculator className="w-4 h-4 text-aurora" />

                  <Typography.Text strong className="!font-mono">
                    {discussion.startingValue.toFixed(2)}
                  </Typography.Text>
                </Space>
              </Col>

              <Col>
                <Space size="small">
                  <Clock className="w-4 h-4" />
                  <Typography.Text type="secondary">
                    Updated {dayjs(discussion.updatedAt).fromNow()}
                  </Typography.Text>
                </Space>
              </Col>
            </Row>
          </div>

          <div className="text-right">
            <Typography.Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
              Operations
            </Typography.Text>

            <Typography.Text strong className="text-xl !text-aurora !font-mono">
              {discussion.operations.length}
            </Typography.Text>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default DiscussionCard;
