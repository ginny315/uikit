import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Switch, TextInput, Button, NumberInput, Modal, Loader, Center } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconCoin,
  IconChartLine,
  IconFlame,
  IconReceipt,
  IconBell,
  IconGauge,
} from '@tabler/icons-react';
import { StatCard } from '../../components/shared/StatCard/StatCard';
import { Select } from '../../components/shared/Select/Select';
import type { SelectOption } from '../../components/shared/Select/Select';
import { useApiQuery, useApiMutation, queryKeys } from '../../hooks/useApi';
import { fetchCostReport, updateQuota, updateAlerts } from '../../services/costs';
import type { CostBreakdownItem, QuotaEntry } from '../../services/costs';
import classes from './Costs.module.css';

export function CostsPage() {
  const { t } = useTranslation();

  const [breakdownTab, setBreakdownTab] = useState<'agent' | 'user'>('agent');
  const [alertEnabled, setAlertEnabled] = useState(false);
  const [dailyThreshold, setDailyThreshold] = useState(50);
  const [alertEmail, setAlertEmail] = useState('admin@example.com');
  const [editQuota, setEditQuota] = useState<QuotaEntry | null>(null);

  // ── Data fetching ──
  const { data: report, isLoading } = useApiQuery(
    queryKeys.costs.report({ groupBy: breakdownTab }),
    () => fetchCostReport(breakdownTab === 'agent' ? 'agent' : 'user'),
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

  const breakdownData: CostBreakdownItem[] = report?.breakdown ?? [];
  const quotas: QuotaEntry[] = report?.quotas ?? [];
  const maxBarCost = Math.max(...breakdownData.map((a) => a.cost), 1);
  const maxDayCost = Math.max(...(report?.dailyTrend ?? []).map((d) => d.cost), 1);

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

      {/* ── Stats Cards ── */}
      <div className={classes.statsRow}>
        <StatCard
          icon={<IconCoin size={16} strokeWidth={2.2} />}
          iconBg="rgba(245,158,11,0.12)"
          iconColor="#F59E0B"
          label={t('costs:stats.todayCost')}
          value={summary?.todayCost.toFixed(2) ?? '—'}
          unit="$"
        />
        <StatCard
          icon={<IconReceipt size={16} strokeWidth={2.2} />}
          iconBg="rgba(6,182,212,0.12)"
          iconColor="#06B6D4"
          label={t('costs:stats.weekCost')}
          value={summary?.weekCost.toFixed(2) ?? '—'}
          unit="$"
        />
        <StatCard
          icon={<IconChartLine size={16} strokeWidth={2.2} />}
          iconBg="rgba(168,85,247,0.12)"
          iconColor="#A855F7"
          label={t('costs:stats.monthCost')}
          value={summary?.monthCost.toFixed(2) ?? '—'}
          unit="$"
        />
        <StatCard
          icon={<IconFlame size={16} strokeWidth={2.2} />}
          iconBg="rgba(239,68,68,0.12)"
          iconColor="#EF4444"
          label={t('costs:stats.todayTokens')}
          value={summary?.todayTokens.toLocaleString() ?? '—'}
        />
        <StatCard
          icon={<IconGauge size={16} strokeWidth={2.2} />}
          iconBg="rgba(34,197,94,0.12)"
          iconColor="#22C55E"
          label={t('costs:stats.avgCostPerTask')}
          value={summary?.avgCostPerTask.toFixed(2) ?? '—'}
          unit="$"
        />
        <StatCard
          icon={<IconChartLine size={16} strokeWidth={2.2} />}
          iconBg="rgba(59,130,246,0.12)"
          iconColor="#3B82F6"
          label={t('costs:stats.projectedMonth')}
          value={summary?.projectedMonth.toFixed(2) ?? '—'}
          unit="$"
        />
      </div>

      {/* ── Cost Breakdown + Trend Chart ── */}
      <div className={classes.chartsRow}>
        {/* Breakdown Table */}
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

        {/* Daily Trend Chart */}
        <div className={classes.chartCard}>
          <div className={classes.chartHeader}>
            <span className={classes.chartTitle}>{t('costs:breakdown.byDay')}</span>
          </div>
          <div className={classes.barChart}>
            {(report?.dailyTrend ?? []).map((day) => (
              <div key={day.date} className={classes.barCol}>
                <div
                  className={classes.bar}
                  style={{ height: `${(day.cost / maxDayCost) * 100}%` }}
                />
                <span className={classes.barLabel}>{day.date}</span>
                <span className={classes.barValue}>${day.cost.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

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
                placeholder="admin@example.com"
                w={280}
              />
              <Button onClick={handleSaveAlert} mt="lg" loading={alertMutation.isPending}>
                {t('costs:alerts.saveAlert')}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ── Edit Quota Modal ── */}
      <Modal
        opened={editQuota !== null}
        onClose={() => setEditQuota(null)}
        title={t('costs:quota.editQuota')}
        centered
      >
        {editQuota && (
          <div>
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
              w="100%"
              mt="md"
            />
            <Button fullWidth mt="lg" onClick={handleSaveQuota} size="md" loading={quotaMutation.isPending}>
              {t('common:actions.save')}
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
}
