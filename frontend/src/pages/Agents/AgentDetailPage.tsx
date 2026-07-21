import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Tabs, Modal, Text, Tooltip, Center, Loader } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import {
  IconPencil, IconTrash,
  IconPlayerPlay, IconPlayerStop, IconRefresh, IconAlertTriangle,
} from '@tabler/icons-react';
import { StatusBadge } from '../../components/shared/StatusBadge/StatusBadge';
import { PriorityBadge } from '../../components/shared/PriorityBadge/PriorityBadge';
import { PageHeader } from '../../components/shared/PageHeader/PageHeader';
import type { BreadcrumbItem } from '../../components/shared/PageHeader/PageHeader';
import type { AgentStatus } from '../../types';
import { useApiQuery, useApiMutation, queryKeys } from '../../hooks/useApi';
import { fetchAgent, updateAgent, deleteAgent } from '../../services/agents';
import { fetchTasks } from '../../services/tasks';
import { formatTokens, formatDuration } from '../../lib/format';
import classes from './AgentDetail.module.css';

function TruncatedText({ text, maxLen = 32 }: { text: string; maxLen?: number }) {
  if (text.length <= maxLen) return <span>{text}</span>;
  return (
    <Tooltip label={text} multiline maw={360} openDelay={400}>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
        {text}
      </span>
    </Tooltip>
  );
}

