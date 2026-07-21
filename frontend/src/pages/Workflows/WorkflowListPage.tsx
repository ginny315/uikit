import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  TextInput, Button, ActionIcon, Tooltip, Badge, Pagination, Select, Modal, Text, Card, Center, Loader,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import {
  IconSearch, IconPlus, IconPencil, IconTrash,
  IconPlayerPlay, IconPlayerPause, IconGitBranch,
} from '@tabler/icons-react';
import type { WorkflowSummary, WorkflowStatus } from '../../types';
import { useApiQuery, useApiMutation, queryKeys } from '../../hooks/useApi';
import { fetchWorkflows, createWorkflow, updateWorkflow, deleteWorkflow } from '../../services/workflows';
import classes from './WorkflowList.module.css';

const PAGE_SIZE_OPTIONS = [
  { value: '10', label: '10 条/页' },
  { value: '20', label: '20 条/页' },
  { value: '50', label: '50 条/页' },
];

const WORKFLOW_STATUSES: WorkflowStatus[] = ['active', 'paused', 'draft'];

const STATUS_COLOR: Record<WorkflowStatus, string> = {
  active: 'agentGreen',
  paused: 'yellow',
  draft: 'gray',
};

const STATUS_ICON: Record<WorkflowStatus, React.ReactNode> = {
  active: <IconPlayerPlay size={12} />,
  paused: <IconPlayerPause size={12} />,
  draft: null,
};

