import discussionApi from '@/api/discussion.api';
import useApiMessage from '@/hooks/useApiMessage';
import { Form, Input, InputNumber, Modal, Typography } from 'antd';
import { useState } from 'react';

interface CreateDiscussionModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onCreateDiscussion: (discussion: Discussion) => void;
}

function CreateDiscussionModal(props: Readonly<CreateDiscussionModalProps>) {
  const { isOpen, setIsOpen, onCreateDiscussion } = props;
  const [form] = Form.useForm();

  const { displayErrorMessages } = useApiMessage();

  const [isLoading, setIsLoading] = useState(false);

  const onFinish = async (values: DiscussionFormFields) => {
    setIsLoading(true);

    try {
      const payload: DiscussionCreatePayload = {
        title: values.title,
        startingValue: values.initialValue,
      };

      const response = await discussionApi.create(payload);

      onCreateDiscussion(response.data.data);

      form.resetFields();

      setIsOpen(false);
    } catch (error) {
      displayErrorMessages(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setIsOpen(false);
  };

  return (
    <Modal
      title={
        <>
          <Typography.Title level={3}  className='!mb-1'>Create New Discussion</Typography.Title>

          <Typography.Text  type="secondary" >
            Start a new discussion tree with an initial value.</Typography.Text>
        </>
      }

      open={isOpen}
      onOk={form.submit}
      onCancel={handleCancel}
      okText="Create Discussion"
      maskClosable={false}
      okButtonProps={{
        size: 'large',
        loading: isLoading,
      }}
      cancelButtonProps={{
        size: 'large',
        disabled: isLoading,
      }}
    >
      <Form form={form} layout="vertical" onFinish={onFinish} className="!mt-3" size="large">
        <Form.Item<DiscussionFormFields>
          label="Discussion Title"
          name="title"
          rules={[{ required: true }]}
        >
          <Input autoFocus placeholder="Enter a descriptive title..." />
        </Form.Item>

        <Form.Item<DiscussionFormFields>
          label="Initial Value"
          name="initialValue"
          rules={[{ required: true }]}
        >
          <InputNumber placeholder="Enter starting number..." className="!w-full" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default CreateDiscussionModal;
