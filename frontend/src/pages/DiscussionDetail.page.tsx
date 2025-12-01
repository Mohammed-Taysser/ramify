import discussionApi from '@/api/discussion.api';
import operationApi from '@/api/operation.api';
import { SITEMAP } from '@/apps/config';
import DiscussionTree from '@/components/DiscussionTree';
import OperationForm from '@/components/OperationForm';
import TreeVisualization from '@/components/TreeVisualization';
import useApiMessage from '@/hooks/useApiMessage';
import { buildOperationTree, type TreeOperation } from '@/utils/tree.utils';
import { Button, Card, Col, Empty, Modal, Row, Segmented, Skeleton, Space, Tag, Typography } from 'antd';
import { ArrowLeft, Calculator, MessageSquare, Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const { Title, Text } = Typography;

const DiscussionDetail = () => {
  const { discussionId } = useParams();

  const { displayErrorMessages } = useApiMessage();

  const [showOperationForm, setShowOperationForm] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<number | null>();

  const [isLoading, setIsLoading] = useState(true);
  const [fetchedDiscussion, setFetchedDiscussion] = useState<Maybe<Discussion>>();

  const [editingOperation, setEditingOperation] = useState<TreeOperation | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'tree'>('timeline');

  useEffect(() => {
    if (discussionId && !Number.isNaN(Number(discussionId))) {
      fetchDiscussionByID(Number(discussionId));
    }
  }, [discussionId]);

  const fetchDiscussionByID = async (discussionId: number) => {
    setIsLoading(true);

    try {
      const response = await discussionApi.getById(discussionId);
      setFetchedDiscussion(response.data.data);
    } catch (error) {
      displayErrorMessages(error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentValue = useMemo(() => {
    if (!fetchedDiscussion) {
      return 0;
    }

    if (!fetchedDiscussion.operations || fetchedDiscussion.operations.length === 0) {
      return fetchedDiscussion.startingValue;
    }

    // Find the latest operation by createdAt
    if (fetchedDiscussion.operations.length > 0) {
      const latestOperation = [...fetchedDiscussion.operations].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];
      return latestOperation.afterValue;
    }

    return fetchedDiscussion.startingValue;
  }, [fetchedDiscussion]);

  const handleAddRootOperation = () => {
    if (!fetchedDiscussion) return;

    setSelectedParentId(null); // null indicates root operation
    setEditingOperation(null);
    setShowOperationForm(true);
  };

  // End discussion handler
  const handleEndDiscussion = async () => {
    if (!fetchedDiscussion) return;
    try {
      await discussionApi.endDiscussion(fetchedDiscussion.id);
      // Refresh discussion data
      fetchDiscussionByID(fetchedDiscussion.id);
    } catch (error) {
      displayErrorMessages(error);
    }
  };

  const handleEditOperation = (operation: TreeOperation) => {
    setEditingOperation(operation);
    setShowOperationForm(true);
  };

  const handleOperationSubmit = async (type: OperationType, operand: number, title?: string) => {
    if (!fetchedDiscussion) return;

    try {
      if (editingOperation) {
        await operationApi.update(editingOperation.id, {
          operationType: type,
          value: operand,
          title,
        });
      } else {
        await operationApi.create({
          operation: type,
          value: operand,
          parentId: selectedParentId,
          discussionId: fetchedDiscussion.id,
          title,
        });
      }

      setShowOperationForm(false);
      setEditingOperation(null);
      setSelectedParentId(undefined); // Reset parent ID
      fetchDiscussionByID(fetchedDiscussion.id);
    } catch (error) {
      displayErrorMessages(error);
    }
  };

  const handleAddChildOperation = (parentId: number) => {
    if (!fetchedDiscussion) return;

    setSelectedParentId(parentId);
    setEditingOperation(null);
    setShowOperationForm(true);
  };

  const operationTree = useMemo(() => {
    if (!fetchedDiscussion?.operations) return [];
    return buildOperationTree(fetchedDiscussion.operations);
  }, [fetchedDiscussion]);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: '#f5f5f5' }}
    >
      <Modal
        open={showOperationForm}
        onCancel={() => {
          setShowOperationForm(false);
          setEditingOperation(null);
          setSelectedParentId(undefined);
        }}
        footer={null}
      >
        <OperationForm
          currentValue={
            editingOperation
              ? editingOperation.beforeValue
              : selectedParentId === null || selectedParentId === undefined
                ? fetchedDiscussion?.startingValue || 0
                : fetchedDiscussion?.operations.find((op) => op.id === selectedParentId)?.afterValue || 0
          }
          initialValues={
            editingOperation
              ? {
                type: editingOperation.operationType,
                operand: editingOperation.value,
                title: editingOperation.title || '',
              }
              : undefined
          }
          mode={editingOperation ? 'edit' : 'create'}
          onSubmit={handleOperationSubmit}
          onCancel={() => {
            setShowOperationForm(false);
            setEditingOperation(null);
            setSelectedParentId(undefined);
          }}
        />
      </Modal>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link to={SITEMAP.homepage.path}>
            <Button icon={<ArrowLeft className="h-4 w-4" />} className="mb-4" type="text">
              Back to Discussions
            </Button>
          </Link>

          {isLoading && (
            <Card>
              <Skeleton active />
            </Card>
          )}

          {!fetchedDiscussion && !isLoading && (
            <Card>
              <div className="text-center py-16">
                <Empty
                  image={
                    <MessageSquare className="h-16 w-16 mx-auto" style={{ color: '#d9d9d9' }} />
                  }
                  description={
                    <Space direction="vertical" size="small">
                      <Typography.Title level={3}>No discussion found</Typography.Title>
                      <Typography.Text type="secondary">
                        The discussion you are looking for is not found
                      </Typography.Text>
                    </Space>
                  }
                />
              </div>
            </Card>
          )}

          {!isLoading && fetchedDiscussion && (
            <>
              <Row justify="space-between" className="mb-4" align="middle">
                <Col>
                  <Title level={1} style={{ marginBottom: 8 }}>
                    {fetchedDiscussion.title}
                  </Title>

                  <Space>
                    <Space>
                      <Calculator className="h-4 w-4" />
                      <Text strong className="text-xl font-mono">
                        Initial: {fetchedDiscussion.startingValue.toFixed(2)}
                      </Text>
                    </Space>

                    <Text type="secondary">•</Text>
                    <Text
                      strong
                      className={`text-xl font-mono transition-colors duration-300`}
                    >
                      Current: {currentValue.toFixed(2)}
                    </Text>
                  </Space>
                </Col>

                <Col>
                  <Button
                    type="primary"
                    size="large"
                    onClick={handleAddRootOperation}
                    icon={<Plus className="h-5 w-5" />}
                    disabled={!!fetchedDiscussion?.isEnded}
                  >
                    Add Root Operation
                  </Button>

                  {fetchedDiscussion?.isEnded ? (
                    <Tag color="red">Ended</Tag>
                  ) : (
                    <Button type="primary" danger onClick={handleEndDiscussion}>
                      End Discussion
                    </Button>
                  )}
                </Col>
              </Row>

              <Card className="md:!p-4">
                {fetchedDiscussion.operations.length === 0 ? (
                  <div className="text-center py-16">
                    <Empty
                      image={
                        <Calculator className="h-12 w-12 mx-auto" style={{ color: '#d9d9d9' }} />
                      }
                      description={
                        <Space direction="vertical" size="small">
                          <Title level={4}>No operations yet</Title>
                          <Text type="secondary">
                            Add your first operation to start building the tree
                          </Text>
                        </Space>
                      }
                    >
                      <Button
                        type="primary"
                        size="large"
                        icon={<Plus className="h-5 w-5" />}
                        onClick={handleAddRootOperation}
                      >
                        Add Root Operation
                      </Button>
                    </Empty>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-center mb-4">
                      <Segmented
                        options={[
                          { label: 'Timeline View', value: 'timeline' },
                          { label: 'Tree View', value: 'tree' },
                        ]}
                        value={viewMode}
                        onChange={(value) => setViewMode(value as 'timeline' | 'tree')}
                      />
                    </div>
                    {viewMode === 'timeline' ? (
                      <DiscussionTree
                        operations={operationTree}
                        onAddChild={handleAddChildOperation}
                        onEdit={handleEditOperation}
                        isEnded={fetchedDiscussion?.isEnded}
                      />
                    ) : (
                      <TreeVisualization
                        operations={operationTree}
                        onAddChild={handleAddChildOperation}
                        onEdit={handleEditOperation}
                        isEnded={fetchedDiscussion?.isEnded}
                      />
                    )}
                  </>
                )}
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscussionDetail;
