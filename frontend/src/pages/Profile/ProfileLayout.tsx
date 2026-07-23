import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  IconUser,
  IconLock,
  IconMail,
  IconPhone,
} from '@tabler/icons-react';
import classes from './ProfileLayout.module.css';

const NAV_ITEMS = [
  { key: 'profile', path: '/settings/profile', icon: IconUser },
  { key: 'password', path: '/settings/profile/password', icon: IconLock },
  { key: 'email', path: '/settings/profile/email', icon: IconMail },
  { key: 'phone', path: '/settings/profile/phone', icon: IconPhone },
] as const;

export function ProfileLayout() {
  const { t } = useTranslation();

  return (
    <div className={classes.page}>
      <nav className={classes.tabNav} aria-label={t('profile:sidebar.title')}>
        <div className={classes.tabList}>
          {NAV_ITEMS.map(({ key, path, icon: Icon }) => (
            <NavLink
              key={key}
              to={path}
              end={key === 'profile'}
              className={({ isActive }) =>
                `${classes.tabItem} ${isActive ? classes.tabItemActive : ''}`
              }
            >
              <Icon size={16} stroke={1.75} />
              {t(`profile:sidebar.${key}`)}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className={classes.content}>
        <Outlet />
      </div>
    </div>
  );
}
