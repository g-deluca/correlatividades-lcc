import { Edge } from 'reactflow';

export interface HighlightedPaths {
  nodeIds: Set<string>;
  edgeIds: Set<string>;
}

/**
 * Finds all prerequisite paths leading to a target node
 * Performs a depth-first traversal backwards through the graph
 * @param targetNodeId - The node being hovered
 * @param prerequisiteGraph - Map of node ID to its prerequisites
 * @param edges - Array of all edges in the graph
 * @returns Set of node IDs and edge IDs that should be highlighted
 */
export function findPrerequisitePaths(
  targetNodeId: string,
  prerequisiteGraph: Map<string, string[]>,
  edges: Edge[]
): HighlightedPaths {
  const highlightedNodeIds = new Set<string>();
  const highlightedEdgeIds = new Set<string>();

  // Always include the target node itself
  highlightedNodeIds.add(targetNodeId);

  // DFS to find all prerequisite nodes
  const visited = new Set<string>();

  function dfs(nodeId: string) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    const prerequisites = prerequisiteGraph.get(nodeId) || [];

    for (const prereqId of prerequisites) {
      highlightedNodeIds.add(prereqId);

      // Find and highlight the edge connecting prereqId -> nodeId
      const edge = edges.find(
        e => e.source === prereqId && e.target === nodeId
      );
      if (edge) {
        highlightedEdgeIds.add(edge.id);
      }

      // Recursively traverse prerequisites
      dfs(prereqId);
    }
  }

  dfs(targetNodeId);

  return {
    nodeIds: highlightedNodeIds,
    edgeIds: highlightedEdgeIds,
  };
}
