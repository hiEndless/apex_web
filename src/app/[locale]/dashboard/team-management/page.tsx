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

const tabs = [
  {
    name: '概况',
    value: 'settings',
    content: (
      <div className="space-y-4">
        {/* 第一行：工作室当前等级和分成比例 */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-primary">
            <span className="font-semibold">当前等级:</span>
            <span>V1 合伙人</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-green-600">
            <span className="font-semibold">分成比例:</span>
            <span>30%</span>
          </div>
        </div>

        {/* 第二行：资产数据卡片 */}
        <div className="grid gap-3 md:grid-cols-3">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 px-4 pt-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">累计分成</CardTitle>
              <Wallet className="h-3.5 w-3.5 text-muted-foreground/70" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-lg font-bold text-primary">12,500 <span className="text-xs font-normal text-muted-foreground">USDT</span></div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 px-4 pt-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">已提现</CardTitle>
              <HandCoins className="h-3.5 w-3.5 text-muted-foreground/70" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-lg font-bold text-green-600">8,000 <span className="text-xs font-normal text-muted-foreground">USDT</span></div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 px-4 pt-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">未提现</CardTitle>
              <PiggyBank className="h-3.5 w-3.5 text-muted-foreground/70" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-lg font-bold text-amber-500">4,500 <span className="text-xs font-normal text-muted-foreground">USDT</span></div>
            </CardContent>
          </Card>
        </div>

        {/* 第三行：套餐金额设置 */}
        <Card className="shadow-sm">
          <CardHeader className="px-4 py-3 pb-2 border-b">
            <CardTitle className="flex items-center gap-1.5 text-sm">
              <Settings2 className="h-4 w-4" />
              下级工作室套餐金额设置
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5 rounded-md border p-3 bg-muted/20">
                <div className="text-xs font-semibold">VIP</div>
                <div className="text-[11px] text-muted-foreground mb-1">默认价格: 200 USDT</div>
                <div className="flex items-center gap-1.5">
                  <input type="number" className="flex h-7 w-full rounded-md border border-input bg-background px-2 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" defaultValue="200" />
                  <span className="text-xs text-muted-foreground">USDT</span>
                </div>
              </div>
              <div className="space-y-1.5 rounded-md border p-3 bg-muted/20">
                <div className="text-xs font-semibold">VIP PLUS</div>
                <div className="text-[11px] text-muted-foreground mb-1">默认价格: 320 USDT</div>
                <div className="flex items-center gap-1.5">
                  <input type="number" className="flex h-7 w-full rounded-md border border-input bg-background px-2 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" defaultValue="320" />
                  <span className="text-xs text-muted-foreground">USDT</span>
                </div>
              </div>
              <div className="space-y-1.5 rounded-md border p-3 bg-muted/20">
                <div className="text-xs font-semibold">VIP PRO</div>
                <div className="text-[11px] text-muted-foreground mb-1">默认价格: 600 USDT</div>
                <div className="flex items-center gap-1.5">
                  <input type="number" className="flex h-7 w-full rounded-md border border-input bg-background px-2 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" defaultValue="600" />
                  <span className="text-xs text-muted-foreground">USDT</span>
                </div>
              </div>
              <div className="space-y-1.5 rounded-md border p-3 bg-muted/20">
                <div className="text-xs font-semibold">团队管理权限</div>
                <div className="text-[11px] text-muted-foreground mb-1">默认价格: 4000 USDT</div>
                <div className="flex items-center gap-1.5">
                  <input type="number" className="flex h-7 w-full rounded-md border border-input bg-background px-2 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" defaultValue="4000" />
                  <span className="text-xs text-muted-foreground">USDT</span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-7 px-3">
                保存价格设置
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  },
  {
    name: '工作室列表',
    value: 'members',
    content: (
      <Card>
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
      <Card>
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
          
          <Tabs defaultValue="members" className="gap-6 flex flex-col">
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
