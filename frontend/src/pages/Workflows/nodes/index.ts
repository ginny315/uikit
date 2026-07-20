/**
 * ReactFlow 自定义节点类型注册表
 *
 * 在 <ReactFlow nodeTypes={nodeTypes} /> 中使用。
 * key 对应 WorkflowNode.type 字段。
 */
import { AgentNode } from './AgentNode';
import { StartEndNode } from './StartEndNode';
import type { ComponentType } from 'react';
import type { NodeProps } from '@xyflow/react';

export const nodeTypes: Record<string, ComponentType<NodeProps>> = {
  agent: AgentNode,
  start: StartEndNode,
  end: StartEndNode,
};
