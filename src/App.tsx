import { useMemo } from 'react';
import FlowChart from './components/FlowChart';
import { parseMermaidDiagram } from './utils/mermaidParser';
import mermaidDiagram from './data/courses.mmd?raw';

function App() {
  const { nodes, edges } = useMemo(() => {
    return parseMermaidDiagram(mermaidDiagram);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <FlowChart initialNodes={nodes} initialEdges={edges} />
    </div>
  );
}

export default App;
