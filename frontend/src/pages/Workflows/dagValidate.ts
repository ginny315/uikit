/**
 * DAG 环检测 — 使用 DFS 检测有向图中是否存在环
 *
 * 如果有环则返回包含环中节点的数组（用于提示用户），
 * 无环返回 null。
 */
import type { Edge } from '@xyflow/react';

/**
 * 检测边列表中是否存在环。
 * @param edges ReactFlow 边数组
 * @returns 环中的节点 ID 数组（若有），null（若无环）
 */
export function detectCycle(edges: Edge[]): string[] | null {
  // 构建邻接表
  const adj = new Map<string, string[]>();
  const allNodes = new Set<string>();

  for (const edge of edges) {
    allNodes.add(edge.source);
    allNodes.add(edge.target);

    if (!adj.has(edge.source)) adj.set(edge.source, []);
    adj.get(edge.source)!.push(edge.target);
  }

  const WHITE = 0; // 未访问
  const GRAY = 1;  // 正在访问（在当前递归栈中）
  const BLACK = 2; // 已完成

  const color = new Map<string, number>();
  for (const node of allNodes) {
    color.set(node, WHITE);
  }

  const cycleNodes: string[] = [];

  function dfs(node: string): boolean {
    color.set(node, GRAY);
    const neighbors = adj.get(node) ?? [];

    for (const neighbor of neighbors) {
      const c = color.get(neighbor) ?? WHITE;
      if (c === GRAY) {
        // 发现环
        cycleNodes.push(neighbor);
        cycleNodes.push(node);
        return true;
      }
      if (c === WHITE && dfs(neighbor)) {
        cycleNodes.push(node);
        return true;
      }
    }

    color.set(node, BLACK);
    return false;
  }

  for (const node of allNodes) {
    if ((color.get(node) ?? WHITE) === WHITE) {
      if (dfs(node)) {
        // 反转使环顺序正确
        cycleNodes.reverse();
        return cycleNodes;
      }
    }
  }

  return null;
}
