import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoadingOverlay } from '@mantine/core';
import { AuthGuard } from './components/guard/AuthGuard';
import { ErrorBoundary } from './components/guard/ErrorBoundary';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/Login/LoginPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { AgentListPage } from './pages/Agents/AgentListPage';
import { AgentDetailPage } from './pages/Agents/AgentDetailPage';
import { AgentCreatePage } from './pages/Agents/AgentCreatePage';
import { TaskListPage } from './pages/Tasks/TaskListPage';
import { TaskDetailPage } from './pages/Tasks/TaskDetailPage';
import { WorkflowListPage } from './pages/Workflows/WorkflowListPage';
import { WorkflowEditorPage } from './pages/Workflows/WorkflowEditorPage';
import { LogsPage } from './pages/Traces/LogsPage';
import { CostsPage } from './pages/Costs/CostsPage';
import { AccessSettingsPage } from './pages/Settings/AccessSettingsPage';
import { WebhookSettingsPage } from './pages/Settings/WebhookSettingsPage';
import { useAuthStore } from './stores/authStore';

export function App() {
  const { isLoading } = useAuthStore();

  // ── 应用启动时恢复登录态 ──
  useEffect(() => {
    useAuthStore.getState().initialize();
  }, []);

  // 登录态恢复期间展示全屏 loading，避免闪烁
  if (isLoading) {
    return <LoadingOverlay visible />;
  }

  return (
    <ErrorBoundary>
      <Routes>
        {/* Login — 不受 AuthGuard 保护 */}
        <Route path="/login" element={<LoginPage />} />

        {/* 受保护的路由 — AppLayout 提供 Sidebar + Topbar 布局 */}
        <Route element={<AuthGuard />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/agents" element={<AgentListPage />} />
            <Route path="/agents/create" element={<AgentCreatePage />} />
            <Route path="/agents/:id" element={<AgentDetailPage />} />
            <Route path="/tasks" element={<TaskListPage />} />
            <Route path="/tasks/:id" element={<TaskDetailPage />} />
            <Route path="/workflows" element={<WorkflowListPage />} />
            <Route path="/workflows/:id" element={<WorkflowEditorPage />} />
            <Route path="/logs" element={<LogsPage />} />
            <Route path="/costs" element={<CostsPage />} />
            <Route path="/settings/access" element={<AccessSettingsPage />} />
            <Route path="/settings/webhooks" element={<WebhookSettingsPage />} />
          </Route>
        </Route>

        {/* 兜底 → 首页 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}
