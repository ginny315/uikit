import { useEffect, useMemo } from 'react';
import { MantineProvider } from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import { useTranslation } from 'react-i18next';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/en';
import { useThemeStore } from '../stores/themeStore';
import { createAppTheme } from '../themes/createAppTheme';

interface AppThemeProviderProps {
  children: React.ReactNode;
}

export function AppThemeProvider({ children }: AppThemeProviderProps) {
  const { palette, mode, initialize } = useThemeStore();
  const { i18n } = useTranslation();
  const theme = useMemo(() => createAppTheme(palette), [palette]);
  const datesLocale = i18n.language?.startsWith('en') ? 'en' : 'zh-cn';

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <MantineProvider theme={theme} forceColorScheme={mode}>
      <DatesProvider settings={{ locale: datesLocale, firstDayOfWeek: 1 }}>
        {children}
      </DatesProvider>
    </MantineProvider>
  );
}
