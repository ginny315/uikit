/**
 * AgentNode — ReactFlow 自定义节点：Agent 步骤
 *
 * 在 DAG 画布中代表一个 Agent 执行步骤。使用 Mantine Card 风格，
 * 有输入 handle（顶部）和输出 handle（底部），选中时高亮边框。
 */
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { WorkflowNodeData } from '../../../types';
import { IconRobot } from '@tabler/icons-react';
import { Tooltip } from '@mantine/core';
import classes from './AgentNode.module.css';

function AgentNodeComponent({ data, selected }: NodeProps) {
  const { t } = useTranslation();
  const nodeData = data as unknown as WorkflowNodeData;
  const hasAgent = Boolean(nodeData.agentId);

  return (
    <div className={`${classes.card} ${selected ? classes.selected : ''}`}>
      {/* 输入 handle — 顶部中间 */}
      <Handle
        type="target"
        position={Position.Top}
        className={classes.handle}
        id="top"
      />

      <div className={classes.body}>
        <div className={classes.iconWrap}>
          <IconRobot size={16} className={classes.icon} />
        </div>
        <div className={classes.content}>
          <Tooltip label={nodeData.label} openDelay={500} disabled={nodeData.label.length < 15}>
            <span className={classes.label}>{nodeData.label}</span>
          </Tooltip>
          {hasAgent ? (
            <span className={classes.agentName}>{nodeData.agentName}</span>
          ) : (
            <span className={classes.agentNameMissing}>{t('workflows:editor.noAgentSelected')}</span>
          )}
        </div>
        {hasAgent && <span className={classes.dot} />}
      </div>

      {/* 输出 handle — 底部中间 */}
      <Handle
        type="source"
        position={Position.Bottom}
        className={classes.handle}
        id="bottom"
      />
    </div>
  );
}

export const AgentNode = memo(AgentNodeComponent);
