import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Popover, UnstyledButton, Text } from '@mantine/core';
import { PALETTES, PALETTE_ORDER, type ThemePalette } from '../../../themes/palettes';
import { useThemeStore } from '../../../stores/themeStore';
import classes from './ThemePicker.module.css';

const SWATCH_CLASS: Record<ThemePalette, string> = {
  forest: classes.swatchForest,
  ocean: classes.swatchOcean,
  sunset: classes.swatchSunset,
  rose: classes.swatchRose,
  lavender: classes.swatchLavender,
};

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
    <Popover opened={opened} onChange={setOpened} position="bottom-end" width={320} shadow="lg" radius="lg">
      <Popover.Target>
        <UnstyledButton
          className={classes.trigger}
          onClick={() => setOpened((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={opened}
          aria-label={t('common:theme.pickerLabel')}
        >
          <span className={classes.triggerDot} style={{ background: current.accent }} />
          <span className={classes.triggerLabel}>{t(`common:theme.palettes.${palette}`)}</span>
          <span className={classes.triggerCaret}>▾</span>
        </UnstyledButton>
      </Popover.Target>

      <Popover.Dropdown className={classes.dropdown}>
        <Text className={classes.panelTitle}>{t('common:theme.panelTitle')}</Text>
        <Text className={classes.panelDesc}>{t('common:theme.panelDesc')}</Text>

        <div className={classes.grid} role="menu">
          {PALETTE_ORDER.map((id) => {
            const item = PALETTES[id];
            const active = palette === id;
            return (
              <button
                key={id}
                type="button"
                role="menuitem"
                className={`${classes.card} ${active ? classes.cardActive : ''}`}
                onClick={() => {
                  setPalette(id);
                  setOpened(false);
                }}
              >
                <span className={`${classes.swatch} ${SWATCH_CLASS[id]}`} style={{ ['--swatch-accent' as string]: item.accent }} />
                <span className={classes.cardName}>{t(`common:theme.palettes.${id}`)}</span>
              </button>
            );
          })}
        </div>
      </Popover.Dropdown>
    </Popover>
  );
}
