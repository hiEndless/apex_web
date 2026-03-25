'use client'

import { useState } from 'react'

import { EyeIcon, EyeOffIcon } from 'lucide-react'

import { ApiError, getAccessTokenStudioId } from '@/api/client'
import { authApi } from '@/api/auth'
import {
  persistAuthToken,
  persistRefreshToken,
  persistSessionDisplay,
  persistSuperAdminBaseStudioId,
} from '@/lib/auth-session'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from '@/i18n/navigation'

const LoginForm = () => {
  const router = useRouter()
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data = await authApi.login({
        account: account.trim(),
        password,
      })
      persistAuthToken(data.access_token)
      persistRefreshToken(data.refresh_token)
      persistSessionDisplay({
        username: data.username,
        studio_name: data.studio_name,
        is_super_admin: data.is_super_admin,
        is_team_manager: data.is_team_manager,
      })
      // 新登录时重置一次，确保不会沿用上一次账号残留的“主工作室 id”
      persistSuperAdminBaseStudioId(null)
      // 接口可能未带 studio_id，但 JWT 内已有（persistAuthToken 之后可读）
      const superAdminHomeId =
        data.is_super_admin === true
          ? (data.studio_id ?? getAccessTokenStudioId())
          : null
      persistSuperAdminBaseStudioId(superAdminHomeId)
      router.push('/dashboard')
    } catch (err) {
      const message = err instanceof ApiError ? err.message : '登录失败，请重试'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className='space-y-4' onSubmit={onSubmit}>
      <div className='space-y-1'>
        <Label className='leading-5' htmlFor='account'>
          用户名或邮箱
        </Label>
        <Input
          id='account'
          type='text'
          autoComplete='username'
          placeholder='请输入用户名或邮箱'
          value={account}
          onChange={e => setAccount(e.target.value)}
          required
          minLength={3}
        />
      </div>

      <div className='w-full space-y-1'>
        <div className='flex items-center justify-between'>
          <Label className='leading-5' htmlFor='password'>
            密码
          </Label>
          <a href='#' className='text-muted-foreground text-sm hover:underline'>
            忘记密码？
          </a>
        </div>
        <div className='relative'>
          <Input
            id='password'
            type={isPasswordVisible ? 'text' : 'password'}
            autoComplete='current-password'
            placeholder='••••••••••••••••'
            className='pr-9'
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={8}
          />
          <Button
            variant='ghost'
            size='icon'
            type='button'
            onClick={() => setIsPasswordVisible(prev => !prev)}
            className='text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent'
          >
            {isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
            <span className='sr-only'>{isPasswordVisible ? '隐藏密码' : '显示密码'}</span>
          </Button>
        </div>
      </div>

      <div className='flex items-center gap-3'>
        <Checkbox id='rememberMe' className='size-6' />
        <Label htmlFor='rememberMe'>
          <span className='text-muted-foreground'>记住我</span>
        </Label>
      </div>

      {error ? <p className='text-destructive text-sm'>{error}</p> : null}

      <Button className='w-full' type='submit' disabled={loading}>
        {loading ? '登录中…' : '登录'}
      </Button>
    </form>
  )
}

export default LoginForm
