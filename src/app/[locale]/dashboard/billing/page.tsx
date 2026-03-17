'use client';

import PageContainer from '@/components/layout/page-container';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function BillingPage() {
  // Mock organization
  const organization = { name: 'Demo Org' };

  return (
    <PageContainer>
      <div className='space-y-6'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Billing & Plans</h1>
          <p className='text-muted-foreground'>
            Manage your subscription and usage limits for {organization?.name}
          </p>
        </div>

        {/* Info Alert */}
        <Alert>
          <Info className='h-4 w-4' />
          <AlertDescription>
            This is a demo billing page. No actual billing integration is active.
          </AlertDescription>
        </Alert>

        {/* Mock Pricing Table */}
        <Card>
          <CardHeader>
            <CardTitle>Available Plans</CardTitle>
            <CardDescription>
              Choose a plan that fits your organization's needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='mx-auto max-w-4xl'>
              <div className="p-4 text-center border rounded">
                Pricing table placeholder
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
