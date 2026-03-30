'use client';

import { settingsApi } from '@/api/settings';
import { apiClient } from '@/api/client';
import PageContainer from '@/components/layout/page-container';
import { Link } from '@/i18n/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DateTimeRangePicker } from '@/components/shadcn-studio/date-picker/date-picker-02';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const MAX_LIMIT_OPTIONS = [200, 500, 1000] as const;

/** 表格每页展示条数（本地分页） */
const PAGE_SIZE = 50;

const FILTER_CTRL =
  'shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 h-8 text-xs w-full';

type PositionsHistoryItem = {
  api_id?: number;
  inst_id?: string | null;
  lever?: string | null;
  direction?: string | null;

  open_avg_px?: string | null;
  close_avg_px?: string | null;
  close_type?: string | null;
  close_total_pos?: string | null;

  fee?: string | null;
  realized_pnl?: string | null;
  pnl_ratio?: string | null;

  c_time?: string | null;
  u_time?: string | null;
};

type FilterState = {
  apiId: number | '';
  instId: string;
  direction: '' | 'long' | 'short';
  closeType: '' | '1' | '2' | '3' | '4' | '5';
  cTimeStart: string;
  cTimeEnd: string;
  uTimeStart: string;
  uTimeEnd: string;
  limit: number;
};

function formatTimeMs(msText?: string | null) {
  const ms = Number(msText ?? '');
  if (!Number.isFinite(ms)) return '-';
  return new Date(ms).toLocaleString();
}

/** 开仓/平仓均价：>=1 保留 2 位小数；<1 保留 8 位小数 */
function formatAvgPx(value?: string | null) {
  const raw = String(value ?? '').trim();
  if (!raw) return '-';
  const n = parseFloat(raw);
  if (!Number.isFinite(n)) return '-';
  if (n >= 1) return n.toFixed(2);
  return n.toFixed(8);
}

/** 手续费：保留 2 位小数 */
function formatFee(value?: string | null) {
  const n = parseFloat(value ?? '');
  if (!Number.isFinite(n)) return '-';
  return n.toFixed(2);
}

function formatIntLike(value?: string | null) {
  const n = parseFloat(value ?? '');
  if (!Number.isFinite(n)) return '-';
  const s = n.toFixed(6);
  return s.replace(/\.?0+$/, '');
}

function formatPnl(value?: string | null) {
  const n = parseFloat(value ?? '');
  if (!Number.isFinite(n)) return '-';
  return n.toFixed(3);
}

function formatPnlRatioPercent(value?: string | null) {
  const n = parseFloat(value ?? '');
  if (!Number.isFinite(n)) return '-';
  const percent = Math.abs(n) <= 1 ? n * 100 : n;
  return `${percent.toFixed(2)}%`;
}

function getDirectionInfo(direction?: string | null) {
  const v = String(direction ?? '').trim().toLowerCase();
  if (v === 'long') return { label: '多', className: 'text-green-600' };
  if (v === 'short') return { label: '空', className: 'text-red-600' };
  if (v === 'net') return { label: '净', className: 'text-blue-600' };
  return { label: '-', className: '' };
}

function getCloseTypeZh(closeType?: string | null) {
  const v = String(closeType ?? '').trim();
  if (!v) return '-';
  switch (v) {
    case '1':
      return '部分平仓';
    case '2':
      return '完全平仓';
    case '3':
      return '强平';
    case '4':
      return '强减';
    case '5':
      return 'ADL自动减仓';
    default:
      return v;
  }
}

function getLeverBadgeText(lever?: string | null) {
  const raw = String(lever ?? '').trim();
  if (!raw) return null;
  const n = parseFloat(raw);
  if (!Number.isFinite(n)) return `x${raw}`;
  const normalized = Number.isInteger(n) ? String(n) : n.toString();
  if (!normalized) return null;
  return `x${normalized}`;
}

