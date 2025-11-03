import { Node, Edge } from 'reactflow';
import dagre from 'dagre';

export interface CourseNode {
  id: string;
  label: string;
}

export interface CourseEdge {
  source: string;
  target: string;
}

/**
 * Parses a Mermaid flowchart diagram and extracts nodes and edges
 * @param mermaidText - The Mermaid diagram text
 * @returns Object containing parsed nodes and edges
 */
export function parseMermaidDiagram(mermaidText: string): {
  nodes: Node[];
  edges: Edge[];
} {
  let lines = mermaidText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('%%')); // Remove comments and empty lines

  // Remove YAML frontmatter if present (between --- markers)
  const frontmatterStart = lines.findIndex(line => line === '---');
  if (frontmatterStart !== -1) {
    const frontmatterEnd = lines.findIndex((line, idx) => idx > frontmatterStart && line === '---');
    if (frontmatterEnd !== -1) {
      lines = [...lines.slice(0, frontmatterStart), ...lines.slice(frontmatterEnd + 1)];
    }
  }

  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const nodeMap = new Map<string, string>(); // id -> label

  // Skip the first line if it's "graph" or "flowchart"
  const contentLines = lines.filter(
    line => !line.match(/^(graph|flowchart)\s+/)
  );

  for (const line of contentLines) {
    // Match edges with multi-target support: A --> B & C & D
    // First, check if line contains -->
    if (line.includes('-->')) {
      const [sourceStr, targetsStr] = line.split('-->').map(s => s.trim());

      // Parse source node
      const sourceMatch = sourceStr.match(/([\w-]+)(?:\[([^\]]+)\])?/);
      if (!sourceMatch) continue;

      const [, sourceId, sourceLabel] = sourceMatch;

      // Store source node
      if (sourceLabel && !nodeMap.has(sourceId)) {
        nodeMap.set(sourceId, sourceLabel);
      }
      if (!nodeMap.has(sourceId)) {
        nodeMap.set(sourceId, sourceId);
      }

      // Parse target nodes (split by &)
      const targetParts = targetsStr.split('&').map(s => s.trim());

      for (const targetPart of targetParts) {
        const targetMatch = targetPart.match(/([\w-]+)(?:\[([^\]]+)\])?/);
        if (!targetMatch) continue;

        const [, targetId, targetLabel] = targetMatch;

        // Store target node
        if (targetLabel && !nodeMap.has(targetId)) {
          nodeMap.set(targetId, targetLabel);
        }
        if (!nodeMap.has(targetId)) {
          nodeMap.set(targetId, targetId);
        }

        // Create edge
        edges.push({
          id: `${sourceId}-${targetId}`,
          source: sourceId,
          target: targetId,
          type: 'smoothstep',
        });
      }
    }
    // Match standalone node definitions: A[Label]
    else {
      const nodeMatch = line.match(/([\w-]+)\[([^\]]+)\]/);
      if (nodeMatch) {
        const [, nodeId, nodeLabel] = nodeMatch;
        if (!nodeMap.has(nodeId)) {
          nodeMap.set(nodeId, nodeLabel);
        }
      }
    }
  }

  // Convert nodes to ReactFlow format with Dagre layout
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Configure the layout
  dagreGraph.setGraph({
    rankdir: 'LR', // Left to right layout (same as flowchart LR)
    nodesep: 80,   // Horizontal spacing between nodes
    ranksep: 200,  // Vertical spacing between ranks
  });

  // Add nodes to dagre graph
  nodeMap.forEach((label, id) => {
    dagreGraph.setNode(id, {
      width: 250,  // Estimated node width
      height: 80   // Estimated node height
    });
  });

  // Add edges to dagre graph
  for (const edge of edges) {
    dagreGraph.setEdge(edge.source, edge.target);
  }

  // Calculate layout
  dagre.layout(dagreGraph);

  // Create ReactFlow nodes with calculated positions
  nodeMap.forEach((label, id) => {
    const nodeWithPosition = dagreGraph.node(id);
    nodes.push({
      id,
      data: { label },
      position: {
        x: nodeWithPosition.x - nodeWithPosition.width / 2,
        y: nodeWithPosition.y - nodeWithPosition.height / 2,
      },
      type: 'courseNode',
      style: {
        width: 250,
        height: 80,
      },
    });
  });

  return { nodes, edges };
}

/**
 * Builds an adjacency list representing prerequisite relationships
 * @param edges - Array of edges from the parsed diagram
 * @returns Map of node ID to array of prerequisite node IDs
 */
export function buildPrerequisiteGraph(edges: Edge[]): Map<string, string[]> {
  const graph = new Map<string, string[]>();

  for (const edge of edges) {
    if (!graph.has(edge.target)) {
      graph.set(edge.target, []);
    }
    graph.get(edge.target)!.push(edge.source);
  }

  return graph;
}
