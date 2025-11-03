import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

function CourseNode({ data }: NodeProps) {
  return (
    <>
      {/* Left side handle (input - where prerequisites connect TO) */}
      <Handle
        type="target"
        position={Position.Left}
      />

      {/* Node content */}
      <div style={{ padding: '10px' }}>
        {data.label}
      </div>

      {/* Right side handle (output - where this course connects FROM) */}
      <Handle
        type="source"
        position={Position.Right}
      />
    </>
  );
}

export default memo(CourseNode);
