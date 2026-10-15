import type { ReactElement, ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

declare function PageContainer(props: PageContainerProps): ReactElement;

export default PageContainer;
