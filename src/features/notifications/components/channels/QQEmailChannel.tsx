'use client';

import { UseFormReturn } from 'react-hook-form';
import { NotificationChannelUpdate } from '@/features/settings/types';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface ChannelProps {
  form: UseFormReturn<NotificationChannelUpdate>;
}

export function QQEmailChannel({ form }: ChannelProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">QQ Mail Configuration</h3>
      <p className="text-sm text-muted-foreground">
        Uses QQ SMTP service (smtp.qq.com). You need to generate an authorization code.
      </p>

      <div className="grid grid-cols-2 gap-4 items-start">
        <FormField
          control={form.control}
          name="config.qq_email_address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>QQ Email Address</FormLabel>
              <FormControl>
                <Input placeholder="12345678@qq.com" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="config.qq_auth_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Authorization Code</FormLabel>
              <FormControl>
                <Input type="password" placeholder="abcdefghijklmnop" {...field} value={field.value || ''} />
              </FormControl>
              <FormDescription className="text-xs">
                Get from QQ Mail Settings &gt; Accounts &gt; Generate Auth Code.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="config.email_address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Recipient Address (To)</FormLabel>
            <FormControl>
              <Input placeholder="admin@example.com" {...field} value={field.value || ''} />
            </FormControl>
            <FormDescription>Where to send the notifications.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
