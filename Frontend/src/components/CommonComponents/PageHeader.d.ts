import type { ReactElement, ReactNode } from 'react';

interface PageHeaderProps {
  title: ReactNode;
  background?: string;
  image?: string;
  imageSize?: string;
  imagePosition?: string;
  eyebrow?: ReactNode;
  subtitle?: ReactNode;
  description?: ReactNode;
  breadcrumb?: string;
  className?: string;
  contentClassName?: string;
  titleClassName?: string;
  action?: ReactNode;
  children?: ReactNode;
}

declare function PageHeader(props: PageHeaderProps): ReactElement;

export default PageHeader;
