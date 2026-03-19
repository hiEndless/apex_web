import { cn } from '@/lib/utils'

const AuthBackground = ({ className }: { className?: string }) => {
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      <svg className='absolute inset-0 h-full w-full opacity-[0.03]' xmlns='http://www.w3.org/2000/svg'>
        <defs>
          <pattern id='dot-grid' width='32' height='32' patternUnits='userSpaceOnUse'>
            <circle cx='1' cy='1' r='1' fill='currentColor' />
          </pattern>
        </defs>
        <rect width='100%' height='100%' fill='url(#dot-grid)' />
      </svg>

      <div className='absolute -top-20 -left-20 h-72 w-72 rounded-full border border-current opacity-[0.07]' />
      <div className='absolute -top-10 -left-10 h-52 w-52 rounded-full border border-current opacity-[0.05]' />

      <div className='absolute -top-6 right-[12%] h-28 w-28 rotate-45 rounded-lg border border-current opacity-[0.08]' />
      <div className='bg-foreground/10 absolute top-16 right-[8%] h-16 w-16 rotate-12 rounded-md' />

      <svg className='absolute top-[30%] -right-4 h-40 w-40 opacity-[0.08]' viewBox='0 0 100 100'>
        <polygon
          points='50,3 93,25 93,75 50,97 7,75 7,25'
          fill='none'
          stroke='currentColor'
          strokeWidth='1.5'
        />
      </svg>

      <svg className='absolute top-[45%] left-[5%] h-24 w-24 opacity-[0.07]' viewBox='0 0 100 100'>
        <polygon
          points='50,8 95,92 5,92'
          fill='none'
          stroke='currentColor'
          strokeWidth='1.5'
        />
      </svg>

      <div className='bg-foreground/10 absolute bottom-[20%] left-[10%] h-10 w-10 rounded-full' />
      <div className='absolute bottom-[25%] left-[15%] h-20 w-20 -rotate-12 rounded-lg border border-current opacity-[0.07]' />

      <div className='absolute -right-12 -bottom-12 h-56 w-56 rounded-full border border-current opacity-[0.07]' />
      <div className='absolute -right-4 -bottom-4 h-36 w-36 rounded-full border border-current opacity-[0.05]' />

      <div className='absolute bottom-[8%] left-[40%] h-14 w-14 rotate-45 border border-current opacity-[0.06]' />

      <div className='bg-foreground/10 absolute top-[15%] left-[30%] h-3 w-3 rounded-full' />
      <div className='bg-foreground/8 absolute top-[25%] right-[25%] h-2.5 w-2.5 rounded-full' />
      <div className='bg-foreground/10 absolute top-[60%] left-[20%] h-3 w-3 rounded-full' />
      <div className='bg-foreground/8 absolute bottom-[15%] right-[30%] h-3.5 w-3.5 rounded-full' />
      <div className='bg-foreground/10 absolute top-[40%] left-[45%] h-2.5 w-2.5 rounded-full' />
    </div>
  )
}

export default AuthBackground
