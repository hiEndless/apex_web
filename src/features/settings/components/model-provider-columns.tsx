'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ModelProvider } from '../types';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { settingsApi } from '@/api/settings';
import { AlertTriangle, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import Image from 'next/image';

const PROVIDER_LOGO_SRC: Record<string, string> = {
  openai: '/model_providers/openai.png',
  azure_openai: '/model_providers/azure.png',
  anthropic: '/model_providers/openai-compatible.png', // Fallback as no specific logo found
  deepseek: '/model_providers/deepseek.png',
  ollama: '/model_providers/ollama.png',
  gemini: '/model_providers/google.png',
  siliconflow: '/model_providers/siliconflow.png',
  openrouter: '/model_providers/openrouter.png',
  dashscope: '/model_providers/dashscope.png',
};

const ProviderCell = ({ provider }: { provider: string }) => {
  const providerKey = (provider || '').trim().toLowerCase();
  // Try direct match, then check if it contains key words, default to openai-compatible if likely compatible
  let logoSrc = PROVIDER_LOGO_SRC[providerKey];
  
  if (!logoSrc) {
     if (providerKey.includes('gpt') || providerKey.includes('openai')) logoSrc = '/model_providers/openai-compatible.png';
  }

  return (
    <div className="flex items-center gap-2">
      {logoSrc && (
        <Image
          src={logoSrc}
          alt={`${providerKey} logo`}
          width={16}
          height={16}
          className="shrink-0"
        />
      )}
      <span className="uppercase font-medium">{provider}</span>
    </div>
  );
};

const ActiveSwitchCell = ({ row, t, onRefresh }: { row: ModelProvider; t: any; onRefresh: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleToggle = (checked: boolean) => {
    if (!checked) {
      setShowConfirm(true);
    } else {
      updateStatus(true);
    }
  };

  const updateStatus = async (isActive: boolean) => {
    setLoading(true);
    try {
      await settingsApi.updateModelProvider(row.id, { is_active: isActive });
      toast.success(isActive ? 'Provider Activated' : 'Provider Deactivated');
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
        title={t('Modal.deactivateModelProvider')}
        description={t('Modal.deactivateModelProviderDescription')}
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        t={t}
      >
        <div className="pt-4 space-y-4">
          <div className="flex w-full items-center justify-end space-x-2">
            <Button disabled={loading} variant="outline" onClick={() => setShowConfirm(false)}>
              {t('Modal.cancel')}
            </Button>
            <Button disabled={loading} onClick={() => updateStatus(false)}>
              {t('Modal.confirmAndDeactivate')}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

const DeleteCell = ({ row, onRefresh, t }: { row: ModelProvider; onRefresh: () => void; t: any }) => {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await settingsApi.deleteModelProvider(row.id);
      toast.success('Provider Deleted');
      onRefresh();
    } catch (error) {
      toast.error('Failed to delete provider');
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
        title={t('Modal.deleteModelProvider')}
        description={t('Modal.deleteModelProviderDescription')}
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        t={t}
      >
        <div className="pt-4 space-y-4">
           <div className="flex items-start p-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-300" role="alert">
              <AlertTriangle className="flex-shrink-0 inline w-5 h-5 me-3" />
              <div>
                <span className="font-medium">{t('Modal.warning')}</span> {t('Modal.deleteModelProviderWarning')}
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

export const getModelProviderColumns = (t: any, onRefresh: () => void): ColumnDef<ModelProvider>[] => [
  {
    accessorKey: 'provider',
    header: t('provider'),
    cell: ({ row }) => <ProviderCell provider={row.original.provider} />,
    size: 130,
  },
  {
    accessorKey: 'base_url',
    header: t('baseUrl'),
    cell: ({ row }) => <span className="text-xs font-mono text-muted-foreground">{row.original.base_url}</span>,
    size: 200,
  },
  {
    accessorKey: 'has_api_key',
    header: t('apiKey'),
    cell: ({ row }) => (
      <span className="text-xs">
        {row.original.has_api_key ? (
          <span className="flex items-center text-green-600 gap-1"><CheckCircle2 className="w-3 h-3" /> {t('configured')}</span>
        ) : (
          <span className="flex items-center text-yellow-600 gap-1"><AlertTriangle className="w-3 h-3" /> {t('missing')}</span>
        )}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: 'created_at',
    header: t('createdAt'),
    cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
    size: 100,
  },
  {
    accessorKey: 'availability_status',
    header: t('status'),
    cell: ({ row }) => {
        const status = row.original.availability_status;
        if (status === 'ok') return <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {t('ok')}</span>;
        if (status === 'unavailable') return <span className="text-xs text-red-600 flex items-center gap-1"><XCircle className="w-3 h-3" /> {t('error')}</span>;
        return <span className="text-xs text-muted-foreground">Unknown</span>;
    },
    size: 80,
  },
  {
    id: 'active',
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
