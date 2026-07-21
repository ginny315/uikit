import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  TextInput, Textarea, Button, ActionIcon, Tooltip, Badge, Pagination, Select, Center, Loader,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import {
  IconSearch, IconPlus, IconEye, IconBan,
  IconChevronUp, IconChevronDown, IconSelector,
} from '@tabler/icons-react';
import { StatusBadge } from '../../components/shared/StatusBadge/StatusBadge';
import { PriorityBadge } from '../../components/shared/PriorityBadge/PriorityBadge';
import { AppModal } from '../../components/shared/AppModal/AppModal';
import { ConfirmModal } from '../../components/shared/ConfirmModal/ConfirmModal';
import type { Task, TaskStatus, TaskPriority } from '../../types';
import { useApiQuery, useApiMutation, queryKeys } from '../../hooks/useApi';
import { useRealtimeInterval } from '../../hooks/useRealtime';
import { fetchTasks, createTask, cancelTask } from '../../services/tasks';
import { fetchAgents } from '../../services/agents';
import { formatDuration } from '../../lib/format';
import classes from './TaskList.module.css';

const PAGE_SIZE_OPTIONS = [
  { value: '10', label: '10 条/页' },
  { value: '20', label: '20 条/页' },
  { value: '50', label: '50 条/页' },
];

const TASK_STATUSES: TaskStatus[] = ['queued', 'running', 'succeeded', 'failed', 'cancelled'];

type SortField = 'priority' | 'duration' | 'tokensUsed' | 'createdAt';
type SortDir = 'asc' | 'desc';

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
  if (field !== sortField) return <IconSelector size={12} style={{ opacity: 0.3 }} />;
  return sortDir === 'asc' ? <IconChevronUp size={12} /> : <IconChevronDown size={12} />;
}

function TruncatedCell({ text }: { text: string }) {
  return (
    <Tooltip label={text} multiline maw={400} openDelay={500} disabled={text.length < 20}>
      <span className={classes.truncatedCell}>{text}</span>
    </Tooltip>
  );
}

function isCancellable(task: Task): boolean {
  return task.status === 'queued' || task.status === 'running';
}

