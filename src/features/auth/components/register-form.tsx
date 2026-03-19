'use client'

import { useState } from 'react'

import { EyeIcon, EyeOffIcon } from 'lucide-react'

import { authApi } from '@/api/auth'
import { ApiError } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from '@/i18n/navigation'

const RegisterForm = () => {
  const router = useRouter()
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [studioName, setStudioName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }
    if (!agreeTerms) {
      setError('请先同意隐私政策和服务条款')
      return
    }
    setLoading(true)
    try {
      await authApi.register({
        username: username.trim(),
        password,
        email: email.trim() || undefined,
        studio_name: studioName.trim(),
        invite_code: inviteCode.trim(),
      })
      router.push('/auth/sign-in')
    } catch (err) {
      const message = err instanceof ApiError ? err.message : '注册失败，请重试'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className='space-y-4' onSubmit={onSubmit}>
      <div className='space-y-1'>
        <Label className='leading-5' htmlFor='username'>
          用户名 *
        </Label>
        <Input
          id='username'
          type='text'
          autoComplete='username'
          placeholder='至少 3 个字符'
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          minLength={3}
          maxLength={64}
        />
      </div>

      <div className='space-y-1'>
        <Label className='leading-5' htmlFor='userEmail'>
          邮箱（选填）
        </Label>
        <Input
          type='email'
          id='userEmail'
          autoComplete='email'
          placeholder='可用于登录'
          value={email}
          onChange={e => setEmail(e.target.value)}
          maxLength={255}
        />
      </div>

      <div className='space-y-1'>
        <Label className='leading-5' htmlFor='studioName'>
          工作室名称 *
        </Label>
        <Input
          id='studioName'
          type='text'
          placeholder='至少 2 个字符'
          value={studioName}
          onChange={e => setStudioName(e.target.value)}
          required
          minLength={2}
          maxLength={128}
        />
      </div>

      <div className='w-full space-y-1'>
        <Label className='leading-5' htmlFor='password'>
          密码 *
        </Label>
        <div className='relative'>
          <Input
            id='password'
            type={isPasswordVisible ? 'text' : 'password'}
            autoComplete='new-password'
            placeholder='至少 8 位'
            className='pr-9'
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={8}
            maxLength={128}
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

      <div className='w-full space-y-1'>
        <Label className='leading-5' htmlFor='confirmPassword'>
          确认密码 *
        </Label>
        <div className='relative'>
          <Input
            id='confirmPassword'
            type={isConfirmPasswordVisible ? 'text' : 'password'}
            autoComplete='new-password'
            placeholder='••••••••••••••••'
            className='pr-9'
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            minLength={8}
          />
          <Button
            variant='ghost'
            size='icon'
            type='button'
            onClick={() => setIsConfirmPasswordVisible(prev => !prev)}
            className='text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent'
          >
            {isConfirmPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
            <span className='sr-only'>{isConfirmPasswordVisible ? '隐藏密码' : '显示密码'}</span>
          </Button>
        </div>
      </div>

      <div className='space-y-1'>
        <Label className='leading-5' htmlFor='inviteCode'>
          邀请码 *
        </Label>
        <Input
          type='text'
          id='inviteCode'
          placeholder='请输入邀请码'
          value={inviteCode}
          onChange={e => setInviteCode(e.target.value)}
          required
        />
      </div>

      <div className='flex items-center gap-3'>
        <Checkbox
          id='agreeTerms'
          className='size-6'
          checked={agreeTerms}
          onCheckedChange={v => setAgreeTerms(v === true)}
        />
        <Label htmlFor='agreeTerms'>
          <span className='text-muted-foreground'>我同意</span>{' '}
          <a href='#'>隐私政策和服务条款</a>
        </Label>
      </div>

      {error ? <p className='text-destructive text-sm'>{error}</p> : null}

      <Button className='w-full' type='submit' disabled={loading}>
        {loading ? '提交中…' : '注册'}
      </Button>
    </form>
  )
}

export default RegisterForm
