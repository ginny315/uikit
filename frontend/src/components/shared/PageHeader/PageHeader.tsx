import { useNavigate } from 'react-router-dom';
import { Breadcrumbs, Anchor } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import classes from './PageHeader.module.css';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface PageHeaderProps {
  /** 面包屑路径 */
  breadcrumbs: BreadcrumbItem[];
  /** 页面标题 */
  title: string;
  /** 标题右侧的操作区（按钮等） */
  children?: React.ReactNode;
}

export function PageHeader({ breadcrumbs, title, children }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className={classes.wrapper}>
      <Breadcrumbs
        className={classes.breadcrumbs}
        separator={<IconChevronRight size={12} />}
      >
        {breadcrumbs.map((item, i) => {
          const isLast = i === breadcrumbs.length - 1;
          if (item.path && !isLast) {
            return (
              <Anchor
                key={item.path}
                className={classes.breadcrumbLink}
                onClick={(e) => { e.preventDefault(); navigate(item.path!); }}
                href={item.path}
              >
                {item.label}
              </Anchor>
            );
          }
          return (
            <span key={i} className={isLast ? classes.breadcrumbCurrent : classes.breadcrumbText}>
              {item.label}
            </span>
          );
        })}
      </Breadcrumbs>

      <div className={classes.titleRow}>
        <h1 className={classes.title}>{title}</h1>
        {children && <div className={classes.actions}>{children}</div>}
      </div>
    </div>
  );
}
