import { apiClient } from './client';
import {
  NotificationChannel,
  NotificationChannelType,
} from '@/features/settings/types';

type BackendNotificationMessage = {
  id: number;
  studio_id: number;
  channel: string;
  payload: any;
  status: number;
  created_at: string | null;
  updated_at: string | null;
};

const NOTIFICATION_CHANNELS_BASE = '/api/settings/notification-channels';

const channelTypeToBackendChannel = (
  channelType: NotificationChannelType
): string => {
  switch (channelType) {
    case 'dingtalk_bot':
      return 'dingtalk'; // 默认渠道名要求
    case 'smtp_email':
      return 'smtp_email';
    case 'telegram_bot':
      return 'telegram_bot';
    case 'qq_email':
      return 'qq_email';
    default:
      return channelType;
  }
};

const backendChannelToChannelType = (
  backendChannel: string
): NotificationChannelType | null => {
  const ch = (backendChannel || '').trim().toLowerCase();
  switch (ch) {
    case 'dingtalk':
    case 'dingtalk_bot':
      return 'dingtalk_bot';
    case 'smtp_email':
      return 'smtp_email';
    case 'telegram_bot':
      return 'telegram_bot';
    case 'qq_email':
      return 'qq_email';
    default:
      return null;
  }
};

const displayNameByType: Record<NotificationChannelType, string> = {
  smtp_email: 'Email Notifications',
  telegram_bot: 'Telegram Bot',
  dingtalk_bot: '钉钉机器人',
  qq_email: 'QQ Email',
};

function buildBackendPayloadFromChannel(channel: NotificationChannel): any {
  const cfg = (channel.config || {}) as Record<string, any>;
  const recipients = Array.isArray(channel.recipients) ? channel.recipients : [];
  const triggers = Array.isArray(channel.triggers) ? channel.triggers : [];

  const backendChannel = channelTypeToBackendChannel(channel.channel_type);

  if (backendChannel === 'dingtalk') {
    return {
      // 兼容后端 _extract_dingtalk_payload
      webhook: cfg.dingtalk_webhook || cfg.webhook || cfg.url || '',
      secret: cfg.dingtalk_secret || cfg.secret || '',
      // 也把原始字段带上，便于前端回显
      dingtalk_webhook: cfg.dingtalk_webhook || '',
      dingtalk_secret: cfg.dingtalk_secret || '',
      recipients,
      triggers,
    };
  }

  // 其他渠道：直接把 config 扁平到 payload（前端从 payload 解析回 config）
  return {
    ...cfg,
    recipients,
    triggers,
  };
}

function buildChannelFromBackendMessage(item: BackendNotificationMessage): NotificationChannel | null {
  const channelType = backendChannelToChannelType(item.channel);
  if (!channelType) return null;

  const payload = item.payload || {};
  const recipients = Array.isArray(payload.recipients) ? payload.recipients : [];
  const triggers = Array.isArray(payload.triggers) ? payload.triggers : [];

  let config: any = {};
  if (channelType === 'dingtalk_bot') {
    config = {
      dingtalk_webhook:
        payload.dingtalk_webhook ||
        payload.webhook ||
        payload.url ||
        payload.robot_webhook ||
        '',
      dingtalk_secret:
        payload.dingtalk_secret || payload.secret || payload.sign_secret || payload.key || '',
    };
  } else {
    config = payload.config && typeof payload.config === 'object' ? payload.config : payload;
  }

  return {
    id: String(item.id),
    channel_type: channelType,
    name: displayNameByType[channelType],
    // logo 实际上由 ChannelLogo 根据 channel_type 渲染
    logo: channelType,
    is_active: item.status === 1,
    config,
    recipients,
    triggers,
    created_at: item.created_at || new Date().toISOString(),
    updated_at: item.updated_at || new Date().toISOString(),
  };
}

export const notificationApi = {
  getChannels: async (): Promise<NotificationChannel[]> => {
    const items = await apiClient.get<BackendNotificationMessage[]>(NOTIFICATION_CHANNELS_BASE);
    if (!Array.isArray(items)) return [];
    const mapped = items.map(buildChannelFromBackendMessage).filter(Boolean) as NotificationChannel[];
    return mapped;
  },

  // 创建/更新 + 打开/关闭
  upsertChannel: async (channel: NotificationChannel): Promise<NotificationChannel> => {
    const backendChannel = channelTypeToBackendChannel(channel.channel_type);
    const payload = buildBackendPayloadFromChannel(channel);

    const rawId = (channel.id || '').toString();
    const messageId = Number(rawId);
    const hasId = Number.isFinite(messageId) && messageId > 0;

    let saved: BackendNotificationMessage;

    if (!hasId) {
      saved = await apiClient.post<BackendNotificationMessage>(NOTIFICATION_CHANNELS_BASE, {
        channel: backendChannel,
        payload,
      });
    } else {
      saved = await apiClient.put<BackendNotificationMessage>(
        `${NOTIFICATION_CHANNELS_BASE}/${messageId}`,
        {
          channel: backendChannel,
          payload,
        }
      );
    }

    if (channel.is_active) {
      const opened = await apiClient.put<BackendNotificationMessage>(
        `${NOTIFICATION_CHANNELS_BASE}/${Number(saved.id)}/open`,
        {}
      );
      return (buildChannelFromBackendMessage(opened) as NotificationChannel) || channel;
    }

    const closed = await apiClient.put<BackendNotificationMessage>(
      `${NOTIFICATION_CHANNELS_BASE}/${Number(saved.id)}/close`,
      {}
    );
    return (buildChannelFromBackendMessage(closed) as NotificationChannel) || channel;
  },

  testChannel: (id: string) => {
    const messageId = Number(id);
    return apiClient.post<void>(
      `${NOTIFICATION_CHANNELS_BASE}/${messageId}/test`,
      {},
    );
  },
};