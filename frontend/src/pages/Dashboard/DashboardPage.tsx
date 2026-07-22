import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Center, Loader } from '@mantine/core';
import {
  IconRobot,
  IconChecklist,
  IconCircleCheck,
  IconChartLine,
} from '@tabler/icons-react';
import { StatCard } from '../../components/shared/StatCard/StatCard';
import { STAT_ICON } from '../../lib/statIconTheme';
import { QueueMonitor } from '../../components/shared/QueueMonitor/QueueMonitor';
import type { QueueItem } from '../../components/shared/QueueMonitor/QueueMonitor';
import { SystemHealthCard } from '../../components/shared/SystemHealthCard/SystemHealthCard';
import { StatusBadge } from '../../components/shared/StatusBadge/StatusBadge';
import { Select } from '../../components/shared/Select/Select';
import type { SelectOption } from '../../components/shared/Select/Select';
import { useApiQuery, queryKeys } from '../../hooks/useApi';
import { useRealtimeInterval } from '../../hooks/useRealtime';
import {
  fetchDashboardMetrics,
  fetchQueueStatus,
  fetchServiceHealth,
  fetchRecentTasks,
  fetchTaskThroughput,
  fetchLatencyDistribution,
} from '../../services/dashboard';
import { formatTokens } from '../../lib/format';
import classes from './Dashboard.module.css';

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

function extractTime(createdAt: string): string {
  const parts = createdAt.split(' ');
  return parts[1] ?? createdAt;
}

