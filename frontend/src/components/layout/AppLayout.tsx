import { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import classes from './AppLayout.module.css';

const COLLAPSED_KEY = 'agentsys-sidebar-collapsed';
const TABLET_BREAKPOINT = 1024;

function getStoredCollapsed(): boolean {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(getStoredCollapsed);

  // 平板断点自动折叠
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${TABLET_BREAKPOINT}px)`);

    function handleChange(e: MediaQueryListEvent | MediaQueryList) {
      if (e.matches) {
        setCollapsed(true);
      } else {
        // 恢复用户偏好
        setCollapsed(getStoredCollapsed());
      }
    }

    handleChange(mql); // 初始检查
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COLLAPSED_KEY, String(next));
      } catch { /* noop */ }
      return next;
    });
  }, []);

  function closeSidebar() {
    setSidebarOpen(false);
  }

  return (
    <div
      className={classes.wrapper}
      style={{
        '--agentsys-sidebar-width': collapsed
          ? 'var(--agentsys-sidebar-collapsed-width, 64px)'
          : '240px',
      } as React.CSSProperties}
    >
      {/* Mobile overlay */}
      <div
        className={`${classes.overlay} ${sidebarOpen ? classes.overlayVisible : ''}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* Sidebar — wrapped for mobile slide animation */}
      <div className={`${classes.sidebarContainer} ${sidebarOpen ? classes.sidebarContainerOpen : ''}`}>
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={toggleCollapsed}
          onClose={closeSidebar}
        />
      </div>

      <Topbar onMenuClick={() => setSidebarOpen(true)} />

      <main className={classes.main}>
        <div className={classes.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
