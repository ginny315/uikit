import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Popover, Text, Tooltip } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { PALETTES, PALETTE_ORDER } from '../../../themes/palettes';
import { useThemeStore } from '../../../stores/themeStore';
import classes from './ThemePicker.module.css';

export function ThemePicker() {
  const { t } = useTranslation();
  const { palette, setPalette } = useThemeStore();
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    if (!opened) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpened(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [opened]);

  const current = PALETTES[palette];

  return (
    <Popover opened={opened} onChange={setOpened} position="bottom-end" width={280} shadow="md" radius="md">
      <Popover.Target>
        <Tooltip label={t(`common:theme.palettes.${palette}`)} openDelay={400}>
          <button
            type="button"
            className={classes.trigger}
            onClick={() => setOpened((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={opened}
            aria-label={t('common:theme.pickerLabel')}
          >
            <span className={classes.triggerDot} style={{ background: current.accent }} />
          </button>
        </Tooltip>
      </Popover.Target>

      <Popover.Dropdown className={classes.dropdown}>
        <Text className={classes.panelTitle}>{t('common:theme.panelTitle')}</Text>
        <Text className={classes.panelDesc}>{t('common:theme.panelDesc')}</Text>

        <div className={classes.swatchRow} role="menu">
          {PALETTE_ORDER.map((id) => {
            const item = PALETTES[id];
            const active = palette === id;
            return (
              <button
                key={id}
                type="button"
                role="menuitem"
                className={`${classes.swatchOption} ${active ? classes.swatchOptionActive : ''}`}
                aria-label={t(`common:theme.palettes.${id}`)}
                aria-current={active ? 'true' : undefined}
                onClick={() => {
                  setPalette(id);
                  setOpened(false);
                }}
              >
                <span
                  className={classes.swatchDot}
                  style={{
                    background: item.accent,
                    ['--swatch-secondary' as string]: item.accentSecondary,
                    ...(active ? { ['--swatch-ring' as string]: item.accent } : {}),
                  }}
                >
                  {active && <IconCheck size={14} stroke={2.5} className={classes.swatchCheck} />}
                </span>
                <span className={classes.swatchName}>{t(`common:theme.palettes.${id}`)}</span>
              </button>
            );
          })}
        </div>
      </Popover.Dropdown>
    </Popover>
  );
}
