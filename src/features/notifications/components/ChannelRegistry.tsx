'use client';

import { NotificationChannelType, NotificationChannelUpdate } from '@/features/settings/types';
import { UseFormReturn } from 'react-hook-form';
import { EmailChannel } from './channels/EmailChannel';
import { TelegramChannel } from './channels/TelegramChannel';
import { DingTalkChannel } from './channels/DingTalkChannel';
import { QQEmailChannel } from './channels/QQEmailChannel';

export const ChannelRegistry: Record<NotificationChannelType, React.ComponentType<{ form: UseFormReturn<NotificationChannelUpdate> }>> = {
  'smtp_email': EmailChannel,
  'telegram_bot': TelegramChannel,
  'dingtalk_bot': DingTalkChannel,
  'qq_email': QQEmailChannel,
};

export const ChannelLabels: Record<NotificationChannelType, string> = {
  'smtp_email': 'Email',
  'telegram_bot': 'Telegram',
  'dingtalk_bot': 'DingTalk',
  'qq_email': 'QQ Email',
};

export const ChannelIcons: Record<NotificationChannelType, string> = {
  'smtp_email': 'mail',
  'telegram_bot': 'send',
  'dingtalk_bot': 'webhook',
  'qq_email': 'mail',
};
