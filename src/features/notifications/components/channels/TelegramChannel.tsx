'use client';

import { UseFormReturn } from 'react-hook-form';
import { NotificationChannelUpdate } from '@/features/settings/types';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface ChannelProps {
  form: UseFormReturn<NotificationChannelUpdate>;
}

export function TelegramChannel({ form }: ChannelProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Telegram Bot Configuration</h3>

      <FormField
        control={form.control}
        name="config.telegram_bot_token"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bot Token</FormLabel>
            <FormControl>
              <Input type="password" placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11" {...field} value={field.value || ''} />
            </FormControl>
            <FormDescription>
              Create a bot via <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="underline text-primary">@BotFather</a> and paste the token here.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="config.channel_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Chat ID / Channel Username</FormLabel>
            <FormControl>
              <Input placeholder="@my_channel_name or -1001234567890" {...field} value={field.value || ''} />
            </FormControl>
            <FormDescription>
              The username of the channel (e.g. @my_channel) or the numeric Chat ID.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
