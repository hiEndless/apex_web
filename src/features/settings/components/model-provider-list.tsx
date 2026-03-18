'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from '@tanstack/react-table';
import { ModelProvider } from '../types';
import { settingsApi } from '@/api/settings';
import { DataTable } from '@/components/ui/table/data-table';
import { ModelProviderAddButton } from './model-provider-form';
import { getModelProviderColumns } from './model-provider-columns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export function ModelProviderList() {
  const t = useTranslations('AccountSettingsPage.modelProviderList');
  const tColumns = useTranslations('AccountSettingsPage.columns');
  const [data, setData] = useState<ModelProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const providers = await settingsApi.getModelProviders();
      console.log('Fetched providers:', providers);
      setData(providers);
    } catch (error) {
      console.error('Failed to fetch model providers:', error);
      toast.error('Failed to fetch model providers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = useMemo(() => getModelProviderColumns(tColumns, fetchData), []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  const visibleRowCount = table.getRowModel().rows.length;
  const ESTIMATED_HEADER_HEIGHT = 44;
  const ESTIMATED_ROW_HEIGHT = 44.5;
  const MIN_TABLE_HEIGHT = 80;
  const tableHeight = Math.max(
    MIN_TABLE_HEIGHT,
    ESTIMATED_HEADER_HEIGHT + visibleRowCount * ESTIMATED_ROW_HEIGHT
  );

  return (
    <Card className="flex flex-col min-h-[150px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle>{t('title')}</CardTitle>
            <CardDescription>
              {t('description')}
            </CardDescription>
          </div>
          <ModelProviderAddButton onSuccess={fetchData} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col">
        {data.length > 0 && table.getRowModel().rows.length === 0 && (
           <div className="p-4 mb-4 bg-yellow-100 text-yellow-800 rounded">
             <p className="font-bold">Debug Info:</p>
             <p>Data loaded ({data.length} items) but table is empty.</p>
           </div>
        )}
        <div className="min-h-[80px] flex flex-col">
           <DataTable table={table} pagination={false} className="flex-none" style={{ height: tableHeight }} />
        </div>
      </CardContent>
    </Card>
  );
}
