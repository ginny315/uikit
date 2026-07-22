import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Switch, TextInput, Button, NumberInput, Loader, Center, Badge, Text } from '@mantine/core';
import { BarChart } from '@mantine/charts';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';
import {
  IconCoin,
  IconChartLine,
  IconFlame,
  IconReceipt,
  IconBell,
  IconGauge,
} from '@tabler/icons-react';
import { StatCard } from '../../components/shared/StatCard/StatCard';
import { AppModal } from '../../components/shared/AppModal/AppModal';
import { Select } from '../../components/shared/Select/Select';
import type { SelectOption } from '../../components/shared/Select/Select';
import { TimeRangePicker, type TimeRange } from '../../components/shared/TimeRangePicker/TimeRangePicker';
import { useApiQuery, useApiMutation, queryKeys } from '../../hooks/useApi';
import { fetchCostReport, updateQuota, updateAlerts } from '../../services/costs';
import type { CostBreakdownItem, QuotaEntry } from '../../services/costs';
import { STAT_ICON } from '../../lib/statIconTheme';
import classes from './Costs.module.css';

type DatePreset = '7d' | '30d' | 'month';

function buildDefaultDateRange(): TimeRange {
  return {
    start: dayjs().subtract(6, 'day').startOf('day').toISOString(),
    end: dayjs().endOf('day').toISOString(),
  };
}

function buildPresetRange(preset: DatePreset): TimeRange {
  const end = dayjs().endOf('day');
  if (preset === '7d') {
    return { start: dayjs().subtract(6, 'day').startOf('day').toISOString(), end: end.toISOString() };
  }
  if (preset === '30d') {
    return { start: dayjs().subtract(29, 'day').startOf('day').toISOString(), end: end.toISOString() };
  }
  return { start: dayjs().startOf('month').toISOString(), end: end.toISOString() };
}

function formatChartDate(isoDate: string): string {
  return dayjs(isoDate).format('MM/DD');
}

function matchesPreset(range: TimeRange, preset: DatePreset): boolean {
  if (!range.start || !range.end) return false;
  const expected = buildPresetRange(preset);
  return dayjs(range.start).isSame(expected.start, 'day') && dayjs(range.end).isSame(expected.end, 'day');
}