export default function PositionsHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<PositionsHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [syncing, setSyncing] = useState(false);

  const [signals, setSignals] = useState<Array<{ id: number; api_name?: string }>>([]);
  const [filters, setFilters] = useState<FilterState>({
    apiId: '',
    instId: '',
    direction: '',
    closeType: '',
    cTimeStart: '',
    cTimeEnd: '',
    uTimeStart: '',
    uTimeEnd: '',
    limit: MAX_LIMIT_OPTIONS[0],
  });

  const apiRole = 'trader';

  useEffect(() => {
    let cancelled = false;
    const fetchSignals = async () => {
      try {
        const data = await settingsApi.getExchangeAccounts();
        if (cancelled) return;
        const items = (data ?? [])
          .filter((x) => x?.is_readonly)
          .map((x) => ({ id: x.id, api_name: x.api_name }));
        setSignals(items);
      } catch (e) {
        if (cancelled) return;
        const message = e instanceof Error ? e.message : '加载信号列表失败，请稍后重试';
        toast.error(message);
      }
    };
    fetchSignals();
    return () => {
      cancelled = true;
    };
  }, []);

  const buildQueryUrl = useMemo(() => {
    const buildQueryUrlFrom = (f: FilterState) => {
    const usp = new URLSearchParams();
    usp.set('api_role', apiRole);
      if (f.apiId !== '') usp.set('api_id', String(f.apiId));
      if (f.instId.trim()) usp.set('inst_id', f.instId.trim());
      if (f.direction) usp.set('direction', f.direction);
      if (f.closeType) usp.set('close_type', f.closeType);
      if (f.cTimeStart.trim()) usp.set('c_time_start', f.cTimeStart.trim());
      if (f.cTimeEnd.trim()) usp.set('c_time_end', f.cTimeEnd.trim());
      if (f.uTimeStart.trim()) usp.set('u_time_start', f.uTimeStart.trim());
      if (f.uTimeEnd.trim()) usp.set('u_time_end', f.uTimeEnd.trim());
      usp.set('limit', String(f.limit));
      return `/api/positions/trade-records?${usp.toString()}`;
    };
    return buildQueryUrlFrom(filters);
  }, [apiRole, filters]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(records.length / PAGE_SIZE)),
    [records.length],
  );

  const pagedRecords = useMemo(
    () => records.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [records, page],
  );

  const fetchRecords = async (url?: string) => {
    setLoading(true);
    setError(null);
    try {
      const items = await apiClient.get<PositionsHistoryItem[]>(url ?? buildQueryUrl);
      setRecords(items ?? []);
      setPage(1);
    } catch (e) {
      const message = e instanceof Error ? e.message : '加载历史持仓失败，请稍后重试';
      setError(message);
      toast.error(message);
      setRecords([]);
      setPage(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (filters.apiId === '') {
      toast.error('请先在「信号」筛选中选择特定信号');
      return;
    }
    setSyncing(true);
    try {
      await apiClient.post('/api/positions/trade-records/sync-close-history', {
        api_id: Number(filters.apiId),
        inst_id: filters.instId.trim() || '',
        limit: 100,
      });
      toast.success('历史仓位更新成功');
      void fetchRecords();
    } catch (e) {
      const message = e instanceof Error ? e.message : '更新历史仓位失败，请稍后重试';
      toast.error(message);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    // 首次进入自动加载
    void fetchRecords(buildQueryUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageContainer
      pageTitle='交易员历史持仓'
      pageDescription='历史平仓记录'
    >
      <div className='w-full min-w-0 max-w-full space-y-4'>
      <div className='mb-4 flex flex-wrap items-center gap-2'>
        <Link
          href='/dashboard/copy-task'
          className='inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted/40'
        >
          <ArrowLeft className='h-4 w-4' />
          返回跟单管理
        </Link>
      </div>

      <Card className='mb-4 min-w-0 gap-0 overflow-hidden border py-4 shadow-none'>
        <CardHeader className='px-3 pb-2 pt-0 sm:px-4'>
          <CardTitle className='text-sm font-medium'>筛选</CardTitle>
        </CardHeader>
        <CardContent className='w-full min-w-0 max-w-full overflow-x-auto px-3 pt-0 sm:px-4'>
          <div className='flex flex-col gap-3'>
            {/* 第一行：基础筛选 */}
            <div className='grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4'>
            <div className='space-y-1'>
              <div className='text-xs text-muted-foreground'>信号</div>
              <Select
                value={filters.apiId === '' ? 'all' : String(filters.apiId)}
                onValueChange={(v) => setFilters((prev) => ({ ...prev, apiId: v === 'all' ? '' : Number(v) }))}
              >
                <SelectTrigger size='sm' className={FILTER_CTRL}>
                  <SelectValue placeholder='全部' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>全部信号</SelectItem>
                  {signals.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.api_name || `信号 ${s.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-1'>
              <div className='text-xs text-muted-foreground'>交易对</div>
              <Input
                value={filters.instId}
                onChange={(e) => setFilters((prev) => ({ ...prev, instId: e.target.value }))}
                placeholder='如 ETH-USDT-SWAP'
                className={FILTER_CTRL}
              />
            </div>

            <div className='space-y-1'>
              <div className='text-xs text-muted-foreground'>方向</div>
              <Select
                value={filters.direction || 'all'}
                onValueChange={(v) =>
                  setFilters((prev) => ({
                    ...prev,
                    direction: v === 'all' ? '' : (v as FilterState['direction']),
                  }))
                }
              >
                <SelectTrigger size='sm' className={FILTER_CTRL}>
                  <SelectValue placeholder='全部' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>全部</SelectItem>
                  <SelectItem value='long'>多</SelectItem>
                  <SelectItem value='short'>空</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-1'>
              <div className='text-xs text-muted-foreground'>平仓类型</div>
              <Select
                value={filters.closeType || 'all'}
                onValueChange={(v) =>
                  setFilters((prev) => ({
                    ...prev,
                    closeType: v === 'all' ? '' : (v as FilterState['closeType']),
                  }))
                }
              >
                <SelectTrigger size='sm' className={FILTER_CTRL}>
                  <SelectValue placeholder='全部' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>全部</SelectItem>
                  <SelectItem value='1'>部分平仓</SelectItem>
                  <SelectItem value='2'>完全平仓</SelectItem>
                  <SelectItem value='3'>强平</SelectItem>
                  <SelectItem value='4'>强减</SelectItem>
                  <SelectItem value='5'>ADL自动减仓</SelectItem>
                </SelectContent>
              </Select>
            </div>
            </div>

            {/* 第二行：与第一行同宽的四列网格，开仓/平仓与「信号」列宽一致 */}
            <div className='grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4'>
              <div className='min-w-0 space-y-1'>
                <div className='text-xs text-muted-foreground'>开仓时间</div>
                <DateTimeRangePicker
                  valueStart={filters.cTimeStart}
                  valueEnd={filters.cTimeEnd}
                  className='w-full min-w-0'
                  triggerClassName='w-full min-w-0 max-w-full'
                  onChange={(startMs, endMs) =>
                    setFilters((prev) => ({ ...prev, cTimeStart: startMs, cTimeEnd: endMs }))
                  }
                />
              </div>

              <div className='min-w-0 space-y-1'>
                <div className='text-xs text-muted-foreground'>平仓时间</div>
                <DateTimeRangePicker
                  valueStart={filters.uTimeStart}
                  valueEnd={filters.uTimeEnd}
                  className='w-full min-w-0'
                  triggerClassName='w-full min-w-0 max-w-full'
                  onChange={(startMs, endMs) =>
                    setFilters((prev) => ({ ...prev, uTimeStart: startMs, uTimeEnd: endMs }))
                  }
                />
              </div>

              <div className='min-w-0 space-y-1'>
                <div className='text-xs text-muted-foreground'>单次拉取条数</div>
                <Select
                  value={String(filters.limit)}
                  onValueChange={(v) => setFilters((prev) => ({ ...prev, limit: Number(v) }))}
                >
                  <SelectTrigger size='sm' className={`${FILTER_CTRL} w-full`}>
                    <SelectValue placeholder='条数' />
                  </SelectTrigger>
                  <SelectContent>
                    {MAX_LIMIT_OPTIONS.map((x) => (
                      <SelectItem key={x} value={String(x)}>
                        {x}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='min-w-0 space-y-1'>
                <div className='text-xs text-muted-foreground'>操作</div>
                <div className='flex flex-wrap gap-2'>
                  <Button
                    variant='default'
                    size='sm'
                    className='h-8 text-xs shadow-none'
                    onClick={() => {
                      void fetchRecords();
                    }}
                  >
                    查询
                  </Button>
                  <Button
                    size='sm'
                    className='h-8 text-xs shadow-none bg-blue-600 text-white hover:bg-blue-700'
                    disabled={syncing}
                    onClick={handleSync}
                  >
                    {syncing ? <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' /> : null}
                    更新
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    className='h-8 text-xs shadow-none'
                    onClick={() => {
                      const nextFilters: FilterState = {
                        apiId: '',
                        instId: '',
                        direction: '',
                        closeType: '',
                        cTimeStart: '',
                        cTimeEnd: '',
                        uTimeStart: '',
                        uTimeEnd: '',
                        limit: MAX_LIMIT_OPTIONS[0],
                      };
                      setFilters(nextFilters);
                      const url = (() => {
                        const usp = new URLSearchParams();
                        usp.set('api_role', apiRole);
                        if (nextFilters.apiId !== '') usp.set('api_id', String(nextFilters.apiId));
                        if (nextFilters.instId.trim()) usp.set('inst_id', nextFilters.instId.trim());
                        if (nextFilters.direction) usp.set('direction', nextFilters.direction);
                        if (nextFilters.closeType) usp.set('close_type', nextFilters.closeType);
                        if (nextFilters.cTimeStart.trim()) usp.set('c_time_start', nextFilters.cTimeStart.trim());
                        if (nextFilters.cTimeEnd.trim()) usp.set('c_time_end', nextFilters.cTimeEnd.trim());
                        if (nextFilters.uTimeStart.trim()) usp.set('u_time_start', nextFilters.uTimeStart.trim());
                        if (nextFilters.uTimeEnd.trim()) usp.set('u_time_end', nextFilters.uTimeEnd.trim());
                        usp.set('limit', String(nextFilters.limit));
                        return `/api/positions/trade-records?${usp.toString()}`;
                      })();
                      void fetchRecords(url);
                    }}
                  >
                    <RotateCcw className='mr-1.5 h-3.5 w-3.5' />
                    重置
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className='min-w-0 overflow-hidden'>
        <CardHeader className='px-3 sm:px-6'>
          <div className='flex items-center justify-between gap-3'>
            <div>
              <CardTitle className='text-base'>历史持仓记录</CardTitle>
              <CardDescription>返回按时间倒序排列</CardDescription>
            </div>
            {loading ? (
              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <Loader2 className='h-4 w-4 animate-spin' />
                加载中
              </div>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className='w-full min-w-0 overflow-visible p-0 sm:px-6 sm:pb-6'>
          {error ? (
            <div className='m-3 sm:m-0 rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground'>
              {error}
            </div>
          ) : loading ? null : records.length === 0 ? (
            <div className='m-3 sm:m-0 rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground'>
              暂无历史持仓
            </div>
          ) : (
            <div className='relative w-full min-w-0 max-w-full overflow-hidden'>
              <div className='w-full min-w-0 max-w-full touch-pan-x overflow-auto overscroll-x-contain px-3 pb-4 sm:px-0'>
                <Table className='w-full min-w-[900px] whitespace-nowrap lg:min-w-[1100px]'>
                  <TableHeader>
                    <TableRow>
                    <TableHead>信号ID</TableHead>
                    <TableHead>交易对</TableHead>
                    <TableHead>杠杆</TableHead>
                    <TableHead>方向</TableHead>
                    <TableHead>开仓均价</TableHead>
                    <TableHead>平仓均价</TableHead>
                    <TableHead>平仓类型</TableHead>
                    <TableHead>最大平仓量</TableHead>
                    <TableHead>手续费</TableHead>
                    <TableHead>收益</TableHead>
                    <TableHead>收益率</TableHead>
                    <TableHead>开仓时间</TableHead>
                    <TableHead>平仓时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedRecords.map((item, idx) => {
                    const directionInfo = getDirectionInfo(item.direction);
                    const pnlN = parseFloat(item.realized_pnl ?? '');
                    const pnlClass =
                      !Number.isFinite(pnlN) || pnlN === 0
                        ? ''
                        : pnlN > 0
                          ? 'text-green-600'
                          : 'text-red-600';
                    const rowKey = `${item.api_id ?? 'na'}-${item.inst_id ?? 'na'}-${item.c_time ?? 'na'}-${(page - 1) * PAGE_SIZE + idx}`;
                    return (
                      <TableRow key={rowKey}>
                        <TableCell>{item.api_id ?? '-'}</TableCell>
                        <TableCell>{item.inst_id ?? '-'}</TableCell>
                        <TableCell>
                          {getLeverBadgeText(item.lever) ? (
                            <Badge variant='secondary'>{getLeverBadgeText(item.lever)}</Badge>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className={directionInfo.className}>{directionInfo.label}</TableCell>
                        <TableCell>{formatAvgPx(item.open_avg_px)}</TableCell>
                        <TableCell>{formatAvgPx(item.close_avg_px)}</TableCell>
                        <TableCell>{getCloseTypeZh(item.close_type)}</TableCell>
                        <TableCell>{formatIntLike(item.close_total_pos)}</TableCell>
                        <TableCell>{formatFee(item.fee)}</TableCell>
                        <TableCell className={pnlClass}>{formatPnl(item.realized_pnl)}</TableCell>
                        <TableCell>{formatPnlRatioPercent(item.pnl_ratio)}</TableCell>
                        <TableCell>{formatTimeMs(item.c_time)}</TableCell>
                        <TableCell>{formatTimeMs(item.u_time)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                </Table>
              </div>
            </div>
          )}
          {!loading && !error && records.length > 0 ? (
            <div className='mt-4 flex min-w-0 flex-wrap items-center justify-between gap-3 border-t px-3 pt-4 text-sm text-muted-foreground sm:px-0'>
              <span>
                共 {records.length} 条，每页 {PAGE_SIZE} 条
              </span>
              <div className='flex min-w-0 flex-wrap items-center gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  上一页
                </Button>
                <span className='tabular-nums text-foreground'>
                  第 {page} / {totalPages} 页
                </span>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  下一页
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
      </div>
    </PageContainer>
  );
}
