import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Popover, Button, Text, CloseButton, Group, UnstyledButton, SimpleGrid } from '@mantine/core';
import { DatePicker, DateInput } from '@mantine/dates';
import { useMediaQuery } from '@mantine/hooks';
import dayjs from 'dayjs';
import { IconCalendar } from '@tabler/icons-react';
import classes from './TimeRangePicker.module.css';

export interface TimeRange {
  start: string | null;
  end: string | null;
}

export type DatePreset = '7d' | '30d' | 'month';

interface TimeRangePickerProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
  showPresets?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

function toDate(value: string | null): Date | null {
  return value ? dayjs(value).toDate() : null;
}

function panelAnchor(value: Date | null): Date {
  return value ?? new Date();
}

export function buildPresetRange(preset: DatePreset): TimeRange {
  const end = dayjs().endOf('day');
  if (preset === '7d') {
    return {
      start: dayjs().subtract(6, 'day').startOf('day').toISOString(),
      end: end.toISOString(),
    };
  }
  if (preset === '30d') {
    return {
      start: dayjs().subtract(29, 'day').startOf('day').toISOString(),
      end: end.toISOString(),
    };
  }
  return {
    start: dayjs().startOf('month').toISOString(),
    end: end.toISOString(),
  };
}

export function matchesPreset(range: TimeRange, preset: DatePreset): boolean {
  if (!range.start || !range.end) return false;
  const expected = buildPresetRange(preset);
  return dayjs(range.start).isSame(expected.start, 'day')
    && dayjs(range.end).isSame(expected.end, 'day');
}

function formatRangeLabel(value: TimeRange, separator: string): string {
  const fmt = (d: string | null) => (d ? dayjs(d).format('YYYY-MM-DD') : '—');
  return `${fmt(value.start)} ${separator} ${fmt(value.end)}`;
}

