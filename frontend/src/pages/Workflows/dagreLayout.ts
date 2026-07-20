/**
 * dagre 自动布局 — 从上到下层级排列 DAG 节点
 *
 * 基于 @dagrejs/dagre，按照官网推荐的做法封装。
 * 只修改 node.position，返回新的 nodes 数组（不可变）。
 */
import { graphlib, layout } from '@dagrejs/dagre';
import type { Node, Edge } from '@xyflow/react';

/** dagre 节点 label 类型 — 只包含布局所需尺寸 */
interface DagreNodeLabel {
  width: number;
  height: number;
}

/** dagre 图配置：从上到下，层级间距 80px，节点间距 60px */
const DAGRE_CONFIG = {
  rankdir: 'TB',    // Top → Bottom
  nodesep: 60,      // 同级节点水平间距
  ranksep: 80,      // 层级垂直间距
  edgesep: 20,
  ranker: 'tight-tree' as const,
};

/**
 * 对节点执行 dagre 布局。
 * 如果节点已经通过 ReactFlow 渲染过，使用 measured 尺寸；
 * 否则回退到默认尺寸。
 *
 * 返回新数组，不修改原始 nodes。
 */
export function runDagreLayout(nodes: Node[], edges: Edge[]): Node[] {
  const g = new graphlib.Graph<DagreNodeLabel>()
    .setDefaultEdgeLabel(() => ({}))
    .setGraph(DAGRE_CONFIG);

  // 添加节点
  for (const node of nodes) {
    const width = node.measured?.width ?? 200;
    const height = node.measured?.height ?? 60;
    g.setNode(node.id, { width, height });
  }

  // 添加边
  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  // 执行布局
  layout(g);

  // 更新节点位置
  return nodes.map((node) => {
    const dagreNode = g.node(node.id);
    if (!dagreNode) return node;

    const width = node.measured?.width ?? 200;
    const height = node.measured?.height ?? 60;

    // dagre 返回的是节点中心坐标，转换为左上角坐标
    return {
      ...node,
      position: {
        x: dagreNode.x - width / 2,
        y: dagreNode.y - height / 2,
      },
    };
  });
}
