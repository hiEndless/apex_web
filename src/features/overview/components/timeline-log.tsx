'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { copyTaskApi, TimelineLogItem } from '@/api/copy-task';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';

export function TimelineLog() {
  const [logs, setLogs] = useState<TimelineLogItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    copyTaskApi.getTraderTimeline({ limit: 50 })
      .then((data) => {
        if (isMounted) setLogs(data);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  const getActionColor = (action: string) => {
    switch (action?.toLowerCase()) {
      case 'open':
      case 'add':
        return 'text-green-500';
      case 'close':
      case 'reduce':
        return 'text-red-500';
      default:
        return 'text-foreground';
    }
  };

  const getActionLabel = (action: string) => {
    const actionMap: Record<string, string> = {
      open: '开仓',
      add: '加仓',
      reduce: '减仓',
      close: '平仓'
    };
    return actionMap[action?.toLowerCase()] || action;
  };

  const getSideLabel = (side: string, posSide: string) => {
    if (posSide === 'long') return '做多';
    if (posSide === 'short') return '做空';
    if (side === 'buy') return '买入';
    if (side === 'sell') return '卖出';
    return '';
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 flex-none">
        <CardTitle className="text-base font-semibold">实时交易记录</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0 px-6 pb-6">
        <ScrollArea className="h-full">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : logs && logs.length > 0 ? (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="relative pl-4">
                  <span className="absolute left-0 top-[6px] h-2 w-2 rounded-full bg-primary/80" />
                  <span className="absolute left-[3px] top-4 h-[calc(100%-8px)] w-px bg-border/70" />
                  <div className="space-y-1 pb-3">
                    <div className="text-xs leading-5 text-foreground/90 font-medium">
                      {log.trader_api_name || `API ${log.trader_api_id}`}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {log.event_ts ? format(new Date(log.event_ts), 'yyyy-MM-dd HH:mm:ss') : '-'}
                    </div>
                    <div className="text-xs leading-5 text-foreground/90">
                      <span className={`font-bold mr-2 ${getActionColor(log.action)}`}>
                        {getActionLabel(log.action)} {getSideLabel(log.side, log.pos_side)}
                      </span>
                      <span className="mr-2">{log.inst_id}</span>
                      <span className="text-muted-foreground mr-2">量: {log.quantity}</span>
                      <span className="text-muted-foreground">价: {log.price || '--'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground py-4">暂无记录</div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
