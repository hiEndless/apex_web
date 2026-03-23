'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { authApi } from '@/api/auth';

export default function ProfileViewPage() {
  const [studioName, setStudioName] = useState('');
  const [updatingStudio, setUpdatingStudio] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handleUpdateStudioName = async () => {
    if (!studioName.trim()) {
      toast.error('请输入工作室名称');
      return;
    }
    try {
      setUpdatingStudio(true);
      await authApi.updateStudioName(studioName.trim());
      toast.success('工作室名称修改成功');
      setStudioName('');
    } catch (err: any) {
      toast.error(err.message || '修改失败');
    } finally {
      setUpdatingStudio(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword) {
      toast.error('请输入当前密码');
      return;
    }
    if (!newPassword) {
      toast.error('请输入新密码');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('新密码长度不能少于 8 位');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('两次输入的新密码不一致');
      return;
    }
    try {
      setUpdatingPassword(true);
      await authApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        revoke_sessions: true
      });
      toast.success('密码修改成功，请重新登录');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Optionally redirect to login, handled by API client on auth failure or can do it here
      setTimeout(() => {
        window.location.href = '/zh/auth/sign-in'; // Basic redirect to login
      }, 1500);
    } catch (err: any) {
      toast.error(err.message || '修改失败');
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className='flex w-full flex-col p-4'>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h3 className="text-2xl font-medium">账户设置</h3>
          <p className="text-sm text-muted-foreground">
            管理您的工作室信息和账户安全
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>修改工作室名称</CardTitle>
            <CardDescription>
              仅工作室管理员可修改工作室名称，长度需在 2 到 128 个字符之间。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="studio-name">新的工作室名称</Label>
              <Input 
                id="studio-name" 
                placeholder="请输入新的工作室名称" 
                value={studioName}
                onChange={(e) => setStudioName(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleUpdateStudioName} disabled={updatingStudio}>
              {updatingStudio && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              保存修改
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>修改密码</CardTitle>
            <CardDescription>
              修改密码后，您当前的所有登录设备都将被登出，需重新登录。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">当前密码</Label>
              <Input 
                id="current-password" 
                type="password" 
                placeholder="请输入当前密码" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">新密码</Label>
              <Input 
                id="new-password" 
                type="password" 
                placeholder="请输入新密码（至少 8 位）" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">确认新密码</Label>
              <Input 
                id="confirm-password" 
                type="password" 
                placeholder="请再次输入新密码" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleUpdatePassword} disabled={updatingPassword}>
              {updatingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              更新密码
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
