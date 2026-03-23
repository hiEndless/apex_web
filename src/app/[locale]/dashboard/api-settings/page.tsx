'use client';

import { useTranslations } from 'next-intl';
import PageContainer from '@/components/layout/page-container';
import { ExchangeList } from '@/features/settings/components/exchange-list';

export default function ApiSettingsPage() {
  const t = useTranslations('AccountSettingsPage');

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">API 设置</h1>
          <p className="text-muted-foreground">
            添加和管理工作室交易员与跟单 API
          </p>
        </div>
        <ExchangeList />
      </div>
    </PageContainer>
  );
}
