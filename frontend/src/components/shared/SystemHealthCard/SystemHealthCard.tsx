import classes from './SystemHealthCard.module.css';

export type HealthStatus = 'healthy' | 'degraded' | 'down';

export interface SystemHealthCardProps {
  name: string;
  status: HealthStatus;
  uptime: string;
  latency: string;
}

const STATUS_CLASS: Record<HealthStatus, string> = {
  healthy: classes.healthy,
  degraded: classes.degraded,
  down: classes.down,
};

export function SystemHealthCard({ name, status, uptime, latency }: SystemHealthCardProps) {
  return (
    <div className={classes.card}>
      <span className={`${classes.indicator} ${STATUS_CLASS[status]}`} />
      <div className={classes.info}>
        <div className={classes.name}>{name}</div>
        <div className={classes.meta}>↑ {uptime} · {latency}</div>
      </div>
    </div>
  );
}