export function TaskListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [cancelTarget, setCancelTarget] = useState<Task | null>(null);
  const [cancelOpened, { open: openCancel, close: closeCancel }] = useDisclosure(false);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);

  const listParams = useMemo(() => ({
    search: search.trim() || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    priority: priorityFilter === 'all' ? undefined : Number(priorityFilter),
    sort: sortField,
    order: sortDir,
    page,
    pageSize,
  }), [search, statusFilter, priorityFilter, sortField, sortDir, page, pageSize]);

  const refetchInterval = useRealtimeInterval();

  const { data, isLoading } = useApiQuery(
    queryKeys.tasks.list(listParams),
    () => fetchTasks(listParams),
    { refetchInterval },
  );

  const { data: agentsData } = useApiQuery(
    queryKeys.agents.list({ status: 'running', pageSize: 100 }),
    () => fetchAgents({ status: 'running', pageSize: 100 }),
  );

  const createMutation = useApiMutation(queryKeys.tasks.all, createTask);
  const cancelMutation = useApiMutation(queryKeys.tasks.all, cancelTask);

  const tasks = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  const STATUS_FILTERS: { value: TaskStatus | 'all'; label: string }[] = [
    { value: 'all', label: t('tasks:list.filterAll') },
    ...TASK_STATUSES.map((s) => ({ value: s, label: t(`status:task.${s}`) })),
  ];

  const PRIORITY_FILTER_OPTIONS = [
    { value: 'all', label: t('tasks:list.priorityAll') },
    { value: '1', label: t('status:priority.critical') },
    { value: '2', label: t('status:priority.high') },
    { value: '3', label: t('status:priority.medium') },
    { value: '4', label: t('status:priority.low') },
  ];

  const AGENT_OPTIONS = useMemo(
    () => (agentsData?.data ?? []).map((a) => ({ value: a.id, label: a.name })),
    [agentsData],
  );

  const createForm = useForm({
    initialValues: { agentId: '', input: '', priority: '3' },
    validate: {
      agentId: (v) => (v ? null : t('validation:taskAgentRequired')),
      input: (v) => {
        if (!v.trim()) return t('validation:taskInputRequired');
        if (v.trim().length < 5) return t('validation:taskInputMinLength', { min: 5 });
        return null;
      },
    },
  });

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir(field === 'createdAt' ? 'desc' : 'asc');
    }
  }

  function handleCreateSubmit(values: typeof createForm.values) {
    createMutation.mutate(
      {
        agentId: values.agentId,
        input: values.input.trim(),
        priority: Number(values.priority) as TaskPriority,
      },
      {
        onSuccess: (newTask) => {
          notifications.show({ message: t('tasks:create.successMsg', { id: newTask.id }), color: 'green', withCloseButton: true });
          closeCreate();
          createForm.reset();
          setPage(1);
        },
      },
    );
  }

  function handleCancelConfirm() {
    if (!cancelTarget) return;
    const targetId = cancelTarget.id;
    cancelMutation.mutate(targetId, {
      onSuccess: () => {
        notifications.show({ message: t('tasks:cancelModal.successMsg', { id: targetId }), color: 'yellow', withCloseButton: true });
        closeCancel();
        setCancelTarget(null);
      },
    });
  }

  return (
    <>
      <div className={classes.header}>
        <h1 className={classes.title}>{t('tasks:list.title')}</h1>
        <Button leftSection={<IconPlus size={16} />} onClick={openCreate}>
          {t('tasks:list.createBtn')}
        </Button>
      </div>

      <div className={classes.toolbar}>
        <TextInput
          className={classes.searchInput}
          placeholder={t('tasks:list.searchPlaceholder')}
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => { setSearch(e.currentTarget.value); setPage(1); }}
        />
        {STATUS_FILTERS.map((s) => (
          <Badge
            key={s.value}
            className={classes.filterChip}
            variant={statusFilter === s.value ? 'filled' : 'light'}
            color={statusFilter === s.value ? 'agentGreen' : 'gray'}
            style={{ cursor: 'pointer' }}
            onClick={() => { setStatusFilter(s.value); setPage(1); }}
          >
            {s.label}
          </Badge>
        ))}
        <Select
          data={PRIORITY_FILTER_OPTIONS}
          value={priorityFilter}
          onChange={(v) => { setPriorityFilter(v ?? 'all'); setPage(1); }}
          size="xs"
          w={130}
          allowDeselect={false}
        />
      </div>

      <div className={classes.tableCard}>
        {isLoading ? (
          <Center py="xl"><Loader size="md" /></Center>
        ) : (
          <>
            <div className={classes.tableWrap}>
              <table>
                <colgroup>
                  <col className={classes.colStickyLeft} />
                  <col /><col /><col /><col /><col /><col /><col />
                  <col className={classes.colStickyRight} />
                </colgroup>
                <thead>
                  <tr>
                    <th className={classes.stickyLeft}>{t('tasks:list.columns.taskId')}</th>
                    <th>{t('tasks:list.columns.agent')}</th>
                    <th>{t('tasks:list.columns.status')}</th>
                    <th className={classes.sortable} onClick={() => toggleSort('priority')}>
                      {t('tasks:list.columns.priority')} <SortIcon field="priority" sortField={sortField} sortDir={sortDir} />
                    </th>
                    <th>{t('tasks:list.columns.input')}</th>
                    <th className={classes.sortable} onClick={() => toggleSort('duration')}>
                      {t('tasks:list.columns.duration')} <SortIcon field="duration" sortField={sortField} sortDir={sortDir} />
                    </th>
                    <th className={classes.sortable} onClick={() => toggleSort('tokensUsed')}>
                      {t('tasks:list.columns.tokens')} <SortIcon field="tokensUsed" sortField={sortField} sortDir={sortDir} />
                    </th>
                    <th className={classes.sortable} onClick={() => toggleSort('createdAt')}>
                      {t('tasks:list.columns.createdAt')} <SortIcon field="createdAt" sortField={sortField} sortDir={sortDir} />
                    </th>
                    <th className={classes.stickyRight}>{t('tasks:list.columns.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id} onClick={() => navigate(`/tasks/${task.id}`)}>
                      <td className={`${classes.stickyLeft} ${classes.monoCell}`}>{task.id}</td>
                      <td className={classes.agentCell}>{task.agentName}</td>
                      <td><StatusBadge status={task.status} /></td>
                      <td><PriorityBadge priority={task.priority} /></td>
                      <td className={classes.inputCell}><TruncatedCell text={task.input} /></td>
                      <td className={classes.monoCell}>{formatDuration(task.duration)}</td>
                      <td className={classes.monoCell}>{task.tokensUsed?.toLocaleString() ?? '—'}</td>
                      <td className={classes.timeCell}>{task.createdAt}</td>
                      <td className={classes.stickyRight}>
                        <div className={classes.actions} onClick={(e) => e.stopPropagation()}>
                          <Tooltip label={t('tasks:list.viewAction')}>
                            <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => navigate(`/tasks/${task.id}`)}>
                              <IconEye size={14} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label={t('tasks:list.cancelAction')} disabled={!isCancellable(task)}>
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              size="sm"
                              disabled={!isCancellable(task)}
                              onClick={() => { setCancelTarget(task); openCancel(); }}
                            >
                              <IconBan size={14} />
                            </ActionIcon>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {tasks.length === 0 && (
              <div className={classes.empty}>{t('tasks:list.empty')}</div>
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
                  {t('tasks:list.totalTasks', { count: total })}
                </span>
              </div>
              {totalPages > 1 && (
                <Pagination total={totalPages} value={safePage} onChange={setPage} size="sm" withEdges />
              )}
            </div>
          </>
        )}
      </div>

      <AppModal
        opened={createOpened}
        onClose={() => { closeCreate(); createForm.reset(); }}
        title={t('tasks:create.title')}
        footer={
          <>
            <Button variant="default" onClick={() => { closeCreate(); createForm.reset(); }}>
              {t('common:actions.cancel')}
            </Button>
            <Button type="submit" form="create-task-form" loading={createMutation.isPending}>
              {t('tasks:create.submitBtn')}
            </Button>
          </>
        }
      >
        <form id="create-task-form" onSubmit={createForm.onSubmit(handleCreateSubmit)}>
          <Select
            label={t('tasks:create.agentLabel')}
            placeholder={t('tasks:create.agentPlaceholder')}
            description={t('tasks:create.agentDesc')}
            data={AGENT_OPTIONS}
            searchable
            mb="md"
            withAsterisk
            {...createForm.getInputProps('agentId')}
          />
          <Textarea
            label={t('tasks:create.inputLabel')}
            placeholder={t('tasks:create.inputPlaceholder')}
            minRows={3}
            autosize
            mb="md"
            withAsterisk
            {...createForm.getInputProps('input')}
          />
          <Select
            label={t('tasks:create.priorityLabel')}
            data={PRIORITY_FILTER_OPTIONS.filter((o) => o.value !== 'all')}
            allowDeselect={false}
            {...createForm.getInputProps('priority')}
          />
        </form>
      </AppModal>

      <ConfirmModal
        opened={cancelOpened}
        onClose={closeCancel}
        title={t('tasks:cancelModal.title')}
        message={t('tasks:cancelModal.message', { id: cancelTarget?.id ?? '' })}
        target={cancelTarget ? { icon: <IconBan size={14} />, label: cancelTarget.id, detail: cancelTarget.input } : undefined}
        confirmLabel={t('tasks:cancelModal.confirmBtn')}
        cancelLabel={t('tasks:cancelModal.keepBtn')}
        confirmLoading={cancelMutation.isPending}
        onConfirm={handleCancelConfirm}
      />
    </>
  );
}
