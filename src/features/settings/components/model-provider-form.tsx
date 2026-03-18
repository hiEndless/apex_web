'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Form } from '@/components/ui/form';
import { FormInput } from '@/components/forms/form-input';
import { FormSelect } from '@/components/forms/form-select';
import { settingsApi } from '@/api/settings';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

const formSchema = z.object({
  provider: z.string().min(1, 'Please select a provider'),
  base_url: z.string().min(1, 'Base URL is required'),
  api_key: z.string().optional(),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface ModelProviderAddButtonProps {
  onSuccess: () => void;
}

const PROVIDER_OPTIONS = [
  { label: 'OpenAI', value: 'openai' },
  { label: 'Azure OpenAI', value: 'azure_openai' },
  { label: 'Anthropic', value: 'anthropic' },
  { label: 'DeepSeek', value: 'deepseek' },
  { label: 'Ollama', value: 'ollama' },
  { label: 'Gemini', value: 'gemini' },
  { label: 'SiliconFlow', value: 'siliconflow' },
  { label: 'DashScope', value: 'dashscope' },
  { label: 'OpenRouter', value: 'openrouter' },
  { label: 'Other', value: 'other' },
];

export function ModelProviderAddButton({ onSuccess }: ModelProviderAddButtonProps) {
  const t = useTranslations('AccountSettingsPage.modelProviderForm');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      provider: 'openai',
      base_url: 'https://api.openai.com/v1',
      api_key: '',
      is_active: true,
    },
  });

  const watchedProvider = form.watch('provider');

  useEffect(() => {
    if (watchedProvider) {
      let baseUrl = '';
      switch (watchedProvider) {
        case 'openai':
          baseUrl = 'https://api.openai.com/v1';
          break;
        case 'anthropic':
          baseUrl = 'https://api.anthropic.com';
          break;
        case 'deepseek':
          baseUrl = 'https://api.deepseek.com/v1';
          break;
        case 'siliconflow':
          baseUrl = 'https://api.siliconflow.cn/v1';
          break;
        case 'ollama':
          baseUrl = 'http://localhost:11434';
          break;
        case 'siliconflow':
          baseUrl = 'https://api.siliconflow.cn/v1';
          break;
        case 'dashscope':
          baseUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
          break;
        case 'openrouter':
          baseUrl = 'https://openrouter.ai/api/v1';
          break;
        default:
          break;
      }
      if (baseUrl) {
        form.setValue('base_url', baseUrl);
      }
    }
  }, [watchedProvider, form]);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      await settingsApi.createModelProvider({
        provider: values.provider,
        base_url: values.base_url,
        api_key: values.api_key || undefined,
        is_active: values.is_active,
      });
      toast.success('Model Provider added successfully');
      setOpen(false);
      form.reset();
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add provider');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> {t('addButton')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('dialog.title')}</DialogTitle>
          <DialogDescription>
            {t('dialog.description')}
          </DialogDescription>
        </DialogHeader>
        <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormSelect
              control={form.control}
              name="provider"
              label={t('form.provider')}
              placeholder="Select provider"
              options={PROVIDER_OPTIONS}
            />
            <FormInput
              control={form.control}
              name="base_url"
              label={t('form.baseUrl')}
              placeholder="https://api.openai.com/v1"
            />
            <FormInput
              control={form.control}
              name="api_key"
              label={t('form.apiKey')}
              placeholder="sk-..."
              type="password"
            />
            
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? 'Adding...' : t('form.addButton')}
              </Button>
            </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
