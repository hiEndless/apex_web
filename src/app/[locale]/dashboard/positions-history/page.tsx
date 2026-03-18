'use client';

import PageContainer from '@/components/layout/page-container';

export default function WorkspacesPage() {
  return (
    <PageContainer
      pageTitle='Workspaces'
      pageDescription='Manage your workspaces and switch between them'
    >
      <div className='p-4 border rounded-lg'>
        <h3 className='text-lg font-medium'>Workspaces</h3>
        <p className='text-muted-foreground'>
          Workspace management is currently disabled in this demo.
        </p>
      </div>
    </PageContainer>
  );
}
