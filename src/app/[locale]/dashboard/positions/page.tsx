'use client';

import { positionsApi, CurrentPosition, CurrentTradersPositionsResponse } from '@/api/positions';
import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const formatOpenTime = (cTime?: string) => {
  const ms = Number(cTime ?? '');
  if (!Number.isFinite(ms)) return '-';
  return new Date(ms).toLocaleString();
};

const formatOpenTimeShort = (cTime?: string) => {
  const ms = Number(cTime ?? '');
  if (!Number.isFinite(ms)) return '-';
  return new Date(ms).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};

const formatUpl = (upl?: string) => {
  const n = parseFloat(upl ?? '');
  if (!Number.isFinite(n)) return '-';
  return n.toFixed(3);
};

const formatUplRatioPercent = (uplRatio?: string) => {
  const n = parseFloat(uplRatio ?? '');
  if (!Number.isFinite(n)) return '-';

  // uplRatio 语义通常是 ratio（如 0.0123 表示 1.23%），兜底兼容已是百分比的情况
  const percent = Math.abs(n) <= 1 ? n * 100 : n;
  return `${percent.toFixed(2)}%`;
};

const getUplClass = (upl?: string) => {
  const n = parseFloat(upl ?? '');
  if (!Number.isFinite(n) || n === 0) return '';
  return n > 0 ? 'text-green-600' : 'text-red-600';
};

const getUplRatioClass = (uplRatio?: string) => {
  const n = parseFloat(uplRatio ?? '');
  if (!Number.isFinite(n) || n === 0) return '';
  return n > 0 ? 'text-green-600' : 'text-red-600';
};

const formatMargin = (margin?: string) => {
  const n = parseFloat(margin ?? '');
  if (!Number.isFinite(n)) return '-';
  return n.toFixed(2);
};

const formatAbsPos = (pos?: string) => {
  const n = parseFloat(pos ?? '');
  if (!Number.isFinite(n)) return '-';
  return Math.abs(n).toString();
};

const getDirectionInfo = (p: CurrentPosition) => {
  const posSide = String(p.posSide ?? '').trim().toLowerCase();
  if (posSide === 'long') return { label: '多', className: 'text-green-600' };
  if (posSide === 'short') return { label: '空', className: 'text-red-600' };

  // hedge=net 时 posSide 可能是 net 或缺失，这时用 pos 正负判断
  const n = parseFloat(p.pos ?? '');
  if (!Number.isFinite(n) || n === 0) return { label: '-', className: '' };
  return n > 0
    ? { label: '多', className: 'text-green-600' }
    : { label: '空', className: 'text-red-600' };
};

const getLeverBadgeText = (lever?: string) => {
  const raw = String(lever ?? '').trim();
  if (!raw) return null;
  const n = parseFloat(raw);
  if (!Number.isFinite(n)) return `x${raw}`;
  const normalized = Number.isInteger(n) ? String(n) : n.toString();
  if (!normalized) return null;
  return `x${normalized}`;
};

