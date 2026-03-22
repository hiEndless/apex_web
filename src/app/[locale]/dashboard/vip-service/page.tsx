'use client';

import PageContainer from '@/components/layout/page-container';
import Pricing, { type Plan } from '@/components/shadcn-studio/blocks/pricing-component-07/pricing-component-07';


const plans: Plan[] = [
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
    id: 'vip plus',
    name: 'VIP PLUS',
    subtitle: '适合成长型工作室',
    priceMonthly: 320,
    accounts: '15 个信号 API，5 个交易 API',
    features: ['15 个信号 API', '5 个交易 API', '信号交易记录', '7×24 客服支持'],
    buttonText: '开通 VIP PLUS'
  },
  {
    id: 'vip pro',
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
  return (
    <PageContainer>
      <div className='space-y-4'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>会员服务</h1>
          <p className='text-muted-foreground mt-1 text-sm'>
            选择适合自己的会员服务
          </p>
        </div>

        <Pricing plans={plans} />
      </div>
    </PageContainer>
  );
}
