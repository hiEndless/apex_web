import { ExchangeAccount } from '@/features/settings/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EXCHANGE_LOGO_SRC } from '@/constants/exchange-logo';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from '@/i18n/navigation';
import type { PnlStatsItem, GroupedBinding } from '@/api/copy-task';
import { cn } from '@/lib/utils';

function MiniCurvePlaceholder() {
  return (
    <div className='flex h-9 w-full items-center rounded border border-dashed border-border/50 bg-background/50 px-1.5'>
      <svg viewBox='0 0 100 22' className='h-full w-full' preserveAspectRatio='none'>
        <path
          d='M0,16 C14,14 20,6 34,7 C48,9 54,16 68,14 C82,11 88,4 100,5'
          fill='none'
          stroke='currentColor'
          strokeWidth='1.5'
          vectorEffect='non-scaling-stroke'
          className='text-muted-foreground/40'
        />
      </svg>
    </div>
  );
}

function MiniCurve({ data }: { data: PnlStatsItem['daily_curve'] }) {
  if (!data || data.length === 0) return <MiniCurvePlaceholder />;

  // Normalize data for SVG
  const values = data.map((d) => parseFloat(d.cum_pnl || '0'));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  
  const width = 100;
  const height = 22;
  const padding = 2; // padding top and bottom

  const points = values.map((val, i) => {
    // 7 days data will have 7 points. x values: 0, 16.66, 33.33, 50, 66.66, 83.33, 100
    const x = (i / (values.length - 1 || 1)) * width;
    // Normalize y to fit in height (invert y because SVG 0 is top)
    let y = height / 2;
    if (range > 0) {
      y = height - padding - ((val - min) / range) * (height - 2 * padding);
    }
    return { x, y };
  });

  // Build curved path using smooth cubic bezier approximation
  let pathD = '';
  if (points.length > 0) {
    pathD = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      
      // Calculate control points for a smooth curve between p0 and p1
      // By using horizontal control points, we ensure the curve is smooth and doesn't overshoot vertically
      const cp1x = p0.x + (p1.x - p0.x) / 2;
      const cp1y = p0.y;
      
      const cp2x = p0.x + (p1.x - p0.x) / 2;
      const cp2y = p1.y;

      pathD += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p1.x},${p1.y}`;
    }
  }
  // Since cum_pnl represents total profit accumulated in this period, we check if the last day is >= 0
  // Or check if the last day's cum_pnl is >= the first day's cum_pnl
  const isPositive = values[values.length - 1] >= 0;

  return (
    <div className='flex h-9 w-full items-center rounded bg-background/50 px-1.5'>
      <svg viewBox={`0 0 ${width} ${height}`} className='h-full w-full' preserveAspectRatio='none'>
        <path
          d={pathD}
          fill='none'
          stroke='currentColor'
          strokeWidth='1.5'
          vectorEffect='non-scaling-stroke'
          className={isPositive ? 'text-green-500' : 'text-red-500'}
        />
      </svg>
    </div>
  );
}

interface SignalGridViewProps {
  signalApis: ExchangeAccount[];
  studioNamesById: Record<number, string>;
  currentStudioId: number | null;
  groupedBindings: Record<string, GroupedBinding>;
  pnlStats?: Record<number, PnlStatsItem>;
  adminSignals?: ExchangeAccount[];
  loadingAdmin?: boolean;
  shouldShowSystemSignals?: boolean;
}

function SignalCard({
  signal,
  currentStudioId,
  studioNamesById,
  groupedBindings,
  pnlStats,
  router,
  isAdminSignal = false,
}: {
  signal: ExchangeAccount;
  currentStudioId: number | null;
  studioNamesById: Record<number, string>;
  groupedBindings: Record<string, GroupedBinding>;
  pnlStats: Record<number, PnlStatsItem>;
  router: ReturnType<typeof useRouter>;
  isAdminSignal?: boolean;
}) {
  const platformKey = (signal.platform || '').trim().toLowerCase();
  const logoSrc = EXCHANGE_LOGO_SRC[platformKey];
  const isOwnSignal = !isAdminSignal && (currentStudioId == null || signal.studio_id === currentStudioId);
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
          {isAdminSignal ? (
            <Badge
              variant='secondary'
              className='absolute right-0 top-0 max-w-[min(10rem,40%)] border-transparent bg-orange-100 text-xs text-orange-700 shadow-none hover:bg-orange-200'
            >
              系统
            </Badge>
          ) : isOwnSignal ? (
            <Badge
              variant='default'
              className='absolute right-0 top-0 max-w-[min(10rem,40%)] border-transparent bg-blue-600 text-xs text-white shadow-none hover:bg-blue-600/90'
            >
              自有
            </Badge>
          ) : (
            <Badge
              variant='default'
              title={otherStudioLabel}
              className='absolute right-0 top-0 max-w-[min(10rem,40%)] border-transparent bg-green-600 text-xs text-white shadow-none hover:bg-green-600/90'
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
              7天收益(USDT)
            </p>
            <div className={cn('flex items-baseline gap-1 text-lg font-semibold tabular-nums tracking-tight', 
              (() => {
                const pnlStr = pnlStats[signal.id]?.summary?.total_pnl;
                if (!pnlStr) return 'text-muted-foreground/75';
                const pnlNum = parseFloat(pnlStr);
                if (pnlNum > 0) return 'text-green-500';
                if (pnlNum < 0) return 'text-red-500';
                return 'text-muted-foreground/75';
              })()
            )}>
              {(() => {
                const pnlStr = pnlStats[signal.id]?.summary?.total_pnl;
                if (!pnlStr) return <TrendingUp className='h-3 w-3 shrink-0 opacity-40' aria-hidden />;
                const pnlNum = parseFloat(pnlStr);
                if (pnlNum > 0) return <TrendingUp className='h-3 w-3 shrink-0 opacity-80' aria-hidden />;
                if (pnlNum < 0) return <TrendingDown className='h-3 w-3 shrink-0 opacity-80' aria-hidden />;
                return <TrendingUp className='h-3 w-3 shrink-0 opacity-40' aria-hidden />;
              })()}
              <span>
                {(() => {
                  const pnlStr = pnlStats[signal.id]?.summary?.total_pnl;
                  if (!pnlStr) return '--';
                  const pnlNum = parseFloat(pnlStr);
                  return `${pnlNum > 0 ? '+' : ''}${pnlNum.toFixed(2)}`;
                })()}
              </span>
            </div>
          </div>
          <div className='flex w-[46%] max-w-[120px] shrink-0 flex-col justify-center gap-0.5'>
            {pnlStats[signal.id] ? (
              <MiniCurve data={pnlStats[signal.id].daily_curve} />
            ) : (
              <MiniCurvePlaceholder />
            )}
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
}

export function SignalGridView({
  signalApis,
  studioNamesById,
  currentStudioId,
  groupedBindings,
  pnlStats = {},
  adminSignals = [],
  loadingAdmin = false,
  shouldShowSystemSignals = false,
}: SignalGridViewProps) {
  const router = useRouter();

  return (
    <div className='space-y-8'>
      {shouldShowSystemSignals && (adminSignals.length > 0 || loadingAdmin) && (
        <div className='space-y-4'>
          <div className='flex items-center gap-4'>
            <h3 className='text-base font-semibold text-foreground/80 whitespace-nowrap'>系统跟单信号</h3>
            <div className='h-px flex-1 bg-border/60' />
          </div>
          {loadingAdmin ? (
            <div className='flex items-center justify-center py-8'>
              <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4'>
              {adminSignals.map((signal) => (
                <SignalCard
                  key={signal.id}
                  signal={signal}
                  currentStudioId={currentStudioId}
                  studioNamesById={studioNamesById}
                  groupedBindings={groupedBindings}
                  pnlStats={pnlStats}
                  router={router}
                  isAdminSignal={true}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className='space-y-4'>
        {shouldShowSystemSignals && (adminSignals.length > 0 || loadingAdmin) && (
          <div className='flex items-center gap-4'>
            <h3 className='text-base font-semibold text-foreground/80 whitespace-nowrap'>我的信号</h3>
            <div className='h-px flex-1 bg-border/60' />
          </div>
        )}
        {signalApis.length === 0 ? (
           <div className='flex min-h-[min(30vh,200px)] flex-col items-center justify-center rounded-xl border border-dashed border-border/50 bg-muted/15 px-6 py-10 text-center'>
             <p className='text-sm text-muted-foreground'>暂无我的信号</p>
           </div>
        ) : (
          <div className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {signalApis.map((signal) => (
              <SignalCard
                key={signal.id}
                signal={signal}
                currentStudioId={currentStudioId}
                studioNamesById={studioNamesById}
                groupedBindings={groupedBindings}
                pnlStats={pnlStats}
                router={router}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
