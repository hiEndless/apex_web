'use client';

import { settingsApi } from '@/api/settings';
import { apiClient } from '@/api/client';
import PageContainer from '@/components/layout/page-container';
import { Link } from '@/i18n/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EXCHANGE_LOGO_SRC } from '@/constants/exchange-logo';
import { ExchangeAccount } from '@/features/settings/types';
import { getSessionDisplay } from '@/lib/auth-session';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

type FollowConfig = {
  enabled: boolean;
  ratio: string;
  lever_set: 1 | 2;
  leverage: string;
  is_reverse: boolean;
  first_order_set: 1 | 2 | 3 | 4;
  open_type: number;
  mgn_mode: string;
  bindingId?: number;
};

type CurrentPosition = {
  instId?: string;
  margin?: string;
  markPx?: string;
  mgnMode?: string;
  upl?: string;
  lever?: string;
  cTime?: string;
  avgPx?: string;
  uplRatio?: string;
  pos?: string;
  posSide?: string;
};

type FollowBindingFromApi = {
  id: number;
  trader_api_id: number;
  follower_api_id: number;
  ratio: number;
  lever_set: number;
  leverage: string;
  is_reverse: boolean;
  first_order_set: number;
  open_type: number;
  mgn_mode: string;
  is_active: boolean;
};

function buildDefaultConfig(enabled: boolean): FollowConfig {
  return {
    enabled,
    ratio: '',
    lever_set: 1,
    leverage: '1',
    is_reverse: true,
    first_order_set: 1,
    open_type: 1,
    mgn_mode: 'cross',
  };
}

function isValidFollowRatio(value?: string): boolean {
  const raw = String(value ?? '').trim();
  return /^[1-9]\d*$/.test(raw);
}

function formatFollowRatioForInput(value: number): string {
  if (!Number.isFinite(value)) return '';
  return Number.isInteger(value) ? String(value) : String(value).replace(/\.?0+$/, '');
}

/** 绑定返回的 follower_api_id 可能已删或不在当前工作室列表；若仍优先使用会无匹配高亮 */
function pickDefaultTradingApiId(
  tradingApis: ExchangeAccount[],
  preferred: number | null
): number | null {
  if (tradingApis.length === 0) return null;
  const ids = new Set(tradingApis.map((a) => a.id));
  if (preferred != null && ids.has(preferred)) return preferred;
  return tradingApis[0]?.id ?? null;
}

