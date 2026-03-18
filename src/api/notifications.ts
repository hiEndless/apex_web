import { apiClient } from './client';
import {
  NotificationChannel,
  NotificationChannelUpdate,
} from '@/features/settings/types';

export const notificationApi = {
  getChannels: () => {
    return apiClient.get<NotificationChannel[]>('/api/settings/notification_channels');
  },

  // Upsert: Create or update a channel based on its type
  upsertChannel: (channel: NotificationChannel) => {
    return apiClient.post<NotificationChannel>('/api/settings/notification_channels', channel);
  },

  testChannel: (id: string) => {
    return apiClient.post<void>(`/api/notifications/channels/${id}/test`, {});
  },
};