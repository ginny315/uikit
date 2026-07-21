import { useMemo, useState, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TextInput, Badge, Pagination, Select, Center, Loader } from '@mantine/core';
import { IconSearch, IconChevronRight } from '@tabler/icons-react';
import { TimeRangePicker } from '../../components/shared/TimeRangePicker/TimeRangePicker';
import type { TimeRange } from '../../components/shared/TimeRangePicker/TimeRangePicker';
import type { LogEntry, LogLevel } from '../../types';
import { useApiQuery, queryKeys } from '../../hooks/useApi';
import { searchLogs } from '../../services/logs';
import { fetchAgents } from '../../services/agents';
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

const SOURCE_SYSTEM = '__system__';

export function LogsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<LogLevel | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<TimeRange>({ start: null, end: null });
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const logParams = useMemo(() => ({
    search: search.trim() || undefined,
    level: levelFilter === 'all' ? undefined : levelFilter,
    source: sourceFilter === 'all' ? undefined : sourceFilter,
    start: timeRange.start ?? undefined,
    end: timeRange.end ?? undefined,
    page,
    pageSize,
  }), [search, levelFilter, sourceFilter, timeRange, page, pageSize]);

  const { data, isLoading } = useApiQuery(
    queryKeys.logs.search(logParams),
    () => searchLogs(logParams),
  );

  const { data: agentsData } = useApiQuery(
    queryKeys.agents.list({ pageSize: 100 }),
    () => fetchAgents({ pageSize: 100 }),
  );

  const logs = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  const LEVEL_FILTERS: { value: LogLevel | 'all'; label: string }[] = [
    { value: 'all', label: t('logs:list.filterAll') },
    ...LOG_LEVELS.map((l) => ({ value: l, label: l.toUpperCase() })),
  ];

  const SOURCE_OPTIONS = useMemo(() => {
    const agentNames = [...new Set((agentsData?.data ?? []).map((a) => a.name))].sort();
    return [
      { value: 'all', label: t('logs:list.sourceAll') },
      ...agentNames.map((n) => ({ value: n, label: n })),
      { value: SOURCE_SYSTEM, label: t('logs:list.sourceSystem') },
    ];
  }, [agentsData, t]);

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
        {isLoading ? (
          <Center py="xl"><Loader size="md" /></Center>
        ) : (
          <>
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
                  {logs.map((log) => {
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

            {logs.length === 0 && (
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
                  {t('logs:list.totalLogs', { count: total })}
                </span>
              </div>
              {totalPages > 1 && (
                <Pagination total={totalPages} value={safePage} onChange={setPage} size="sm" withEdges />
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
