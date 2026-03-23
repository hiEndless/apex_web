'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useLocale } from 'next-intl';

import { ApiError } from '@/api/client';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';

import { NotificationChannel, NotificationChannelUpdate } from '@/features/settings/types';
import { notificationApi } from '@/api/notifications';
import { ChannelConfigForm } from '@/features/notifications/components/ChannelConfigForm';
import { ChannelLogo } from '@/features/notifications/components/ChannelLogo';
import { STATIC_CHANNELS } from './static-channels';

const StatusDot = ({ enabled }: { enabled: boolean }) => (
  <div className="relative flex h-3 w-3 mr-2">
    {enabled ? (
      <>
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 dark:bg-green-500 opacity-75" />
        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 dark:bg-green-400" />
      </>
    ) : (
      <span className="relative inline-flex rounded-full h-3 w-3 bg-gray-300 dark:bg-gray-600" />
    )}
  </div>
);

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  try {
    return JSON.stringify(error);
  } catch {
    return '操作失败';
  }
}

export default function NotificationPage() {
  const locale = useLocale();
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    const initializeChannels = async () => {
      setIsLoading(true);
      try {
        const response = await notificationApi.getChannels();
        const apiChannels = Array.isArray(response) ? response : [];

        const mergedChannels = STATIC_CHANNELS.map(staticChannel => {
          const apiChannel = apiChannels.find(c => c.channel_type === staticChannel.channel_type);
          return apiChannel ? { ...staticChannel, ...apiChannel } : staticChannel;
        });

        setChannels(mergedChannels);
        setSelectedChannelId(mergedChannels[0].id);
      } catch (error) {
        console.error('Failed to fetch channels from API, using static channels:', error);
        setChannels(STATIC_CHANNELS);
        setSelectedChannelId(STATIC_CHANNELS[0].id);
        toast.error(`获取通知渠道失败：${getErrorMessage(error)}`);
      } finally {
        setIsLoading(false);
      }
    };

    initializeChannels();
  }, []);

  const selectedChannel = channels.find(c => c.id === selectedChannelId);

  const handleSave = async (data: NotificationChannelUpdate) => {
    if (!selectedChannel) return;
    setIsSaving(true);
    try {
      const channelToUpdate: NotificationChannel = {
        ...selectedChannel,
        ...data,
        config: { ...selectedChannel.config, ...data.config },
      };

      const response = await notificationApi.upsertChannel(channelToUpdate);
      const updatedChannel = response && typeof response === 'object' ? response : channelToUpdate;

      setChannels(prev => prev.map(c =>
        c.channel_type === updatedChannel.channel_type ? updatedChannel : c
      ));

      toast.success('配置已保存');
    } catch (error) {
      console.error('Failed to save:', error);
      toast.error(`保存失败：${getErrorMessage(error)}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!selectedChannelId) return;
    setIsTesting(true);
    try {
      await notificationApi.testChannel(selectedChannelId);
      toast.success('测试消息发送成功');
    } catch (error) {
      toast.error(`测试发送失败：${getErrorMessage(error)}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleToggleChannel = async (id: string, enabled: boolean) => {
    const channelToToggle = channels.find(c => c.id === id);
    if (!channelToToggle) return;

    setChannels(prev => prev.map(c => c.id === id ? { ...c, is_active: enabled } : c));

    try {
      const response = await notificationApi.upsertChannel({ ...channelToToggle, is_active: enabled });
      const updatedChannel = response && typeof response === 'object' ? response : { ...channelToToggle, is_active: enabled };
      setChannels(prev => prev.map(c => c.channel_type === updatedChannel.channel_type ? updatedChannel : c));
      toast.success(`${channelToToggle.name} 已${enabled ? '开启' : '关闭'}通知`);
    } catch (error) {
      setChannels(prev => prev.map(c => c.id === id ? { ...c, is_active: !enabled } : c));
      toast.error(`更新状态失败：${getErrorMessage(error)}`);
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6 h-full flex flex-col">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">通知设置</h1>
          <p className="text-muted-foreground">
            配置您的消息通知方式与触发规则
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 h-full min-h-[600px]">
          <Card className="w-full md:w-[30%] h-fit dark:bg-black">
            <CardHeader>
              <CardTitle className="text-lg">通知渠道</CardTitle>
              <CardDescription>选择要配置的渠道</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[300px] md:h-[500px]">
                <div className="flex flex-col p-2 gap-2">
                  {channels
                    .filter(c => !(c.channel_type === 'qq_email' && !locale.startsWith('zh')))
                    .map(channel => (
                    <div
                      key={channel.id}
                      onClick={() => setSelectedChannelId(channel.id)}
                      className={`
                        flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200
                        ${selectedChannelId === channel.id
                          ? 'bg-accent text-accent-foreground shadow-sm'
                          : 'hover:bg-muted/50'}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <StatusDot enabled={channel.is_active} />
                        <ChannelLogo type={channel.channel_type} />
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{channel.name}</span>
                        </div>
                      </div>

                      <div onClick={(e) => e.stopPropagation()}>
                        <Switch
                          checked={channel.is_active}
                          onCheckedChange={(c) => handleToggleChannel(channel.id, c)}
                          className="scale-75"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="w-full md:w-[70%] animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col dark:bg-black">
            {selectedChannel ? (
              <ChannelConfigForm
                channel={selectedChannel}
                onSave={handleSave}
                onTest={handleTest}
                isSaving={isSaving}
                isTesting={isTesting}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-12">
                <AlertCircle className="h-12 w-12 mb-4 opacity-20" />
                <p>请从左侧选择一个通知渠道进行配置</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
