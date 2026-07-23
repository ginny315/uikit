import { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoadingOverlay, Center, Loader } from '@mantine/core';
import { AuthGuard } from './components/guard/AuthGuard';
import { ErrorBoundary } from './components/guard/ErrorBoundary';
import { AppLayout } from './components/layout/AppLayout';
import { useAuthStore } from './stores/authStore';

// ── Session 11: Code Splitting — 页面级 React.lazy ──
// Login 保持同步加载（用户首先看到的就是登录页）
import { LoginPage } from './pages/Login/LoginPage';

const DashboardPage = lazy(() => import('./pages/Dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const AgentListPage = lazy(() => import('./pages/Agents/AgentListPage').then((m) => ({ default: m.AgentListPage })));
const AgentDetailPage = lazy(() => import('./pages/Agents/AgentDetailPage').then((m) => ({ default: m.AgentDetailPage })));
const AgentCreatePage = lazy(() => import('./pages/Agents/AgentCreatePage').then((m) => ({ default: m.AgentCreatePage })));
const TaskListPage = lazy(() => import('./pages/Tasks/TaskListPage').then((m) => ({ default: m.TaskListPage })));
const TaskDetailPage = lazy(() => import('./pages/Tasks/TaskDetailPage').then((m) => ({ default: m.TaskDetailPage })));
const WorkflowListPage = lazy(() => import('./pages/Workflows/WorkflowListPage').then((m) => ({ default: m.WorkflowListPage })));
const WorkflowEditorPage = lazy(() => import('./pages/Workflows/WorkflowEditorPage').then((m) => ({ default: m.WorkflowEditorPage })));
const LogsPage = lazy(() => import('./pages/Traces/LogsPage').then((m) => ({ default: m.LogsPage })));
const CostsPage = lazy(() => import('./pages/Costs/CostsPage').then((m) => ({ default: m.CostsPage })));
const AccessSettingsPage = lazy(() => import('./pages/Settings/AccessSettingsPage').then((m) => ({ default: m.AccessSettingsPage })));
const WebhookSettingsPage = lazy(() => import('./pages/Settings/WebhookSettingsPage').then((m) => ({ default: m.WebhookSettingsPage })));
const ProfileLayout = lazy(() => import('./pages/Profile/ProfileLayout').then((m) => ({ default: m.ProfileLayout })));
const ProfileSettingsPage = lazy(() => import('./pages/Profile/ProfileSettingsPage').then((m) => ({ default: m.ProfileSettingsPage })));
const PasswordSettingsPage = lazy(() => import('./pages/Profile/PasswordSettingsPage').then((m) => ({ default: m.PasswordSettingsPage })));
const EmailSettingsPage = lazy(() => import('./pages/Profile/EmailSettingsPage').then((m) => ({ default: m.EmailSettingsPage })));
const PhoneSettingsPage = lazy(() => import('./pages/Profile/PhoneSettingsPage').then((m) => ({ default: m.PhoneSettingsPage })));

function PageLoader() {
  return (
    <Center h="60vh">
      <Loader size="md" />
    </Center>
  );
}

function SuspensePage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

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
        {/* Login — 同步加载，不受 AuthGuard 保护 */}
        <Route path="/login" element={<LoginPage />} />

        {/* 受保护的路由 — AppLayout 提供 Sidebar + Topbar 布局 */}
        <Route element={<AuthGuard />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<SuspensePage><DashboardPage /></SuspensePage>} />
            <Route path="/agents" element={<SuspensePage><AgentListPage /></SuspensePage>} />
            <Route path="/agents/create" element={<SuspensePage><AgentCreatePage /></SuspensePage>} />
            <Route path="/agents/:id" element={<SuspensePage><AgentDetailPage /></SuspensePage>} />
            <Route path="/tasks" element={<SuspensePage><TaskListPage /></SuspensePage>} />
            <Route path="/tasks/:id" element={<SuspensePage><TaskDetailPage /></SuspensePage>} />
            <Route path="/workflows" element={<SuspensePage><WorkflowListPage /></SuspensePage>} />
            <Route path="/workflows/:id" element={<SuspensePage><WorkflowEditorPage /></SuspensePage>} />
            <Route path="/logs" element={<SuspensePage><LogsPage /></SuspensePage>} />
            <Route path="/costs" element={<SuspensePage><CostsPage /></SuspensePage>} />
            <Route path="/settings/access" element={<SuspensePage><AccessSettingsPage /></SuspensePage>} />
            <Route path="/settings/webhooks" element={<SuspensePage><WebhookSettingsPage /></SuspensePage>} />
            <Route path="/settings/profile" element={<SuspensePage><ProfileLayout /></SuspensePage>}>
              <Route index element={<SuspensePage><ProfileSettingsPage /></SuspensePage>} />
              <Route path="password" element={<SuspensePage><PasswordSettingsPage /></SuspensePage>} />
              <Route path="email" element={<SuspensePage><EmailSettingsPage /></SuspensePage>} />
              <Route path="phone" element={<SuspensePage><PhoneSettingsPage /></SuspensePage>} />
            </Route>
          </Route>
        </Route>

        {/* 兜底 → 首页 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}
