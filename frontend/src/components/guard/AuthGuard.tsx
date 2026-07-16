import { Navigate, Outlet } from 'react-router-dom';
import { config } from '../../config';
import { useAuthStore } from '../../stores/authStore';

/**
 * 路由守卫
 *
 * auth.enabled=false → 直通（本地开发模式）
 * auth.enabled=true  → 检查 token，无 token 跳转登录页
 *
 * 用法：
 *   <Route element={<AuthGuard />}>
 *     <Route path="/" element={<Dashboard />} />
 *     ...
 *   </Route>
 */
export function AuthGuard() {
  // auth 未启用时直接放行
  if (!config.auth.enabled) {
    return <Outlet />;
  }

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to={config.auth.loginPath} replace />;
  }

  return <Outlet />;
}
