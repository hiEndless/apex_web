'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ExchangeAccount } from '../types';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { settingsApi } from '@/api/settings';
import { AlertTriangle, Trash2 } from 'lucide-react';
import Image from 'next/image';
import {
  clearActiveExchangeFromLocalStorage,
  getActiveExchangeFromLocalStorage,
  setActiveExchangeToLocalStorage
} from '@/lib/active-exchange';

// 交易所 logo 映射表：logo 放在 public/exchange_logo 下（文件名建议与 exchange 小写一致）
// 新增交易所时：新增图片文件 + 在这里补一行映射，避免找不到资源导致页面显示异常/空占位
const EXCHANGE_LOGO_SRC: Record<string, string> = {
  binance: '/exchange_logo/binance.png',
  okx: '/exchange_logo/okx.png',
};

// 交易所名称单元格：在名称左侧展示交易所 logo
const ExchangeCell = ({ exchange }: { exchange: string }) => {
  const exchangeKey = (exchange || '').trim().toLowerCase();
  const logoSrc = EXCHANGE_LOGO_SRC[exchangeKey];

  return (
    <div className="flex items-center gap-2">
      {logoSrc && (
        <Image
          src={logoSrc}
          alt={`${exchangeKey} logo`}
          width={16}
          height={16}
          className="shrink-0"
        />
      )}
      <span className="uppercase font-medium">{exchange}</span>
    </div>
  );
};

const ActiveSwitchCell = ({ row, t, onRefresh }: { row: ExchangeAccount; t: any; onRefresh: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleToggle = (checked: boolean) => {
    if (checked) {
      setShowConfirm(true);
    } else {
        updateStatus(false);
    }
  };

  const updateStatus = async (isActive: boolean) => {
    setLoading(true);
    try {
      await settingsApi.updateExchangeAccount(row.id, { is_active: isActive });
      // 中文说明：后端保证同一用户“同一时刻只有一个交易所账户激活”，前端同步写入 LocalStorage 作为跨页面选择来源。
      if (isActive) {
        setActiveExchangeToLocalStorage(row.exchange);
      } else {
        const current = getActiveExchangeFromLocalStorage();
        if (current && current === row.exchange) {
          clearActiveExchangeFromLocalStorage();
        }
      }
      toast.success(isActive ? 'API Activated' : 'API Deactivated');
      onRefresh();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <div className="flex items-center space-x-2">
        <Switch
          checked={row.is_active}
          onCheckedChange={handleToggle}
          disabled={loading}
        />
        <span className={row.is_active ? 'text-green-600 font-medium text-xs' : 'text-muted-foreground text-xs'}>
          {row.is_active ? t('active') : t('inactive')}
        </span>
      </div>
      <Modal
        title={t('Modal.activateExchangeApi')}
        description={t('Modal.activateExchangeApiDescription')}
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        t={t}
      >
        <div className="pt-4 space-y-4">
           <div className="flex items-start p-4 text-sm text-yellow-800 rounded-lg bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300" role="alert">
              <AlertTriangle className="flex-shrink-0 inline w-5 h-5 me-3" />
              <div>
                <span className="font-medium">{t('Modal.warning')}</span> {t('Modal.activateExchangeApiWarning')}
              </div>
            </div>
          <div className="flex w-full items-center justify-end space-x-2">
            <Button disabled={loading} variant="outline" onClick={() => setShowConfirm(false)}>
              {t('Modal.cancel')}
            </Button>
            <Button disabled={loading} onClick={() => updateStatus(true)}>
              {t('Modal.confirmAndActivate')}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

const DeleteCell = ({ row, onRefresh, t }: { row: ExchangeAccount; onRefresh: () => void; t: any }) => {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await settingsApi.deleteExchangeAccount(row.id);
      // 中文说明：删除当前激活账户时，需要清理本地的激活交易所，避免其它页面继续用旧值请求后端。
      if (row.is_active) {
        const current = getActiveExchangeFromLocalStorage();
        if (current && current === row.exchange) {
          clearActiveExchangeFromLocalStorage();
        }
      }
      toast.success('API Deleted');
      onRefresh();
    } catch (error) {
      toast.error('Failed to delete API');
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-destructive hover:text-destructive/90"
        onClick={() => setShowConfirm(true)}
        disabled={loading}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <Modal
        title={t('Modal.deleteExchangeApi')}
        description={t('Modal.deleteExchangeApiDescription')}
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        t={t}
      >
        <div className="pt-4 space-y-4">
           <div className="flex items-start p-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-300" role="alert">
              <AlertTriangle className="flex-shrink-0 inline w-5 h-5 me-3" />
              <div>
                <span className="font-medium">{t('Modal.warning')}</span> {t('Modal.deleteExchangeApiWarning')}
              </div>
            </div>
          <div className="flex w-full items-center justify-end space-x-2">
            <Button disabled={loading} variant="outline" onClick={() => setShowConfirm(false)}>
              {t('Modal.cancel')}
            </Button>
            <Button disabled={loading} variant="destructive" onClick={handleDelete}>
              {t('Modal.delete')}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export const getColumns = (t: any, onRefresh: () => void): ColumnDef<ExchangeAccount>[] => [
  {
    accessorKey: 'exchange',
    header: t('exchange'),
    cell: ({ row }) => <ExchangeCell exchange={row.original.exchange} />,
    size: 130,
  },
  {
    accessorKey: 'api_label',
    header: t('label'),
    cell: ({ row }) => row.original.api_label || '-',
    size: 120,
  },
  {
    accessorKey: 'api_key_masked',
    header: t('apiKey'),
    cell: ({ row }) => <span className="font-mono text-xs">{row.original.api_key_masked}</span>,
    size: 160,
  },
  {
    accessorKey: 'created_at',
    header: t('createdAt'),
    cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
    size: 100,
  },
  {
    accessorKey: 'is_read_only',
    header: t('permissions'),
    cell: ({ row }) => (
      <span className="text-xs">
        {row.original.is_read_only ? t('readOnly') : t('trading')}
      </span>
    ),
    size: 60,
  },
  {
    id: 'actions',
    header: t('activeStatus'),
    cell: ({ row }) => <ActiveSwitchCell row={row.original} t={t} onRefresh={onRefresh} />,
    size: 120,
  },
  {
    id: 'delete',
    header: t('actions'),
    cell: ({ row }) => <DeleteCell row={row.original} onRefresh={onRefresh} t={t} />,
    size: 40,
    enableResizing: false,
  },
];
