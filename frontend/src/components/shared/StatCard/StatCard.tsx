import { IconArrowUpRight, IconArrowDownRight, IconMinus } from '@tabler/icons-react';
import classes from './StatCard.module.css';

export type TrendDirection = 'up' | 'down' | 'neutral';

export interface StatCardProps {
  /** 图标 (ReactNode) */
  icon: React.ReactNode;
  /** 图标背景色 */
  iconBg: string;
  /** 图标颜色 */
  iconColor: string;
  /** 标签文字 */
  label: string;
  /** 主数值 */
  value: string | number;
  /** 数值单位 (如 %, / 5M) */
  unit?: string;
  /** 趋势文字 */
  trend?: string;
  /** 趋势方向 */
  trendDirection?: TrendDirection;
}

function TrendIcon({ direction }: { direction: TrendDirection }) {
  if (direction === 'up') return <IconArrowUpRight size={14} />;
  if (direction === 'down') return <IconArrowDownRight size={14} />;
  return <IconMinus size={14} />;
}

const TREND_CLASS: Record<TrendDirection, string> = {
  up: classes.trendUp,
  down: classes.trendDown,
  neutral: classes.trendNeutral,
};

export function StatCard({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  unit,
  trend,
  trendDirection = 'neutral',
}: StatCardProps) {
  return (
    <div className={classes.card}>
      <div className={classes.header}>
        <span className={classes.label}>{label}</span>
        <div className={classes.iconWrap} style={{ background: iconBg, color: iconColor }}>
          {icon}
        </div>
      </div>

      <div className={classes.value}>
        {value}
        {unit && <span className={classes.unit}>{unit}</span>}
      </div>

      {trend && (
        <div className={`${classes.trend} ${TREND_CLASS[trendDirection]}`}>
          <TrendIcon direction={trendDirection} />
          {trend}
        </div>
      )}
    </div>
  );
}
