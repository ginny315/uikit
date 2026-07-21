import { Modal, Button, Text } from '@mantine/core';
import classes from './ConfirmModal.module.css';

interface ConfirmModalTarget {
  /** Icon element to display */
  icon?: React.ReactNode;
  /** Primary label (name, ID, etc.) */
  label: string;
  /** Secondary detail text */
  detail?: string;
}

export interface ConfirmModalProps {
  opened: boolean;
  onClose: () => void;
  /** Modal title (defaults to "确认删除") */
  title: string;
  /** Warning / confirmation message */
  message: string;
  /** What's being deleted — shown in a preview card */
  target?: ConfirmModalTarget;
  /** Confirm button text */
  confirmLabel: string;
  /** Cancel button text */
  cancelLabel?: string;
  onConfirm: () => void;
}

export function ConfirmModal({
  opened,
  onClose,
  title,
  message,
  target,
  confirmLabel,
  cancelLabel = '取消',
  onConfirm,
}: ConfirmModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <span className={classes.titleInner}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#DC2626"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {title}
        </span>
      }
      centered
      className={classes.root}
    >
      {target && (
        <div className={classes.target}>
          {target.icon && <span className={classes.targetIcon}>{target.icon}</span>}
          <div className={classes.targetInfo}>
            <span className={classes.targetLabel}>{target.label}</span>
            {target.detail && <span className={classes.targetDetail}>{target.detail}</span>}
          </div>
        </div>
      )}
      <Text size="sm" c="dimmed" mt={target ? 'sm' : undefined} mb="sm">
        {message}
      </Text>
      <div className={classes.actions}>
        <Button variant="default" onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button color="red" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
