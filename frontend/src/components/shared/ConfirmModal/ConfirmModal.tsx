import { useTranslation } from 'react-i18next';
import { Button, Text } from '@mantine/core';
import { AppModal } from '../AppModal/AppModal';
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
  /** Modal title */
  title: string;
  /** Warning / confirmation message */
  message: string;
  /** What's being deleted — shown in a preview card */
  target?: ConfirmModalTarget;
  /** Confirm button text */
  confirmLabel: string;
  /** Cancel button text */
  cancelLabel?: string;
  /** Confirm button loading state */
  confirmLoading?: boolean;
  onConfirm: () => void;
}

export function ConfirmModal({
  opened,
  onClose,
  title,
  message,
  target,
  confirmLabel,
  cancelLabel,
  confirmLoading,
  onConfirm,
}: ConfirmModalProps) {
  const { t } = useTranslation();
  const resolvedCancelLabel = cancelLabel ?? t('common:actions.cancel');
  return (
    <AppModal
      opened={opened}
      onClose={onClose}
      variant="danger"
      title={
        <span className={classes.titleInner}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
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
      footer={
        <>
          <Button variant="default" onClick={onClose}>
            {resolvedCancelLabel}
          </Button>
          <Button color="red" onClick={onConfirm} loading={confirmLoading}>
            {confirmLabel}
          </Button>
        </>
      }
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
      <Text size="sm" c="dimmed">
        {message}
      </Text>
    </AppModal>
  );
}
