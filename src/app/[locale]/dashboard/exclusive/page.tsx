'use client';

import PageContainer from '@/components/layout/page-container';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { BadgeCheck } from 'lucide-react';

export default function ExclusivePage() {
  // Mock organization data
  const organization = { name: 'Demo Org' };

  return (
    <PageContainer>
      <div className='space-y-6'>
        <div>
          <h1 className='flex items-center gap-2 text-3xl font-bold tracking-tight'>
            <BadgeCheck className='h-7 w-7 text-green-600' />
            Exclusive Area
          </h1>
          <p className='text-muted-foreground'>
            Welcome,{' '}
            <span className='font-semibold'>{organization?.name}</span>! This
            page contains exclusive features.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>
              Thank You for Checking Out the Exclusive Page
            </CardTitle>
            <CardDescription>
              This content is visible to everyone in the demo version.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-lg'>Have a wonderful day!</div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
