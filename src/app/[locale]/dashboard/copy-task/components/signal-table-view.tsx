import { Fragment, useState } from 'react';
import { ExchangeAccount } from '@/features/settings/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { EXCHANGE_LOGO_SRC } from '@/constants/exchange-logo';
import { GroupedBinding } from './signal-grid-view';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useRouter } from '@/i18n/navigation';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface SignalTableViewProps {
  signalApis: ExchangeAccount[];
  studioNamesById: Record<number, string>;
  currentStudioId: number | null;
  groupedBindings: Record<string, GroupedBinding>;
}

export function SignalTableView({
  signalApis,
  studioNamesById,
  currentStudioId,
  groupedBindings,
}: SignalTableViewProps) {
  const router = useRouter();
  // 默认全部展开
  const [expandedRows, setExpandedRows] = useState<Set<number>>(
    new Set(signalApis.map((s) => s.id))
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

  return (
    <div className="rounded-md border bg-card">
      <div className="w-full overflow-x-auto overscroll-x-contain">
        <Table className="min-w-[760px]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px] whitespace-nowrap">信号源 / 跟单账户</TableHead>
            <TableHead className="whitespace-nowrap">工作室</TableHead>
            <TableHead className="whitespace-nowrap">当前资产</TableHead>
            <TableHead className="whitespace-nowrap">跟单倍数</TableHead>
            <TableHead className="whitespace-nowrap text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {signalApis.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                暂无数据
              </TableCell>
            </TableRow>
          )}
          {signalApis.map((signal) => {
            const platformKey = (signal.platform || '').trim().toLowerCase();
            const logoSrc = EXCHANGE_LOGO_SRC[platformKey];
            const isOwnSignal = currentStudioId == null || signal.studio_id === currentStudioId;
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
                    {isOwnSignal ? (
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
                    {/*<TableCell className="text-muted-foreground text-sm">*/}
                    {/*  {follower.follower_studio_id === currentStudioId ? '自有' : `工作室 #${follower.follower_studio_id}`}*/}
                    {/*</TableCell>*/}
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
}
