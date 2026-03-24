'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { authApi } from '@/api/auth';
import { toast } from 'sonner';

export function InviteCodeDisplay() {
  const [inviteCode, setInviteCode] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchInviteCode = async () => {
      try {
        setLoading(true);
        const res = await authApi.getTeamInviteCode();
        if (res?.team_invite_code) {
          setInviteCode(res.team_invite_code);
        }
      } catch (error) {
        console.error('Failed to fetch team invite code:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInviteCode();
  }, []);

  const handleCopy = () => {
    if (!inviteCode) return;
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    toast.success('邀请码已复制到剪贴板');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-lg">团队邀请码</CardTitle>
          <CardDescription>
            加载中...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!inviteCode) {
    return null; // 如果没有邀请码则不展示
  }

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="text-lg">团队邀请码</CardTitle>
        <CardDescription>
          将此邀请码分享给其他工作室，当他们注册时填写此邀请码，即可成为你的工作室团队成员。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 max-w-md">
          <Input 
            value={inviteCode} 
            readOnly 
            className="font-mono text-center tracking-wider bg-muted" 
          />
          <Button 
            variant="secondary" 
            onClick={handleCopy}
            className="shrink-0 w-24 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 dark:hover:text-blue-300 transition-colors"
          >
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-green-600 dark:text-green-400">已复制</span>
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                <span>复制</span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
