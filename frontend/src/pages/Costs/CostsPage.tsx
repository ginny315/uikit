import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Switch, TextInput, Button, NumberInput, Modal } from '@mantine/core';
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
import classes from './Costs.module.css';

// ── Mock Data ──

interface CostByAgent {
  agentId: string;
  agentName: string;
  cost: number;
  tokens: number;
  tasks: number;
}

interface CostByDay {
  date: string;
  cost: number;
}

interface QuotaEntry {
  agentId: string;
  agentName: string;
  dailyLimit: number;
  used: number;
}

const MOCK_COST_BY_AGENT: CostByAgent[] = [
  { agentId: '1', agentName: 'code-reviewer', cost: 42.50, tokens: 425000, tasks: 87 },
  { agentId: '2', agentName: 'security-scanner', cost: 28.30, tokens: 283000, tasks: 54 },
  { agentId: '3', agentName: 'test-generator', cost: 15.75, tokens: 157500, tasks: 32 },
  { agentId: '4', agentName: 'slack-notifier', cost: 3.20, tokens: 32000, tasks: 148 },
  { agentId: '5', agentName: 'doc-writer', cost: 18.90, tokens: 189000, tasks: 23 },
];

const MOCK_COST_BY_USER: CostByAgent[] = [
  { agentId: 'u1', agentName: 'Alice Chen', cost: 52.80, tokens: 528000, tasks: 156 },
  { agentId: 'u2', agentName: 'Bob Zhang', cost: 31.45, tokens: 314500, tasks: 89 },
  { agentId: 'u3', agentName: 'Carol Li', cost: 18.20, tokens: 182000, tasks: 67 },
  { agentId: 'u4', agentName: 'David Wang', cost: 6.20, tokens: 62000, tasks: 32 },
];

const MOCK_COST_BY_DAY: CostByDay[] = [
  { date: '07/15', cost: 18.50 },
  { date: '07/16', cost: 22.30 },
  { date: '07/17', cost: 15.80 },
  { date: '07/18', cost: 28.90 },
  { date: '07/19', cost: 19.20 },
  { date: '07/20', cost: 25.60 },
  { date: '07/21', cost: 12.40 },
];

const MOCK_QUOTAS: QuotaEntry[] = [
  { agentId: '1', agentName: 'code-reviewer', dailyLimit: 500000, used: 425000 },
  { agentId: '2', agentName: 'security-scanner', dailyLimit: 300000, used: 283000 },
  { agentId: '3', agentName: 'test-generator', dailyLimit: 200000, used: 157500 },
  { agentId: '4', agentName: 'slack-notifier', dailyLimit: 100000, used: 32000 },
  { agentId: '5', agentName: 'doc-writer', dailyLimit: 250000, used: 189000 },
];

const MAX_BAR_COST = Math.max(...MOCK_COST_BY_AGENT.map((a) => a.cost));
const MAX_DAY_COST = Math.max(...MOCK_COST_BY_DAY.map((d) => d.cost));

export function CostsPage() {
  const { t } = useTranslation();

  const [breakdownTab, setBreakdownTab] = useState<'agent' | 'user'>('agent');
  const [alertEnabled, setAlertEnabled] = useState(false);
  const [dailyThreshold, setDailyThreshold] = useState(50);
  const [alertEmail, setAlertEmail] = useState('admin@example.com');
  const [editQuota, setEditQuota] = useState<{ agentId: string; agentName: string; limit: number } | null>(null);

  const breakdownOptions: SelectOption[] = [
    { value: 'agent', label: t('costs:breakdown.byAgent') },
    { value: 'user', label: t('costs:breakdown.byUser') },
  ];

  const breakdownData = breakdownTab === 'agent' ? MOCK_COST_BY_AGENT : MOCK_COST_BY_USER;

  const todayCost = 12.40;
  const weekCost = 108.65;
  const monthCost = 452.80;
  const todayTokens = 124000;

  function handleSaveAlert() {
    notifications.show({ message: t('costs:alerts.alertSaved'), color: 'green' });
  }

  function handleSaveQuota() {
    notifications.show({ message: t('costs:quota.quotaSaved'), color: 'green' });
    setEditQuota(null);
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
          value={todayCost.toFixed(2)}
          unit="$"
        />
        <StatCard
          icon={<IconReceipt size={16} strokeWidth={2.2} />}
          iconBg="rgba(6,182,212,0.12)"
          iconColor="#06B6D4"
          label={t('costs:stats.weekCost')}
          value={weekCost.toFixed(2)}
          unit="$"
        />
        <StatCard
          icon={<IconChartLine size={16} strokeWidth={2.2} />}
          iconBg="rgba(168,85,247,0.12)"
          iconColor="#A855F7"
          label={t('costs:stats.monthCost')}
          value={monthCost.toFixed(2)}
          unit="$"
        />
        <StatCard
          icon={<IconFlame size={16} strokeWidth={2.2} />}
          iconBg="rgba(239,68,68,0.12)"
          iconColor="#EF4444"
          label={t('costs:stats.todayTokens')}
          value={todayTokens.toLocaleString()}
        />
        <StatCard
          icon={<IconGauge size={16} strokeWidth={2.2} />}
          iconBg="rgba(34,197,94,0.12)"
          iconColor="#22C55E"
          label={t('costs:stats.avgCostPerTask')}
          value="0.36"
          unit="$"
        />
        <StatCard
          icon={<IconChartLine size={16} strokeWidth={2.2} />}
          iconBg="rgba(59,130,246,0.12)"
          iconColor="#3B82F6"
          label={t('costs:stats.projectedMonth')}
          value="512.00"
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
                  const pct = ((row.cost / totalCost) * 100).toFixed(1);
                  const barWidth = (row.cost / MAX_BAR_COST) * 100;
                  return (
                    <tr key={row.agentId}>
                      <td className={classes.nameCell}>{row.agentName}</td>
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
            {MOCK_COST_BY_DAY.map((day) => (
              <div key={day.date} className={classes.barCol}>
                <div
                  className={classes.bar}
                  style={{ height: `${(day.cost / MAX_DAY_COST) * 100}%` }}
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
              {MOCK_QUOTAS.map((q) => {
                const usagePct = (q.used / q.dailyLimit) * 100;
                const isHigh = usagePct > 80;
                return (
                  <tr key={q.agentId}>
                    <td className={classes.nameCell}>{q.agentName}</td>
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
                        onClick={() => setEditQuota({ agentId: q.agentId, agentName: q.agentName, limit: q.dailyLimit })}
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
              <Button onClick={handleSaveAlert} mt="lg">{t('costs:alerts.saveAlert')}</Button>
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
                <div className={classes.quotaTargetName}>{editQuota.agentName}</div>
                {(() => {
                  const q = MOCK_QUOTAS.find((q) => q.agentId === editQuota.agentId);
                  return q ? (
                    <div className={classes.quotaTargetUsage}>
                      {t('costs:quota.used')}: {q.used.toLocaleString()} / {q.dailyLimit.toLocaleString()} tokens
                    </div>
                  ) : null;
                })()}
              </div>
            </div>
            <NumberInput
              label={t('costs:quota.dailyLimit')}
              value={editQuota.limit}
              onChange={(v) => setEditQuota({ ...editQuota, limit: Number(v) || 0 })}
              min={0}
              step={10000}
              w="100%"
              mt="md"
            />
            <Button fullWidth mt="lg" onClick={handleSaveQuota} size="md">{t('common:actions.save')}</Button>
          </div>
        )}
      </Modal>
    </>
  );
}
