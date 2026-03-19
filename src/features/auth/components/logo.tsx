import Image from 'next/image'
import { cn } from '@/lib/utils'

const Logo = ({ className }: { className?: string }) => {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className='relative size-8.5'>
        <Image
          src='/logo.png'
          alt='Logo'
          fill
          className='object-contain'
          priority
        />
      </div>
      <span className='text-xl font-semibold'>ApeX Studio</span>
    </div>
  )
}

export default Logo
