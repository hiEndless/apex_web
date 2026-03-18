'use client';

import { UseFormReturn } from 'react-hook-form';
import { NotificationChannelUpdate } from '@/features/settings/types';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface ChannelProps {
  form: UseFormReturn<NotificationChannelUpdate>;
}

const STEPS = [
  '打开钉钉，进入需要接收通知的群聊',
  '点击右上角"..."  ->  群设置  ->  智能群助手  ->  添加机器人',
  '选择"自定义（通过 Webhook 接入自定义服务）"',
  '设置机器人名称，安全设置建议选择"加签"并记录密钥',
  '完成后复制 Webhook 地址，粘贴到下方输入框',
];

export function DingTalkChannel({ form }: ChannelProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">钉钉机器人配置</h3>

      <Alert variant="default" className="bg-muted/50">
        <Info className="h-4 w-4" />
        <AlertTitle className="text-sm font-medium">如何创建钉钉机器人</AlertTitle>
        <AlertDescription>
          <ol className="mt-2 space-y-1 text-xs text-muted-foreground list-decimal list-inside">
            {STEPS.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </AlertDescription>
      </Alert>

      <FormField
        control={form.control}
        name="config.dingtalk_webhook"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Webhook 地址</FormLabel>
            <FormControl>
              <Input placeholder="https://oapi.dingtalk.com/robot/send?access_token=..." {...field} value={field.value || ''} />
            </FormControl>
            <FormDescription>
              从钉钉群的机器人设置中复制 Webhook 地址。
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="config.dingtalk_secret"
        render={({ field }) => (
          <FormItem>
            <FormLabel>签名密钥（可选）</FormLabel>
            <FormControl>
              <Input type="password" placeholder="SEC..." {...field} value={field.value || ''} />
            </FormControl>
            <FormDescription>
              如果安全设置选择了"加签"，请在此粘贴密钥。若使用"关键词"或"IP 白名单"则留空。
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
