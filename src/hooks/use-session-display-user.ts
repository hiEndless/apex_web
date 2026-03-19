'use client'

import { useEffect, useMemo, useState } from 'react'

import { getSessionDisplay } from '@/lib/auth-session'

/** 侧栏/顶栏展示：主行工作室名（无则平台），副行用户名 */
export function useSessionDisplayUser() {
  // Hydration mismatch fix:
  // - SSR 阶段没有 window/localStorage，getSessionDisplay() 会返回 null 值
  // - CSR hydration 时会读取到 localStorage，导致首屏文本不一致
  // 这里先用两端一致的占位值，等 useEffect 后再同步真实 session。
  const [raw, setRaw] = useState<{
    username: string | null
    studio_name: string | null
  }>(() => ({
    username: null,
    studio_name: null,
  }))

  useEffect(() => {
    setRaw(getSessionDisplay())
  }, [])

  return useMemo(() => {
    const username = raw.username?.trim()
    const studioName = raw.studio_name?.trim()
    if (!username && !studioName) {
      return {
        fullName: '—',
        emailAddresses: [{ emailAddress: '—' }],
        imageUrl: '' as const,
      }
    }
    return {
      fullName: studioName || '平台',
      emailAddresses: [{ emailAddress: username || '—' }],
      imageUrl: '' as const,
    }
  }, [raw])
}
