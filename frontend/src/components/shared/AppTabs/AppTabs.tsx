import { Tabs, useMantineTheme, type TabsProps } from '@mantine/core';
import type { AppTabsVariant } from '../../../themes/paletteShapes';
import classes from './AppTabs.module.css';

export type { AppTabsVariant };

export interface AppTabsProps extends TabsProps {
  /** pills: 分段控件 | underline: 下划线；未传时跟随当前 palette */
  variant?: AppTabsVariant;
}

function AppTabsRoot({ variant, classNames, children, ...props }: AppTabsProps) {
  const theme = useMantineTheme();
  const resolvedVariant = variant ?? (theme.other?.appTabsVariant as AppTabsVariant | undefined) ?? 'pills';
  const isPills = resolvedVariant === 'pills';

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
