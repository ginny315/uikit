import { Modal, type ModalProps } from '@mantine/core';
import classes from './AppModal.module.css';

export interface AppModalProps extends ModalProps {
  /** default: 常规弹窗 | danger: 删除/危险确认 */
  variant?: 'default' | 'danger';
  /** 底部操作区 — 按钮组放这里，与内容区视觉分离 */
  footer?: React.ReactNode;
}

export function AppModal({
  variant = 'default',
  footer,
  className,
  classNames,
  centered = true,
  radius = 'lg',
  padding = 0,
  size = '440px',
  children,
  ...props
}: AppModalProps) {
  return (
    <Modal
      centered={centered}
      radius={radius}
      padding={padding}
      size={size}
      overlayProps={{ backgroundOpacity: 0.45, blur: 6 }}
      transitionProps={{ transition: 'pop', duration: 180 }}
      classNames={{
        root: `${classes.root} ${variant === 'danger' ? classes.danger : ''} ${className ?? ''}`,
        inner: classes.inner,
        content: classes.content,
        header: classes.header,
        title: classes.title,
        close: classes.close,
        body: classes.body,
        ...classNames,
      }}
      {...props}
    >
      <div className={classes.bodyInner}>{children}</div>
      {footer && <div className={classes.footer}>{footer}</div>}
    </Modal>
  );
}
