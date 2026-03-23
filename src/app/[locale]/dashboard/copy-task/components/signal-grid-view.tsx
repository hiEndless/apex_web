import { ExchangeAccount } from '@/features/settings/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EXCHANGE_LOGO_SRC } from '@/constants/exchange-logo';
import { TrendingUp } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from '@/i18n/navigation';

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

export type GroupedBinding = {
  trader_api_id: number;
  trader_api_name: string;
  trader_studio_id: number;
  followers: {
    follower_api_id: number;
    follower_api_name: string;
    follower_studio_id: number;
    ratio: number;
  }[];
};

interface SignalGridViewProps {
  signalApis: ExchangeAccount[];
  studioNamesById: Record<number, string>;
  currentStudioId: number | null;
  groupedBindings: Record<string, GroupedBinding>;
}

export function SignalGridView({
  signalApis,
  studioNamesById,
  currentStudioId,
  groupedBindings,
}: SignalGridViewProps) {
  const router = useRouter();

  return (
    <div className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4'>
      {signalApis.map((signal) => {
        const platformKey = (signal.platform || '').trim().toLowerCase();
        const logoSrc = EXCHANGE_LOGO_SRC[platformKey];
        const isOwnSignal = currentStudioId == null || signal.studio_id === currentStudioId;
        const otherStudioLabel =
          studioNamesById[signal.studio_id] ?? `工作室 #${signal.studio_id}`;
        
        const bindingInfo = groupedBindings[signal.id];
        const followerCount = bindingInfo?.followers?.length || 0;

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
                {isOwnSignal ? (
                  <Badge
                    variant='default'
                    className='absolute right-0 top-0 max-w-[min(10rem,40%)] border-transparent bg-blue-600 text-xs text-white hover:bg-blue-600/90'
                  >
                    自有
                  </Badge>
                ) : (
                  <Badge
                    variant='default'
                    title={otherStudioLabel}
                    className='absolute right-0 top-0 max-w-[min(10rem,40%)] border-transparent bg-green-600 text-xs text-white hover:bg-green-600/90'
                  >
                    <span className='line-clamp-1'>{otherStudioLabel}</span>
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className='px-4 pt-0'>
              <div className='mb-2 flex items-center justify-between text-[10px] font-medium leading-none text-muted-foreground/80'>
                <span className='tabular-nums'>当前资产：{signal.usdt.toFixed(2)} USDT</span>
                <span className='rounded bg-muted/50 px-1.5 py-0.5'>
                  {followerCount} 个跟单
                </span>
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
  );
}
