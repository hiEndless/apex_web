'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { FormInput } from '@/components/forms/form-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ApiError } from '@/api/client';
import { settingsApi } from '@/api/settings';
import { toast } from 'sonner';
import { Plus, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

const EXCHANGE_IP_WHITELIST =
  process.env.NEXT_PUBLIC_IP_WHITELIST ?? '0.0.0.0';

const EXCHANGES = [
  { label: 'OKX', value: 'okx', logo: '/exchange_logo/okx.png' },
  // { label: 'Binance', value: 'binance', logo: '/exchange_logo/binance.png' },
] as const;

const formSchema = z.object({
  exchange: z.string().min(1, 'Please select an exchange'),
  api_key: z.string().min(1, 'API Key is required'),
  api_secret: z.string().min(1, 'Secret Key is required'),
  api_passphrase: z.string().min(1, 'Passphrase is required'),
  api_label: z.string().optional(),
  is_read_only: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface ExchangeAddButtonProps {
  onSuccess: () => void;
}

export function ExchangeAddButton({ onSuccess }: ExchangeAddButtonProps) {
  const t = useTranslations('AccountSettingsPage.exchangeForm');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      exchange: 'okx',
      api_key: '',
      api_secret: '',
      api_passphrase: '',
      api_label: '',
      is_read_only: true,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const apiName = (values.api_label || '').trim() || values.exchange;
      await settingsApi.createExchangeAccount({
        platform: values.exchange,
        is_readonly: values.is_read_only,
        api_name: apiName,
        passphrase: values.api_passphrase,
        api_key: values.api_key,
        secret_key: values.api_secret,
        flag: 0,
      });
      toast.success('Exchange API added successfully');
      setOpen(false);
      form.reset({
        exchange: 'okx',
        api_key: '',
        api_secret: '',
        api_passphrase: '',
        api_label: '',
        is_read_only: true
      });
      onSuccess();
    } catch (error) {
      const msg =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Failed to add API';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          {t('addButton')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>{t('dialog.title')}</DialogTitle>
          <DialogDescription>{t('dialog.description')}</DialogDescription>
          <div
            className="mt-3 flex gap-2 rounded-lg border-0 bg-amber-50 px-3 py-2 text-xs text-foreground/90 dark:bg-amber-950/25 dark:text-amber-50/95"
            role="note"
          >
            <span className="shrink-0 select-none text-sm leading-snug" aria-hidden>
              💡
            </span>
            <p className="min-w-0 leading-relaxed">
              {t('dialog.ipWhitelistNote', { ip: EXCHANGE_IP_WHITELIST })}
            </p>
          </div>
        </DialogHeader>
        <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="exchange"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('form.exchange')}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select exchange" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {EXCHANGES.map((ex) => (
                      <SelectItem key={ex.value} value={ex.value}>
                        <div className="flex items-center gap-2">
                          <Image
                            src={ex.logo}
                            alt={ex.label}
                            width={16}
                            height={16}
                            className="shrink-0"
                          />
                          <span>{ex.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormInput
            control={form.control}
            name="api_label"
            label={t('form.label')}
            placeholder="e.g. My Main Account"
          />

          <FormField
            control={form.control}
            name="is_read_only"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('form.permissions')}</FormLabel>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={() => field.onChange(true)}
                    />
                    <span className="text-sm">{t('form.readOnly')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={!field.value}
                      onCheckedChange={() => field.onChange(false)}
                    />
                    <span className="text-sm">{t('form.trading')}</span>
                  </label>
                </div>
              </FormItem>
            )}
          />

          <FormInput
            control={form.control}
            name="api_key"
            label={t('form.apiKey')}
            placeholder="Enter API Key"
          />
          <FormInput
            control={form.control}
            name="api_secret"
            label={t('form.apiSecret')}
            placeholder="Enter API Secret"
            type="password"
          />
          <FormInput
            control={form.control}
            name="api_passphrase"
            label={t('form.passphrase')}
            placeholder="Enter Passphrase"
            type="password"
          />

          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? '...' : t('form.addButton')}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