export default function PositionsPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<CurrentTradersPositionsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [closePositionOpen, setClosePositionOpen] = useState(false);
  const [closingPosition, setClosingPosition] = useState(false);
  const [closeTarget, setCloseTarget] = useState<{
    apiId: number;
    apiName: string;
    instId: string;
    mgnMode: string;
    posSide: string;
  } | null>(null);

  const fetchPositions = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const res = await positionsApi.getCurrentTradersPositions('SWAP');
      setData(res);
      if (isRefresh) {
        toast.success('刷新成功');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '加载持仓失败，请稍后重试';
      setError(message);
      if (!isRefresh) {
        toast.error(message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  const handleClosePosition = async () => {
    if (!closeTarget) return;

    setClosingPosition(true);
    try {
      await positionsApi.closeAllPosition({
        follower_api_id: closeTarget.apiId,
        inst_id: closeTarget.instId,
        mgn_mode: closeTarget.mgnMode,
        pos_side: closeTarget.posSide,
      });
      toast.success(`${closeTarget.apiName} 的 ${closeTarget.instId} 仓位已提交全平请求`);
      setClosePositionOpen(false);
      // Refresh positions after closing
      fetchPositions(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : '全平请求失败，请稍后重试';
      toast.error(message);
    } finally {
      setClosingPosition(false);
    }
  };

  return (
    <PageContainer
      pageTitle='当前持仓'
      pageDescription='当前工作室下所有交易 API 的实时持仓信息'
    >
      <div className='mb-4 flex justify-end'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => fetchPositions(true)}
          disabled={loading || refreshing}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
          />
          刷新
        </Button>
      </div>

      {loading ? (
        <div className='flex h-[40vh] items-center justify-center'>
          <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
        </div>
      ) : error ? (
        <Card>
          <CardContent className='pt-6'>
            <div className='rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground'>
              {error}
            </div>
          </CardContent>
        </Card>
      ) : !data || data.items.length === 0 ? (
        <Card>
          <CardContent className='pt-6'>
            <div className='rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground'>
              当前没有交易 API 或无法获取持仓信息
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-6'>
          {data.items.map((apiItem) => (
            <Card key={apiItem.api_id}>
              <CardHeader>
                <CardTitle>{`${apiItem.api_name || `API ${apiItem.api_id}`}仓位`}</CardTitle>
                <CardDescription>
                  {apiItem.platform.toUpperCase()} API - 当前实时持仓
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!apiItem.ok ? (
                  <div className='rounded-lg border border-dashed p-6 text-center text-sm text-red-500 bg-red-50/50'>
                    获取失败: {apiItem.error}
                  </div>
                ) : apiItem.positions.length === 0 ? (
                  <div className='rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground'>
                    当前空仓
                  </div>
                ) : (
                  <>
                    <div className='space-y-2 md:hidden'>
                      {apiItem.positions.map((item, idx) => (
                        <div
                          key={`${item.instId ?? ''}-${item.posSide ?? ''}-${item.pos ?? ''}-${idx}`}
                          className='rounded-lg border p-2'
                        >
                          <div className='flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px]'>
                            <span className='font-medium tabular-nums'>
                              {item.instId ?? '-'}
                            </span>
                            {getLeverBadgeText(item.lever) ? (
                              <Badge
                                variant='secondary'
                                className='h-4 px-2 text-[11px] leading-4 border-transparent bg-blue-50 text-blue-700 hover:bg-blue-50/90'
                              >
                                {getLeverBadgeText(item.lever)}
                              </Badge>
                            ) : null}

                            <span className='text-muted-foreground'>方向</span>
                            <span
                              className={`font-medium ${getDirectionInfo(item).className}`}
                            >
                              {getDirectionInfo(item).label}
                            </span>

                            <span className='text-muted-foreground'>仓位</span>
                            <span className='tabular-nums'>
                              {formatAbsPos(item.pos)}
                            </span>

                            <span className='text-muted-foreground'>开仓价</span>
                            <span className='tabular-nums'>
                              {item.avgPx ?? '-'}
                            </span>

                            <span className='text-muted-foreground'>标记</span>
                            <span className='tabular-nums'>
                              {item.markPx ?? '-'}
                            </span>

                            <span className='text-muted-foreground'>保证金</span>
                            <span className='tabular-nums'>
                              {formatMargin(item.margin)}
                            </span>

                            <span className='text-muted-foreground'>收益</span>
                            <span
                              className={`tabular-nums ${getUplClass(item.upl)}`}
                            >
                              {formatUpl(item.upl)}
                            </span>

                            <span className='text-muted-foreground'>收益率</span>
                            <span
                              className={`tabular-nums ${getUplRatioClass(item.uplRatio)}`}
                            >
                              {formatUplRatioPercent(item.uplRatio)}
                            </span>

                            <span className='text-muted-foreground'>时间</span>
                            <span className='tabular-nums text-muted-foreground'>
                              {formatOpenTimeShort(item.cTime)}
                            </span>

                            <div className='w-full mt-2'>
                              <Button
                                variant='destructive'
                                size='sm'
                                className='w-full h-8 text-xs'
                                onClick={() => {
                                  setCloseTarget({
                                    apiId: apiItem.api_id,
                                    apiName: apiItem.api_name || `API ${apiItem.api_id}`,
                                    instId: item.instId ?? '',
                                    mgnMode: item.mgnMode ?? 'cross',
                                    posSide: item.posSide ?? 'net',
                                  });
                                  setClosePositionOpen(true);
                                }}
                              >
                                全平
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className='hidden md:block'>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>交易对</TableHead>
                            <TableHead>方向</TableHead>
                            <TableHead>仓位</TableHead>
                            <TableHead>开仓价</TableHead>
                            <TableHead>标记价</TableHead>
                            <TableHead>保证金</TableHead>
                            <TableHead>收益</TableHead>
                            <TableHead>收益率</TableHead>
                            <TableHead>开仓时间</TableHead>
                            <TableHead className='text-right'>操作</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {apiItem.positions.map((item, idx) => (
                            <TableRow
                              key={`${item.instId ?? ''}-${item.posSide ?? ''}-${item.pos ?? ''}-${idx}`}
                            >
                              <TableCell>
                                <div className='flex items-center gap-2'>
                                  <span>{item.instId ?? '-'}</span>
                                  {getLeverBadgeText(item.lever) ? (
                                    <Badge
                                      variant='secondary'
                                      className='h-5 px-2 text-[11px] leading-4 border-transparent bg-blue-50 text-blue-700 hover:bg-blue-50/90'
                                    >
                                      {getLeverBadgeText(item.lever)}
                                    </Badge>
                                  ) : null}
                                </div>
                              </TableCell>
                              <TableCell
                                className={getDirectionInfo(item).className}
                              >
                                {getDirectionInfo(item).label}
                              </TableCell>
                              <TableCell>{formatAbsPos(item.pos)}</TableCell>
                              <TableCell>{item.avgPx ?? '-'}</TableCell>
                              <TableCell>{item.markPx ?? '-'}</TableCell>
                              <TableCell>{formatMargin(item.margin)}</TableCell>
                              <TableCell className={getUplClass(item.upl)}>
                                {formatUpl(item.upl)}
                              </TableCell>
                              <TableCell
                                className={getUplRatioClass(item.uplRatio)}
                              >
                                {formatUplRatioPercent(item.uplRatio)}
                              </TableCell>
                              <TableCell>{formatOpenTime(item.cTime)}</TableCell>
                              <TableCell className='text-right'>
                                <Button
                                  variant='destructive'
                                  size='sm'
                                  className='h-7 px-2 text-xs'
                                  onClick={() => {
                                    setCloseTarget({
                                      apiId: apiItem.api_id,
                                      apiName: apiItem.api_name || `API ${apiItem.api_id}`,
                                      instId: item.instId ?? '',
                                      mgnMode: item.mgnMode ?? 'cross',
                                      posSide: item.posSide ?? 'net',
                                    });
                                    setClosePositionOpen(true);
                                  }}
                                >
                                  全平
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={closePositionOpen} onOpenChange={setClosePositionOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认平仓</AlertDialogTitle>
            <AlertDialogDescription>
              确定要全平 {closeTarget?.apiName} 的 {closeTarget?.instId} 仓位吗？
              此操作将发送市价全平请求到交易所。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={closingPosition}>取消</AlertDialogCancel>
            <AlertDialogAction
              className='bg-red-600 hover:bg-red-700'
              disabled={closingPosition}
              onClick={(e) => {
                e.preventDefault();
                handleClosePosition();
              }}
            >
              {closingPosition ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  平仓中...
                </>
              ) : (
                '确认平仓'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}

