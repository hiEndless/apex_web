'use client'

import { useState } from 'react'

import Image from 'next/image'
import { Copy, X } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { EXCHANGE_LOGO_SRC } from '@/constants/exchange-logo'
import { cn } from '@/lib/utils'

const EXCHANGE_ACCOUNTS: Record<'binance' | 'okx', string> = {
  binance: '727380886',
  okx: '443052143151353864'
}

export type PaymentExchange = 'binance' | 'okx'

export interface PaymentMethodDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 应付 USDT 数量（与定价区一致） */
  amountUsdt: number
}

export function PaymentMethodDialog({
  open,
  onOpenChange,
  amountUsdt
}: PaymentMethodDialogProps) {
  const [exchange, setExchange] = useState<PaymentExchange>('binance')
  const [referenceId, setReferenceId] = useState('')

  const account = EXCHANGE_ACCOUNTS[exchange]
  const exchangeLabel = exchange === 'binance' ? 'Binance' : 'OKX'
  const exchangeLabelZh = exchange === 'binance' ? '币安' : 'OKX'

  const copyAccount = async () => {
    try {
      await navigator.clipboard.writeText(account)
      toast.success('已复制到剪贴板')
    } catch {
      toast.error('复制失败')
    }
  }

  const handleSubmit = () => {
    const ref = referenceId.trim()
    if (!ref) {
      toast.error('请输入参考编号')
      return
    }
    toast.success('已提交，请等待验证')
    onOpenChange(false)
    setReferenceId('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideClose
        className={cn(
          'max-h-[min(90dvh,640px)] gap-0 overflow-hidden p-0 shadow-none sm:max-w-[532px]'
        )}
      >
        <DialogHeader className='border-border bg-muted/50 flex flex-row items-center justify-between gap-2 space-y-0 border-b px-4 py-3 text-left'>
          <DialogTitle className='text-foreground text-base font-semibold'>选择支付方式</DialogTitle>
          <DialogClose asChild>
            <Button type='button' variant='ghost' size='icon' className='size-8 shrink-0' aria-label='关闭'>
              <X className='size-4' />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className='max-h-[calc(90dvh-200px)] overflow-y-auto px-4 py-4'>
          <p className='text-foreground mb-2 text-sm font-medium'>选择交易所</p>
          <div className='mb-5 grid grid-cols-2 gap-2'>
            {(
              [
                { id: 'binance' as const, name: 'Binance', logo: EXCHANGE_LOGO_SRC.binance },
                { id: 'okx' as const, name: 'OKX', logo: EXCHANGE_LOGO_SRC.okx }
              ] as const
            ).map((ex) => {
              const selected = exchange === ex.id
              return (
                <button
                  key={ex.id}
                  type='button'
                  onClick={() => setExchange(ex.id)}
                  className={cn(
                    'border-border bg-background flex items-center justify-center gap-2 rounded-md border px-3 py-3 text-sm transition-colors',
                    selected
                      ? 'border-primary bg-muted/80 ring-ring/50 ring-1'
                      : 'hover:bg-muted/50'
                  )}
                >
                  <Image
                    src={ex.logo}
                    alt=''
                    width={22}
                    height={22}
                    className='size-[22px] object-contain'
                  />
                  <span className='font-medium'>{ex.name}</span>
                </button>
              )
            })}
          </div>

          <div className='border-border bg-muted/30 rounded-lg border p-3'>
            <p className='text-foreground mb-3 text-sm font-medium'>转账步骤</p>

            <div className='text-foreground space-y-4 text-sm'>
              <div>
                <p className='text-muted-foreground mb-2 leading-relaxed'>
                  1. 请往以下{exchangeLabelZh}账号转入{' '}
                  <span className='text-destructive font-semibold'>${amountUsdt}</span> USDT
                </p>
                <div className='flex gap-2'>
                  <Input
                    readOnly
                    value={account}
                    className='h-9 font-mono text-sm shadow-none'
                  />
                  <Button type='button' variant='secondary' size='sm' onClick={copyAccount} className='shrink-0'>
                    <Copy className='size-4' />
                    复制
                  </Button>
                </div>
              </div>

              <p className='text-muted-foreground leading-relaxed'>
                2. 在{exchangeLabel}官网/APP 上进行转账操作，等待转账成功后进入转账详情页
              </p>

              <div>
                <p className='text-muted-foreground mb-2'>3. 请输入参考编号</p>
                <Input
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  placeholder='请输入参考编号'
                  className='h-9 text-sm shadow-none'
                />
              </div>
            </div>

            <div className='mt-4 rounded-md bg-amber-50 px-3 py-2 text-xs leading-relaxed text-foreground'>
              转账提示：如遇「转账失败」、「网络错误」等情况，请联系我们处理。
            </div>
          </div>
        </div>

        <DialogFooter className='border-border bg-background gap-2 border-t px-4 py-3 sm:justify-end'>
          <DialogClose asChild>
            <Button type='button' variant='outline' size='sm'>
              关闭
            </Button>
          </DialogClose>
          <Button type='button' size='sm' onClick={handleSubmit}>
            提交验证
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
