import { useState, useMemo, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TextInput, Badge, Pagination, Select } from '@mantine/core';
import dayjs from 'dayjs';
import { IconSearch, IconChevronRight } from '@tabler/icons-react';
import { TimeRangePicker } from '../../components/shared/TimeRangePicker/TimeRangePicker';
import type { TimeRange } from '../../components/shared/TimeRangePicker/TimeRangePicker';
import type { LogEntry, LogLevel } from '../../types';
import { MOCK_LOGS } from '../../mocks/logs';
import classes from './Logs.module.css';

const PAGE_SIZE_OPTIONS = [
  { value: '20', label: '20 条/页' },
  { value: '50', label: '50 条/页' },
  { value: '100', label: '100 条/页' },
];

const LOG_LEVELS: LogLevel[] = ['debug', 'info', 'warn', 'error'];

const LEVEL_CLASS: Record<LogLevel, string> = {
  debug: classes.levelDebug,
  info: classes.levelInfo,
  warn: classes.levelWarn,
  error: classes.levelError,
};

/** 系统级日志（无 agentId）在来源筛选中的取值 */
const SOURCE_SYSTEM = '__system__';

export function LogsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<LogLevel | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  // 时间范围，null = 不限（开区间）
  const [timeRange, setTimeRange] = useState<TimeRange>({ start: null, end: null });
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const LEVEL_FILTERS: { value: LogLevel | 'all'; label: string }[] = [
    { value: 'all', label: t('logs:list.filterAll') },
    ...LOG_LEVELS.map((l) => ({ value: l, label: l.toUpperCase() })),
  ];

  // 来源选项：全部 + 出现过的 Agent（按名称排序）+ 系统服务
  const SOURCE_OPTIONS = useMemo(() => {
    const agentNames = [...new Set(MOCK_LOGS.map((l) => l.agentName).filter((n): n is string => !!n))].sort();
    return [
      { value: 'all', label: t('logs:list.sourceAll') },
      ...agentNames.map((n) => ({ value: n, label: n })),
      { value: SOURCE_SYSTEM, label: t('logs:list.sourceSystem') },
    ];
  }, [t]);

  const filtered = useMemo(() => {
    let list = MOCK_LOGS;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((l) =>
        l.message.toLowerCase().includes(q)
        || l.taskId?.toLowerCase().includes(q)
        || l.traceId.toLowerCase().includes(q)
        || l.instanceId.toLowerCase().includes(q)
        || l.agentName?.toLowerCase().includes(q));
    }
    if (levelFilter !== 'all') list = list.filter((l) => l.level === levelFilter);
    if (sourceFilter !== 'all') {
      list = sourceFilter === SOURCE_SYSTEM
        ? list.filter((l) => !l.agentId)
        : list.filter((l) => l.agentName === sourceFilter);
    }
    // 时间范围：开区间，起点取整分钟开头，终点包含所选分钟内的全部日志
    if (timeRange.start) {
      const from = dayjs(timeRange.start).startOf('minute').valueOf();
      list = list.filter((l) => dayjs(l.timestamp).valueOf() >= from);
    }
    if (timeRange.end) {
      const to = dayjs(timeRange.end).endOf('minute').valueOf();
      list = list.filter((l) => dayjs(l.timestamp).valueOf() <= to);
    }
    // 日志流固定按时间倒序（最新在前）；timestamp 格式固定，字符串序即时间序
    return [...list].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [search, levelFilter, sourceFilter, timeRange]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  function toggleExpand(id: string) {
    setExpandedId((cur) => (cur === id ? null : id));
  }

  function renderExpandPanel(log: LogEntry) {
    const fields = Object.entries(log.fields ?? {});
    return (
      <div className={classes.expandPanel}>
        <div className={classes.expandGrid}>
          <div>
            <div className={classes.expandLabel}>{t('logs:detail.traceId')}</div>
            <div className={classes.expandValue}>{log.traceId}</div>
          </div>
          <div>
            <div className={classes.expandLabel}>{t('logs:detail.spanId')}</div>
            <div className={classes.expandValue}>{log.spanId}</div>
          </div>
          <div>
            <div className={classes.expandLabel}>{t('logs:detail.instanceId')}</div>
            <div className={classes.expandValue}>{log.instanceId}</div>
          </div>
          {log.taskId && (
            <div>
              <div className={classes.expandLabel}>{t('logs:detail.taskId')}</div>
              <div className={classes.expandValue}>{log.taskId}</div>
            </div>
          )}
        </div>

        <div className={classes.expandLabel}>{t('logs:detail.message')}</div>
        <div className={classes.expandMessage}>{log.message}</div>

        <div className={classes.expandLabel}>{t('logs:detail.fields')}</div>
        {fields.length > 0 ? (
          <div className={classes.fieldsWrap}>
            {fields.map(([k, v]) => (
              <span key={k} className={classes.fieldTag}><b>{k}:</b> {String(v)}</span>
            ))}
          </div>
        ) : (
          <div className={classes.expandMessage} style={{ color: 'var(--mantine-color-dimmed)', marginBottom: 0 }}>
            {t('logs:detail.noFields')}
          </div>
        )}

        {(log.taskId || log.agentId) && (
          <div className={classes.expandActions}>
            {log.taskId && (
              <span className={classes.expandLink} onClick={() => navigate(`/tasks/${log.taskId}`)}>
                {t('logs:detail.viewTask')}
              </span>
            )}
            {log.agentId && (
              <span className={classes.expandLink} onClick={() => navigate(`/agents/${log.agentId}`)}>
                {t('logs:detail.viewAgent')}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className={classes.header}>
        <h1 className={classes.title}>{t('logs:list.title')}</h1>
      </div>

      <div className={classes.toolbar}>
        <TextInput
          className={classes.searchInput}
          placeholder={t('logs:list.searchPlaceholder')}
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => { setSearch(e.currentTarget.value); setPage(1); }}
        />
        {LEVEL_FILTERS.map((l) => (
          <Badge
            key={l.value}
            className={classes.filterChip}
            variant={levelFilter === l.value ? 'filled' : 'light'}
            color={levelFilter === l.value ? 'agentGreen' : 'gray'}
            style={{ cursor: 'pointer' }}
            onClick={() => { setLevelFilter(l.value); setPage(1); }}
          >
            {l.label}
          </Badge>
        ))}
        <Select
          data={SOURCE_OPTIONS}
          value={sourceFilter}
          onChange={(v) => { setSourceFilter(v ?? 'all'); setPage(1); }}
          size="xs"
          w={170}
          searchable
          allowDeselect={false}
        />
        <TimeRangePicker
          value={timeRange}
          onChange={(range) => { setTimeRange(range); setPage(1); }}
        />
      </div>

      <div className={classes.tableCard}>
        <div className={classes.tableWrap}>
          <table>
            <thead>
              <tr>
                <th style={{ width: 28 }} />
                <th>{t('logs:list.columns.time')}</th>
                <th>{t('logs:list.columns.level')}</th>
                <th>{t('logs:list.columns.source')}</th>
                <th>{t('logs:list.columns.message')}</th>
                <th>{t('logs:list.columns.task')}</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((log) => {
                const expanded = expandedId === log.id;
                return (
                  <Fragment key={log.id}>
                    <tr
                      className={`${classes.logRow} ${expanded ? classes.logRowExpanded : ''}`}
                      onClick={() => toggleExpand(log.id)}
                    >
                      <td>
                        <span className={`${classes.chevron} ${expanded ? classes.chevronOpen : ''}`}>
                          <IconChevronRight size={14} />
                        </span>
                      </td>
                      <td className={classes.timeCell}>{log.timestamp}</td>
                      <td className={`${classes.levelCell} ${LEVEL_CLASS[log.level]}`}>
                        {log.level.toUpperCase()}
                      </td>
                      <td className={classes.sourceCell}>
                        {log.agentName ?? <span className={classes.sourceSystem}>{log.instanceId}</span>}
                      </td>
                      <td className={classes.messageCell}>
                        <span className={classes.messageText}>{log.message}</span>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        {log.taskId ? (
                          <span className={classes.taskLink} onClick={() => navigate(`/tasks/${log.taskId}`)}>
                            {log.taskId}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--mantine-color-dimmed)' }}>—</span>
                        )}
                      </td>
                    </tr>
                    {expanded && (
                      <tr>
                        <td colSpan={6} className={classes.expandCell}>
                          {renderExpandPanel(log)}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className={classes.empty}>{t('logs:list.empty')}</div>
        )}

        <div className={classes.paginationRow}>
          <div className={classes.pageSizeWrap}>
            <Select
              data={PAGE_SIZE_OPTIONS}
              value={String(pageSize)}
              onChange={(v) => { setPageSize(Number(v)); setPage(1); }}
              size="xs"
              w={120}
              allowDeselect={false}
            />
            <span className={classes.totalText}>
              {t('logs:list.totalLogs', { count: filtered.length })}
            </span>
          </div>
          {totalPages > 1 && (
            <Pagination total={totalPages} value={safePage} onChange={setPage} size="sm" withEdges />
          )}
        </div>
      </div>
    </>
  );
}
