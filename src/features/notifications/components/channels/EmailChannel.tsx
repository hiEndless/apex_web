'use client';

import { UseFormReturn } from 'react-hook-form';
import { NotificationChannelUpdate } from '@/features/settings/types';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface ChannelProps {
  form: UseFormReturn<NotificationChannelUpdate>;
}

export function EmailChannel({ form }: ChannelProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">SMTP Server Configuration</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="config.smtp_host"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SMTP Host</FormLabel>
              <FormControl>
                <Input placeholder="smtp.example.com" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="config.smtp_port"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SMTP Port</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="587"
                  {...field}
                  value={field.value || ''}
                  onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="config.smtp_username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="user@example.com" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="config.smtp_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="config.email_from"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sender Address (From)</FormLabel>
            <FormControl>
              <Input placeholder="notifications@example.com" {...field} value={field.value || ''} />
            </FormControl>
            <FormDescription>The email address displayed as the sender.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

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
