/**
 * WorkflowEditorPage — DAG 工作流编辑器
 *
 * 基于 @xyflow/react (ReactFlow v12) 构建的可视化工作流编辑器。
 * 三栏布局：左侧节点面板 + 中央画布 + 右侧配置面板（选中节点时显示）。
 *
 * 核心交互：
 *   1. 点击「添加步骤」→ 在画布中央创建 Agent 节点
 *   2. 拖拽节点底部 handle → 另一节点顶部 handle → 创建依赖边
 *   3. 点击节点 → 右侧面板配置 Agent 和输入模板
 *   4. Delete/Backspace → 删除选中节点或边
 *   5. 自动布局 → dagre 从上到下层级排列
 *   6. 保存 → DAG 环检测 → 调用 updateWorkflow API
 */
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  useReactFlow,
  addEdge,
  type Connection,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Button, ActionIcon, Tooltip, Badge, Text, Modal, Center, Loader,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import dayjs from 'dayjs';
import {
  IconArrowLeft, IconPlus, IconLayoutDistributeVertical,
  IconMaximize, IconPlayerPlay, IconPlayerPause, IconAlertTriangle,
  IconGitBranch,
} from '@tabler/icons-react';
import type { WorkflowDetail, WorkflowNode, WorkflowNodeData, WorkflowStatus } from '../../types';
import { useApiQuery, useApiMutation, queryKeys } from '../../hooks/useApi';
import { fetchWorkflow, updateWorkflow } from '../../services/workflows';
import { nodeTypes } from './nodes';
import { NodeConfigPanel } from './NodeConfigPanel';
import { runDagreLayout } from './dagreLayout';
import { detectCycle } from './dagValidate';
import classes from './WorkflowEditor.module.css';

// ── 默认边样式 ──
const defaultEdgeOptions = {
  type: 'smoothstep',
  animated: true,
  style: { stroke: 'var(--mantine-color-dimmed)', strokeWidth: 1.5 },
  markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--mantine-color-dimmed)', width: 14, height: 14 },
};

/** 从 WorkflowDetail.nodes 构建 ReactFlow Node[]（补充运行时字段） */
function buildInitialNodes(detailNodes: WorkflowNode[]): Node[] {
  return detailNodes.map((n) => ({
    id: n.id,
    type: n.type,
    position: n.position,
    data: { ...n.data },
  }));
}

/** 从 WorkflowDetail.edges 构建 ReactFlow Edge[] */
function buildInitialEdges(detailEdges: { id: string; source: string; target: string }[]): Edge[] {
  return detailEdges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: 'smoothstep',
    animated: true,
    style: { stroke: 'var(--mantine-color-dimmed)', strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--mantine-color-dimmed)', width: 14, height: 14 },
  }));
}

