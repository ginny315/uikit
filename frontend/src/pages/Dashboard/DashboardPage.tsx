import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  IconRobot,
  IconChecklist,
  IconCircleCheck,
  IconChartLine,
} from '@tabler/icons-react';
import { StatCard } from '../../components/shared/StatCard/StatCard';
import { QueueMonitor } from '../../components/shared/QueueMonitor/QueueMonitor';
import type { QueueItem } from '../../components/shared/QueueMonitor/QueueMonitor';
import { SystemHealthCard } from '../../components/shared/SystemHealthCard/SystemHealthCard';
import type { SystemHealthCardProps } from '../../components/shared/SystemHealthCard/SystemHealthCard';
import { StatusBadge } from '../../components/shared/StatusBadge/StatusBadge';
import { Select } from '../../components/shared/Select/Select';
import type { SelectOption } from '../../components/shared/Select/Select';
import type { Task } from '../../types';
import classes from './Dashboard.module.css';

// ── Mock Data (TODO: 替换为 MSW + React Query) ──

const HEALTH_SERVICES: SystemHealthCardProps[] = [
  { name: 'API Gateway', status: 'healthy', uptime: '14d', latency: '2ms' },
  { name: 'Control Service', status: 'healthy', uptime: '14d', latency: '4ms' },
  { name: 'Scheduler', status: 'healthy', uptime: '7d', latency: '1ms' },
  { name: 'Agent Runtime', status: 'healthy', uptime: '14d', latency: '18ms' },
  { name: 'Auth Service', status: 'degraded', uptime: '3d', latency: '45ms' },
  { name: 'Metrics Service', status: 'healthy', uptime: '14d', latency: '8ms' },
  { name: 'Log Service', status: 'healthy', uptime: '14d', latency: '6ms' },
  { name: 'Webhook Service', status: 'healthy', uptime: '14d', latency: '5ms' },
];

const RECENT_TASKS: (Task & { time: string })[] = [
  { id: 'task_7a3f2', agentId: '1', agentName: 'code-reviewer', status: 'succeeded', priority: 3, input: '', duration: 12700, tokensUsed: 1420, createdAt: '', time: '10:32:15' },
  { id: 'task_b81e9', agentId: '2', agentName: 'security-scanner', status: 'running', priority: 4, input: '', createdAt: '', time: '10:31:48' },
  { id: 'task_4c21a', agentId: '3', agentName: 'test-generator', status: 'failed', priority: 2, input: '', duration: 3200, tokensUsed: 560, createdAt: '', time: '10:29:03', errorMessage: 'timeout' },
  { id: 'task_9d55c', agentId: '1', agentName: 'code-reviewer', status: 'queued', priority: 2, input: '', createdAt: '', time: '10:33:00' },
  { id: 'task_e17ab', agentId: '4', agentName: 'slack-notifier', status: 'succeeded', priority: 1, input: '', duration: 800, tokensUsed: 90, createdAt: '', time: '10:28:22' },
];

const THROUGHPUT_BARS = [
  { label: '00:00', height: 45 },
  { label: '03:00', height: 30 },
  { label: '06:00', height: 65 },
  { label: '09:00', height: 88 },
  { label: '12:00', height: 95 },
  { label: '15:00', height: 72 },
  { label: '18:00', height: 58 },
  { label: '21:00', height: 40 },
];

const LATENCY_DATA = [
  { label: '<100ms', width: 62, count: 774, variant: 'fast' as const },
  { label: '100-500ms', width: 24, count: 299, variant: 'mid' as const },
  { label: '500ms-2s', width: 10, count: 125, variant: 'slow' as const },
  { label: '>2s', width: 4, count: 49, variant: 'tail' as const },
];

const LATENCY_FILL_CLASS: Record<string, string> = {
  fast: classes.latencyFast,
  mid: classes.latencyMid,
  slow: classes.latencySlow,
  tail: classes.latencyTail,
};

const PRIORITY_KEYS: Record<number, string> = {
  4: 'urgent',
  3: 'high',
  2: 'normal',
  1: 'low',
};

