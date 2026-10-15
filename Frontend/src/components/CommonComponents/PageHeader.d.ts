import type { ReactElement, ReactNode } from 'react';

interface PageHeaderProps {
  title: ReactNode;
  eyebrow?: ReactNode;
  subtitle?: ReactNode;
  description?: ReactNode;
  breadcrumb?: string;
  breadcrumbTrail?: ReactNode;
  className?: string;
  contentClassName?: string;
  titleClassName?: string;
  action?: ReactNode;
  children?: ReactNode;
}

declare function PageHeader(props: PageHeaderProps): ReactElement;

export default PageHeader;
