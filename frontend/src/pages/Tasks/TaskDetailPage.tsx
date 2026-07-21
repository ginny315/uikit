import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Text, Center, Loader } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import { IconAlertTriangle, IconBan, IconRefresh } from '@tabler/icons-react';
import { StatusBadge } from '../../components/shared/StatusBadge/StatusBadge';
import { PriorityBadge } from '../../components/shared/PriorityBadge/PriorityBadge';
import { ConfirmModal } from '../../components/shared/ConfirmModal/ConfirmModal';
import { PageHeader } from '../../components/shared/PageHeader/PageHeader';
import type { BreadcrumbItem } from '../../components/shared/PageHeader/PageHeader';
import type { TaskTimelineEvent } from '../../types';
import { useApiQuery, useApiMutation, queryKeys } from '../../hooks/useApi';
import { fetchTask, fetchTaskTimeline, cancelTask, retryTask } from '../../services/tasks';
import { formatDuration } from '../../lib/format';
import classes from './TaskDetail.module.css';

const DOT_CLASS: Record<TaskTimelineEvent['type'], string> = {
  enqueued: classes.dotEnqueued,
  assigned: classes.dotAssigned,
  llm_call: classes.dotLlmCall,
  tool_call: classes.dotToolCall,
  retry: classes.dotRetry,
  completed: classes.dotCompleted,
  failed: classes.dotFailed,
  cancelled: classes.dotCancelled,
};

