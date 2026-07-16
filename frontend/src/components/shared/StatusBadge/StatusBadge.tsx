import { useTranslation } from 'react-i18next';
import type { TaskStatus, AgentStatus } from '../../../types';
import classes from './StatusBadge.module.css';

type DisplayStatus = TaskStatus | AgentStatus;

const STATUS_CLASS: Record<DisplayStatus, string> = {
  succeeded: classes.succeeded,
  running: classes.running,
  failed: classes.failed,
  queued: classes.queued,
  cancelled: classes.cancelled,
  stopped: classes.cancelled,
  error: classes.failed,
};

export interface StatusBadgeProps {
  status: DisplayStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation('status');

  const isAgentStatus = status === 'stopped' || status === 'error';
  const key = isAgentStatus ? `agent.${status}` : `task.${status}`;
  const label = t(key, status); // fallback to raw status string
  const cls = STATUS_CLASS[status] ?? classes.queued;

  return (
    <span className={`${classes.badge} ${cls}`}>
      <span className={classes.dot} />
      {label}
    </span>
  );
}
