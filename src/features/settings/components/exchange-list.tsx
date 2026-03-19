'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import { ExchangeAccount } from '../types';
import { settingsApi } from '@/api/settings';
import { ExchangeAddButton } from './exchange-form';
import { DeleteCell, ExchangeCell, getColumns } from './columns';
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
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import {
  clearActiveExchangeFromLocalStorage,
  setActiveExchangeToLocalStorage,
} from '@/lib/active-exchange';
import { KeyRound } from 'lucide-react';

export function ExchangeList() {
  const t = useTranslations('AccountSettingsPage.exchangeList');
  const tColumns = useTranslations('AccountSettingsPage.columns');
  const [data, setData] = useState<ExchangeAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const accounts = await settingsApi.getExchangeAccounts();
      setData(accounts);
      const active = accounts.find((it) => it.is_readonly && it.status === 1);
      if (active?.platform) {
        setActiveExchangeToLocalStorage(active.platform);
      } else {
        clearActiveExchangeFromLocalStorage();
      }
    } catch (error) {
      console.error('Failed to fetch exchange accounts:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to fetch exchange accounts.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns = useMemo(() => getColumns(tColumns, fetchData), [tColumns, fetchData]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <CardTitle>{t('title')}</CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </div>
          <ExchangeAddButton onSuccess={fetchData} />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="rounded-full bg-muted p-3 mb-3">
              <KeyRound className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">暂无交易所 API</p>
            <p className="text-xs text-muted-foreground mt-1">
              点击右上角按钮添加你的第一个交易所 API
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {data.map((row) => {
                const createdAt = row.created_at
                  ? new Date(row.created_at).toLocaleString()
                  : '-';
                const roleText = row.is_readonly
                  ? tColumns('signal')
                  : tColumns('trading');
                const roleClass = row.is_readonly
                  ? 'text-green-600 font-medium'
                  : 'text-foreground font-medium';
                const statusText = row.status === 1 ? tColumns('ok') : tColumns('error');

                return (
                  <div key={row.id} className="rounded-lg border p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-2">
                        <ExchangeCell platform={row.platform} />

                        <div className="flex items-baseline justify-between gap-3">
                          <span className="text-xs text-muted-foreground">
                            {tColumns('label')}
                          </span>
                          <span className="text-sm font-medium break-all">
                            {row.api_name || '-'}
                          </span>
                        </div>
                      </div>

                      <DeleteCell row={row} onRefresh={fetchData} t={tColumns} />
                    </div>

                    <div className="mt-2 space-y-1 text-sm">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-xs text-muted-foreground">
                          {tColumns('uid')}
                        </span>
                        <span className="font-mono text-xs">{row.uid || '-'}</span>
                      </div>

                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-xs text-muted-foreground">
                          {tColumns('usdtBalance')}
                        </span>
                        <span className="text-xs tabular-nums">
                          {typeof row.usdt === 'number' ? row.usdt.toFixed(4) : '-'}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-xs text-muted-foreground">
                          {tColumns('createdAt')}
                        </span>
                        <span className="text-xs break-all">{createdAt}</span>
                      </div>

                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-xs text-muted-foreground">
                          {tColumns('role')}
                        </span>
                        <span className={roleClass + ' text-xs'}>
                          {roleText}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-xs text-muted-foreground">
                          {tColumns('status')}
                        </span>
                        <span className="text-xs">{statusText}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="hidden md:block rounded-lg border">
              <Table>
                <TableHeader className="bg-muted">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
