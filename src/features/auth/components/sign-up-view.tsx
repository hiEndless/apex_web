import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from '@/i18n/navigation'

import Logo from '@/features/auth/components/logo'
import AuthLines from '@/features/auth/assets/svg/auth-lines'
import AuthBackground from '@/features/auth/components/auth-background'
import RegisterForm from '@/features/auth/components/register-form'

export default function SignUpViewPage() {
  return (
    <div className='bg-muted relative flex min-h-screen justify-center px-4 py-6 sm:px-6 sm:py-10 lg:px-8'>
      <AuthBackground />

      <Card className='relative w-full max-w-md border-none pt-12 shadow-lg'>
        <div className='to-primary/10 pointer-events-none absolute top-0 h-52 w-full rounded-t-xl bg-gradient-to-t from-transparent' />

        <AuthLines className='pointer-events-none absolute inset-x-0 top-0' />

        <CardHeader className='justify-center gap-6 text-center'>
          <Logo className='justify-center gap-3' />
          <div>
            <CardTitle className='mb-1.5 text-2xl'>注册 ApeX</CardTitle>
            <CardDescription className='text-base'>请填写以下信息完成注册</CardDescription>
          </div>
        </CardHeader>

        <CardContent className='pb-6'>
          <RegisterForm />

          <p className='text-muted-foreground mt-4 text-center'>
            已有账号？{' '}
            <Link href='/auth/sign-in' className='text-card-foreground hover:underline'>
              登录
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
