import { useTranslation } from 'react-i18next';
import classes from './QueueMonitor.module.css';

export type QueueLevel = 'critical' | 'high' | 'medium' | 'low';

export interface QueueItem {
  level: QueueLevel;
  label: string;
  count: number;
}

const DOT_CLASS: Record<QueueLevel, string> = {
  critical: classes.dotCritical,
  high: classes.dotHigh,
  medium: classes.dotMedium,
  low: classes.dotLow,
};

export interface QueueMonitorProps {
  items: QueueItem[];
}

export function QueueMonitor({ items }: QueueMonitorProps) {
  const { t } = useTranslation();

  return (
    <div className={classes.card}>
      <div className={classes.title}>{t('dashboard:queue.title')}</div>
      {items.map((item) => (
        <div key={item.level} className={classes.item}>
          <span className={`${classes.dot} ${DOT_CLASS[item.level]}`} />
          <span className={classes.label}>{item.label}</span>
          <span className={classes.count}>{item.count}</span>
        </div>
      ))}
    </div>
  );
}
