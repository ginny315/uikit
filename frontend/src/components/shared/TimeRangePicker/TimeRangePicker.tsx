import { useState, useCallback, useMemo } from 'react';
import { Popover, Button, Text, CloseButton, Input, Group } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import dayjs from 'dayjs';
import { IconCalendar } from '@tabler/icons-react';
import classes from './TimeRangePicker.module.css';

// ── Types ──

export interface TimeRange {
  start: string | null;
  end: string | null;
}

interface TimeRangePickerProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

// ── Component ──

export function TimeRangePicker({ value, onChange }: TimeRangePickerProps) {
  const [opened, setOpened] = useState(false);

  // Popover 内草稿（各自独立的日期面板）
  const [draftStart, setDraftStart] = useState<Date | null>(null);
  const [draftEnd, setDraftEnd] = useState<Date | null>(null);

  const handleOpen = useCallback(() => {
    setDraftStart(value.start ? dayjs(value.start).toDate() : null);
    setDraftEnd(value.end ? dayjs(value.end).toDate() : null);
    setOpened(true);
  }, [value]);

  const handleApply = useCallback(() => {
    setOpened(false);
    onChange({
      start: draftStart ? dayjs(draftStart).startOf('day').toISOString() : null,
      end: draftEnd ? dayjs(draftEnd).endOf('day').toISOString() : null,
    });
  }, [draftStart, draftEnd, onChange]);

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setOpened(false);
      onChange({ start: null, end: null });
    },
    [onChange],
  );

  const triggerLabel = useMemo(() => {
    if (!value.start && !value.end) return '选择日期范围';
    const fmt = (d: string | null) => (d ? dayjs(d).format('YYYY-MM-DD') : '—');
    return `${fmt(value.start)} 至 ${fmt(value.end)}`;
  }, [value]);

  const hasValue = !!(value.start || value.end);

  return (
    <Popover opened={opened} onChange={setOpened} position="bottom-start" shadow="md" width={520}>
      <Popover.Target>
        <Input
          component="button"
          size="xs"
          leftSection={<IconCalendar size={14} />}
          rightSection={
            hasValue ? <CloseButton size={14} onClick={handleClear} /> : undefined
          }
          rightSectionPointerEvents="all"
          classNames={{ input: classes.trigger }}
          onClick={handleOpen}
        >
          {triggerLabel}
        </Input>
      </Popover.Target>

      <Popover.Dropdown className={classes.dropdown}>
        <Group gap="md" align="flex-start" wrap="nowrap">
          <DatePicker
            key={`start-${opened}`}
            value={draftStart}
            onChange={(v) => setDraftStart(v ? dayjs(v).toDate() : null)}
            defaultDate={value.start ? dayjs(value.start).toDate() : undefined}
            maxDate={draftEnd ?? undefined}
            size="sm"
          />
          <DatePicker
            key={`end-${opened}`}
            value={draftEnd}
            onChange={(v) => setDraftEnd(v ? dayjs(v).toDate() : null)}
            defaultDate={value.end ? dayjs(value.end).toDate() : undefined}
            minDate={draftStart ?? undefined}
            size="sm"
          />
        </Group>

        <Group justify="space-between" mt="md" pt="sm" className={classes.footer}>
          <Text size="xs" c="dimmed">
            {draftStart ? dayjs(draftStart).format('YYYY-MM-DD') : '—'}
            {' 至 '}
            {draftEnd ? dayjs(draftEnd).format('YYYY-MM-DD') : '—'}
          </Text>
          <Button size="xs" color="agentGreen" onClick={handleApply}>
            确定
          </Button>
        </Group>
      </Popover.Dropdown>
    </Popover>
  );
}
