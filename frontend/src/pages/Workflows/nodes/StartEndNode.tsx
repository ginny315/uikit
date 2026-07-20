/**
 * StartEndNode — ReactFlow 自定义节点：工作流开始/结束标记
 *
 * 圆角胶囊形，视觉上与 AgentNode 区分开。
 * Start 节点只有输出 handle，End 节点只有输入 handle。
 */
import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { IconPlayerPlay, IconCircleCheck } from '@tabler/icons-react';
import classes from './StartEndNode.module.css';

interface StartEndData {
  label: string;
}

function StartEndNodeComponent({ data, type }: NodeProps) {
  const nodeData = data as unknown as StartEndData;
  const isStart = type === 'start';

  return (
    <div className={`${classes.capsule} ${isStart ? classes.start : classes.end}`}>
      {!isStart && (
        <Handle
          type="target"
          position={Position.Top}
          className={classes.handle}
          id="top"
        />
      )}

      <div className={classes.body}>
        {isStart ? (
          <IconPlayerPlay size={13} className={classes.startIcon} />
        ) : (
          <IconCircleCheck size={13} className={classes.endIcon} />
        )}
        <span className={classes.label}>{nodeData.label}</span>
      </div>

      {isStart && (
        <Handle
          type="source"
          position={Position.Bottom}
          className={classes.handle}
          id="bottom"
        />
      )}
    </div>
  );
}

export const StartEndNode = memo(StartEndNodeComponent);
