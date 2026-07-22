import { useEffect, useMemo } from 'react';
import { MantineProvider } from '@mantine/core';
import { useThemeStore } from '../stores/themeStore';
import { createAppTheme } from '../themes/createAppTheme';

interface AppThemeProviderProps {
  children: React.ReactNode;
}

export function AppThemeProvider({ children }: AppThemeProviderProps) {
  const { palette, mode, initialize } = useThemeStore();
  const theme = useMemo(() => createAppTheme(palette), [palette]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <MantineProvider theme={theme} forceColorScheme={mode}>
      {children}
    </MantineProvider>
  );
}
