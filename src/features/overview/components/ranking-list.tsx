'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { positionsApi, StudioPnlRankingItem, StudioTradeCountRankingItem } from '@/api/positions';
import { Skeleton } from '@/components/ui/skeleton';

export function RankingList({ title, days, type }: { title: string; days: number; type: 'pnl' | 'trade_count' }) {
  const [items, setItems] = useState<StudioPnlRankingItem[] | StudioTradeCountRankingItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const fetchPromise = type === 'pnl' 
      ? positionsApi.getStudioPnlRanking(days).then(res => res.items)
      : positionsApi.getStudioTradeCountRanking(days).then(res => res.items);

    fetchPromise
      .then((data) => {
        if (isMounted) setItems(data);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, [days, type]);

  const renderValue = (item: StudioPnlRankingItem | StudioTradeCountRankingItem) => {
    if (type === 'trade_count') {
      return (item as StudioTradeCountRankingItem).total_trade_count;
    }

    const pnlValue = parseFloat((item as StudioPnlRankingItem).total_pnl || '0');
    const isPositive = pnlValue > 0;
    const isNegative = pnlValue < 0;
    
    const valueColor = isPositive ? 'text-green-600 dark:text-green-400' : isNegative ? 'text-destructive' : 'text-foreground';
    const displayValue = !isNaN(pnlValue) ? pnlValue.toFixed(2) : '0.00';

    return (
      <span className={valueColor}>
        {isPositive ? '+' : ''}{displayValue}
      </span>
    );
  };

  const maxTradeCount = type === 'trade_count' && items && items.length > 0
    ? Math.max(...(items as StudioTradeCountRankingItem[]).map(i => i.total_trade_count), 1)
    : 1;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 flex-none">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : items && items.length > 0 ? (
          <div className="space-y-4 mt-2">
            {items.map((item, index) => (
              <div key={item.api_id} className="flex items-center">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted font-bold text-xs">
                  {index + 1}
                </div>
                <div className="ml-3 flex-1 min-w-0 flex items-center">
                  <p className="text-sm font-medium leading-none truncate w-[100px] shrink-0" title={item.api_name}>
                    {item.api_name}
                  </p>
                  
                  {type === 'trade_count' ? (
                    <>
                      <div className="flex-1 mx-3 h-1.5 rounded-full overflow-hidden flex items-center">
                        <div 
                          className="h-full bg-primary/70 rounded-full transition-all duration-500" 
                          style={{ width: `${((item as StudioTradeCountRankingItem).total_trade_count / maxTradeCount) * 100}%` }}
                        />
                      </div>
                      <div className="font-medium whitespace-nowrap text-sm shrink-0 w-8 text-right">
                        {renderValue(item)}
                      </div>
                    </>
                  ) : (
                    <div className="ml-auto font-medium whitespace-nowrap text-sm shrink-0">
                      {renderValue(item)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground py-4">暂无数据</div>
        )}
      </CardContent>
    </Card>
  );
}

