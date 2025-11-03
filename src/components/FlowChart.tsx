import { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  NodeMouseHandler,
  useNodesState,
  useEdgesState,
  MarkerType,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { buildPrerequisiteGraph } from '../utils/mermaidParser';
import { findPrerequisitePaths } from '../utils/pathHighlighter';
import CourseNode from './CourseNode';

interface FlowChartProps {
  initialNodes: Node[];
  initialEdges: Edge[];
}

// Register custom node types
const nodeTypes: NodeTypes = {
  courseNode: CourseNode,
};

export default function FlowChart({ initialNodes, initialEdges }: FlowChartProps) {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Build prerequisite graph once
  const prerequisiteGraph = useMemo(
    () => buildPrerequisiteGraph(initialEdges),
    [initialEdges]
  );

  // Calculate which nodes and edges should be highlighted
  const highlighted = useMemo(() => {
    if (!hoveredNodeId) {
      return { nodeIds: new Set<string>(), edgeIds: new Set<string>() };
    }
    return findPrerequisitePaths(hoveredNodeId, prerequisiteGraph, initialEdges);
  }, [hoveredNodeId, prerequisiteGraph, initialEdges]);

  // Handle node hover
  const onNodeMouseEnter: NodeMouseHandler = useCallback((_event, node) => {
    setHoveredNodeId(node.id);
  }, []);

  const onNodeMouseLeave: NodeMouseHandler = useCallback(() => {
    setHoveredNodeId(null);
  }, []);

  // Apply highlighting styles to nodes
  const styledNodes = useMemo(() => {
    return nodes.map(node => ({
      ...node,
      style: {
        ...node.style,
        opacity: hoveredNodeId ? (highlighted.nodeIds.has(node.id) ? 1 : 0.3) : 1,
        backgroundColor: highlighted.nodeIds.has(node.id) ? '#6366f1' : '#fff',
        color: highlighted.nodeIds.has(node.id) ? '#fff' : '#000',
        border: highlighted.nodeIds.has(node.id) ? '2px solid #4f46e5' : '1px solid #ddd',
        transition: 'all 0.2s ease',
        padding: '10px',
        borderRadius: '8px',
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        wordWrap: 'break-word',
        whiteSpace: 'normal',
      },
    }));
  }, [nodes, hoveredNodeId, highlighted.nodeIds]);

  // Apply highlighting styles to edges
  const styledEdges = useMemo(() => {
    return edges.map(edge => {
      const isHighlighted = highlighted.edgeIds.has(edge.id);
      const strokeColor = isHighlighted ? '#6366f1' : '#b1b1b7';

      return {
        ...edge,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: strokeColor,
          width: 12,
          height: 12,
        },
        style: {
          ...edge.style,
          stroke: strokeColor,
          strokeWidth: isHighlighted ? 3 : 2,
          opacity: hoveredNodeId ? (isHighlighted ? 1 : 0.2) : 1,
          transition: 'all 0.2s ease',
        },
        animated: isHighlighted,
      };
    });
  }, [edges, hoveredNodeId, highlighted.edgeIds]);

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ReactFlow
        nodes={styledNodes}
        edges={styledEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        fitView
        minZoom={0.1}
        maxZoom={2}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
