import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TextInput, Button, ActionIcon, Tooltip, Badge, Pagination, Select, Modal, Text, Center, Loader } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import {
  IconSearch, IconPlus, IconPencil, IconTrash,
  IconChevronUp, IconChevronDown, IconSelector,
} from '@tabler/icons-react';
import { StatusBadge } from '../../components/shared/StatusBadge/StatusBadge';
import type { Agent, AgentStatus } from '../../types';
import { useApiQuery, useApiMutation, queryKeys } from '../../hooks/useApi';
import { fetchAgents, deleteAgent } from '../../services/agents';
import { formatTokens } from '../../lib/format';
import classes from './AgentList.module.css';

const PAGE_SIZE_OPTIONS = [
  { value: '10', label: '10 条/页' },
  { value: '20', label: '20 条/页' },
  { value: '50', label: '50 条/页' },
];

type SortField = 'name' | 'status' | 'todayTasks' | 'todayTokens';
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

export function AgentListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AgentStatus | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Agent | null>(null);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);

  const listParams = useMemo(() => ({
    search: search.trim() || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    sort: sortField,
    order: sortDir,
    page,
    pageSize,
  }), [search, statusFilter, sortField, sortDir, page, pageSize]);

  const { data, isLoading } = useApiQuery(
    queryKeys.agents.list(listParams),
    () => fetchAgents(listParams),
  );

  const deleteMutation = useApiMutation(queryKeys.agents.all, deleteAgent);

  const agents = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  const STATUS_FILTERS: { value: AgentStatus | 'all'; label: string }[] = [
    { value: 'all', label: t('agents:list.filterAll') },
    { value: 'running', label: t('agents:list.filterRunning') },
    { value: 'stopped', label: t('agents:list.filterStopped') },
    { value: 'error', label: t('agents:list.filterError') },
  ];

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    const name = deleteTarget.name;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        notifications.show({ message: `Agent "${name}" 已删除`, color: 'green', withCloseButton: true });
        closeDelete();
        setDeleteTarget(null);
      },
    });
  }

  return (
    <>
      <div className={classes.header}>
        <h1 className={classes.title}>{t('agents:list.title')}</h1>
        <Button leftSection={<IconPlus size={16} />} onClick={() => navigate('/agents/create')}>
          {t('agents:list.createBtn')}
        </Button>
      </div>

      <div className={classes.toolbar}>
        <TextInput
          className={classes.searchInput}
          placeholder={t('agents:list.searchPlaceholder')}
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
                  <col /><col /><col /><col /><col />
                  <col className={classes.colStickyRight} />
                </colgroup>
                <thead>
                  <tr>
                    <th className={classes.stickyLeft} onClick={() => toggleSort('name')}>
                      {t('agents:list.columns.name')} <SortIcon field="name" sortField={sortField} sortDir={sortDir} />
                    </th>
                    <th>{t('agents:list.columns.description')}</th>
                    <th onClick={() => toggleSort('status')}>
                      {t('agents:list.columns.status')} <SortIcon field="status" sortField={sortField} sortDir={sortDir} />
                    </th>
                    <th>{t('agents:list.columns.providerModel')}</th>
                    <th onClick={() => toggleSort('todayTasks')}>
                      {t('agents:list.columns.todayTasks')} <SortIcon field="todayTasks" sortField={sortField} sortDir={sortDir} />
                    </th>
                    <th onClick={() => toggleSort('todayTokens')}>
                      {t('agents:list.columns.todayTokens')} <SortIcon field="todayTokens" sortField={sortField} sortDir={sortDir} />
                    </th>
                    <th className={classes.stickyRight}>{t('agents:list.columns.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((agent) => (
                    <tr key={agent.id} onClick={() => navigate(`/agents/${agent.id}`)}>
                      <td className={classes.stickyLeft}><span className={classes.agentName}>{agent.name}</span></td>
                      <td className={classes.descCell}><TruncatedCell text={agent.description} /></td>
                      <td><StatusBadge status={agent.status} /></td>
                      <td>
                        <span className={classes.dimmedCell} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                          {agent.llmProvider} / {agent.llmModel}
                        </span>
                      </td>
                      <td className={classes.monoCell}>{agent.todayTasks}</td>
                      <td className={classes.monoCell}>
                        <Tooltip label={`${agent.todayTokens.toLocaleString()} / ${agent.dailyTokenQuota.toLocaleString()} tokens`} openDelay={400}>
                          <span>
                            {formatTokens(agent.todayTokens)}
                            <span className={classes.dimmedCell}> / {formatTokens(agent.dailyTokenQuota)}</span>
                          </span>
                        </Tooltip>
                      </td>
                      <td className={classes.stickyRight}>
                        <div className={classes.actions} onClick={(e) => e.stopPropagation()}>
                          <Tooltip label={t('common:actions.edit')}>
                            <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => navigate(`/agents/${agent.id}`)}>
                              <IconPencil size={14} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label={t('common:actions.delete')}>
                            <ActionIcon variant="subtle" color="red" size="sm" onClick={() => { setDeleteTarget(agent); openDelete(); }}>
                              <IconTrash size={14} />
                            </ActionIcon>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {agents.length === 0 && (
              <div className={classes.empty}>{t('agents:list.empty')}</div>
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
                  {t('agents:list.totalAgents', { count: total })}
                </span>
              </div>
              {totalPages > 1 && (
                <Pagination total={totalPages} value={safePage} onChange={setPage} size="sm" withEdges />
              )}
            </div>
          </>
        )}
      </div>

      <Modal opened={deleteOpened} onClose={closeDelete} title={t('agents:detail.deleteModal.title')} centered>
        <Text size="sm" mb="md">
          {t('agents:detail.deleteModal.message', { name: deleteTarget?.name ?? '' })}
        </Text>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button variant="subtle" color="gray" onClick={closeDelete}>{t('common:actions.cancel')}</Button>
          <Button color="red" loading={deleteMutation.isPending} onClick={handleDeleteConfirm}>
            {t('agents:detail.deleteModal.confirmBtn')}
          </Button>
        </div>
      </Modal>
    </>
  );
}
