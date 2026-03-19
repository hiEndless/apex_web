'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ExchangeAccount } from '../types';
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
} from '@/lib/active-exchange';

const EXCHANGE_LOGO_SRC: Record<string, string> = {
  binance: '/exchange_logo/binance.png',
  okx: '/exchange_logo/okx.png',
};

const ExchangeCell = ({ platform }: { platform: string }) => {
  const key = (platform || '').trim().toLowerCase();
  const logoSrc = EXCHANGE_LOGO_SRC[key];

  return (
    <div className="flex items-center gap-2">
      {logoSrc && (
        <Image
          src={logoSrc}
          alt={`${key} logo`}
          width={16}
          height={16}
          className="shrink-0"
        />
      )}
      <span className="font-medium uppercase">{key}</span>
    </div>
  );
};

const DeleteCell = ({
  row,
  onRefresh,
  t,
}: {
  row: ExchangeAccount;
  onRefresh: () => void;
  t: (key: string) => string;
}) => {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await settingsApi.deleteExchangeAccount(row.id);
      const current = getActiveExchangeFromLocalStorage();
      if (current && current === row.platform) {
        clearActiveExchangeFromLocalStorage();
      }
      toast.success(t('deleteSuccess'));
      onRefresh();
    } catch {
      toast.error(t('deleteFailed'));
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
        className="text-destructive hover:text-destructive/90 h-7 w-7"
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
      >
        <div className="space-y-4 pt-4">
          <div
            className="flex items-start rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-gray-800 dark:text-red-300"
            role="alert"
          >
            <AlertTriangle className="me-3 inline h-5 w-5 flex-shrink-0" />
            <div>
              <span className="font-medium">{t('Modal.warning')}</span>{' '}
              {t('Modal.deleteExchangeApiWarning')}
            </div>
          </div>
          <div className="flex w-full items-center justify-end space-x-2">
            <Button
              disabled={loading}
              variant="outline"
              onClick={() => setShowConfirm(false)}
            >
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

export const getColumns = (
  t: (key: string) => string,
  onRefresh: () => void
): ColumnDef<ExchangeAccount>[] => [
  {
    accessorKey: 'platform',
    header: t('exchange'),
    cell: ({ row }) => <ExchangeCell platform={row.original.platform} />,
    size: 130,
  },
  {
    accessorKey: 'api_name',
    header: t('label'),
    cell: ({ row }) => row.original.api_name || '-',
    size: 120,
  },
  {
    accessorKey: 'uid',
    header: t('uid'),
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.uid || '-'}</span>
    ),
    size: 140,
  },
  {
    accessorKey: 'usdt',
    header: t('usdtBalance'),
    cell: ({ row }) => (
      <span className="text-xs tabular-nums">
        {typeof row.original.usdt === 'number' ? row.original.usdt.toFixed(4) : '-'}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: 'created_at',
    header: t('createdAt'),
    cell: ({ row }) =>
      row.original.created_at
        ? new Date(row.original.created_at).toLocaleString()
        : '-',
    size: 160,
  },
  {
    accessorKey: 'is_readonly',
    header: t('role'),
    cell: ({ row }) => (
      <span
        className={
          row.original.is_readonly
            ? 'text-xs text-green-600 font-medium'
            : 'text-xs text-foreground font-medium'
        }
      >
        {row.original.is_readonly ? t('signal') : t('trading')}
      </span>
    ),
    size: 80,
  },
  {
    accessorKey: 'status',
    header: t('status'),
    cell: ({ row }) => (
      <span className="text-xs">
        {row.original.status === 1 ? t('ok') : t('error')}
      </span>
    ),
    size: 72,
  },
  {
    id: 'delete',
    header: t('actions'),
    cell: ({ row }) => (
      <DeleteCell row={row.original} onRefresh={onRefresh} t={t} />
    ),
    size: 48,
    enableResizing: false,
  },
];
