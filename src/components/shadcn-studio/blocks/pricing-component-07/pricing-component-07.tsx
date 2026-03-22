'use client'

import { useState } from 'react'

import { CheckIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import { PaymentMethodDialog } from '@/features/vip-service/components/payment-method-dialog'

import { cn } from '@/lib/utils'
import { MotionPreset } from '@/components/ui/motion-preset'

export type Plan = {
  id: string
  name: string
  subtitle: string
  /** 订阅月价（USDT）；一次性方案可为 0 */
  priceMonthly: number
  /** 若设置：固定金额一次性支付，不参与月付/年付 */
  oneTimePrice?: number
  accounts: string
  features: string[]
  buttonText: string
}

const YEARLY_DISCOUNT = 0.8

function formatYuan(amount: number) {
  return `${amount} USDT`
}

function yearlyTotal(monthly: number) {
  return Math.round(monthly * 12 * YEARLY_DISCOUNT)
}

/** 年付划线价：按原价计全年（不打折） */
function yearlyOriginalTotal(monthly: number) {
  return Math.round(monthly * 12)
}

export type BillingCycle = 'month' | 'year'

/** 当前方案应付 USDT 数额（与展示价格一致） */
export function getPaymentAmountUsdt(plan: Plan, billing: BillingCycle): number {
  if (plan.oneTimePrice != null) return plan.oneTimePrice
  if (plan.priceMonthly <= 0) return 0
  if (billing === 'month') return plan.priceMonthly
  return yearlyTotal(plan.priceMonthly)
}

function priceLabel(plan: Plan, cycle: BillingCycle): { main: string; suffix: string } {
  if (plan.oneTimePrice != null) {
    return { main: formatYuan(plan.oneTimePrice), suffix: '/永久' }
  }
  if (plan.priceMonthly <= 0) {
    return { main: formatYuan(0), suffix: cycle === 'month' ? '/月' : '/年' }
  }
  if (cycle === 'month') {
    return { main: formatYuan(plan.priceMonthly), suffix: '/月' }
  }
  return { main: formatYuan(yearlyTotal(plan.priceMonthly)), suffix: '/年' }
}

const Pricing = ({ plans }: { plans: Plan[] }) => {
  const [selectedPlan, setSelectedPlan] = useState<string>(() => plans[0]?.id ?? '')
  const [billing, setBilling] = useState<BillingCycle>('month')
  const [payDialogOpen, setPayDialogOpen] = useState(false)

  const selectedPlanData = plans.find(plan => plan.id === selectedPlan)!
  const paymentAmountUsdt = getPaymentAmountUsdt(selectedPlanData, billing)

  return (
    <section className='py-4 sm:py-8 lg:py-10'>
      <div className='mx-auto max-w-5xl px-3 sm:px-4'>
        <div className='mb-5 flex flex-col items-center gap-1.5'>
          <div className='relative inline-flex rounded-full bg-muted p-0.5'>
            <button
              type='button'
              onClick={() => setBilling('month')}
              className={cn(
                'relative z-[1] rounded-full px-3 py-1 text-xs font-medium transition-colors',
                billing === 'month'
                  ? 'bg-background text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              月付
            </button>
            <button
              type='button'
              onClick={() => setBilling('year')}
              className={cn(
                'relative z-[1] rounded-full px-3 py-1 text-xs font-medium transition-colors',
                billing === 'year'
                  ? 'bg-background text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              年付
            </button>
          </div>
          <div className='flex items-center gap-1.5'>
            <span className='text-muted-foreground text-[11px]'>年付享</span>
            <span className='inline-flex items-center rounded-full bg-emerald-50 px-2 py-px text-[11px] font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'>
              🏷️ 优惠 20%
            </span>
          </div>
        </div>

        <div className='flex flex-col gap-4 lg:flex-row lg:items-stretch'>
          <div className='flex flex-1 flex-col gap-2.5'>
            {plans.map((plan, index) => {
              const { main, suffix } = priceLabel(plan, billing)
              return (
                <MotionPreset
                  key={plan.id}
                  fade
                  blur
                  slide={{ direction: 'up', offset: 50 }}
                  delay={0.6 + index * 0.15}
                  transition={{ duration: 0.7 }}
                >
                  <Card
                    className={cn(
                      `cursor-pointer gap-0 py-0 shadow-none transition-colors ${
                        selectedPlan === plan.id ? 'bg-muted border-primary' : 'border-border'
                      }`
                    )}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    <CardContent className='flex items-center gap-3 px-4 py-2.5'>
                      <div className='border-input flex size-5 shrink-0 items-center justify-center rounded-full border'>
                        {selectedPlan === plan.id && <div className='bg-primary size-3 rounded-full' />}
                      </div>
                      <div className='flex min-w-0 flex-1 flex-col gap-0'>
                        <p className='text-sm font-semibold leading-tight'>{plan.name}</p>
                        <p className='text-muted-foreground text-xs leading-tight'>{plan.accounts}</p>
                      </div>
                      <div className='flex shrink-0 flex-col items-end gap-0'>
                        {billing === 'year' &&
                          plan.oneTimePrice == null &&
                          plan.priceMonthly > 0 && (
                          <span className='text-muted-foreground text-[11px] line-through tabular-nums'>
                            {formatYuan(yearlyOriginalTotal(plan.priceMonthly))}/年
                          </span>
                        )}
                        <div className='flex items-end gap-0.5'>
                          <span className='text-xl font-bold tabular-nums'>{main}</span>
                          <span className='text-muted-foreground text-xs'>{suffix}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </MotionPreset>
              )
            })}
          </div>

          <MotionPreset
            key={`${selectedPlan}-${billing}`}
            className='bg-primary flex-1 rounded-xl p-4 lg:min-w-0'
            fade
            blur
            zoom={{ initialScale: 0.95 }}
            delay={0.3}
            transition={{ duration: 0.6 }}
          >
            <div className='mb-4 flex flex-col gap-0.5'>
              <h3 className='text-primary-foreground text-lg font-semibold leading-tight'>
                {selectedPlanData.name}
              </h3>
              <p className='text-primary-foreground/90 text-xs'>{selectedPlanData.subtitle}</p>
            </div>

            <Card className='gap-0 py-0 shadow-none'>
              <CardContent className='flex flex-col gap-3 px-4 py-3'>
                <div className='flex flex-col gap-0.5'>
                  {billing === 'year' &&
                    selectedPlanData.oneTimePrice == null &&
                    selectedPlanData.priceMonthly > 0 && (
                    <span className='text-muted-foreground text-sm line-through tabular-nums'>
                      {formatYuan(yearlyOriginalTotal(selectedPlanData.priceMonthly))}/年
                    </span>
                  )}
                  <div className='flex items-end gap-0.5'>
                    <span className='text-2xl font-semibold tabular-nums'>
                      {priceLabel(selectedPlanData, billing).main}
                    </span>
                    <span className='text-muted-foreground text-sm'>
                      {priceLabel(selectedPlanData, billing).suffix}
                    </span>
                  </div>
                </div>
                <div className='flex flex-col gap-1'>
                  {selectedPlanData.features.map((feature, index) => (
                    <div key={index} className='flex items-start gap-2 py-0.5'>
                      <CheckIcon className='mt-0.5 size-3.5 shrink-0' />
                      <span className='text-sm font-medium leading-snug'>{feature}</span>
                    </div>
                  ))}
                </div>
                <div className='flex flex-col gap-1.5'>
                  <span className='text-muted-foreground text-xs'>支付方式</span>
                  <div
                    className='flex items-center gap-2'
                    role='status'
                    aria-label='支付方式：交易所转账（已选定）'
                  >
                    <span
                      className='border-primary flex size-4 shrink-0 items-center justify-center rounded-full border-2 bg-background'
                      aria-hidden
                    >
                      <span className='bg-primary size-2 rounded-full' />
                    </span>
                    <span className='text-sm font-normal'>交易所转账</span>
                  </div>
                </div>
                <Button
                  size='sm'
                  className='shadow-none'
                  type='button'
                  onClick={() => setPayDialogOpen(true)}
                >
                  {selectedPlanData.buttonText}
                </Button>
              </CardContent>
            </Card>
          </MotionPreset>
        </div>
      </div>

      <PaymentMethodDialog
        open={payDialogOpen}
        onOpenChange={setPayDialogOpen}
        amountUsdt={paymentAmountUsdt}
      />
    </section>
  )
}

export default Pricing
