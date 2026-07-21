import { Tabs, type TabsProps } from '@mantine/core';
import classes from './AppTabs.module.css';

export type AppTabsVariant = 'pills' | 'underline';

export interface AppTabsProps extends TabsProps {
  /** pills: 分段控件风格（默认）| underline: 下划线风格 */
  variant?: AppTabsVariant;
}

function AppTabsRoot({ variant = 'pills', classNames, children, ...props }: AppTabsProps) {
  const isPills = variant === 'pills';

  return (
    <div className={classes.card}>
      <Tabs
        variant={isPills ? 'pills' : 'default'}
        classNames={{
          root: classes.root,
          list: isPills ? classes.pillList : classes.underlineList,
          tab: isPills ? classes.pillTab : classes.underlineTab,
          tabSection: classes.tabSection,
          panel: classes.panel,
          ...classNames,
        }}
        {...props}
      >
        {children}
      </Tabs>
    </div>
  );
}

export const AppTabs = Object.assign(AppTabsRoot, {
  List: Tabs.List,
  Tab: Tabs.Tab,
  Panel: Tabs.Panel,
});