export function WorkflowListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<WorkflowStatus | 'all'>('all');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<WorkflowSummary | null>(null);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);

  const listParams = useMemo(() => ({
    search: search.trim() || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
  }), [search, statusFilter]);

  const { data: workflows = [], isLoading } = useApiQuery(
    queryKeys.workflows.list(listParams),
    () => fetchWorkflows(listParams),
  );

  const createMutation = useApiMutation(queryKeys.workflows.all, createWorkflow);
  const updateMutation = useApiMutation(queryKeys.workflows.all, (vars: { id: string; data: Partial<WorkflowSummary> }) =>
    updateWorkflow(vars.id, vars.data),
  );
  const deleteMutation = useApiMutation(queryKeys.workflows.all, deleteWorkflow);

  const statuses: { value: WorkflowStatus | 'all'; label: string }[] = [
    { value: 'all', label: t('workflows:list.filterAll') },
    ...WORKFLOW_STATUSES.map((s) => ({ value: s, label: t(`workflows:status.${s}`) })),
  ];

  const createForm = useForm({
    initialValues: { name: '', description: '' },
    validate: {
      name: (v) => (v.trim().length > 0 ? null : '请输入工作流名称'),
      description: (v) => (v.trim().length > 0 ? null : '请输入描述'),
    },
  });

  const filtered = useMemo(() => {
    let list = [...workflows];
    list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return list;
  }, [workflows]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  function handleCreate(values: typeof createForm.values) {
    createMutation.mutate(
      { name: values.name.trim(), description: values.description.trim() },
      {
        onSuccess: (newWf) => {
          notifications.show({ message: `工作流「${newWf.name}」已创建`, color: 'green', withCloseButton: true });
          closeCreate();
          createForm.reset();
          setPage(1);
        },
      },
    );
  }

  function handleToggleStatus(wf: WorkflowSummary) {
    const next: WorkflowStatus = wf.status === 'active' ? 'paused' : 'active';
    updateMutation.mutate(
      { id: wf.id, data: { status: next } },
      {
        onSuccess: () => {
          const msgKey = next === 'active' ? 'enabledMsg' : 'pausedMsg';
          notifications.show({ message: t(`workflows:editor.${msgKey}`), withCloseButton: true });
        },
      },
    );
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    const name = deleteTarget.name;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        notifications.show({ message: `工作流「${name}」已删除`, color: 'green', withCloseButton: true });
        closeDelete();
        setDeleteTarget(null);
      },
    });
  }

  return (
    <>
      <div className={classes.header}>
        <h1 className={classes.title}>{t('workflows:list.title')}</h1>
        <Button leftSection={<IconPlus size={16} />} onClick={openCreate}>
          {t('workflows:list.createBtn')}
        </Button>
      </div>

      <div className={classes.toolbar}>
        <TextInput
          className={classes.searchInput}
          placeholder={t('workflows:list.searchPlaceholder')}
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => { setSearch(e.currentTarget.value); setPage(1); }}
        />
        {statuses.map((s) => (
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

      {isLoading ? (
        <Center py="xl"><Loader size="md" /></Center>
      ) : (
        <>
          <div className={classes.cardGrid}>
            {paginated.map((wf) => (
              <Card
                key={wf.id}
                className={classes.workflowCard}
                padding="lg"
                onClick={() => navigate(`/workflows/${wf.id}`)}
              >
                <div className={classes.cardHeader}>
                  <div className={classes.cardTitleWrap}>
                    <IconGitBranch size={18} className={classes.cardIcon} />
                    <span className={classes.cardName}>{wf.name}</span>
                  </div>
                  <div className={classes.cardActions} onClick={(e) => e.stopPropagation()}>
                    <Tooltip label={wf.status === 'active' ? t('workflows:editor.pause') : t('workflows:editor.enable')}>
                      <ActionIcon
                        variant="subtle"
                        color={wf.status === 'active' ? 'yellow' : 'agentGreen'}
                        size="sm"
                        onClick={() => handleToggleStatus(wf)}
                        disabled={wf.status === 'draft'}
                      >
                        {wf.status === 'active' ? <IconPlayerPause size={15} /> : <IconPlayerPlay size={15} />}
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label={t('common:actions.edit')}>
                      <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => navigate(`/workflows/${wf.id}`)}>
                        <IconPencil size={15} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label={t('common:actions.delete')}>
                      <ActionIcon variant="subtle" color="red" size="sm" onClick={() => { setDeleteTarget(wf); openDelete(); }}>
                        <IconTrash size={15} />
                      </ActionIcon>
                    </Tooltip>
                  </div>
                </div>
                <Text size="sm" c="dimmed" lineClamp={2} mb="md" className={classes.cardDesc}>
                  {wf.description}
                </Text>
                <div className={classes.cardMeta}>
                  <Badge
                    variant="light"
                    color={STATUS_COLOR[wf.status]}
                    size="sm"
                    leftSection={STATUS_ICON[wf.status]}
                    ff="monospace"
                  >
                    {t(`workflows:status.${wf.status}`)}
                  </Badge>
                  <span className={classes.stepCount}>
                    {t('workflows:list.stepCount', { count: wf.stepCount })}
                  </span>
                  <span className={classes.updatedAt}>{wf.updatedAt}</span>
                </div>
              </Card>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className={classes.empty}>{t('workflows:list.empty')}</div>
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
                {t('common:pagination.total', { count: filtered.length })}
              </span>
            </div>
            {totalPages > 1 && (
              <Pagination total={totalPages} value={safePage} onChange={setPage} size="sm" withEdges />
            )}
          </div>
        </>
      )}

      <Modal
        opened={createOpened}
        onClose={() => { closeCreate(); createForm.reset(); }}
        title={t('workflows:create.title')}
        centered
      >
        <form onSubmit={createForm.onSubmit(handleCreate)}>
          <TextInput
            label={t('workflows:create.nameLabel')}
            placeholder={t('workflows:create.namePlaceholder')}
            mb="md"
            withAsterisk
            {...createForm.getInputProps('name')}
          />
          <TextInput
            label={t('workflows:create.descLabel')}
            placeholder={t('workflows:create.descPlaceholder')}
            mb="lg"
            withAsterisk
            {...createForm.getInputProps('description')}
          />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="subtle" color="gray" onClick={() => { closeCreate(); createForm.reset(); }}>
              {t('common:actions.cancel')}
            </Button>
            <Button type="submit" loading={createMutation.isPending}>{t('workflows:create.submitBtn')}</Button>
          </div>
        </form>
      </Modal>

      <Modal opened={deleteOpened} onClose={closeDelete} title={t('workflows:list.confirmDeleteTitle')} centered>
        <Text size="sm" mb="md">
          {t('workflows:list.confirmDeleteMsg', { name: deleteTarget?.name ?? '' })}
        </Text>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button variant="subtle" color="gray" onClick={closeDelete}>{t('common:actions.cancel')}</Button>
          <Button color="red" loading={deleteMutation.isPending} onClick={handleDeleteConfirm}>
            {t('common:actions.confirmDelete')}
          </Button>
        </div>
      </Modal>
    </>
  );
}
