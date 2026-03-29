'use client';

import { settingsApi } from '@/api/settings';
import { apiClient } from '@/api/client';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type BillItem = {
  balChg: string;
  type: string;
  ts: string;
  [key: string]: any;
};

type BillsResponse = {
  api_id: number;
  api_name: string;
  platform: string;
  bills: BillItem[];
};

function formatShanghaiTime(tsText?: string | null) {
  const ms = Number(tsText ?? '');
  if (!Number.isFinite(ms) || ms === 0) return '-';
  return new Date(ms).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
}

function getBillTypeZh(type?: string) {
  const v = String(type ?? '').trim();
  if (!v) return '-';
  switch (v) {
    case '1': return '充值';
    case '2': return '提现';
    case '13': return '撤销提现';
    case '20': return '转出至子账户';
    case '21': return '从子账户转入';
    case '150': return '节点返佣';
    case '151': return '邀请奖励';
    case '152': return '经纪商返佣';
    default: return v;
  }
}

// 允许显示的账单类型
const ALLOWED_BILL_TYPES = ['1', '2', '13', '20', '21', '150', '151', '152'];

export default function BillsPage() {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<BillItem[]>([]);
  const [signals, setSignals] = useState<Array<{ id: number; api_name?: string }>>([]);
  const [selectedApiId, setSelectedApiId] = useState<number | ''>('');

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
        if (items.length > 0 && selectedApiId === '') {
          setSelectedApiId(items[0].id);
        }
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

  const fetchRecords = async (apiId: number | '') => {
    if (apiId === '') return;
    setLoading(true);
    try {
      const res = await apiClient.get<BillsResponse>(`/api/positions/funding-bills/${apiId}`);
      // 过滤只显示允许的账单类型
      const filteredBills = (res?.bills ?? []).filter(bill => 
        ALLOWED_BILL_TYPES.includes(String(bill.type ?? '').trim())
      );
      setRecords(filteredBills);
    } catch (e) {
      const message = e instanceof Error ? e.message : '加载资金流水失败，请稍后重试';
      toast.error(message);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedApiId !== '') {
      void fetchRecords(selectedApiId);
    }
  }, [selectedApiId]);

  return (
    <PageContainer
      pageTitle='资金流水'
      pageDescription='只读信号API的最近资金流水'
    >
      <div className='w-full min-w-0 max-w-full space-y-4'>
        <Card className='min-w-0 gap-0 overflow-hidden border py-4 shadow-none'>
          <CardHeader className='px-3 pb-2 pt-0 sm:px-4'>
            <CardTitle className='text-sm font-medium'>筛选</CardTitle>
          </CardHeader>
          <CardContent className='w-full min-w-0 max-w-full overflow-x-auto px-3 pt-0 sm:px-4'>
            <div className='flex items-end gap-3'>
              <div className='w-[200px] space-y-1'>
                <div className='text-xs text-muted-foreground'>信号 (仅只读API)</div>
                <Select
                  value={selectedApiId === '' ? '' : String(selectedApiId)}
                  onValueChange={(v) => setSelectedApiId(Number(v))}
                >
                  <SelectTrigger size='sm' className='h-8 w-full text-xs shadow-none focus-visible:ring-0 focus-visible:ring-offset-0'>
                    <SelectValue placeholder='请选择信号' />
                  </SelectTrigger>
                  <SelectContent>
                    {signals.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.api_name || `信号 ${s.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant='outline'
                size='sm'
                className='h-8 w-8 px-0 shadow-none'
                onClick={() => fetchRecords(selectedApiId)}
                disabled={loading || selectedApiId === ''}
              >
                <RotateCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className='min-w-0 border shadow-none'>
          <div className='overflow-x-auto'>
            <Table className='min-w-[800px]'>
              <TableHeader>
                <TableRow className='hover:bg-transparent'>
                  <TableHead className='h-10 text-xs font-medium'>变动时间</TableHead>
                  <TableHead className='h-10 text-xs font-medium'>账单类型</TableHead>
                  <TableHead className='h-10 text-right text-xs font-medium'>余额变动</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className='h-32 text-center'>
                      <Loader2 className='mx-auto h-6 w-6 animate-spin text-muted-foreground/50' />
                    </TableCell>
                  </TableRow>
                ) : records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className='h-32 text-center text-xs text-muted-foreground'>
                      暂无资金流水
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((item, idx) => {
                    const chg = parseFloat(item.balChg ?? '0');
                    const chgColor = chg > 0 ? 'text-green-600' : chg < 0 ? 'text-red-600' : '';
                    const chgSign = chg > 0 ? '+' : '';
                    return (
                      <TableRow key={idx} className='group hover:bg-muted/40'>
                        <TableCell className='py-2 text-xs'>
                          {formatShanghaiTime(item.ts)}
                        </TableCell>
                        <TableCell className='py-2 text-xs'>
                          {getBillTypeZh(item.type)}
                        </TableCell>
                        <TableCell className={`py-2 text-right text-xs font-medium ${chgColor}`}>
                          {chgSign}{item.balChg}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
