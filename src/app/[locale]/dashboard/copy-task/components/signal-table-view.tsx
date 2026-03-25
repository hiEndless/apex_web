import { Fragment, useState } from 'react';
import { ExchangeAccount } from '@/features/settings/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { EXCHANGE_LOGO_SRC } from '@/constants/exchange-logo';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useRouter } from '@/i18n/navigation';
import { ChevronRight, ChevronDown, Loader2 } from 'lucide-react';
import type { PnlStatsItem, GroupedBinding } from '@/api/copy-task';

interface SignalTableViewProps {
  signalApis: ExchangeAccount[];
  studioNamesById: Record<number, string>;
  currentStudioId: number | null;
  groupedBindings: Record<string, GroupedBinding>;
  pnlStats?: Record<number, PnlStatsItem>;
  adminSignals?: ExchangeAccount[];
  loadingAdmin?: boolean;
  shouldShowSystemSignals?: boolean;
}

export function SignalTableView({
  signalApis,
  studioNamesById,
  currentStudioId,
  groupedBindings,
  pnlStats = {},
  adminSignals = [],
  loadingAdmin = false,
  shouldShowSystemSignals = false,
}: SignalTableViewProps) {
  const router = useRouter();
  // 默认全部展开
  const [expandedRows, setExpandedRows] = useState<Set<number>>(
    new Set([...signalApis.map((s) => s.id), ...adminSignals.map((s) => s.id)])
  );

  const toggleRow = (id: number) => {
    const next = new Set(expandedRows);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpandedRows(next);
  };

  const renderTable = (signals: ExchangeAccount[], isAdminSignal = false) => (
    <div className="rounded-md border bg-card">
      <div className="w-full overflow-x-auto overscroll-x-contain">
        <Table className="min-w-[760px]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px] whitespace-nowrap">信号源 / 跟单账户</TableHead>
            <TableHead className="whitespace-nowrap">工作室</TableHead>
            <TableHead className="whitespace-nowrap">当前资产</TableHead>
            <TableHead className="whitespace-nowrap">跟单比例</TableHead>
            <TableHead className="whitespace-nowrap text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {signals.map((signal) => {
            const platformKey = (signal.platform || '').trim().toLowerCase();
            const logoSrc = EXCHANGE_LOGO_SRC[platformKey];
            const isOwnSignal = !isAdminSignal && (currentStudioId == null || signal.studio_id === currentStudioId);
            const otherStudioLabel =
              studioNamesById[signal.studio_id] ?? `工作室 #${signal.studio_id}`;
            const bindingInfo = groupedBindings[signal.id];
            const followers = bindingInfo?.followers || [];
            const isExpanded = expandedRows.has(signal.id);

            return (
              <Fragment key={signal.id}>
                <TableRow className="bg-muted/30 hover:bg-muted/50">
                  <TableCell className="font-medium whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => toggleRow(signal.id)}
                        className="p-1 hover:bg-muted rounded-sm text-muted-foreground transition-colors"
                      >
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                      {logoSrc && (
                        <Image src={logoSrc} alt={`${platformKey} logo`} width={16} height={16} className="shrink-0" />
                      )}
                      <span>{signal.api_name || `信号 ${signal.id}`}</span>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {isAdminSignal ? (
                      <Badge variant="outline" className="text-orange-700 border-orange-200 bg-orange-50">系统</Badge>
                    ) : isOwnSignal ? (
                      <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50/50">自有</Badge>
                    ) : (
                      <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50/50">{otherStudioLabel}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="tabular-nums whitespace-nowrap">{signal.usdt.toFixed(2)} USDT</TableCell>
                  <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                    {followers.length} 个跟单
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button
                      variant="link"
                      className="px-0 text-blue-600 hover:text-blue-700 h-auto font-medium"
                      onClick={() => router.push(`/dashboard/copy-task/${signal.id}`)}
                    >
                      详情 / 设置
                    </Button>
                  </TableCell>
                </TableRow>

                {isExpanded && followers.map((follower) => (
                  <TableRow key={`${signal.id}-${follower.follower_api_id}`} className="bg-background hover:bg-muted/30">
                    <TableCell className="pl-[3.25rem] whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground relative">
                        <div className="absolute -left-6 top-1/2 h-px w-4 bg-border/80" />
                        <div className="absolute -left-6 -top-4 h-8 w-px bg-border/80" />
                        <span>{follower.follower_api_name || `API ${follower.follower_api_id}`}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm whitespace-nowrap"></TableCell>
                    <TableCell className="text-muted-foreground text-sm whitespace-nowrap"></TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant="secondary" className="font-mono text-xs border-transparent bg-muted/80">
                        x {follower.ratio}
                      </Badge>
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                ))}
                {isExpanded && followers.length === 0 && (
                  <TableRow className="bg-background hover:bg-muted/30">
                    <TableCell colSpan={5} className="pl-[3.25rem] text-sm text-muted-foreground italic relative">
                      <div className="absolute left-[1.75rem] top-1/2 h-px w-4 bg-border/80" />
                      <div className="absolute left-[1.75rem] -top-4 h-8 w-px bg-border/80" />
                      <span className="pl-2">暂无跟单账户</span>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            );
          })}
        </TableBody>
        </Table>
      </div>
    </div>
  );

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
            renderTable(adminSignals, true)
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
          renderTable(signalApis, false)
        )}
      </div>
    </div>
  );
}