export function CostsPage() {
  const { t } = useTranslation();

  const [breakdownTab, setBreakdownTab] = useState<'agent' | 'user'>('agent');
  const [dateRange, setDateRange] = useState<TimeRange>(buildDefaultDateRange);
  const [alertEnabled, setAlertEnabled] = useState(false);
  const [dailyThreshold, setDailyThreshold] = useState(50);
  const [alertEmail, setAlertEmail] = useState('admin@example.com');
  const [editQuota, setEditQuota] = useState<QuotaEntry | null>(null);

  // ── Data fetching ──
  const reportParams = useMemo(() => ({
    groupBy: breakdownTab,
    start: dateRange.start ?? undefined,
    end: dateRange.end ?? undefined,
  }), [breakdownTab, dateRange.start, dateRange.end]);

  const { data: report, isLoading } = useApiQuery(
    queryKeys.costs.report(reportParams),
    () => fetchCostReport(reportParams),
  );

  const quotaMutation = useApiMutation(queryKeys.costs.all, (vars: { agentId: string; limit: number }) =>
    updateQuota(vars.agentId, { dailyLimit: vars.limit }),
  );

  const alertMutation = useApiMutation(queryKeys.costs.all, () =>
    updateAlerts({ enabled: alertEnabled, threshold: dailyThreshold, email: alertEmail }),
  );

  const breakdownOptions: SelectOption[] = [
    { value: 'agent', label: t('costs:breakdown.byAgent') },
    { value: 'user', label: t('costs:breakdown.byUser') },
  ];

  const datePresets: { id: DatePreset; label: string }[] = [
    { id: '7d', label: t('costs:dateRange.last7Days') },
    { id: '30d', label: t('costs:dateRange.last30Days') },
    { id: 'month', label: t('costs:dateRange.thisMonth') },
  ];

  const dailyTrend = report?.dailyTrend ?? [];
  const breakdownData: CostBreakdownItem[] = report?.breakdown ?? [];
  const quotas: QuotaEntry[] = report?.quotas ?? [];
  const maxBarCost = Math.max(...breakdownData.map((a) => a.cost), 1);
  const periodTotal = dailyTrend.reduce((sum, d) => sum + d.cost, 0);

  const trendChartData = useMemo(
    () => (report?.dailyTrend ?? []).map((day) => ({
      date: formatChartDate(day.date),
      cost: day.cost,
    })),
    [report?.dailyTrend],
  );

  const summary = report?.summary;

  function handleSaveAlert() {
    alertMutation.mutate(undefined, {
      onSuccess: () => notifications.show({ message: t('costs:alerts.alertSaved'), color: 'green' }),
    });
  }

  function handleSaveQuota() {
    if (!editQuota) return;
    quotaMutation.mutate(
      { agentId: editQuota.id, limit: editQuota.dailyLimit },
      {
        onSuccess: () => {
          notifications.show({ message: t('costs:quota.quotaSaved'), color: 'green' });
          setEditQuota(null);
        },
      },
    );
  }

  if (isLoading) {
    return (
      <Center h={400}>
        <Loader />
      </Center>
    );
  }

  return (
    <>
      <div className={classes.header}>
        <h1 className={classes.title}>{t('costs:title')}</h1>
      </div>

      {/* ── Stats Cards（固定快照，不受周期筛选影响）── */}
      <div className={classes.statsRow}>
        <StatCard
          icon={<IconCoin size={16} strokeWidth={2.2} />}
          iconBg={STAT_ICON.amber.iconBg}
          iconColor={STAT_ICON.amber.iconColor}
          label={t('costs:stats.todayCost')}
          value={summary?.todayCost.toFixed(2) ?? '—'}
          unit="$"
        />
        <StatCard
          icon={<IconReceipt size={16} strokeWidth={2.2} />}
          iconBg={STAT_ICON.green.iconBg}
          iconColor={STAT_ICON.green.iconColor}
          label={t('costs:stats.weekCost')}
          value={summary?.weekCost.toFixed(2) ?? '—'}
          unit="$"
        />
        <StatCard
          icon={<IconChartLine size={16} strokeWidth={2.2} />}
          iconBg={STAT_ICON.green.iconBg}
          iconColor={STAT_ICON.green.iconColor}
          label={t('costs:stats.monthCost')}
          value={summary?.monthCost.toFixed(2) ?? '—'}
          unit="$"
        />
        <StatCard
          icon={<IconFlame size={16} strokeWidth={2.2} />}
          iconBg={STAT_ICON.cyan.iconBg}
          iconColor={STAT_ICON.cyan.iconColor}
          label={t('costs:stats.todayTokens')}
          value={summary?.todayTokens.toLocaleString() ?? '—'}
        />
        <StatCard
          icon={<IconGauge size={16} strokeWidth={2.2} />}
          iconBg={STAT_ICON.cyan.iconBg}
          iconColor={STAT_ICON.cyan.iconColor}
          label={t('costs:stats.avgCostPerTask')}
          value={summary?.avgCostPerTask.toFixed(2) ?? '—'}
          unit="$"
        />
        <StatCard
          icon={<IconChartLine size={16} strokeWidth={2.2} />}
          iconBg={STAT_ICON.amber.iconBg}
          iconColor={STAT_ICON.amber.iconColor}
          label={t('costs:stats.projectedMonth')}
          value={summary?.projectedMonth.toFixed(2) ?? '—'}
          unit="$"
        />
      </div>

      {/* ── 周期分析：日期控件 + 趋势图 + 明细表 ── */}
      <section className={classes.analysisSection}>
        <div className={classes.analysisToolbar}>
          <div>
            <Text className={classes.analysisTitle}>{t('costs:analysis.title')}</Text>
            <Text size="xs" c="dimmed" mt={4}>{t('costs:analysis.desc')}</Text>
          </div>
          <div className={classes.dateToolbar}>
            {datePresets.map((preset) => (
              <Badge
                key={preset.id}
                className={classes.presetChip}
                variant={matchesPreset(dateRange, preset.id) ? 'filled' : 'light'}
                color={matchesPreset(dateRange, preset.id) ? 'agentGreen' : 'gray'}
                onClick={() => setDateRange(buildPresetRange(preset.id))}
              >
                {preset.label}
              </Badge>
            ))}
            <TimeRangePicker value={dateRange} onChange={setDateRange} />
          </div>
        </div>

        <div className={classes.chartCard}>
          <div className={classes.chartHeader}>
            <div>
              <span className={classes.chartTitle}>{t('costs:breakdown.dailyTrend')}</span>
              {dailyTrend.length > 0 && (
                <Text size="xs" c="dimmed" mt={4}>
                  {t('costs:breakdown.periodSummary', { amount: periodTotal.toFixed(2) })}
                </Text>
              )}
            </div>
          </div>
          {dailyTrend.length === 0 ? (
            <div className={classes.chartEmpty}>{t('costs:breakdown.dailyTrendEmpty')}</div>
          ) : (
            <BarChart
              h={260}
              data={trendChartData}
              dataKey="date"
              series={[{ name: 'cost', label: t('costs:breakdown.cost'), color: 'agentGreen.6' }]}
              tickLine="y"
              gridAxis="xy"
              withLegend={false}
              valueFormatter={(value) => `$${Number(value).toFixed(2)}`}
              className={classes.trendChart}
            />
          )}
        </div>

        <div className={classes.chartCard}>
          <div className={classes.chartHeader}>
            <span className={classes.chartTitle}>{t('costs:breakdown.title')}</span>
            <Select
              options={breakdownOptions}
              value={breakdownTab}
              onChange={(v) => setBreakdownTab(v as 'agent' | 'user')}
            />
          </div>
          <div className={classes.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>{t(`costs:breakdown.${breakdownTab}`)}</th>
                  <th>{t('costs:breakdown.cost')}</th>
                  <th>{t('costs:breakdown.tokens')}</th>
                  <th>{t('costs:breakdown.tasks')}</th>
                  <th>{t('costs:breakdown.percentage')}</th>
                </tr>
              </thead>
              <tbody>
                {breakdownData.map((row) => {
                  const totalCost = breakdownData.reduce((s, r) => s + r.cost, 0);
                  const pct = totalCost > 0 ? ((row.cost / totalCost) * 100).toFixed(1) : '0';
                  const barWidth = (row.cost / maxBarCost) * 100;
                  return (
                    <tr key={row.id}>
                      <td className={classes.nameCell}>{row.name}</td>
                      <td className={classes.monoCell}>${row.cost.toFixed(2)}</td>
                      <td className={classes.monoCell}>{row.tokens.toLocaleString()}</td>
                      <td className={classes.monoCell}>{row.tasks}</td>
                      <td>
                        <div className={classes.pctCell}>
                          <div className={classes.pctBar} style={{ width: `${barWidth}%` }} />
                          <span className={classes.pctText}>{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Quota Management ── */}
      <div className={classes.section}>
        <div className={classes.sectionHeader}>
          <span className={classes.sectionTitle}>{t('costs:quota.title')}</span>
        </div>
        <div className={classes.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>{t('costs:quota.agent')}</th>
                <th>{t('costs:quota.dailyLimit')}</th>
                <th>{t('costs:quota.used')}</th>
                <th>{t('costs:quota.remaining')}</th>
                <th>{t('costs:quota.usage')}</th>
                <th style={{ width: 80 }}>{t('common:actions.edit')}</th>
              </tr>
            </thead>
            <tbody>
              {quotas.map((q) => {
                const usagePct = q.dailyLimit > 0 ? (q.used / q.dailyLimit) * 100 : 0;
                const isHigh = usagePct > 80;
                return (
                  <tr key={q.id}>
                    <td className={classes.nameCell}>{q.name}</td>
                    <td className={classes.monoCell}>{q.dailyLimit.toLocaleString()}</td>
                    <td className={classes.monoCell}>{q.used.toLocaleString()}</td>
                    <td className={classes.monoCell}>{(q.dailyLimit - q.used).toLocaleString()}</td>
                    <td>
                      <div className={classes.usageBar}>
                        <div
                          className={`${classes.usageFill} ${isHigh ? classes.usageHigh : classes.usageNormal}`}
                          style={{ width: `${Math.min(usagePct, 100)}%` }}
                        />
                        <span className={`${classes.usageText} ${isHigh ? classes.usageTextHigh : ''}`}>
                          {usagePct.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <Button
                        variant="subtle"
                        size="compact-xs"
                        onClick={() => setEditQuota(q)}
                      >
                        {t('common:actions.edit')}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Cost Alerts ── */}
      <div className={classes.section}>
        <div className={classes.sectionHeader}>
          <span className={classes.sectionTitle}>
            <IconBell size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            {t('costs:alerts.title')}
          </span>
          <span className={`${classes.alertStatus} ${alertEnabled ? classes.alertOn : classes.alertOff}`}>
            {alertEnabled ? t('costs:alerts.enabled') : t('costs:alerts.disabled')}
          </span>
        </div>
        <div className={classes.alertForm}>
          <Switch
            label={alertEnabled ? t('costs:alerts.enabled') : t('costs:alerts.disabled')}
            checked={alertEnabled}
            onChange={(e) => setAlertEnabled(e.currentTarget.checked)}
            size="md"
          />
          {alertEnabled && (
            <div className={classes.alertFields}>
              <NumberInput
                label={t('costs:alerts.dailyThreshold')}
                value={dailyThreshold}
                onChange={(v) => setDailyThreshold(Number(v) || 0)}
                min={1}
                prefix="$"
                w={200}
              />
              <TextInput
                label={t('costs:alerts.email')}
                value={alertEmail}
                onChange={(e) => setAlertEmail(e.currentTarget.value)}
                placeholder={t('costs:alerts.emailPlaceholder')}
                w={280}
              />
              <Button onClick={handleSaveAlert} mt="lg" loading={alertMutation.isPending}>
                {t('costs:alerts.saveAlert')}
              </Button>
            </div>
          )}
        </div>
      </div>

      <AppModal
        opened={editQuota !== null}
        onClose={() => setEditQuota(null)}
        title={t('costs:quota.editQuota')}
        footer={
          <>
            <Button variant="default" onClick={() => setEditQuota(null)}>
              {t('common:actions.cancel')}
            </Button>
            <Button onClick={handleSaveQuota} loading={quotaMutation.isPending}>
              {t('common:actions.save')}
            </Button>
          </>
        }
      >
        {editQuota && (
          <>
            <div className={classes.quotaTarget}>
              <IconGauge size={18} style={{ color: 'var(--mantine-color-dimmed)' }} />
              <div>
                <div className={classes.quotaTargetName}>{editQuota.name}</div>
                <div className={classes.quotaTargetUsage}>
                  {t('costs:quota.used')}: {editQuota.used.toLocaleString()} / {editQuota.dailyLimit.toLocaleString()} tokens
                </div>
              </div>
            </div>
            <NumberInput
              label={t('costs:quota.dailyLimit')}
              value={editQuota.dailyLimit}
              onChange={(v) => setEditQuota({ ...editQuota, dailyLimit: Number(v) || 0 })}
              min={0}
              step={10000}
              mt="md"
            />
          </>
        )}
      </AppModal>
    </>
  );
}
