'use client';

import { settingsApi } from '@/api/settings';
import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ExchangeAccount } from '@/features/settings/types';
import { useRouter } from '@/i18n/navigation';
import { Loader2, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

function MiniCurvePlaceholder() {
  return (
    <div className='h-14 w-full rounded-md border border-dashed bg-muted/20 p-2'>
      <svg viewBox='0 0 100 28' className='h-full w-full'>
        <path
          d='M0,20 C12,18 18,8 32,10 C45,12 52,20 66,17 C80,14 85,8 100,10'
          fill='none'
          stroke='currentColor'
          strokeWidth='1.8'
          className='text-muted-foreground/50'
        />
      </svg>
    </div>
  );
}

export default function CopyTaskPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<ExchangeAccount[]>([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      setLoading(true);
      try {
        const data = await settingsApi.getExchangeAccounts();
        setAccounts(data);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : '加载信号列表失败，请稍后重试';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, []);

  const signalApis = useMemo(
    () => accounts.filter((item) => item.is_readonly),
    [accounts]
  );

  return (
    <PageContainer
      pageTitle='跟单管理'
      pageDescription='选择只读信号 API，进入详情配置跟单策略'
    >
      {loading ? (
        <div className='flex h-[40vh] items-center justify-center'>
          <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
        </div>
      ) : signalApis.length === 0 ? (
        <Card className='mx-auto max-w-xl'>
          <CardHeader>
            <CardTitle>暂无可用信号</CardTitle>
            <CardDescription>
              还没有只读权限（is_readonly=true）的信号 API，请先到 API 管理中新增。
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
          {signalApis.map((signal) => (
            <Card
              key={signal.id}
              className='rounded-2xl border hover:shadow-md transition-shadow'
            >
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between gap-2'>
                  <CardTitle className='line-clamp-1 text-base font-semibold'>
                    {signal.api_name || `信号 ${signal.id}`}
                  </CardTitle>
                  <Badge variant='secondary'>只读信号</Badge>
                </div>
                <CardDescription className='line-clamp-1'>
                  交易所：{signal.platform.toUpperCase()}
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='rounded-lg bg-muted/20 p-3'>
                  <div className='mb-1 text-xs text-muted-foreground'>近期盈利（预留）</div>
                  <div className='flex items-center gap-2 text-2xl font-semibold text-muted-foreground/70'>
                    <TrendingUp className='h-4 w-4' />
                    --
                  </div>
                </div>
                <div>
                  <div className='mb-1 text-xs text-muted-foreground'>mini 收益曲线（预留）</div>
                  <MiniCurvePlaceholder />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className='w-full'
                  onClick={() => router.push(`/dashboard/copy-task/${signal.id}`)}
                >
                  跟单
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
