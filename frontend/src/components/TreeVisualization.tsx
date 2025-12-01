import OperationNode from '@/components/OperationNode';
import type { TreeOperation } from '@/utils/tree.utils';
import { useEffect, useMemo } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface TreeVisualizationProps {
  operations: TreeOperation[];
  onAddChild: (id: number) => void;
  onEdit: (operation: TreeOperation) => void;
  isEnded?: boolean;
}

const nodeTypes = {
  operationNode: OperationNode,
};

// Position nodes using a proper tree layout algorithm
const layoutTree = (
  operations: TreeOperation[],
  horizontalSpacing = 400,
  verticalSpacing = 200,
  currentX = 0,
  currentY = 0,
  nodes: Node[] = [],
  edges: Edge[] = []
): { nodes: Node[]; edges: Edge[]; } => {
  if (operations.length === 0) {
    return { nodes, edges };
  }

  // Calculate total width needed for all operations at this level
  const totalWidth = operations.length * horizontalSpacing;
  let xOffset = currentX - totalWidth / 2;

  operations.forEach((operation) => {
    // Calculate x position for this node
    const nodeX = xOffset + horizontalSpacing / 2;
    const nodeY = currentY;

    // Create node
    nodes.push({
      id: `operation-${operation.id}`,
      type: 'operationNode',
      position: { x: nodeX, y: nodeY },
      data: operation,
    });

    // Create edge from parent if it exists
    if (operation.parentId !== null) {
      edges.push({
        id: `edge-${operation.parentId}-${operation.id}`,
        source: `operation-${operation.parentId}`,
        target: `operation-${operation.id}`,
        animated: true,
        style: {
          stroke: '#666',
          strokeWidth: 2,
        },
        type: 'smoothstep',
      });
    }

    // Recursively layout children
    if (operation.children.length > 0) {
      layoutTree(
        operation.children,
        horizontalSpacing,
        verticalSpacing,
        nodeX, // Center children under this node
        currentY + verticalSpacing,
        nodes,
        edges
      );
    }

    xOffset += horizontalSpacing;
  });

  return { nodes, edges };
};

const TreeVisualization = ({ operations, onAddChild, onEdit, isEnded }: TreeVisualizationProps) => {
  // Convert operations to ReactFlow nodes and edges with proper layout
  const initialLayout = useMemo(() => {
    const { nodes: calculatedNodes, edges: calculatedEdges } = layoutTree(operations);

    // Add operation data with handlers to each node
    const nodesWithData = calculatedNodes.map((node) => ({
      ...node,
      data: {
        operation: node.data,
        onAddChild,
        onEdit,
        isEnded,
      },
    }));

    return { nodes: nodesWithData, edges: calculatedEdges };
  }, [operations, onAddChild, onEdit, isEnded]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialLayout.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialLayout.edges);

  // Update nodes and edges when operations change
  useEffect(() => {
    setNodes(initialLayout.nodes);
    setEdges(initialLayout.edges);
  }, [initialLayout, setNodes, setEdges]);

  if (!operations || operations.length === 0) {
    return null;
  }

  return (
    <div style={{ width: '100%', height: '700px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{
          padding: 0.2,
          minZoom: 0.1,
          maxZoom: 1.2,
        }}
        minZoom={0.1}
        maxZoom={1.5}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
          color="#d0d0d0"
        />
        <Controls />
        <MiniMap
          nodeColor={() => '#e0e0e0'}
          maskColor="rgba(0, 0, 0, 0.1)"
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  );
};

export default TreeVisualization;