export function AgentDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string | null>('overview');
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);

  const { data: agent, isLoading, isError } = useApiQuery(
    queryKeys.agents.detail(id ?? ''),
    () => fetchAgent(id!),
    { enabled: !!id },
  );

  const { data: tasksData } = useApiQuery(
    queryKeys.tasks.list({ agentId: id }),
    () => fetchTasks({ agentId: id, pageSize: 100 }),
    { enabled: !!id },
  );

  const statusMutation = useApiMutation(queryKeys.agents.all, (status: AgentStatus) =>
    updateAgent(id!, { status }),
  );
  const deleteMutation = useApiMutation(queryKeys.agents.all, () => deleteAgent(id!));

  const agentTasks = tasksData?.data ?? [];

  if (isLoading) {
    return <Center h="60vh"><Loader size="md" /></Center>;
  }

  if (!agent || isError) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <IconAlertTriangle size={48} style={{ color: 'var(--mantine-color-dimmed)' }} />
        <Text mt="md" fw={500}>{t('agents:detail.notFound')}</Text>
        <Text size="sm" c="dimmed">{t('agents:detail.notFoundDesc', { id: id ?? '' })}</Text>
        <Button mt="lg" variant="subtle" onClick={() => navigate('/agents')}>
          {t('agents:detail.backToList')}
        </Button>
      </div>
    );
  }

  const agentName = agent.name;
  const agentStatus = agent.status;

  const breadcrumbs: BreadcrumbItem[] = [
    { label: t('nav:pageTitles./agents'), path: '/agents' },
    { label: agentName },
  ];

  const tabTasksLabel = `${t('agents:detail.tabs.tasks')} (${agentTasks.length})`;

  function handleToggleStatus() {
    const next: AgentStatus = agentStatus === 'running' ? 'stopped' : 'running';
    statusMutation.mutate(next, {
      onSuccess: () => {
        notifications.show({
          message: next === 'running' ? `"${agentName}" 已启动` : `"${agentName}" 已停止`,
          color: next === 'running' ? 'green' : 'yellow',
          withCloseButton: true,
        });
      },
    });
  }

  function handleRestart() {
    statusMutation.mutate('running', {
      onSuccess: () => {
        notifications.show({ message: `"${agentName}" 已重启`, color: 'green', withCloseButton: true });
      },
    });
  }

  function handleDeleteConfirm() {
    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        closeDelete();
        navigate('/agents');
      },
    });
  }

  return (
    <>
      <PageHeader breadcrumbs={breadcrumbs} title={agent.name}>
        <StatusBadge status={agent.status} />
        <span className={classes.providerBadge} style={{ marginLeft: 4, marginRight: 12 }}>
          {agent.llmProvider} / {agent.llmModel}
        </span>
        {agent.status === 'running' ? (
          <Button variant="light" color="yellow" size="sm" leftSection={<IconPlayerStop size={14} />} onClick={handleToggleStatus}>
            {t('common:actions.stop')}
          </Button>
        ) : (
          <Button variant="light" color="agentGreen" size="sm" leftSection={<IconPlayerPlay size={14} />} onClick={handleToggleStatus}>
            {t('common:actions.start')}
          </Button>
        )}
        <Button variant="light" color="gray" size="sm" leftSection={<IconRefresh size={14} />} onClick={handleRestart}>
          {t('common:actions.restart')}
        </Button>
        <Button variant="light" color="gray" size="sm" leftSection={<IconPencil size={14} />} onClick={() => navigate(`/agents/create?edit=${agent.id}`)}>
          {t('common:actions.edit')}
        </Button>
        <Button variant="light" color="red" size="sm" leftSection={<IconTrash size={14} />} onClick={openDelete}>
          {t('common:actions.delete')}
        </Button>
      </PageHeader>

      <div className={classes.tabsCard}>
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="overview">{t('agents:detail.tabs.overview')}</Tabs.Tab>
            <Tabs.Tab value="tasks">{tabTasksLabel}</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview">
            <div className={classes.tabContent}>
              <div className={classes.statsRow}>
                <div className={classes.statMini}>
                  <div className={classes.statMiniValue}>{agent.todayTasks}</div>
                  <div className={classes.statMiniLabel}>{t('agents:detail.stats.todayTasks')}</div>
                </div>
                <div className={classes.statMini}>
                  <div className={classes.statMiniValue}>{formatTokens(agent.todayTokens)}</div>
                  <div className={classes.statMiniLabel}>{t('agents:detail.stats.todayTokens')}</div>
                </div>
                <div className={classes.statMini}>
                  <div className={classes.statMiniValue}>{formatTokens(agent.dailyTokenQuota)}</div>
                  <div className={classes.statMiniLabel}>{t('agents:detail.stats.dailyQuota')}</div>
                </div>
              </div>

              <div className={classes.infoGrid}>
                <div>
                  <div className={classes.infoLabel}>{t('agents:detail.info.agentId')}</div>
                  <div className={`${classes.infoValue} ${classes.infoValueMono}`}>{agent.id}</div>
                </div>
                <div>
                  <div className={classes.infoLabel}>{t('agents:detail.info.status')}</div>
                  <div className={classes.infoValue}><StatusBadge status={agent.status} /></div>
                </div>
                <div>
                  <div className={classes.infoLabel}>{t('agents:detail.info.provider')}</div>
                  <div className={classes.infoValue}>{agent.llmProvider}</div>
                </div>
                <div>
                  <div className={classes.infoLabel}>{t('agents:detail.info.model')}</div>
                  <div className={classes.infoValue}>{agent.llmModel}</div>
                </div>
                <div>
                  <div className={classes.infoLabel}>{t('agents:detail.info.created')}</div>
                  <div className={`${classes.infoValue} ${classes.infoValueMono}`}>{agent.createdAt}</div>
                </div>
                <div>
                  <div className={classes.infoLabel}>{t('agents:detail.info.updated')}</div>
                  <div className={`${classes.infoValue} ${classes.infoValueMono}`}>{agent.updatedAt}</div>
                </div>
                <div className={classes.infoGridFull}>
                  <div className={classes.infoLabel}>{t('agents:detail.info.tools')} ({agent.tools.length})</div>
                  <div className={classes.toolsWrap}>
                    {agent.tools.map((tool) => <span key={tool} className={classes.toolTag}>{tool}</span>)}
                  </div>
                </div>
              </div>

              <div className={classes.descriptionCard}>
                <div className={classes.descriptionTitle}>{t('agents:detail.info.description')}</div>
                <div className={classes.descriptionText}>{agent.description}</div>
              </div>
            </div>
          </Tabs.Panel>

          <Tabs.Panel value="tasks">
            <div className={classes.tabContent}>
              <table className={classes.taskTable}>
                <thead>
                  <tr>
                    <th>{t('agents:detail.tasksTable.taskId')}</th>
                    <th>{t('agents:detail.tasksTable.status')}</th>
                    <th>{t('agents:detail.tasksTable.priority')}</th>
                    <th>{t('agents:detail.tasksTable.input')}</th>
                    <th>{t('agents:detail.tasksTable.duration')}</th>
                    <th>{t('agents:detail.tasksTable.tokens')}</th>
                    <th>{t('agents:detail.tasksTable.time')}</th>
                  </tr>
                </thead>
                <tbody>
                  {agentTasks.map((task) => (
                    <tr key={task.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/tasks/${task.id}`)}>
                      <td className={classes.monoCell}>{task.id}</td>
                      <td><StatusBadge status={task.status} /></td>
                      <td><PriorityBadge priority={task.priority} /></td>
                      <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <TruncatedText text={task.input} maxLen={28} />
                      </td>
                      <td className={classes.monoCell}>{formatDuration(task.duration)}</td>
                      <td className={classes.monoCell}>{task.tokensUsed ?? '—'}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--mantine-color-dimmed)' }}>{task.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Tabs.Panel>
        </Tabs>
      </div>

      <Modal opened={deleteOpened} onClose={closeDelete} title={t('agents:detail.deleteModal.title')} centered>
        <Text size="sm" mb="md">
          {t('agents:detail.deleteModal.message', { name: agent.name })}
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
