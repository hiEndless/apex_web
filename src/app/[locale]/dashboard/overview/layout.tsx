import PageContainer from '@/components/layout/page-container';
import { PnlSummaryCards } from '@/features/overview/components/pnl-summary-cards';
import { RankingList } from '@/features/overview/components/ranking-list';
import { TimelineLog } from '@/features/overview/components/timeline-log';
import React from 'react';

export default function OverViewLayout({
  sales,
  pie_stats,
  bar_stats,
  area_stats
}: {
  sales: React.ReactNode;
  pie_stats: React.ReactNode;
  bar_stats: React.ReactNode;
  area_stats: React.ReactNode;
}) {
  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-center justify-between space-y-2'>
          <div className='space-y-1'>
            <h2 className='text-2xl font-bold tracking-tight'>
              你好，欢迎回来 👋
            </h2>
            <p className='text-sm text-muted-foreground'>
              页面数据每 12 小时更新一次
            </p>
          </div>
        </div>

        {/* Row 1: 4 period profit cards */}
        <PnlSummaryCards />

        {/* Row 2: Left (Rankings) 66.67%, Right (Timeline) 33.33% */}
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
          {/* Left side: 4 rankings in a 2x2 grid */}
          <div className='col-span-2 grid grid-cols-1 gap-4 md:grid-cols-2 h-full'>
            <div className='min-h-[200px]'>
              <RankingList title="今日收益" days={1} type="pnl" />
            </div>
            <div className='min-h-[200px]'>
              <RankingList title="最近7天收益" days={7} type="pnl" />
            </div>
            <div className='min-h-[200px]'>
              <RankingList title="今日交易次数" days={1} type="trade_count" />
            </div>
            <div className='min-h-[200px]'>
              <RankingList title="最近7天交易次数" days={7} type="trade_count" />
            </div>
          </div>
          
          {/* Right side: Timeline log */}
          <div className='col-span-1 min-h-[416px] lg:h-full relative'>
            <div className='lg:absolute lg:inset-0 h-full'>
              <TimelineLog />
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