export function TaskDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cancelOpened, { open: openCancel, close: closeCancel }] = useDisclosure(false);

  const { data: task, isLoading, isError } = useApiQuery(
    queryKeys.tasks.detail(id ?? ''),
    () => fetchTask(id!),
    { enabled: !!id },
  );

  const { data: timeline = [] } = useApiQuery(
    queryKeys.tasks.timeline(id ?? ''),
    () => fetchTaskTimeline(id!),
    { enabled: !!id && !!task },
  );

  const cancelMutation = useApiMutation(queryKeys.tasks.all, () => cancelTask(id!));
  const retryMutation = useApiMutation(queryKeys.tasks.all, () => retryTask(id!));

  if (isLoading) {
    return <Center h="60vh"><Loader size="md" /></Center>;
  }

  if (!task || isError) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <IconAlertTriangle size={48} style={{ color: 'var(--mantine-color-dimmed)' }} />
        <Text mt="md" fw={500}>{t('tasks:detail.notFound')}</Text>
        <Text size="sm" c="dimmed">{t('tasks:detail.notFoundDesc', { id: id ?? '' })}</Text>
        <Button mt="lg" variant="subtle" onClick={() => navigate('/tasks')}>
          {t('tasks:detail.backToList')}
        </Button>
      </div>
    );
  }

  const taskId = task.id;
  const isCancellable = task.status === 'queued' || task.status === 'running';
  const isRetryable = task.status === 'failed' || task.status === 'cancelled';

  const breadcrumbs: BreadcrumbItem[] = [
    { label: t('nav:pageTitles./tasks'), path: '/tasks' },
    { label: taskId },
  ];

  function handleCancelConfirm() {
    cancelMutation.mutate(undefined, {
      onSuccess: () => {
        notifications.show({ message: t('tasks:cancelModal.successMsg', { id: taskId }), color: 'yellow', withCloseButton: true });
        closeCancel();
      },
    });
  }

  function handleRetry() {
    retryMutation.mutate(undefined, {
      onSuccess: () => {
        notifications.show({ message: t('tasks:detail.retryMsg', { id: taskId }), color: 'green', withCloseButton: true });
      },
    });
  }

  return (
    <>
      <PageHeader breadcrumbs={breadcrumbs} title={task.input}>
        <StatusBadge status={task.status} />
        <span style={{ marginRight: 12 }}><PriorityBadge priority={task.priority} /></span>
        {isCancellable && (
          <Button variant="light" color="red" size="sm" leftSection={<IconBan size={14} />} onClick={openCancel}>
            {t('tasks:list.cancelAction')}
          </Button>
        )}
        {isRetryable && (
          <Button variant="light" color="agentGreen" size="sm" leftSection={<IconRefresh size={14} />} loading={retryMutation.isPending} onClick={handleRetry}>
            {t('tasks:detail.retryBtn')}
          </Button>
        )}
      </PageHeader>

      <div className={classes.card}>
        <div className={classes.statsRow}>
          <div className={classes.statMini}>
            <div className={classes.statMiniValue}>{formatDuration(task.duration)}</div>
            <div className={classes.statMiniLabel}>{t('tasks:detail.stats.duration')}</div>
          </div>
          <div className={classes.statMini}>
            <div className={classes.statMiniValue}>{task.tokensUsed?.toLocaleString() ?? '—'}</div>
            <div className={classes.statMiniLabel}>{t('tasks:detail.stats.tokens')}</div>
          </div>
          <div className={classes.statMini}>
            <div className={classes.statMiniValue}>{timeline.length}</div>
            <div className={classes.statMiniLabel}>{t('tasks:detail.stats.events')}</div>
          </div>
        </div>

        <div className={classes.infoGrid}>
          <div>
            <div className={classes.infoLabel}>{t('tasks:detail.info.taskId')}</div>
            <div className={`${classes.infoValue} ${classes.infoValueMono}`}>{task.id}</div>
          </div>
          <div>
            <div className={classes.infoLabel}>{t('tasks:detail.info.agent')}</div>
            <div className={classes.infoValue}>
              <span className={classes.agentLink} onClick={() => navigate(`/agents/${task.agentId}`)}>
                {task.agentName}
              </span>
            </div>
          </div>
          <div>
            <div className={classes.infoLabel}>{t('tasks:detail.info.status')}</div>
            <div className={classes.infoValue}><StatusBadge status={task.status} /></div>
          </div>
          <div>
            <div className={classes.infoLabel}>{t('tasks:detail.info.priority')}</div>
            <div className={classes.infoValue}><PriorityBadge priority={task.priority} /></div>
          </div>
          <div>
            <div className={classes.infoLabel}>{t('tasks:detail.info.createdAt')}</div>
            <div className={`${classes.infoValue} ${classes.infoValueMono}`}>{task.createdAt}</div>
          </div>
          <div>
            <div className={classes.infoLabel}>{t('tasks:detail.info.startedAt')}</div>
            <div className={`${classes.infoValue} ${classes.infoValueMono}`}>{task.startedAt ?? '—'}</div>
          </div>
          <div>
            <div className={classes.infoLabel}>{t('tasks:detail.info.completedAt')}</div>
            <div className={`${classes.infoValue} ${classes.infoValueMono}`}>{task.completedAt ?? '—'}</div>
          </div>
        </div>
      </div>

      <div className={classes.card}>
        <div className={classes.sectionTitle}>{t('tasks:detail.input')}</div>
        <div className={classes.contentBlock}>{task.input}</div>
      </div>

      {task.errorMessage ? (
        <div className={classes.card}>
          <div className={classes.sectionTitle}>{t('tasks:detail.error')}</div>
          <div className={classes.errorBlock}>{task.errorMessage}</div>
        </div>
      ) : (
        <div className={classes.card}>
          <div className={classes.sectionTitle}>{t('tasks:detail.output')}</div>
          {task.output ? (
            <div className={classes.contentBlock}>{task.output}</div>
          ) : (
            <div className={`${classes.contentBlock} ${classes.contentBlockEmpty}`}>
              {t('tasks:detail.noOutput')}
            </div>
          )}
        </div>
      )}

      <div className={classes.card}>
        <div className={classes.sectionTitle}>{t('tasks:detail.timeline')}</div>
        <div className={classes.timeline}>
          {timeline.map((event, i) => (
            <div key={`${event.timestamp}-${event.type}-${i}`} className={classes.timelineItem}>
              <span className={`${classes.timelineDot} ${DOT_CLASS[event.type]}`} />
              <div className={classes.timelineHead}>
                <span className={classes.timelineType}>{t(`tasks:detail.timelineEvents.${event.type}`)}</span>
                <span className={classes.timelineTime}>{event.timestamp}</span>
                {event.duration !== undefined && (
                  <span className={classes.timelineDuration}>{formatDuration(event.duration)}</span>
                )}
              </div>
              <div className={classes.timelineDetail}>{event.detail}</div>
            </div>
          ))}
        </div>
      </div>

      <ConfirmModal
        opened={cancelOpened}
        onClose={closeCancel}
        title={t('tasks:cancelModal.title')}
        message={t('tasks:cancelModal.message', { id: taskId })}
        target={{ icon: <IconBan size={14} />, label: taskId, detail: task.input }}
        confirmLabel={t('tasks:cancelModal.confirmBtn')}
        cancelLabel={t('tasks:cancelModal.keepBtn')}
        confirmLoading={cancelMutation.isPending}
        onConfirm={handleCancelConfirm}
      />
    </>
  );
}