export function DashboardPage() {
  const { t } = useTranslation();
  const [throughputFilter, setThroughputFilter] = useState('today');
  const [latencyFilter, setLatencyFilter] = useState('all');
  const refetchInterval = useRealtimeInterval();

  const { data: metrics, isLoading: metricsLoading } = useApiQuery(
    queryKeys.metrics.dashboard,
    fetchDashboardMetrics,
    { refetchInterval },
  );
  const { data: queue } = useApiQuery(
    queryKeys.metrics.queue,
    fetchQueueStatus,
    { refetchInterval },
  );
  const { data: services, isLoading: servicesLoading } = useApiQuery(
    queryKeys.metrics.services,
    fetchServiceHealth,
    { refetchInterval },
  );
  const { data: recentTasks, isLoading: tasksLoading } = useApiQuery(
    queryKeys.tasks.list({ recent: true }),
    () => fetchRecentTasks(5),
    { refetchInterval },
  );
  const { data: throughputData } = useApiQuery(
    queryKeys.metrics.throughput(throughputFilter),
    () => fetchTaskThroughput(throughputFilter),
  );
  const { data: latencyData } = useApiQuery(
    queryKeys.metrics.latency(latencyFilter),
    () => fetchLatencyDistribution(latencyFilter),
  );

  const THROUGHPUT_OPTIONS: SelectOption[] = [
    { value: 'today', label: t('common:time.today') },
    { value: 'week', label: t('common:time.thisWeek') },
    { value: 'month', label: t('common:time.thisMonth') },
  ];

  const LATENCY_OPTIONS: SelectOption[] = [
    { value: 'all', label: t('dashboard:charts.p50p95p99') },
  ];

  const QUEUE_ITEMS: QueueItem[] = useMemo(() => [
    { level: 'critical', label: t('dashboard:queue.critical'), count: Math.max(1, Math.floor((queue?.high ?? metrics?.queueHigh ?? 0) / 3)) },
    { level: 'high', label: t('dashboard:queue.high'), count: queue?.high ?? metrics?.queueHigh ?? 0 },
    { level: 'medium', label: t('dashboard:queue.medium'), count: queue?.medium ?? metrics?.queueMedium ?? 0 },
    { level: 'low', label: t('dashboard:queue.low'), count: queue?.low ?? metrics?.queueLow ?? 0 },
  ], [queue, metrics, t]);

  if (metricsLoading) {
    return (
      <Center h="60vh">
        <Loader size="md" />
      </Center>
    );
  }

  const tokenPct = metrics
    ? Math.round((metrics.todayTokens / metrics.dailyQuota) * 100)
    : 0;

  const maxThroughput = Math.max(...(throughputData ?? []).map((b) => b.count), 1);
  const maxLatency = Math.max(...(latencyData ?? []).map((b) => b.count), 1);

  return (
    <>
      <div className={classes.statsRow}>
        <StatCard
          icon={<IconRobot size={16} strokeWidth={2.2} />}
          iconBg={STAT_ICON.cyan.iconBg}
          iconColor={STAT_ICON.cyan.iconColor}
          label={t('dashboard:stats.activeAgents')}
          value={metrics?.activeAgents ?? 0}
          trend={t('dashboard:stats.newThisWeek', { count: 2 })}
          trendDirection="up"
        />
        <StatCard
          icon={<IconChecklist size={16} strokeWidth={2.2} />}
          iconBg={STAT_ICON.green.iconBg}
          iconColor={STAT_ICON.green.iconColor}
          label={t('dashboard:stats.todayTasks')}
          value={metrics?.todayTasks.toLocaleString() ?? '0'}
          trend={t('dashboard:stats.vsYesterday', { pct: 12.5 })}
          trendDirection="up"
        />
        <StatCard
          icon={<IconCircleCheck size={16} strokeWidth={2.2} />}
          iconBg={STAT_ICON.green.iconBg}
          iconColor={STAT_ICON.green.iconColor}
          label={t('dashboard:stats.successRate')}
          value={String(metrics?.successRate ?? 0)}
          unit="%"
          trend={t('dashboard:stats.latencyImproved', { pct: 0.3 })}
          trendDirection="up"
        />
        <StatCard
          icon={<IconChartLine size={16} strokeWidth={2.2} />}
          iconBg={STAT_ICON.amber.iconBg}
          iconColor={STAT_ICON.amber.iconColor}
          label={t('dashboard:stats.tokenUsage')}
          value={formatTokens(metrics?.todayTokens ?? 0)}
          unit={` / ${formatTokens(metrics?.dailyQuota ?? 0)}`}
          trend={t('dashboard:stats.quotaRemaining', { pct: 100 - tokenPct })}
          trendDirection="neutral"
        />
      </div>

      <div className={classes.chartsRow}>
        <div className={classes.chartCard}>
          <div className={classes.chartHeader}>
            <span className={classes.chartTitle}>{t('dashboard:charts.taskThroughput')}</span>
            <Select options={THROUGHPUT_OPTIONS} value={throughputFilter} onChange={setThroughputFilter} />
          </div>
          <div className={classes.barChart}>
            {(throughputData ?? []).map((bar) => (
              <div key={bar.label} className={classes.barCol}>
                <div
                  className={`${classes.bar} ${classes.barGreen}`}
                  style={{ height: `${Math.round((bar.count / maxThroughput) * 100)}%` }}
                />
                <span className={classes.barLabel}>{bar.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={classes.chartCard}>
          <div className={classes.chartHeader}>
            <span className={classes.chartTitle}>{t('dashboard:charts.latencyDistribution')}</span>
            <Select options={LATENCY_OPTIONS} value={latencyFilter} onChange={setLatencyFilter} />
          </div>
          <div className={classes.latencyBars}>
            {(latencyData ?? []).map((row) => (
              <div key={row.label} className={classes.latencyRow}>
                <span className={classes.latencyLabel}>{row.label}</span>
                <div className={classes.latencyTrack}>
                  <div
                    className={`${classes.latencyFill} ${LATENCY_FILL_CLASS[row.variant]}`}
                    style={{ width: `${Math.round((row.count / maxLatency) * 100)}%` }}
                  />
                </div>
                <span className={classes.latencyCount}>{row.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={classes.queueTasksRow}>
        <QueueMonitor items={QUEUE_ITEMS} />

        <div className={classes.tasksCard}>
          <div className={classes.tasksHeader}>
            <span className={classes.tasksTitle}>{t('dashboard:recentTasks.title')}</span>
            <Link to="/tasks" className={classes.tasksLink}>{t('common:actions.viewAll')}</Link>
          </div>
          <div className={classes.tableWrap}>
            {tasksLoading ? (
              <Center py="xl"><Loader size="sm" /></Center>
            ) : (
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
                  {(recentTasks ?? []).map((task) => (
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
                      <td className={classes.timeCell}>{extractTime(task.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <div className={classes.healthSection}>
        <div className={classes.healthHeader}>
          <span className={classes.healthTitle}>{t('dashboard:systemHealth.title')}</span>
          <span className={classes.healthStatus}>{t('dashboard:stats.allHealthy')}</span>
        </div>
        <div className={classes.healthGrid}>
          {servicesLoading ? (
            <Center py="xl" style={{ gridColumn: '1 / -1' }}><Loader size="sm" /></Center>
          ) : (
            (services ?? []).map((svc) => (
              <SystemHealthCard key={svc.name} {...svc} />
            ))
          )}
        </div>
      </div>
    </>
  );
}
