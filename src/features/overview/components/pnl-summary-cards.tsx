'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { positionsApi, StudioTotalPnlResponse } from '@/api/positions';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

import RatingsCardSvg from '@/assets/svg/ratings-card-svg';
import SessionCardSvg from '@/assets/svg/session-card-svg';
import CustomersCardSvg from '@/assets/svg/customers-card-svg';
import TotalOrdersCardSvg from '@/assets/svg/total-orders-card-svg';

function PeriodCard({ 
  title, 
  days, 
  badgeContent, 
  svg 
}: { 
  title: string; 
  days: number; 
  badgeContent: string;
  svg: ReactNode;
}) {
  const [data, setData] = useState<StudioTotalPnlResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    positionsApi.getStudioTotalPnl(days)
      .then((res) => {
        if (isMounted) setData(res);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => { isMounted = false; };
  }, [days]);

  const pnlValue = parseFloat(data?.summary?.total_pnl || '0');
  const isPositive = pnlValue > 0;
  const isNegative = pnlValue < 0;
  
  const valueColor = isPositive ? 'text-green-600 dark:text-green-400' : isNegative ? 'text-destructive' : 'text-foreground';
  const displayValue = !isNaN(pnlValue) ? pnlValue.toFixed(2) : '0.00';

  return (
    <Card className={cn('relative justify-between gap-6')}>
      <CardHeader className="flex flex-col gap-3">
        <span className="font-medium">{title}</span>
        <div className="flex">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/10 shadow-none border-transparent">{badgeContent}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex items-center gap-2 lg:max-[1100px]:flex-col lg:max-[1100px]:items-start">
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <>
            <span className={`text-2xl font-semibold ${valueColor}`}>
              {isPositive ? '+' : ''}{displayValue}
            </span>
            <span className="text-sm font-medium text-muted-foreground">USDT</span>
          </>
        )}
      </CardContent>
      <div className="absolute right-0.5 bottom-0 [&_path[fill='var(--primary)']]:fill-black dark:[&_path[fill='var(--primary)']]:fill-white [&_path[stroke='var(--primary)']]:stroke-black dark:[&_path[stroke='var(--primary)']]:stroke-white">{svg}</div>
    </Card>
  );
}

export function PnlSummaryCards() {
  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
      <PeriodCard title="今天盈利" days={1} badgeContent="Daily" svg={<RatingsCardSvg />} />
      <PeriodCard title="最近7天盈利" days={7} badgeContent="Last Week" svg={<SessionCardSvg />} />
      <PeriodCard title="最近14天盈利" days={14} badgeContent="Last 2 Weeks" svg={<CustomersCardSvg />} />
      <PeriodCard title="最近30天盈利" days={30} badgeContent="Last Month" svg={<TotalOrdersCardSvg />} />
    </div>
  );
}
