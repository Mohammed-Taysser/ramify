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

// Helper to calculate subtree width
const calculateSubtreeWidth = (
  operation: TreeOperation,
  horizontalSpacing: number
): number => {
  if (operation.children.length === 0) {
    return horizontalSpacing;
  }

  const childrenWidth = operation.children.reduce((sum, child) => {
    return sum + calculateSubtreeWidth(child, horizontalSpacing);
  }, 0);

  return Math.max(horizontalSpacing, childrenWidth);
};

// Recursive layout function
const assignPositions = (
  operation: TreeOperation,
  x: number,
  y: number,
  horizontalSpacing: number,
  verticalSpacing: number,
  nodes: Node[],
  edges: Edge[]
) => {
  // Add current node
  nodes.push({
    id: `operation-${operation.id}`,
    type: 'operationNode',
    position: { x, y },
    data: operation,
  });

  // Add edge from parent
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

  if (operation.children.length > 0) {
    // Calculate total width of children subtrees
    const childrenWidths = operation.children.map((child) =>
      calculateSubtreeWidth(child, horizontalSpacing)
    );
    const totalChildrenWidth = childrenWidths.reduce((a, b) => a + b, 0);

    // Start positioning children centered below parent
    let currentChildX = x - totalChildrenWidth / 2;

    operation.children.forEach((child, index) => {
      const childWidth = childrenWidths[index];
      // Position child at center of its allocated space
      const childX = currentChildX + childWidth / 2;

      assignPositions(
        child,
        childX,
        y + verticalSpacing,
        horizontalSpacing,
        verticalSpacing,
        nodes,
        edges
      );

      currentChildX += childWidth;
    });
  }
};

// Position nodes using a proper tree layout algorithm
const layoutTree = (
  operations: TreeOperation[],
  horizontalSpacing = 400,
  verticalSpacing = 200
): { nodes: Node[]; edges: Edge[]; } => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  if (operations.length === 0) {
    return { nodes, edges };
  }

  // Handle multiple root nodes (though usually there's one starting point)
  const rootsWidths = operations.map((op) => calculateSubtreeWidth(op, horizontalSpacing));
  const totalRootsWidth = rootsWidths.reduce((a, b) => a + b, 0);

  let currentRootX = -totalRootsWidth / 2;

  operations.forEach((root, index) => {
    const rootWidth = rootsWidths[index];
    const rootX = currentRootX + rootWidth / 2;

    assignPositions(
      root,
      rootX,
      0,
      horizontalSpacing,
      verticalSpacing,
      nodes,
      edges
    );

    currentRootX += rootWidth;
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

