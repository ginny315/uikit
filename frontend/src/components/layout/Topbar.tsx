import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ActionIcon, Tooltip, Menu } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMediaQuery } from '@mantine/hooks';
import { IconMenu2, IconLogout, IconCheck, IconSun, IconMoon, IconSettings } from '@tabler/icons-react';
import { ThemePicker } from '../shared/ThemePicker/ThemePicker';
import { ConfirmModal } from '../shared/ConfirmModal/ConfirmModal';
import { useAuthStore } from '../../stores/authStore';
import { getProfileInitials, useProfileStore } from '../../stores/profileStore';
import { useThemeStore } from '../../stores/themeStore';
import { config } from '../../config';
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
    '/settings/profile', '/settings/profile/password',
    '/settings/profile/email', '/settings/profile/phone',
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
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { profile } = useProfileStore();
  const { mode, toggleMode } = useThemeStore();
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const isDark = mode === 'dark';
  const pageTitle = resolvePageTitle(location.pathname, t);
  const currentLang = i18n.language?.startsWith('en') ? 'en-US' : 'zh-CN';
  const initials = getProfileInitials(profile.username);

  const handleToggleTheme = () => {
    toggleMode();
  };

  const handleToggleLang = () => {
    const next = currentLang === 'zh-CN' ? 'en-US' : 'zh-CN';
    i18n.changeLanguage(next);
  };

  const handleLogout = () => {
    logout();
    navigate(config.auth.loginPath, { replace: true });
    notifications.show({
      title: t('auth:brandName'),
      message: t('auth:loggedOut'),
      color: 'green',
      icon: <IconCheck size={16} />,
      autoClose: 3000,
      withBorder: true,
    });
  };

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
            aria-label={t('common:aria.openNavMenu')}
          >
            <IconMenu2 size={18} />
          </ActionIcon>
        )}

        <h1 className={classes.pageTitle}>{pageTitle}</h1>
      </div>

      <div className={classes.right}>
        <ThemePicker />

        <Tooltip label={isDark ? t('common:actions.lightMode') : t('common:actions.darkMode')} openDelay={400}>
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={handleToggleTheme}
            aria-label={isDark ? t('common:actions.lightMode') : t('common:actions.darkMode')}
          >
            {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
          </ActionIcon>
        </Tooltip>

        <Tooltip label={currentLang === 'zh-CN' ? t('common:aria.switchToEnglish') : t('common:aria.switchToChinese')} openDelay={400}>
          <button
            className={classes.langBtn}
            onClick={handleToggleLang}
            type="button"
            aria-label={currentLang === 'zh-CN' ? t('common:aria.switchToEnglish') : t('common:aria.switchToChinese')}
          >
            {currentLang === 'zh-CN' ? 'EN' : '中'}
          </button>
        </Tooltip>

        <Menu position="bottom-end" width={200} shadow="md" radius="md">
          <Menu.Target>
            <button className={classes.userBtn} type="button" aria-label={t('common:aria.userMenu')}>
              <div className={classes.avatar}>
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.username} className={classes.avatarImg} />
                ) : (
                  initials
                )}
              </div>
              <span className={classes.avatarName}>{profile.username}</span>
            </button>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item
              leftSection={<IconSettings size={16} />}
              onClick={() => navigate('/settings/profile')}
            >
              {t('profile:menu.userSettings')}
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              leftSection={<IconLogout size={16} />}
              color="red"
              onClick={() => setLogoutConfirmOpen(true)}
            >
              {t('profile:menu.logout')}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>

      <ConfirmModal
        opened={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        title={t('profile:menu.logoutConfirmTitle')}
        message={t('profile:menu.logoutConfirmMessage')}
        confirmLabel={t('profile:menu.logout')}
        onConfirm={() => {
          setLogoutConfirmOpen(false);
          handleLogout();
        }}
      />
    </header>
  );
}
