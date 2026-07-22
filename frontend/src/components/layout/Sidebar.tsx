import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Tooltip } from '@mantine/core';
import {
  IconLayoutDashboard,
  IconRobot,
  IconChecklist,
  IconGitBranch,
  IconFileText,
  IconCoin,
  IconShieldLock,
  IconWebhook,
  IconChevronLeft,
  IconChevronRight,
} from '@tabler/icons-react';
import classes from './Sidebar.module.css';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

function buildSections(t: (key: string) => string): NavSection[] {
  return [
    {
      label: t('nav:sections.overview'),
      items: [
        { label: t('nav:pages.dashboard'), path: '/', icon: <IconLayoutDashboard size={18} /> },
      ],
    },
    {
      label: t('nav:sections.management'),
      items: [
        { label: t('nav:pages.agents'), path: '/agents', icon: <IconRobot size={18} /> },
        { label: t('nav:pages.tasks'), path: '/tasks', icon: <IconChecklist size={18} /> },
        { label: t('nav:pages.workflows'), path: '/workflows', icon: <IconGitBranch size={18} /> },
      ],
    },
    {
      label: t('nav:sections.observability'),
      items: [
        { label: t('nav:pages.logs'), path: '/logs', icon: <IconFileText size={18} /> },
        { label: t('nav:pages.costs'), path: '/costs', icon: <IconCoin size={18} /> },
      ],
    },
    {
      label: t('nav:sections.settings'),
      items: [
        { label: t('nav:pages.access'), path: '/settings/access', icon: <IconShieldLock size={18} /> },
        { label: t('nav:pages.webhooks'), path: '/settings/webhooks', icon: <IconWebhook size={18} /> },
      ],
    },
  ];
}

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onClose?: () => void;
  className?: string;
}

export function Sidebar({ collapsed = false, onToggleCollapse, onClose, className }: SidebarProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const NAV_SECTIONS = buildSections(t);

  function isActive(path: string): boolean {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  }

  function handleNavClick(path: string) {
    navigate(path);
    onClose?.();
  }

  return (
    <aside className={`${classes.sidebar} ${collapsed ? classes.collapsed : ''} ${className ?? ''}`}>
      {/* Brand */}
      <a
        href="/"
        className={classes.brand}
        onClick={(e) => { e.preventDefault(); handleNavClick('/'); }}
      >
        <div className={classes.brandIcon}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        {!collapsed && <span className={classes.brandLabel}>{t('common:appName')}</span>}
      </a>

      {/* Nav */}
      <nav className={classes.nav}>
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            {!collapsed && <div className={classes.sectionLabel}>{section.label}</div>}
            {section.items.map((item) => {
              const active = isActive(item.path);
              const btn = (
                <button
                  key={item.path}
                  className={`${classes.navItem} ${active ? classes.navItemActive : ''}`}
                  onClick={() => handleNavClick(item.path)}
                  aria-label={item.label}
                >
                  <span className={classes.navItemIcon}>{item.icon}</span>
                  {!collapsed && item.label}
                </button>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.path} label={item.label} position="right" offset={12} openDelay={300}>
                    {btn}
                  </Tooltip>
                );
              }

              return btn;
            })}
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        className={classes.collapseBtn}
        onClick={onToggleCollapse}
        type="button"
        aria-label={collapsed ? t('common:aria.expandSidebar') : t('common:aria.collapseSidebar')}
      >
        {collapsed ? <IconChevronRight size={16} /> : <IconChevronLeft size={16} />}
      </button>

      {/* Footer */}
      {!collapsed && (
        <div className={classes.footer}>
          <div className={classes.footerText}>{t('common:version')}</div>
        </div>
      )}
    </aside>
  );
}
