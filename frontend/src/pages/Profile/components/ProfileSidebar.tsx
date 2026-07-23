import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  IconUser,
  IconLock,
  IconMail,
  IconPhone,
} from '@tabler/icons-react';
import classes from '../ProfileLayout.module.css';

const NAV_ITEMS = [
  { key: 'profile', path: '/settings/profile', icon: IconUser },
  { key: 'password', path: '/settings/profile/password', icon: IconLock },
  { key: 'email', path: '/settings/profile/email', icon: IconMail },
  { key: 'phone', path: '/settings/profile/phone', icon: IconPhone },
] as const;

interface ProfileSidebarProps {
  onNavigate?: () => void;
  variant?: 'sidebar' | 'drawer';
}

export function ProfileSidebar({ onNavigate, variant = 'sidebar' }: ProfileSidebarProps) {
  const { t } = useTranslation();

  return (
    <nav
      className={variant === 'drawer' ? classes.sidebarDrawer : classes.sidebar}
      aria-label={t('profile:sidebar.title')}
    >
      <div className={classes.sidebarTitle}>{t('profile:sidebar.title')}</div>
      {NAV_ITEMS.map(({ key, path, icon: Icon }) => (
        <NavLink
          key={key}
          to={path}
          end={key === 'profile'}
          className={({ isActive }) =>
            `${classes.navItem} ${isActive ? classes.navItemActive : ''}`
          }
          onClick={onNavigate}
        >
          <Icon size={18} stroke={1.75} />
          {t(`profile:sidebar.${key}`)}
        </NavLink>
      ))}
    </nav>
  );
}