/** 生成唯一 ID */
function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 7)}`;
}

function nodeToWorkflowNode(node: Node): WorkflowNode {
  return {
    id: node.id,
    type: node.type as WorkflowNode['type'],
    position: node.position,
    data: node.data as unknown as WorkflowNodeData,
  };
}

export function WorkflowEditorPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: detail, isLoading, isError } = useApiQuery(
    queryKeys.workflows.detail(id ?? ''),
    () => fetchWorkflow(id!),
    { enabled: !!id },
  );

  if (isLoading) {
    return (
      <Center h="60vh">
        <Loader size="md" />
      </Center>
    );
  }

  if (!detail || isError) {
    return (
      <div className={classes.notFound}>
        <IconAlertTriangle size={48} style={{ color: 'var(--mantine-color-dimmed)' }} />
        <Text mt="md" fw={500}>{t('workflows:editor.notFound')}</Text>
        <Text size="sm" c="dimmed">{t('workflows:editor.notFoundDesc', { id: id ?? '' })}</Text>
        <Button mt="lg" variant="subtle" onClick={() => navigate('/workflows')}>
          {t('common:actions.back')}
        </Button>
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <WorkflowEditorInner detail={detail} workflowId={detail.id} />
    </ReactFlowProvider>
  );
}

// ── Inner component — has access to ReactFlow context ──

function WorkflowEditorInner({ detail, workflowId }: { detail: WorkflowDetail; workflowId: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const saveMutation = useApiMutation(queryKeys.workflows.all, (payload: Partial<WorkflowDetail>) =>
    updateWorkflow(workflowId, payload),
  );

  // ReactFlow 节点/边状态 + fitView
  const [nodes, setNodes, onNodesChangeRaw] = useNodesState(
    buildInitialNodes(detail.nodes),
  );
  const [edges, setEdges, onEdgesChangeRaw] = useEdgesState(
    buildInitialEdges(detail.edges),
  );
  const { fitView } = useReactFlow();

  // 工作流元信息
  const [name, setName] = useState(detail.name);
  const [status, setStatus] = useState<WorkflowStatus>(detail.status);
  const [hasChanges, setHasChanges] = useState(false);

  // 选中节点
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return nodes.find((n) => n.id === selectedNodeId) ?? null;
  }, [nodes, selectedNodeId]);

  // 离开确认
  const [leaveOpened, { open: openLeave, close: closeLeave }] = useDisclosure(false);
  const leaveTargetRef = useRef<string | null>(null);

  // ── 边更新处理（ReactFlow 使用不可变更新）──
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    onNodesChangeRaw(changes);
    setHasChanges(true);
  }, [onNodesChangeRaw]);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    onEdgesChangeRaw(changes);
    setHasChanges(true);
  }, [onEdgesChangeRaw]);

  // ── 连接节点 ──
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(
        { ...connection, id: uid('e'), type: 'smoothstep', animated: true, style: { stroke: 'var(--mantine-color-dimmed)', strokeWidth: 1.5 }, markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--mantine-color-dimmed)', width: 14, height: 14 } },
        eds,
      ));
      setHasChanges(true);
    },
    [setEdges],
  );

  // ── 连接校验：禁止自连接、重复边 ──
  const isValidConnection = useCallback(
    (connection: Edge | Connection) => {
      const source = connection.source;
      const target = connection.target;
      if (!source || !target || source === target) return false;
      const dup = edges.some(
        (e) => e.source === source && e.target === target,
      );
      return !dup;
    },
    [edges],
  );

  // ── 节点点击 → 选中 ──
  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  // ── 画布空白点击 → 取消选中 ──
  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  // ── 键盘删除 ──
  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        // 优先删除选中的边
        const selectedEdges = edges.filter((e) => e.selected);
        if (selectedEdges.length > 0) {
          setEdges((eds) => eds.filter((e) => !e.selected));
          setHasChanges(true);
          return;
        }
        // 删除选中的节点（保留 start/end）
        if (selectedNodeId && selectedNodeId !== 'start' && selectedNodeId !== 'end') {
          handleDeleteNode(selectedNodeId);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedNodeId, edges],
  );

  // ── 添加 Agent 节点 ──
  const handleAddNode = useCallback(() => {
    const newNode: Node = {
      id: uid('step'),
      type: 'agent',
      position: { x: 300 + Math.random() * 150, y: 200 + nodes.length * 30 },
      data: { label: 'New Step', agentId: undefined, agentName: undefined, inputTemplate: '' },
    };
    setNodes((nds) => [...nds, newNode]);
    setHasChanges(true);
    setSelectedNodeId(newNode.id);
  }, [nodes.length, setNodes]);

  // ── 更新节点 data ──
  const handleNodeDataChange = useCallback(
    (nodeId: string, partial: Partial<WorkflowNodeData>) => {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id !== nodeId) return n;
          return { ...n, data: { ...n.data, ...partial } };
        }),
      );
      setHasChanges(true);
    },
    [setNodes],
  );

  // ── 删除节点（级联删除关联边）──
  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      if (nodeId === 'start' || nodeId === 'end') return;
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
      setSelectedNodeId(null);
      setHasChanges(true);
    },
    [setNodes, setEdges],
  );

  // ── 自动布局 ──
  const handleAutoLayout = useCallback(() => {
    const layouted = runDagreLayout(nodes, edges);
    setNodes(layouted);
    setHasChanges(true);
  }, [nodes, edges, setNodes]);

  // ── 保存（含 DAG 环检测）──
  const handleSave = useCallback(() => {
    // 环检测
    const cycle = detectCycle(edges);
    if (cycle) {
      notifications.show({
        title: '保存失败',
        message: t('workflows:editor.dagInvalid'),
        color: 'red',
        withCloseButton: true,
      });
      return;
    }

    const payload: Partial<WorkflowDetail> = {
      name,
      status,
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type as WorkflowNode['type'],
        position: n.position,
        data: n.data as unknown as WorkflowNodeData,
      })),
      edges: edges.map((e) => ({ id: e.id, source: e.source, target: e.target })),
      stepCount: nodes.filter((n) => n.type === 'agent').length,
      updatedAt: dayjs().format('YYYY-MM-DD'),
    };

    saveMutation.mutate(payload, {
      onSuccess: () => {
        setHasChanges(false);
        notifications.show({ message: t('workflows:editor.savedMsg'), color: 'green', withCloseButton: true });
      },
    });
  }, [name, status, nodes, edges, t, saveMutation]);

  // ── 启用/暂停 ──
  const handleToggleStatus = useCallback(() => {
    const next: WorkflowStatus = status === 'active' ? 'paused' : 'active';
    setStatus(next);
    setHasChanges(true);
  }, [status]);

  // ── 浏览器离开拦截 ──
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasChanges]);

  // ── 首次加载自动布局 + 适应画布 ──
  const initialLayoutDone = useRef(false);
  useEffect(() => {
    if (initialLayoutDone.current) return;
    initialLayoutDone.current = true;

    const layouted = runDagreLayout(nodes, edges);
    setNodes(layouted);
    requestAnimationFrame(() => {
      fitView({ padding: 0.2, duration: 300 });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 导航拦截
  const navigateSafely = useCallback(
    (to: string) => {
      if (hasChanges) {
        leaveTargetRef.current = to;
        openLeave();
      } else {
        navigate(to);
      }
    },
    [hasChanges, navigate, openLeave],
  );

  return (
    <div className={classes.root} onKeyDown={onKeyDown} tabIndex={-1}>
      {/* ── Top bar ── */}
      <div className={classes.topBar}>
        <div className={classes.topLeft}>
          <ActionIcon variant="subtle" color="gray" size="md" onClick={() => navigateSafely('/workflows')}>
            <IconArrowLeft size={18} />
          </ActionIcon>
          <input
            className={classes.nameInput}
            value={name}
            onChange={(e) => { setName(e.currentTarget.value); setHasChanges(true); }}
            placeholder="工作流名称"
            aria-label="工作流名称"
          />
          <Badge
            variant="light"
            color={status === 'active' ? 'agentGreen' : status === 'paused' ? 'yellow' : 'gray'}
            size="sm"
            ff="monospace"
          >
            {t(`workflows:status.${status}`)}
          </Badge>
          {hasChanges && <span className={classes.dirtyDot} title="有未保存的更改">●</span>}
        </div>
        <div className={classes.topRight}>
          <Tooltip label={t('workflows:editor.saveDraft')}>
            <Button size="xs" variant="filled" onClick={handleSave}>
              {t('common:actions.save')}
            </Button>
          </Tooltip>
          <Tooltip label={status === 'active' ? t('workflows:editor.pause') : t('workflows:editor.enable')}>
            <ActionIcon
              variant="light"
              color={status === 'active' ? 'yellow' : 'agentGreen'}
              size="md"
              onClick={handleToggleStatus}
              disabled={status === 'draft'}
            >
              {status === 'active' ? <IconPlayerPause size={16} /> : <IconPlayerPlay size={16} />}
            </ActionIcon>
          </Tooltip>
        </div>
      </div>

      {/* ── Body: left panel + canvas + right panel ── */}
      <div className={classes.body}>
        {/* Left panel — 节点面板 */}
        <div className={classes.leftPanel}>
          <div className={classes.panelSection}>
            <Text size="xs" fw={600} c="dimmed" mb="xs" ff="Space Grotesk, sans-serif">
              {t('workflows:editor.toolbar.add')}
            </Text>
            <Button
              variant="light"
              color="agentGreen"
              size="xs"
              fullWidth
              leftSection={<IconPlus size={14} />}
              onClick={handleAddNode}
              mb="md"
            >
              {t('workflows:editor.addStep')}
            </Button>
          </div>

          <div className={classes.panelSection}>
            <Text size="xs" fw={600} c="dimmed" mb="xs" ff="Space Grotesk, sans-serif">
              {t('workflows:editor.toolbar.layout')}
            </Text>
            <Button
              variant="subtle"
              color="gray"
              size="xs"
              fullWidth
              leftSection={<IconLayoutDistributeVertical size={14} />}
              onClick={handleAutoLayout}
              mb="xs"
            >
              {t('workflows:editor.toolbar.layout')}
            </Button>
            <Button
              variant="subtle"
              color="gray"
              size="xs"
              fullWidth
              leftSection={<IconMaximize size={14} />}
              onClick={() => fitView({ padding: 0.2, duration: 300 })}
            >
              {t('workflows:editor.toolbar.fitView')}
            </Button>
          </div>
        </div>

        {/* Center — ReactFlow canvas */}
        <div className={classes.canvasWrap}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            isValidConnection={isValidConnection}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            fitView
            multiSelectionKeyCode="Shift"
            selectionKeyCode="Shift"
            snapToGrid
            snapGrid={[16, 16]}
            className={classes.reactFlow}
            proOptions={{ hideAttribution: true }}
          >
            <Controls className={classes.controls} />
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--mantine-color-gray-3)" />
          </ReactFlow>

          {nodes.length === 0 && (
            <div className={classes.emptyOverlay}>
              <IconGitBranch size={40} style={{ opacity: 0.3 }} />
              <Text size="sm" c="dimmed" mt="sm">{t('workflows:editor.emptyCanvas')}</Text>
            </div>
          )}
        </div>

        {/* Right panel — 节点配置 */}
        {selectedNode && selectedNode.type === 'agent' && (
          <NodeConfigPanel
            node={nodeToWorkflowNode(selectedNode)}
            visible
            onChange={handleNodeDataChange}
            onDelete={handleDeleteNode}
          />
        )}
      </div>

      {/* ── 离开确认 Modal ── */}
      <Modal opened={leaveOpened} onClose={closeLeave} title="未保存的更改" centered>
        <Text size="sm" mb="md">{t('workflows:editor.unsavedChanges')}</Text>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button variant="subtle" color="gray" onClick={closeLeave}>
            {t('common:actions.cancel')}
          </Button>
          <Button
            color="red"
            onClick={() => {
              closeLeave();
              if (leaveTargetRef.current) navigate(leaveTargetRef.current);
            }}
          >
            离开
          </Button>
        </div>
      </Modal>
    </div>
  );
}
