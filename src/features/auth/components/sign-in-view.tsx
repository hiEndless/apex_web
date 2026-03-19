import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from '@/i18n/navigation'

import Logo from '@/features/auth/components/logo'
import AuthLines from '@/features/auth/assets/svg/auth-lines'
import AuthBackground from '@/features/auth/components/auth-background'
import LoginForm from '@/features/auth/components/login-form'

export default function SignInViewPage() {
  return (
    <div className='bg-muted relative flex h-auto min-h-screen items-center justify-center px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-24'>
      <AuthBackground />

      <Card className='relative w-full max-w-md overflow-hidden border-none pt-12 shadow-lg'>
        <div className='to-primary/10 pointer-events-none absolute top-0 h-52 w-full rounded-t-xl bg-gradient-to-t from-transparent' />

        <AuthLines className='pointer-events-none absolute inset-x-0 top-0' />

        <CardHeader className='justify-center gap-6 text-center'>
          <Logo className='justify-center gap-3' />
          <div>
            <CardTitle className='mb-1.5 text-2xl'>登录 ApeX</CardTitle>
            <CardDescription className='text-base'>请输入您的账户信息</CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <LoginForm />

          <p className='text-muted-foreground mt-4 text-center'>
            还没有账号？{' '}
            <Link href='/auth/sign-up' className='text-card-foreground hover:underline'>
              注册
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
