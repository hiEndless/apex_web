'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import PageContainer from '@/components/layout/page-container';
import Pricing, { type Plan } from '@/components/shadcn-studio/blocks/pricing-component-07/pricing-component-07';
import { settingsApi } from '@/api/settings';
import { Loader2 } from 'lucide-react';

const defaultPlans: Plan[] = [
  {
    id: 'vip',
    name: 'VIP',
    subtitle: '适合小型工作室',
    priceMonthly: 200,
    accounts: '5 个信号 API，1 个交易 API',
    features: ['5 个信号 API', '1 个交易 API', '信号交易记录', '7×24 客服支持'],
    buttonText: '开通 VIP'
  },
  {
    id: 'vip_plus',
    name: 'VIP PLUS',
    subtitle: '适合成长型工作室',
    priceMonthly: 320,
    accounts: '15 个信号 API，5 个交易 API',
    features: ['15 个信号 API', '5 个交易 API', '信号交易记录', '7×24 客服支持'],
    buttonText: '开通 VIP PLUS'
  },
  {
    id: 'vip_pro',
    name: 'VIP PRO',
    subtitle: '适合大型工作室',
    priceMonthly: 600,
    accounts: '∞ 个信号 API，∞ 个交易 API',
    features: ['∞ 个信号 API', '∞ 个交易 API', '信号交易记录', '专属支持'],
    buttonText: '开通 VIP PRO'
  },
  {
    id: 'team',
    name: '团队管理权限',
    subtitle: '组建自己的工作室团队',
    priceMonthly: 0,
    oneTimePrice: 4000,
    accounts: '组建自己的工作室团队',
    features: ['组建工作室团队', '邀请工作室加入', '查看使用工作室团队全部信号', '工作室管理后台', '专属支持'],
    buttonText: '开通团队管理权限'
  }
];

export default function VipServicePage() {
  const [plans, setPlans] = useState<Plan[]>(defaultPlans);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await settingsApi.getEffectivePricing();
        const items = res?.items || [];
        
        // Merge fetched prices into defaultPlans
        const updatedPlans = defaultPlans.map(plan => {
          if (plan.id === 'team') {
            return plan;
          }
          const serverPlan = items.find(item => item.plan_code === plan.id);
          if (serverPlan && serverPlan.effective_month_price) {
            return {
              ...plan,
              priceMonthly: Number(serverPlan.effective_month_price)
            };
          }
          return plan;
        });
        
        setPlans(updatedPlans);
      } catch (err) {
        toast.error('获取套餐价格失败');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPrices();
  }, []);

  return (
    <PageContainer>
      <div className='space-y-4'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>会员服务</h1>
          <p className='text-muted-foreground mt-1 text-sm'>
            选择适合自己的会员服务
          </p>
        </div>

        {loading ? (
          <div className='flex items-center justify-center py-20'>
            <Loader2 className='text-muted-foreground size-8 animate-spin' />
          </div>
        ) : (
          <Pricing plans={plans} />
        )}
      </div>
    </PageContainer>
  );
}