export default function SignalDetailPage() {
  const params = useParams<{ signalId: string }>();
  const signalId = Number(params.signalId);

  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<ExchangeAccount[]>([]);
  const [positionsLoading, setPositionsLoading] = useState(false);
  const [positionsError, setPositionsError] = useState<string | null>(null);
  const [signalPositions, setSignalPositions] = useState<CurrentPosition[]>([]);
  const [followedApiIds, setFollowedApiIds] = useState<Set<number>>(new Set());
  const [configByApiId, setConfigByApiId] = useState<Record<number, FollowConfig>>({});
  const [selectedApiId, setSelectedApiId] = useState<number | null>(null); // 抽屉编辑目标 API
  const [selectedTimelineApiId, setSelectedTimelineApiId] = useState<number | null>(null); // 时间轴查看目标 API
  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirmDisableFollowOpen, setConfirmDisableFollowOpen] = useState(false);
  const [confirmDisableFollowApiId, setConfirmDisableFollowApiId] = useState<number | null>(
    null
  );

  useEffect(() => {
    setSelectedApiId(null);
    setSheetOpen(false);
  }, [signalId]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const includeTeamStudios = getSessionDisplay().is_team_manager === true;
        const data = await settingsApi.getExchangeAccounts({ includeTeamStudios });
        setAccounts(data);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : '加载信号详情失败，请稍后重试';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const signal = useMemo(
    () => accounts.find((item) => item.id === signalId && item.is_readonly),
    [accounts, signalId]
  );
  const tradingApis = useMemo(
    () => accounts.filter((item) => !item.is_readonly),
    [accounts]
  );

  useEffect(() => {
    if (!signal) return;

    let cancelled = false;
    const fetchBindings = async () => {
      try {
        const bindings = await apiClient.get<FollowBindingFromApi[]>(
          `/api/copy-task/follow-bindings?trader_api_id=${signal.id}`
        );

        if (cancelled) return;

        const bindingByFollowerApiId = new Map<number, FollowBindingFromApi>();
        for (const b of bindings ?? []) {
          if (!b || !b.is_active) continue;
          bindingByFollowerApiId.set(b.follower_api_id, b);
        }

        const nextFollowedApiIds = new Set<number>(bindingByFollowerApiId.keys());
        setFollowedApiIds(nextFollowedApiIds);

        const initConfigs: Record<number, FollowConfig> = {};
        for (const api of tradingApis) {
          const binding = bindingByFollowerApiId.get(api.id);
          if (!binding) {
            initConfigs[api.id] = buildDefaultConfig(false);
            continue;
          }
          const ratioStr = Number.isFinite(binding.ratio)
            ? formatFollowRatioForInput(binding.ratio)
            : String(binding.ratio);
          initConfigs[api.id] = {
            enabled: true,
            ratio: ratioStr,
            lever_set: (binding.lever_set === 2 ? 2 : 1) as 1 | 2,
            leverage: binding.leverage ?? '1',
            is_reverse: Boolean(binding.is_reverse),
            first_order_set: (binding.first_order_set as 1 | 2 | 3 | 4) ?? 1,
            // UI 暂不提供切换：强制固定默认值
            open_type: 1,
            mgn_mode: 'cross',
            bindingId: binding.id,
          };
        }

        setConfigByApiId(initConfigs);

        if (nextFollowedApiIds.size === 0) {
          setSelectedTimelineApiId(null);
        } else {
          const firstValid = Array.from(nextFollowedApiIds.values()).find((id) =>
            tradingApis.some((a) => a.id === id)
          );
          setSelectedTimelineApiId(firstValid ?? tradingApis[0]?.id ?? null);
        }
      } catch (error) {
        if (cancelled) return;
        const message =
          error instanceof Error ? error.message : '加载跟单绑定失败，请稍后重试';
        toast.error(message);
        setFollowedApiIds(new Set());
        setSelectedTimelineApiId(null);
      }
    };

    fetchBindings();
    return () => {
      cancelled = true;
    };
  }, [signal, tradingApis]);

  const followedApis = useMemo(
    () => tradingApis.filter((item) => followedApiIds.has(item.id)),
    [tradingApis, followedApiIds]
  );

  const selectedApi = useMemo(
    () => tradingApis.find((item) => item.id === selectedApiId) ?? null,
    [tradingApis, selectedApiId]
  );
  const selectedTimelineApi = useMemo(
    () => tradingApis.find((item) => item.id === selectedTimelineApiId) ?? null,
    [tradingApis, selectedTimelineApiId]
  );

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

  useEffect(() => {
    if (!signal) return;
    if (!Number.isFinite(signalId)) return;

    let cancelled = false;
    const fetchPositions = async () => {
      setPositionsLoading(true);
      setPositionsError(null);
      try {
        const res = await apiClient.get<{
          positions: CurrentPosition[];
        }>(`/api/positions/current/${signalId}?instType=SWAP`);

        if (cancelled) return;
        setSignalPositions(res.positions ?? []);
      } catch (error) {
        if (cancelled) return;
        const message =
          error instanceof Error ? error.message : '加载当前持仓失败，请稍后重试';
        setPositionsError(message);
        toast.error(message);
        setSignalPositions([]);
      } finally {
        if (cancelled) return;
        setPositionsLoading(false);
      }
    };

    fetchPositions();
    return () => {
      cancelled = true;
    };
  }, [signal, signalId]);

  type TimelineLogItem = {
    id: string;
    time: string;
    timeMs: number | null;
    text: string;
  };

  const [signalTradeLogs, setSignalTradeLogs] = useState<TimelineLogItem[]>([]);
  const [currentTimelineLogs, setCurrentTimelineLogs] = useState<TimelineLogItem[]>([]);

  const parseLogTimeMs = (iso?: string | null) => {
    if (!iso) return null;
    const t = new Date(iso).getTime();
    if (!Number.isFinite(t)) return null;
    return t;
  };

  const formatLogTime = (iso?: string | null) => {
    const t = parseLogTimeMs(iso);
    if (t === null) return '-';
    return new Date(t).toLocaleString();
  };

  const formatQty = (qty: number) => {
    if (!Number.isFinite(qty)) return '-';
    const fixed = qty.toFixed(3);
    return fixed.replace(/\.?0+$/, '');
  };

  const formatPosSide = (posSide?: string | null) => {
    const v = String(posSide ?? '').trim().toLowerCase();
    if (v === 'long') return '多';
    if (v === 'short') return '空';
    if (v === 'net') return '净';
    return '-';
  };

  const formatTraderTradeText = (log: {
    inst_id: string;
    action: string;
    pos_side?: string | null;
    quantity: number;
  }) => {
    const actionZh = (() => {
      const v = String(log.action ?? '').trim().toLowerCase();
      if (v === 'open') return '开仓';
      if (v === 'add') return '加仓';
      if (v === 'reduce') return '减仓';
      if (v === 'close') return '平仓';
      return v || '操作';
    })();

    const posZh = formatPosSide(log.pos_side);
    const posText = posZh === '-' ? '持仓' : `${posZh}单`;
    return `${actionZh} ${log.inst_id} ${posText} ${formatQty(log.quantity)} 张`;
  };

  const actionZhByFollower = (action: string) => {
    const v = String(action ?? '').trim().toLowerCase();
    if (v === 'open') return '开仓';
    if (v === 'add') return '加仓';
    if (v === 'reduce') return '减仓';
    if (v === 'close') return '平仓';
    return v || '操作';
  };

  const formatFollowerCopyText = (log: {
    inst_id: string;
    action: string;
    pos_side?: string | null;
    quantity: number;
    status: number;
    s_code?: string | null;
    reason?: string | null;
  }) => {
    const posZh = formatPosSide(log.pos_side);
    const posText = posZh === '-' ? '持仓' : `${posZh}单`;
    const base = `${actionZhByFollower(log.action)} ${log.inst_id} ${posText} ${formatQty(log.quantity)} 张`;
    if (log.status === 2) {
      const reason = String(log.reason ?? '').trim().slice(0, 200);
      const code = String(log.s_code ?? '').trim();
      const lines: string[] = [];
      if (reason) lines.push(`失败原因：${reason}`);
      if (code) lines.push(`错误码：${code}`);
      if (lines.length === 0) return base;
      return `${base}\n${lines.join('\n')}`;
    }
    return base;
  };

  const shouldBlankLeftByTimeDiff = (left: TimelineLogItem, right?: TimelineLogItem) => {
    if (!right) return false;
    if (left.timeMs === null || right.timeMs === null) return false;
    return Math.abs(left.timeMs - right.timeMs) > 10_000;
  };

  useEffect(() => {
    let cancelled = false;
    const fetchTraderLogs = async () => {
      if (!signal) return;
      try {
        const items = await apiClient.get<
          Array<{
            id: number;
            inst_id: string;
            action: string;
            pos_side?: string | null;
            quantity: number;
            created_at?: string | null;
          }>
        >(
          `/api/copy-task/logs/trader-trades?trader_api_id=${signal.id}&limit=30`
        );

        if (cancelled) return;
        setSignalTradeLogs(
          (items ?? []).map((item) => ({
            id: String(item.id),
            timeMs: parseLogTimeMs(item.created_at),
            time: formatLogTime(item.created_at),
            text: formatTraderTradeText(item),
          }))
        );
      } catch (error) {
        if (cancelled) return;
        const message =
          error instanceof Error ? error.message : '加载交易日志失败，请稍后重试';
        toast.error(message);
        setSignalTradeLogs([]);
      }
    };

    fetchTraderLogs();
    return () => {
      cancelled = true;
    };
  }, [signal]);

  useEffect(() => {
    let cancelled = false;
    const fetchFollowerLogs = async () => {
      if (!signal) return;
      if (selectedTimelineApiId === null) {
        setCurrentTimelineLogs([]);
        return;
      }

      try {
        const items = await apiClient.get<
          Array<{
            id: number;
            inst_id: string;
            action: string;
            pos_side?: string | null;
            quantity: number;
            status: number;
            s_code?: string | null;
            reason?: string | null;
            created_at?: string | null;
          }>
        >(
          `/api/copy-task/logs/follower-copies?trader_api_id=${signal.id}&follower_api_id=${selectedTimelineApiId}&limit=30`
        );

        if (cancelled) return;
        setCurrentTimelineLogs(
          (items ?? []).map((item) => ({
            id: String(item.id),
            timeMs: parseLogTimeMs(item.created_at),
            time: formatLogTime(item.created_at),
            text: formatFollowerCopyText(item),
          }))
        );
      } catch (error) {
        if (cancelled) return;
        const message =
          error instanceof Error ? error.message : '加载跟单日志失败，请稍后重试';
        toast.error(message);
        setCurrentTimelineLogs([]);
      }
    };

    fetchFollowerLogs();
    return () => {
      cancelled = true;
    };
  }, [signal, selectedTimelineApiId]);

  const updateSelectedConfig = (patch: Partial<FollowConfig>) => {
    if (!selectedApiId) return;
    setConfigByApiId((prev) => ({
      ...prev,
      [selectedApiId]: {
        ...(prev[selectedApiId] ?? buildDefaultConfig(followedApiIds.has(selectedApiId))),
        ...patch,
      },
    }));
  };

  const setApiEnabled = (apiId: number, enabled: boolean) => {
    setConfigByApiId((prev) => ({
      ...prev,
      [apiId]: {
        ...(prev[apiId] ?? buildDefaultConfig(followedApiIds.has(apiId))),
        enabled,
      },
    }));
  };

  const saveConfig = async () => {
    if (!selectedApiId || !signal) return;

    const config = configByApiId[selectedApiId] ?? buildDefaultConfig(false);
    const trader_api_id = signal.id;
    const follower_api_id = selectedApiId;

    if (!isValidFollowRatio(config.ratio)) {
      toast.error('跟单比例必须是大于等于 1 的正整数');
      return;
    }
    const ratioNum = Number.parseInt(String(config.ratio).trim(), 10);

    if (config.lever_set === 2) {
      const leverageNum = parseFloat(config.leverage ?? '');
      if (!Number.isFinite(leverageNum)) {
        toast.error('自定义杠杆模式下，杠杆数值必须是数字');
        return;
      }
    }

    const basePayload = {
      trader_api_id,
      follower_api_id,
      follow_type: 1,
      ratio: ratioNum,
      lever_set: config.lever_set,
      leverage: config.leverage,
      is_reverse: config.is_reverse,
      first_order_set: config.first_order_set,
      tp_trigger_ratio: 0,
      sl_trigger_ratio: 0,
      open_type: 1,
      mgn_mode: 'cross',
    };

    try {
      if (!config.enabled) {
        if (config.bindingId) {
          await apiClient.delete<void>(`/api/copy-task/follow-bindings/${config.bindingId}`);
        }
      } else {
        if (config.bindingId) {
          await apiClient.put<void>(`/api/copy-task/follow-bindings`, basePayload);
        } else {
          await apiClient.post<void>(`/api/copy-task/follow-bindings`, basePayload);
        }
      }

      const bindings = await apiClient.get<FollowBindingFromApi[]>(
        `/api/copy-task/follow-bindings?trader_api_id=${trader_api_id}`
      );
      const bindingByFollowerApiId = new Map<number, FollowBindingFromApi>();
      for (const b of bindings ?? []) {
        if (!b || !b.is_active) continue;
        bindingByFollowerApiId.set(b.follower_api_id, b);
      }
      const nextFollowedApiIds = new Set<number>(bindingByFollowerApiId.keys());
      setFollowedApiIds(nextFollowedApiIds);

      const initConfigs: Record<number, FollowConfig> = {};
      for (const api of tradingApis) {
        const binding = bindingByFollowerApiId.get(api.id);
        if (!binding) {
          initConfigs[api.id] = buildDefaultConfig(false);
          continue;
        }
        const ratioStr = Number.isFinite(binding.ratio)
          ? formatFollowRatioForInput(binding.ratio)
          : String(binding.ratio);
        initConfigs[api.id] = {
          enabled: true,
          ratio: ratioStr,
          lever_set: (binding.lever_set === 2 ? 2 : 1) as 1 | 2,
          leverage: binding.leverage ?? '1',
          is_reverse: Boolean(binding.is_reverse),
          first_order_set: (binding.first_order_set as 1 | 2 | 3 | 4) ?? 1,
          // UI 暂不提供切换：强制固定默认值
          open_type: 1,
          mgn_mode: 'cross',
          bindingId: binding.id,
        };
      }
      setConfigByApiId(initConfigs);
      const firstFollowed = Array.from(nextFollowedApiIds.values())[0] ?? null;
      setSelectedTimelineApiId(firstFollowed);

      toast.success('跟单配置已保存');
      setSheetOpen(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '保存失败，请稍后重试';
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className='flex h-[40vh] items-center justify-center'>
          <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
        </div>
      </PageContainer>
    );
  }

  if (!signal) {
    return (
      <PageContainer pageTitle='信号详情'>
        <Card className='max-w-xl'>
          <CardHeader>
            <CardTitle>信号不存在或已不可用</CardTitle>
            <CardDescription>请返回跟单管理列表重新选择信号。</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant='outline'>
              <Link href='/dashboard/copy-task'>
                <ArrowLeft className='mr-2 h-4 w-4' />
                返回信号列表
              </Link>
            </Button>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      pageTitle={`信号详情 - ${signal.api_name || signal.id}`}
      pageDescription='仓位概览、跟单 API 管理与双列时间轴'
    >
      <div className='mb-4'>
        <Button asChild variant='outline' size='sm'>
          <Link href='/dashboard/copy-task'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            返回信号列表
          </Link>
        </Button>
      </div>

      <div className='space-y-4'>
        <Card>
          <CardHeader>
            <CardTitle>{`${signal.api_name || `信号${signal.id}`}仓位`}</CardTitle>
            <CardDescription>当前持仓信息</CardDescription>
          </CardHeader>
          <CardContent>
            {positionsLoading ? (
              <div className='flex items-center justify-center py-6'>
                <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
              </div>
            ) : positionsError ? (
              <div className='rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground'>
                {positionsError}
              </div>
            ) : signalPositions.length === 0 ? (
              <div className='rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground'>
                当前空仓
              </div>
            ) : (
              <>
                <div className='space-y-2 md:hidden'>
                  {signalPositions.map((item) => (
                    <div
                      key={`${item.instId ?? ''}-${item.posSide ?? ''}-${item.pos ?? ''}`}
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
                        <span className={`font-medium ${getDirectionInfo(item).className}`}>
                          {getDirectionInfo(item).label}
                        </span>

                        <span className='text-muted-foreground'>仓位</span>
                        <span className='tabular-nums'>{formatAbsPos(item.pos)}</span>

                        <span className='text-muted-foreground'>开仓价</span>
                        <span className='tabular-nums'>{item.avgPx ?? '-'}</span>

                        <span className='text-muted-foreground'>标记</span>
                        <span className='tabular-nums'>{item.markPx ?? '-'}</span>

                        <span className='text-muted-foreground'>保证金</span>
                        <span className='tabular-nums'>{formatMargin(item.margin)}</span>

                        <span className='text-muted-foreground'>收益</span>
                        <span className={`tabular-nums ${getUplClass(item.upl)}`}>
                          {formatUpl(item.upl)}
                        </span>

                        <span className='text-muted-foreground'>收益率</span>
                        <span className={`tabular-nums ${getUplRatioClass(item.uplRatio)}`}>
                          {formatUplRatioPercent(item.uplRatio)}
                        </span>

                        <span className='text-muted-foreground'>时间</span>
                        <span className='tabular-nums text-muted-foreground'>
                          {formatOpenTimeShort(item.cTime)}
                        </span>
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
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {signalPositions.map((item) => (
                        <TableRow
                          key={`${item.instId ?? ''}-${item.posSide ?? ''}-${item.pos ?? ''}`}
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
                          <TableCell className={getDirectionInfo(item).className}>
                            {getDirectionInfo(item).label}
                          </TableCell>
                          <TableCell>{formatAbsPos(item.pos)}</TableCell>
                          <TableCell>{item.avgPx ?? '-'}</TableCell>
                          <TableCell>{item.markPx ?? '-'}</TableCell>
                          <TableCell>{formatMargin(item.margin)}</TableCell>
                          <TableCell className={getUplClass(item.upl)}>
                            {formatUpl(item.upl)}
                          </TableCell>
                          <TableCell className={getUplRatioClass(item.uplRatio)}>
                            {formatUplRatioPercent(item.uplRatio)}
                          </TableCell>
                          <TableCell>{formatOpenTime(item.cTime)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
              <div>
                <CardTitle>跟单 API</CardTitle>
                <CardDescription>
                  点击卡片切换日志，点击右侧按钮进入跟单设置
                </CardDescription>
              </div>
              <Button
                onClick={() => {
                  setSelectedApiId(
                    pickDefaultTradingApiId(tradingApis, selectedTimelineApiId)
                  );
                  setSheetOpen(true);
                }}
              >
                跟单设置
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {followedApis.length === 0 ? (
              <div className='rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground'>
                暂无已跟单 API，请点击“跟单设置”启用
              </div>
            ) : (
              <div className='-mx-1 overflow-x-auto px-1'>
                <div className='flex min-w-max gap-2 md:min-w-0 md:flex-wrap'>
                {followedApis.map((api) => {
                  const active = selectedTimelineApiId === api.id;
                  const platformKey = (api.platform || '').trim().toLowerCase();
                  const logoSrc = EXCHANGE_LOGO_SRC[platformKey];
                  return (
                    <button
                      key={api.id}
                      type='button'
                      className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                        active
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'hover:bg-muted/40'
                      }`}
                      onClick={() => setSelectedTimelineApiId(api.id)}
                    >
                      <div className='flex items-center gap-2'>
                        {logoSrc && (
                          <Image
                            src={logoSrc}
                            alt={`${platformKey} logo`}
                            width={16}
                            height={16}
                            className='shrink-0'
                          />
                        )}
                        <span className='text-sm font-medium'>
                          {api.api_name || `API ${api.id}`}
                        </span>
                      </div>
                    </button>
                  );
                })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>交易日志</CardTitle>
            <CardDescription>
              左侧信号交易日志，右侧
              {selectedTimelineApi
                ? ` ${selectedTimelineApi.api_name || selectedTimelineApi.id} `
                : ' 当前选择 API '}
              跟单日志
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedTimelineApiId === null ? (
              <div className='rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground'>
                请先选择一个已跟单 API 查看右侧日志
              </div>
            ) : (
              signalTradeLogs.length === 0 ? (
                <div className='rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground'>
                  暂无交易日志
                </div>
              ) : (
                <div>
                  <div className='space-y-2 md:hidden'>
                    {signalTradeLogs.map((trade, idx) => {
                      const rightItem = currentTimelineLogs[idx];
                      const blankLeft = shouldBlankLeftByTimeDiff(trade, rightItem);
                      return (
                        <div key={trade.id} className='relative pl-4'>
                          <span className='absolute left-0 top-2 h-2 w-2 rounded-full bg-primary/80' />
                          <span className='absolute left-[3px] top-4 h-[calc(100%-10px)] w-px bg-border/70' />
                          <div className='space-y-1 pb-2'>
                            <div className='text-xs leading-5 text-foreground/90 break-words whitespace-pre-line'>
                              {blankLeft ? '-' : trade.text}
                              <span className='ml-2 text-[11px] text-muted-foreground'>
                                {blankLeft ? '-' : trade.time}
                              </span>
                            </div>
                            <div className='text-xs leading-5 text-foreground/90 break-words whitespace-pre-line'>
                              <span className='text-[11px] text-muted-foreground mr-2'>
                                {rightItem?.time || '-'}
                              </span>
                              {rightItem?.text || '暂无该笔跟单日志'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className='relative hidden gap-y-2 md:grid md:grid-cols-[1fr_28px_1fr]'>
                    <div className='absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-border/80' />
                    {signalTradeLogs.map((trade, idx) => {
                      const rightItem = currentTimelineLogs[idx];
                      const blankLeft = shouldBlankLeftByTimeDiff(trade, rightItem);
                      return (
                        <div key={trade.id} className='contents'>
                          <div className='flex items-center justify-end gap-2 py-1.5 pr-2 text-right'>
                            <div className='text-xs leading-5 text-foreground/90 break-words whitespace-pre-line'>
                              {blankLeft ? '-' : trade.text}
                            </div>
                            <div className='shrink-0 text-[11px] leading-4 text-muted-foreground'>
                              {blankLeft ? '-' : trade.time}
                            </div>
                          </div>
                          <div className='hidden md:flex items-center justify-center'>
                            <span className='h-2 w-2 rounded-full bg-primary/80 ring-4 ring-primary/10' />
                          </div>
                          <div className='flex items-center gap-2 py-1.5 pl-2'>
                            <div className='shrink-0 text-[11px] leading-4 text-muted-foreground'>
                              {rightItem?.time || '-'}
                            </div>
                            <div className='text-xs leading-5 text-foreground/90 break-words whitespace-pre-line'>
                              {rightItem?.text || '暂无该笔跟单日志'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side='right'
          className='sm:max-w-lg flex flex-col'
        >
          <SheetHeader>
            <SheetTitle>跟单配置</SheetTitle>
            <SheetDescription>选择切换不同 API 的跟单配置</SheetDescription>
          </SheetHeader>

          <div className='space-y-4 px-4 flex-1 overflow-y-auto'>
            <div>
              <div className='mb-2 text-xs font-medium'>全部交易 API</div>
              <div className='flex flex-wrap gap-2'>
                {tradingApis.map((api) => {
                  const active = selectedApiId === api.id;
                  const platformKey = (api.platform || '').trim().toLowerCase();
                  const logoSrc = EXCHANGE_LOGO_SRC[platformKey];
                  return (
                    <button
                      key={api.id}
                      type='button'
                      className={`rounded-md border px-3 py-2 text-left transition-colors ${
                        active
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'hover:bg-muted/40'
                      }`}
                      onClick={() => setSelectedApiId(api.id)}
                    >
                      <div className='flex items-center gap-2'>
                        {logoSrc && (
                          <Image
                            src={logoSrc}
                            alt={`${platformKey} logo`}
                            width={16}
                            height={16}
                            className='shrink-0'
                          />
                        )}
                        <span className='text-xs font-medium'>
                          {api.api_name || `API ${api.id}`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedApi && (
              <>
                <div className='flex items-center justify-between rounded-md border p-3'>
                  <div>
                    <div className='font-medium text-xs'>是否跟单</div>
                  </div>
                  <Switch
                    checked={
                      configByApiId[selectedApi.id]?.enabled ?? followedApiIds.has(selectedApi.id)
                    }
                    onCheckedChange={(checked) => {
                      const currentEnabled =
                        configByApiId[selectedApi.id]?.enabled ?? followedApiIds.has(selectedApi.id);

                      if (checked === true) {
                        updateSelectedConfig({ enabled: true });
                        return;
                      }

                      if (checked === false && currentEnabled) {
                        setConfirmDisableFollowApiId(selectedApi.id);
                        setConfirmDisableFollowOpen(true);
                        return;
                      }

                      // already disabled: keep state unchanged
                    }}
                  />
                </div>

                <div className='flex items-center justify-between rounded-md border p-3'>
                  <div>
                    <div className='font-medium text-xs'>反向跟单</div>
                  </div>
                  <Switch
                      checked={configByApiId[selectedApi.id]?.is_reverse ?? true}
                      onCheckedChange={(checked) =>
                          updateSelectedConfig({ is_reverse: checked })
                      }
                  />
                </div>

                <div className='space-y-2'>
                  <label className='text-xs font-medium'>跟单比例</label>
                  <Input
                    value={configByApiId[selectedApi.id]?.ratio ?? ''}
                    onChange={(e) => {
                      const nextValue = e.target.value;
                      if (/^\d*$/.test(nextValue)) {
                        updateSelectedConfig({ ratio: nextValue });
                      }
                    }}
                    placeholder='例如 1'
                  />
                </div>

                <div className='space-y-2'>
                  <label className='text-xs font-medium'>杠杆模式</label>
                  <div className='flex items-center gap-4'>
                    <label className='flex cursor-pointer items-center gap-2'>
                      <Checkbox
                        checked={(configByApiId[selectedApi.id]?.lever_set ?? 1) === 1}
                        onCheckedChange={(checked) => {
                          if (checked === true) updateSelectedConfig({ lever_set: 1 });
                        }}
                      />
                      <span className='text-xs'>跟随信号</span>
                    </label>
                    <label className='flex cursor-pointer items-center gap-2'>
                      <Checkbox
                        checked={(configByApiId[selectedApi.id]?.lever_set ?? 1) === 2}
                        onCheckedChange={(checked) => {
                          if (checked === true) updateSelectedConfig({ lever_set: 2 });
                        }}
                      />
                      <span className='text-xs'>自定义</span>
                    </label>
                  </div>
                </div>

                {(configByApiId[selectedApi.id]?.lever_set ?? 1) === 2 && (
                  <div className='space-y-2'>
                    <label className='text-xs font-medium'>杠杆数值</label>
                    <Input
                      value={configByApiId[selectedApi.id]?.leverage ?? '1'}
                      onChange={(e) => updateSelectedConfig({ leverage: e.target.value })}
                      placeholder='例如 5'
                    />
                  </div>
                )}

                <div className='space-y-2'>
                  <label className='text-xs font-medium'>开仓模式</label>
                  <div className='flex items-center gap-2'>
                    <label className='flex cursor-not-allowed items-center gap-2 opacity-70'>
                      <Checkbox checked disabled />
                      <span className='text-xs'>市价跟单</span>
                    </label>
                  </div>
                </div>

                <div className='space-y-2'>
                  <label className='text-xs font-medium'>仓位模式</label>
                  <div className='flex items-center gap-2'>
                    <label className='flex cursor-not-allowed items-center gap-2 opacity-70'>
                      <Checkbox checked disabled />
                      <span className='text-xs'>全仓</span>
                    </label>
                  </div>
                </div>

                <div className='space-y-2'>
                  <label className='text-xs font-medium'>首单交易设置</label>
                  <div className='flex flex-col gap-2'>
                    <label className='flex cursor-pointer items-center gap-2'>
                      <Checkbox
                        checked={(configByApiId[selectedApi.id]?.first_order_set ?? 1) === 1}
                        onCheckedChange={(checked) => {
                          if (checked === true) {
                            updateSelectedConfig({ first_order_set: 1 });
                          }
                        }}
                      />
                      <span className='text-xs'>仅复制新开仓</span>
                    </label>
                    <label className='flex cursor-pointer items-center gap-2'>
                      <Checkbox
                        checked={(configByApiId[selectedApi.id]?.first_order_set ?? 1) === 2}
                        onCheckedChange={(checked) => {
                          if (checked === true) {
                            updateSelectedConfig({ first_order_set: 2 });
                          }
                        }}
                      />
                      <span className='text-xs'>复制当前持仓</span>
                    </label>
                    <label className='flex cursor-pointer items-center gap-2'>
                      <Checkbox
                        checked={(configByApiId[selectedApi.id]?.first_order_set ?? 1) === 3}
                        onCheckedChange={(checked) => {
                          if (checked === true) {
                            updateSelectedConfig({ first_order_set: 3 });
                          }
                        }}
                      />
                      <span className='text-xs'>仅复制当前亏损仓位</span>
                    </label>
                    <label className='flex cursor-pointer items-center gap-2'>
                      <Checkbox
                        checked={(configByApiId[selectedApi.id]?.first_order_set ?? 1) === 4}
                        onCheckedChange={(checked) => {
                          if (checked === true) {
                            updateSelectedConfig({ first_order_set: 4 });
                          }
                        }}
                      />
                      <span className='text-xs'>仅复制当前盈利仓位</span>
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>

          <AlertDialog
            open={confirmDisableFollowOpen}
            onOpenChange={(open) => {
              setConfirmDisableFollowOpen(open);
              if (!open) setConfirmDisableFollowApiId(null);
            }}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>解除跟单确认</AlertDialogTitle>
                <AlertDialogDescription>
                  解除跟单不会进行平仓，需要你后续手动平仓。是否确认关闭跟单开关？
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    if (confirmDisableFollowApiId == null) return;
                    setApiEnabled(confirmDisableFollowApiId, false);
                    setConfirmDisableFollowOpen(false);
                    setConfirmDisableFollowApiId(null);
                  }}
                >
                  同意
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <SheetFooter>
            <Button variant='outline' onClick={() => setSheetOpen(false)}>
              取消
            </Button>
            <Button onClick={saveConfig}>保存配置</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </PageContainer>
  );
}
