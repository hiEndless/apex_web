'use client';

import { settingsApi } from '@/api/settings';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { EXCHANGE_LOGO_SRC } from '@/constants/exchange-logo';
import { ExchangeAccount } from '@/features/settings/types';
import { useRouter } from '@/i18n/navigation';
import { LineChart, Loader2, Plus, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

function MiniCurvePlaceholder() {
  return (
    <div className='flex h-9 w-full items-center rounded border border-dashed border-border/50 bg-background/50 px-1.5'>
      <svg viewBox='0 0 100 22' className='h-full w-full' preserveAspectRatio='none'>
        <path
          d='M0,16 C14,14 20,6 34,7 C48,9 54,16 68,14 C82,11 88,4 100,5'
          fill='none'
          stroke='currentColor'
          strokeWidth='1.4'
          className='text-muted-foreground/40'
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
      pageDescription='选择信号，进入详情配置跟单策略'
      // pageHeaderAction={
      //   <Button
      //     size='sm'
      //     className='shrink-0 gap-1'
      //     onClick={() => router.push('/dashboard/api-settings')}
      //   >
      //     <Plus className='h-4 w-4' aria-hidden />
      //     添加信号
      //   </Button>
      // }
    >
      {loading ? (
        <div className='flex h-[40vh] items-center justify-center'>
          <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
        </div>
      ) : signalApis.length === 0 ? (
        <div className='flex min-h-[min(52vh,420px)] flex-col items-center justify-center rounded-xl border border-dashed border-border/50 bg-muted/15 px-6 py-14 text-center'>
          <div
            className='mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-muted/50 ring-1 ring-border/40'
            aria-hidden
          >
            <LineChart className='h-7 w-7 text-muted-foreground' strokeWidth={1.5} />
          </div>
          <h3 className='text-lg font-semibold tracking-tight'>暂无跟单信号</h3>
          <p className='mt-2 max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground'>
            请在 API 管理中添加<strong className='font-medium text-foreground/80'>只读</strong>
            交易所密钥作为信号源，保存后将在此处展示。
          </p>
          <Button
            className='mt-8 gap-1.5'
            onClick={() => router.push('/dashboard/api-settings')}
          >
            <Plus className='h-4 w-4' aria-hidden />
            前往 API 管理
          </Button>
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4'>
          {signalApis.map((signal) => {
            const platformKey = (signal.platform || '').trim().toLowerCase();
            const logoSrc = EXCHANGE_LOGO_SRC[platformKey];
            return (
            <Card
              key={signal.id}
              className='gap-2 rounded-xl border py-3 transition-shadow hover:shadow-md'
            >
              <CardHeader className='px-4 pb-1 pt-0'>
                <div className='relative flex items-center gap-1.5 pr-16'>
                  {logoSrc ? (
                    <Image
                      src={logoSrc}
                      alt={`${platformKey} logo`}
                      width={18}
                      height={18}
                      className='shrink-0'
                    />
                  ) : null}
                  <CardTitle className='min-w-0 text-sm font-semibold leading-snug'>
                    <div className='line-clamp-1'>{signal.api_name || `信号 ${signal.id}`}</div>
                  </CardTitle>
                  <Badge
                    variant='default'
                    className='absolute right-0 top-0 bg-blue-600 text-white border-transparent hover:bg-blue-600/90 text-xs'
                  >
                    自有
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className='px-4 pt-0'>
                <div className='mb-2 text-[10px] font-medium leading-none text-muted-foreground/80 tabular-nums'>
                  当前资产：{signal.usdt.toFixed(2)} USDT
                </div>
                <div className='flex gap-2 rounded-lg border border-border/40 bg-muted/10 p-2'>
                  <div className='flex min-w-0 flex-1 flex-col justify-center gap-0.5'>
                    <p className='text-[10px] font-medium leading-none text-muted-foreground'>
                      最近7天（预留）
                    </p>
                    <div className='flex items-baseline gap-1 text-lg font-semibold tabular-nums tracking-tight text-muted-foreground/75'>
                      <TrendingUp className='h-3 w-3 shrink-0 opacity-65' aria-hidden />
                      <span>--</span>
                    </div>
                  </div>
                  <div className='flex w-[46%] max-w-[120px] shrink-0 flex-col justify-center gap-0.5'>
                    <p className='text-[10px] font-medium leading-none text-muted-foreground'>
                      曲线（预留）
                    </p>
                    <MiniCurvePlaceholder />
                  </div>
                </div>
              </CardContent>
              <CardFooter className='px-4 pb-0 pt-0'>
                <Button
                  size='sm'
                  className='h-8 w-full text-xs font-medium'
                  onClick={() => router.push(`/dashboard/copy-task/${signal.id}`)}
                >
                  跟单
                </Button>
              </CardFooter>
            </Card>
          );
          })}
        </div>
      )}
    </PageContainer>
  );
}
