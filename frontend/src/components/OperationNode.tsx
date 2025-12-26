import { getOperationColor, getOperationSymbol } from '@/utils/operation.utils';
import type { TreeOperation } from '@/utils/tree.utils';
import { Button, Card, Space, Typography } from 'antd';
import { Edit, Plus } from 'lucide-react';
import { memo } from 'react';
import type { NodeProps } from 'reactflow';
import { Handle, Position } from 'reactflow';

const { Text } = Typography;

interface OperationNodeData {
  operation: TreeOperation;
  onAddChild: (id: number) => void;
  onEdit: (operation: TreeOperation) => void;
  isEnded?: boolean;
}

const OperationNode = ({ data }: NodeProps<OperationNodeData>) => {
  const { operation, onAddChild, onEdit, isEnded } = data;
  const symbol = getOperationSymbol(operation.operationType);
  const color = getOperationColor(operation.operationType);

  return (
    <div className="operation-node">
      <Handle type="target" position={Position.Top} />

      <Card
        className="shadow-md"
        style={{
          minWidth: 280,
          borderLeft: `4px solid ${color}`,
        }}
        bodyStyle={{ padding: '12px 16px' }}
      >
        <Space direction="vertical" size="small" className="w-full">
          {/* Operation Type and Symbol */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="text-white text-lg flex justify-center items-center w-7 h-7 rounded-full"
                style={{ backgroundColor: color }}
              >
                <span>{symbol}</span>
              </div>
              <Text strong className="text-base">
                {operation.operationType}
              </Text>
            </div>
            <Text type="secondary" className="text-xs">
              #{operation.id}
            </Text>
          </div>

          {/* Title if exists */}
          {operation.title && (
            <Text className="text-sm" style={{ fontStyle: 'italic' }}>
              "{operation.title}"
            </Text>
          )}

          {/* Calculation */}
          <div className="flex items-center gap-2 font-mono text-sm">
            <Text>{operation.beforeValue.toFixed(2)}</Text>
            <Text strong style={{ color }}>
              {symbol} {operation.value.toFixed(2)}
            </Text>
            <Text>=</Text>
            <Text strong className="text-base">
              {operation.afterValue.toFixed(2)}
            </Text>
          </div>

          {/* Action Buttons */}
          {!isEnded && (
            <div className="flex gap-2 mt-2">
              <Button
                size="small"
                icon={<Plus className="h-3 w-3" />}
                onClick={() => onAddChild(operation.id)}
                className="flex-1"
              >
                Add Child
              </Button>
              <Button
                size="small"
                icon={<Edit className="h-3 w-3" />}
                onClick={() => onEdit(operation)}
              >
                Edit
              </Button>
            </div>
          )}
        </Space>
      </Card>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default memo(OperationNode);
