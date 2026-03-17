'use client';

import PageContainer from '@/components/layout/page-container';

export default function TeamPage() {
  return (
    <PageContainer
      pageTitle='Team Management'
      pageDescription='Manage your workspace team, members, roles, security and more.'
    >
      <div className='p-4 border rounded-lg'>
        <h3 className='text-lg font-medium'>Team Settings</h3>
        <p className='text-muted-foreground'>
          Team management features are currently disabled in this demo.
        </p>
      </div>
    </PageContainer>
  );
}
