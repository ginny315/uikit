import { useTranslation } from 'react-i18next';
import type { TaskPriority } from '../../../types';
import classes from './PriorityBadge.module.css';

/** 优先级数值 → 语义名（与 lib/constants.ts PRIORITY 对应） */
const PRIORITY_LEVEL: Record<TaskPriority, 'critical' | 'high' | 'medium' | 'low'> = {
  1: 'critical',
  2: 'high',
  3: 'medium',
  4: 'low',
};

/** 信号格填充数：紧急 4 格 → 低 1 格 */
const FILLED_BARS: Record<TaskPriority, number> = {
  1: 4,
  2: 3,
  3: 2,
  4: 1,
};

const LEVEL_CLASS: Record<string, string> = {
  critical: classes.critical,
  high: classes.high,
  medium: classes.medium,
  low: classes.low,
};

export interface PriorityBadgeProps {
  priority: TaskPriority;
}

/**
 * 优先级指示器 — Linear 风格信号格。
 * 刻意不用胶囊背景，与 StatusBadge（状态）在视觉语言上区分：
 * 状态 = 彩色 pill，优先级 = 递增信号格 + 文字。
 */
export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const { t } = useTranslation('status');
  const level = PRIORITY_LEVEL[priority];
  const filled = FILLED_BARS[priority];
  const label = t(`priority.${level}`, level);

  return (
    <span className={`${classes.wrapper} ${LEVEL_CLASS[level]}`}>
      <span className={classes.bars} aria-hidden="true">
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className={`${classes.bar} ${i <= filled ? classes.barFilled : ''}`} />
        ))}
      </span>
      {label}
    </span>
  );
}
