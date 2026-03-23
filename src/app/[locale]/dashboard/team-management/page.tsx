'use client';

import { useEffect, useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BadgeCheck, Wallet, HandCoins, PiggyBank, Settings2 } from 'lucide-react';
import { getSessionDisplay } from '@/lib/auth-session';
import { PricingSettings } from './pricing-settings';

const tabs = [
  {
    name: '概况',
    value: 'settings',
    content: (
      <div className="space-y-4">
        {/* 第一行：工作室当前等级、分成比例和资产数据 */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-primary">
            <span className="font-semibold">Level 3</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-green-600">
            <span className="font-semibold">分成比例:</span>
            <span>30%</span>
          </div>
          
          {/* 资产数据标签 */}
          <div className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-red-500">
            <span className="font-semibold text-muted-foreground">累计分成:</span>
            <span className="font-bold">12,500 <span className="text-[10px] font-normal">USDT</span></span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-green-600">
            <span className="font-semibold text-muted-foreground">已提现:</span>
            <span className="font-bold">8,000 <span className="text-[10px] font-normal">USDT</span></span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-amber-500">
            <span className="font-semibold text-muted-foreground">未提现:</span>
            <span className="font-bold">4,500 <span className="text-[10px] font-normal">USDT</span></span>
          </div>
        </div>

        <PricingSettings />
      </div>
    )
  },
  {
    name: '工作室列表',
    value: 'members',
    content: (
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>工作室列表</CardTitle>
          <CardDescription>
            管理工作室的所有成员及其权限。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
            <p className="text-sm text-muted-foreground">工作室列表内容区</p>
          </div>
        </CardContent>
      </Card>
    )
  },
  {
    name: '分成流水',
    value: 'orders',
    content: (
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>分成流水</CardTitle>
          <CardDescription>
            查看工作室的所有分成流水记录。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
            <p className="text-sm text-muted-foreground">分成流水内容区</p>
          </div>
        </CardContent>
      </Card>
    )
  },
];

export default function ExclusivePage() {
  const [organization, setOrganization] = useState<{ name: string | null }>({ name: '' });

  useEffect(() => {
    const session = getSessionDisplay();
    setOrganization({ name: session.studio_name || '未命名工作室' });
  }, []);

  return (
      <PageContainer>
        <div className='space-y-6'>
          <div>
            <h1 className='flex items-center gap-2 text-2xl font-bold tracking-tight'>
              <BadgeCheck className='h-7 w-7 text-green-600' />
              团队管理
            </h1>
            <p className='text-muted-foreground'>
              你好, {' '}
              <span className='font-semibold'>{organization?.name}</span>!
              管理你的工作室团队
            </p>
          </div>
          
          <Tabs defaultValue="settings" className="gap-6 flex flex-col">
            <TabsList className="bg-transparent gap-2 p-0 h-auto justify-start border-none">
              {tabs.map(tab => (
                <TabsTrigger 
                  key={tab.value} 
                  value={tab.value}
                  className='rounded-lg px-3 py-1.5 text-sm font-medium data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-white text-muted-foreground hover:text-foreground transition-colors duration-300 data-[state=active]:shadow-none'
                >
                  {tab.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {tabs.map(tab => (
              <TabsContent key={tab.value} value={tab.value} className="mt-0">
                {tab.content}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </PageContainer>
  );
}