function formatDuration(ms?: number): string {
  if (ms === undefined) return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function DashboardPage() {
  const { t } = useTranslation();

  const [throughputFilter, setThroughputFilter] = useState('today');
  const [latencyFilter, setLatencyFilter] = useState('all');

  const THROUGHPUT_OPTIONS: SelectOption[] = [
    { value: 'today', label: t('common:time.today') },
    { value: 'week', label: t('common:time.thisWeek') },
    { value: 'month', label: t('common:time.thisMonth') },
  ];

  const LATENCY_OPTIONS: SelectOption[] = [
    { value: 'all', label: t('dashboard:charts.p50p95p99') },
  ];

  const QUEUE_ITEMS: QueueItem[] = [
    { level: 'critical', label: t('dashboard:queue.critical'), count: 3 },
    { level: 'high', label: t('dashboard:queue.high'), count: 18 },
    { level: 'medium', label: t('dashboard:queue.medium'), count: 64 },
    { level: 'low', label: t('dashboard:queue.low'), count: 147 },
  ];

  return (
    <>
      {/* ── Stats Cards ── */}
      <div className={classes.statsRow}>
        <StatCard
          icon={<IconRobot size={16} strokeWidth={2.2} />}
          iconBg="rgba(168,85,247,0.12)"
          iconColor="#A855F7"
          label={t('dashboard:stats.activeAgents')}
          value={12}
          trend={t('dashboard:stats.newThisWeek', { count: 2 })}
          trendDirection="up"
        />
        <StatCard
          icon={<IconChecklist size={16} strokeWidth={2.2} />}
          iconBg="rgba(6,182,212,0.12)"
          iconColor="#06B6D4"
          label={t('dashboard:stats.todayTasks')}
          value="1,247"
          trend={t('dashboard:stats.vsYesterday', { pct: 12.5 })}
          trendDirection="up"
        />
        <StatCard
          icon={<IconCircleCheck size={16} strokeWidth={2.2} />}
          iconBg="rgba(34,197,94,0.12)"
          iconColor="#22C55E"
          label={t('dashboard:stats.successRate')}
          value="98.4"
          unit="%"
          trend={t('dashboard:stats.latencyImproved', { pct: 0.3 })}
          trendDirection="up"
        />
        <StatCard
          icon={<IconChartLine size={16} strokeWidth={2.2} />}
          iconBg="rgba(245,158,11,0.12)"
          iconColor="#F59E0B"
          label={t('dashboard:stats.tokenUsage')}
          value="852K"
          unit=" / 5M"
          trend={t('dashboard:stats.quotaRemaining', { pct: 83 })}
          trendDirection="neutral"
        />
      </div>

      {/* ── Charts Row ── */}
      <div className={classes.chartsRow}>
        <div className={classes.chartCard}>
          <div className={classes.chartHeader}>
            <span className={classes.chartTitle}>{t('dashboard:charts.taskThroughput')}</span>
            <Select
              options={THROUGHPUT_OPTIONS}
              value={throughputFilter}
              onChange={setThroughputFilter}
            />
          </div>
          <div className={classes.barChart}>
            {THROUGHPUT_BARS.map((bar) => (
              <div key={bar.label} className={classes.barCol}>
                <div className={`${classes.bar} ${classes.barGreen}`} style={{ height: `${bar.height}%` }} />
                <span className={classes.barLabel}>{bar.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={classes.chartCard}>
          <div className={classes.chartHeader}>
            <span className={classes.chartTitle}>{t('dashboard:charts.latencyDistribution')}</span>
            <Select
              options={LATENCY_OPTIONS}
              value={latencyFilter}
              onChange={setLatencyFilter}
            />
          </div>
          <div className={classes.latencyBars}>
            {LATENCY_DATA.map((row) => (
              <div key={row.label} className={classes.latencyRow}>
                <span className={classes.latencyLabel}>{row.label}</span>
                <div className={classes.latencyTrack}>
                  <div className={`${classes.latencyFill} ${LATENCY_FILL_CLASS[row.variant]}`} style={{ width: `${row.width}%` }} />
                </div>
                <span className={classes.latencyCount}>{row.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Queue + Recent Tasks ── */}
      <div className={classes.queueTasksRow}>
        <QueueMonitor items={QUEUE_ITEMS} />

        <div className={classes.tasksCard}>
          <div className={classes.tasksHeader}>
            <span className={classes.tasksTitle}>{t('dashboard:recentTasks.title')}</span>
            <Link to="/tasks" className={classes.tasksLink}>{t('common:actions.viewAll')}</Link>
          </div>
          <div className={classes.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>{t('dashboard:recentTasks.taskId')}</th>
                  <th>{t('dashboard:recentTasks.agent')}</th>
                  <th>{t('dashboard:recentTasks.status')}</th>
                  <th>{t('dashboard:recentTasks.priority')}</th>
                  <th>{t('dashboard:recentTasks.duration')}</th>
                  <th>{t('dashboard:recentTasks.time')}</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_TASKS.map((task) => (
                  <tr key={task.id}>
                    <td className={classes.monoCell}>{task.id}</td>
                    <td>{task.agentName}</td>
                    <td><StatusBadge status={task.status} /></td>
                    <td>
                      <span className={task.priority >= 3 ? classes.priorityHigh : task.priority === 1 ? classes.priorityLow : classes.priorityNormal}>
                        {t(`dashboard:priority.${PRIORITY_KEYS[task.priority] ?? 'normal'}`)}
                      </span>
                    </td>
                    <td className={classes.monoCell}>{formatDuration(task.duration)}</td>
                    <td className={classes.timeCell}>{task.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── System Health ── */}
      <div className={classes.healthSection}>
        <div className={classes.healthHeader}>
          <span className={classes.healthTitle}>{t('dashboard:systemHealth.title')}</span>
          <span className={classes.healthStatus}>{t('dashboard:stats.allHealthy')}</span>
        </div>
        <div className={classes.healthGrid}>
          {HEALTH_SERVICES.map((svc) => (
            <SystemHealthCard key={svc.name} {...svc} />
          ))}
        </div>
      </div>
    </>
  );
}
