import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, ActionIcon } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconMenu2, IconLogout } from '@tabler/icons-react';
import { useAuthStore } from '../../stores/authStore';
import classes from './Topbar.module.css';

function resolvePageTitle(pathname: string, t: (key: string) => string): string {
  // 动态路由优先匹配，避免 i18next 未找到 key 时返回原始路径字符串
  if (pathname.startsWith('/agents/')) return t('nav:pageTitles.agentDetail');
  if (pathname.startsWith('/tasks/')) return t('nav:pageTitles.taskDetail');
  if (pathname.startsWith('/workflows/')) return t('nav:pageTitles.workflowEditor');

  // 精确匹配的静态路由
  const staticRoutes = [
    '/', '/agents', '/agents/create', '/tasks',
    '/workflows', '/logs', '/costs',
    '/settings/access', '/settings/webhooks',
  ];
  if (staticRoutes.includes(pathname)) {
    return t(`nav:pageTitles.${pathname}`);
  }

  return t('nav:pageTitles.notFound');
}

interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const { logout } = useAuthStore();
  const pageTitle = resolvePageTitle(location.pathname, t);

  // 仅在手机端 (≤768px) 显示汉堡菜单，侧边栏在此断点下隐藏为 overlay
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <header className={classes.topbar}>
      <div className={classes.left}>
        {isMobile && (
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={onMenuClick}
            aria-label="打开导航菜单"
          >
            <IconMenu2 size={18} />
          </ActionIcon>
        )}

        <h1 className={classes.pageTitle}>{pageTitle}</h1>
      </div>

      <div className={classes.right}>
        <button className={classes.userBtn} type="button">
          <div className={classes.avatar}>A</div>
          <span className={classes.avatarName}>Admin</span>
        </button>
        <Button
          variant="subtle"
          color="gray"
          size="sm"
          leftSection={<IconLogout size={16} />}
          onClick={logout}
        >
          {t('common:actions.logout')}
        </Button>
      </div>
    </header>
  );
}
