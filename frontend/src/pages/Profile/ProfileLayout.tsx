import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ActionIcon, Drawer } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconMenu2 } from '@tabler/icons-react';
import { ProfileSidebar } from './components/ProfileSidebar';
import classes from './ProfileLayout.module.css';

export function ProfileLayout() {
  const { t } = useTranslation();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className={classes.profileLayout}>
      {!isMobile && <ProfileSidebar />}

      <div className={classes.content}>
        {isMobile && (
          <div className={classes.mobileHeader}>
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() => setDrawerOpen(true)}
              aria-label={t('common:aria.openNavMenu')}
            >
              <IconMenu2 size={18} />
            </ActionIcon>
            <span className={classes.sidebarTitle}>{t('profile:sidebar.title')}</span>
          </div>
        )}
        <Outlet />
      </div>

      {isMobile && (
        <Drawer
          opened={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title={t('profile:sidebar.title')}
          position="left"
          size={280}
        >
          <ProfileSidebar variant="drawer" onNavigate={() => setDrawerOpen(false)} />
        </Drawer>
      )}
    </div>
  );
}