export function TimeRangePicker({
  value,
  onChange,
  showPresets = true,
  minDate,
  maxDate,
}: TimeRangePickerProps) {
  const { t } = useTranslation();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [opened, setOpened] = useState(false);
  const [draftStart, setDraftStart] = useState<Date | null>(null);
  const [draftEnd, setDraftEnd] = useState<Date | null>(null);
  const [startPanelDate, setStartPanelDate] = useState<Date>(() => new Date());
  const [endPanelDate, setEndPanelDate] = useState<Date>(() => new Date());

  const handleOpenChange = useCallback((next: boolean) => {
    if (next) {
      const start = toDate(value.start);
      const end = toDate(value.end);
      setDraftStart(start);
      setDraftEnd(end);
      setStartPanelDate(panelAnchor(start));
      setEndPanelDate(panelAnchor(end));
    }
    setOpened(next);
  }, [value]);

  const handleApply = useCallback(() => {
    if (!draftStart || !draftEnd) return;
    if (dayjs(draftStart).isAfter(draftEnd, 'day')) return;

    onChange({
      start: dayjs(draftStart).startOf('day').toISOString(),
      end: dayjs(draftEnd).endOf('day').toISOString(),
    });
    setOpened(false);
  }, [draftStart, draftEnd, onChange]);

  const handleClear = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    onChange({ start: null, end: null });
    setDraftStart(null);
    setDraftEnd(null);
    setOpened(false);
  }, [onChange]);

  const handlePreset = useCallback((preset: DatePreset) => {
    const range = buildPresetRange(preset);
    onChange(range);
    setOpened(false);
  }, [onChange]);

  const updateDraftStart = useCallback((next: Date | null) => {
    setDraftStart(next);
    if (next) setStartPanelDate(next);
  }, []);

  const updateDraftEnd = useCallback((next: Date | null) => {
    setDraftEnd(next);
    if (next) setEndPanelDate(next);
  }, []);

  const triggerLabel = useMemo(() => {
    if (!value.start && !value.end) return t('common:dateRange.placeholder');
    return formatRangeLabel(value, t('common:dateRange.separator'));
  }, [value, t]);

  const hasValue = !!(value.start || value.end);

  const canApply = !!(draftStart && draftEnd)
    && !dayjs(draftStart).isAfter(draftEnd, 'day');

  const startMaxDate = draftEnd ?? maxDate;
  const endMinDate = draftStart ?? minDate;

  const presetItems: { id: DatePreset; label: string }[] = [
    { id: '7d', label: t('common:dateRange.last7Days') },
    { id: '30d', label: t('common:dateRange.last30Days') },
    { id: 'month', label: t('common:dateRange.thisMonth') },
  ];

  return (
    <Popover
      opened={opened}
      onChange={handleOpenChange}
      position="bottom-start"
      shadow="md"
      radius="md"
      width={isMobile ? 'calc(100vw - 32px)' : 'auto'}
    >
      <Popover.Target>
        <UnstyledButton
          className={`${classes.trigger} ${hasValue ? classes.triggerActive : ''}`}
          onClick={() => handleOpenChange(!opened)}
          aria-label={t('common:dateRange.placeholder')}
          aria-expanded={opened}
        >
          <IconCalendar size={15} className={classes.triggerIcon} />
          <span className={classes.triggerLabel}>{triggerLabel}</span>
          {hasValue && (
            <CloseButton
              size="xs"
              className={classes.clearBtn}
              onClick={handleClear}
              aria-label={t('common:dateRange.clear')}
            />
          )}
        </UnstyledButton>
      </Popover.Target>

      <Popover.Dropdown className={classes.dropdown}>
        {showPresets && (
          <Group gap={6} className={classes.presets}>
            {presetItems.map((preset) => (
              <Button
                key={preset.id}
                size="compact-xs"
                variant={matchesPreset(value, preset.id) ? 'filled' : 'light'}
                color={matchesPreset(value, preset.id) ? 'agentGreen' : 'gray'}
                onClick={() => handlePreset(preset.id)}
              >
                {preset.label}
              </Button>
            ))}
            {hasValue && (
              <Button size="compact-xs" variant="subtle" color="gray" onClick={() => handleClear()}>
                {t('common:dateRange.clear')}
              </Button>
            )}
          </Group>
        )}

        <SimpleGrid cols={isMobile ? 1 : 2} spacing="md" className={classes.panels}>
          <div className={classes.panel}>
            <Text size="xs" fw={600} mb={8}>{t('common:dateRange.startDate')}</Text>
            <DateInput
              value={draftStart}
              onChange={(v) => updateDraftStart(v ? dayjs(v).toDate() : null)}
              valueFormat="YYYY-MM-DD"
              placeholder="YYYY-MM-DD"
              size="xs"
              minDate={minDate}
              maxDate={startMaxDate}
              clearable
              mb="xs"
            />
            <DatePicker
              value={draftStart}
              onChange={(v) => updateDraftStart(v ? dayjs(v).toDate() : null)}
              date={startPanelDate}
              onDateChange={(d) => setStartPanelDate(dayjs(d).toDate())}
              minDate={minDate}
              maxDate={startMaxDate}
              size="sm"
              className={classes.calendar}
            />
          </div>

          <div className={classes.panel}>
            <Text size="xs" fw={600} mb={8}>{t('common:dateRange.endDate')}</Text>
            <DateInput
              value={draftEnd}
              onChange={(v) => updateDraftEnd(v ? dayjs(v).toDate() : null)}
              valueFormat="YYYY-MM-DD"
              placeholder="YYYY-MM-DD"
              size="xs"
              minDate={endMinDate}
              maxDate={maxDate}
              clearable
              mb="xs"
            />
            <DatePicker
              value={draftEnd}
              onChange={(v) => updateDraftEnd(v ? dayjs(v).toDate() : null)}
              date={endPanelDate}
              onDateChange={(d) => setEndPanelDate(dayjs(d).toDate())}
              minDate={endMinDate}
              maxDate={maxDate}
              size="sm"
              className={classes.calendar}
            />
          </div>
        </SimpleGrid>

        <Group justify="space-between" className={classes.footer}>
          <Text size="xs" c="dimmed" className={classes.summary}>
            {draftStart ? dayjs(draftStart).format('YYYY-MM-DD') : '—'}
            {` ${t('common:dateRange.separator')} `}
            {draftEnd ? dayjs(draftEnd).format('YYYY-MM-DD') : '—'}
          </Text>
          <Group gap={8}>
            <Button size="xs" variant="default" onClick={() => setOpened(false)}>
              {t('common:actions.cancel')}
            </Button>
            <Button size="xs" color="agentGreen" disabled={!canApply} onClick={handleApply}>
              {t('common:dateRange.apply')}
            </Button>
          </Group>
        </Group>
      </Popover.Dropdown>
    </Popover>
  );
}
