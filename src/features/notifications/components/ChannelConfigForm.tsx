'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { NotificationChannel, NotificationChannelUpdate } from '@/features/settings/types';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Send, AlertTriangle } from 'lucide-react';
import { ChannelRegistry } from './ChannelRegistry';
import { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface ChannelConfigFormProps {
  channel: NotificationChannel;
  onSave: (data: NotificationChannelUpdate) => Promise<void>;
  onTest: () => Promise<void>;
  isSaving: boolean;
  isTesting: boolean;
}

export function ChannelConfigForm({ channel, onSave, onTest, isSaving, isTesting }: ChannelConfigFormProps) {
  const form = useForm<NotificationChannelUpdate>({
    defaultValues: {
      is_active: channel.is_active,
      config: channel.config || {},
      recipients: channel.recipients || [],
      triggers: channel.triggers || [],
    },
  });

  useEffect(() => {
    form.reset({
      is_active: channel.is_active,
      config: channel.config || {},
      recipients: channel.recipients || [],
      triggers: channel.triggers || [],
    });
  }, [channel, form]);

  const ChannelComponent = ChannelRegistry[channel.channel_type];

  if (!ChannelComponent) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
        <AlertTriangle className="h-8 w-8 mb-2 text-yellow-500 dark:text-yellow-400" />
        <p>Configuration component for type &quot;{channel.channel_type}&quot; not found.</p>
      </div>
    );
  }

  return (
    <Form form={form} onSubmit={form.handleSubmit(onSave)} className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{channel.name} 配置</CardTitle>
            <CardDescription>
              上次更新: {new Date(channel.updated_at).toLocaleDateString()}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="space-y-6 pt-6 flex-1 overflow-y-auto">
        <ChannelComponent form={form} />
      </CardContent>

      <Separator className="mt-auto" />

      <div className="flex items-center justify-between p-6">
        <Button
          type="button"
          variant="outline"
          onClick={onTest}
          disabled={isTesting || !form.watch('is_active')}
        >
          {isTesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          测试连接
        </Button>

        <Button type="submit" disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          保存配置
        </Button>
      </div>
    </Form>
  );
}
