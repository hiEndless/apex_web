'use client';

import { authApi, type StudioListItem } from '@/api/auth';
import { settingsApi } from '@/api/settings';
import { copyTaskApi, type PnlStatsItem, type PnlStatsResponse, type GroupedBinding } from '@/api/copy-task';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { getAccessTokenStudioId } from '@/api/client';
import { ExchangeAccount } from '@/features/settings/types';
import { getSessionDisplay, getSuperAdminBaseStudioId } from '@/lib/auth-session';
import { useRouter } from '@/i18n/navigation';
import { LineChart, Loader2, Plus, LayoutGrid, List } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { SignalGridView } from './components/signal-grid-view';
import { SignalTableView } from './components/signal-table-view';

export default function CopyTaskPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<ExchangeAccount[]>([]);
  const [studioNamesById, setStudioNamesById] = useState<Record<number, string>>({});
  const [groupedBindings, setGroupedBindings] = useState<Record<string, GroupedBinding>>({});
  const [pnlStats, setPnlStats] = useState<Record<number, PnlStatsItem>>({});
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [adminSignals, setAdminSignals] = useState<ExchangeAccount[]>([]);
  const [loadingAdmin, setLoadingAdmin] = useState(false);

  const currentStudioId = getAccessTokenStudioId();
  const { is_super_admin } = getSessionDisplay();
  const superAdminBaseStudioId = getSuperAdminBaseStudioId();
  const shouldShowSystemSignals =
    Boolean(is_super_admin) &&
    superAdminBaseStudioId != null &&
    currentStudioId != null &&
    currentStudioId === superAdminBaseStudioId;

  useEffect(() => {
    if (!shouldShowSystemSignals) {
      setAdminSignals([]);
      setLoadingAdmin(false);
      return;
    }

    let cancelled = false;
    setLoadingAdmin(true);
    settingsApi.getSuperAdminFollowingTraderApis()
      .then(res => {
        if (!cancelled) setAdminSignals(res || []);
      })
      .catch(err => {
        console.error('Failed to fetch admin signals', err);
      })
      .finally(() => {
        if (!cancelled) setLoadingAdmin(false);
      });
    return () => { cancelled = true; };
  }, [shouldShowSystemSignals]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const includeTeamStudios = getSessionDisplay().is_team_manager === true;
        const [data, studios, bindingsRes, pnlRes] = await Promise.all([
          settingsApi.getExchangeAccounts({ includeTeamStudios }),
          includeTeamStudios ? authApi.listStudios() : Promise.resolve<StudioListItem[]>([]),
          copyTaskApi.getGroupedBindings().catch(() => ({})),
          copyTaskApi.getReadonlyApiPnlStats('7d').catch(() => null),
        ]);
        
        setAccounts(data);
        setGroupedBindings(bindingsRes || {});
        
        if (pnlRes && pnlRes.items) {
          const pnlMap: Record<number, PnlStatsItem> = {};
          pnlRes.items.forEach((item: PnlStatsItem) => {
            pnlMap[item.api_id] = item;
          });
          setPnlStats(pnlMap);
        }

        if (includeTeamStudios && studios.length > 0) {
          const map: Record<number, string> = {};
          for (const s of studios) {
            map[s.studio_id] = s.studio_name;
          }
          setStudioNamesById(map);
        } else {
          setStudioNamesById({});
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : '加载信号列表失败，请稍后重试';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const signalApis = useMemo(
    () => accounts.filter((item) => item.is_readonly),
    [accounts]
  );

  return (
    <PageContainer
      pageTitle='跟单管理'
      pageDescription='选择信号，进入详情配置跟单策略'
      pageHeaderAction={
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'table')}>
          <TabsList className="grid w-[120px] grid-cols-2">
            <TabsTrigger value="grid" title="卡片视图" className="data-[state=active]:shadow-none">
              <LayoutGrid className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="table" title="列表视图" className="data-[state=active]:shadow-none">
              <List className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      }
    >
      {loading ? (
        <div className='flex h-[40vh] items-center justify-center'>
          <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
        </div>
      ) : signalApis.length === 0 && !is_super_admin ? (
        <div className='flex min-h-[min(52vh,420px)] flex-col items-center justify-center rounded-xl border border-dashed border-border/50 bg-muted/15 px-6 py-14 text-center'>
          <div
            className='mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-muted/50 ring-1 ring-border/40'
            aria-hidden
          >
            <LineChart className='h-7 w-7 text-muted-foreground' strokeWidth={1.5} />
          </div>
          <h3 className='text-lg font-semibold tracking-tight'>暂无跟单信号</h3>
          <p className='mt-2 max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground'>
            请在 API 管理中添加<strong className='font-medium text-foreground/80'>只读</strong>
            交易所密钥作为信号源，保存后将在此处展示。
          </p>
          <Button
            className='mt-8 gap-1.5'
            onClick={() => router.push('/dashboard/api-settings')}
          >
            <Plus className='h-4 w-4' aria-hidden />
            前往 API 管理
          </Button>
        </div>
      ) : (
        viewMode === 'grid' ? (
          <SignalGridView
            signalApis={signalApis}
            studioNamesById={studioNamesById}
            currentStudioId={currentStudioId}
            groupedBindings={groupedBindings}
            pnlStats={pnlStats}
            adminSignals={adminSignals}
            loadingAdmin={loadingAdmin}
            shouldShowSystemSignals={shouldShowSystemSignals}
          />
        ) : (
          <SignalTableView
            signalApis={signalApis}
            studioNamesById={studioNamesById}
            currentStudioId={currentStudioId}
            groupedBindings={groupedBindings}
            pnlStats={pnlStats}
            adminSignals={adminSignals}
            loadingAdmin={loadingAdmin}
            shouldShowSystemSignals={shouldShowSystemSignals}
          />
        )
      )}
    </PageContainer>
  );
}
