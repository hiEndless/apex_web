'use client'

import { useEffect, useMemo, useState } from 'react'

import { getSessionDisplay } from '@/lib/auth-session'

/** 侧栏/顶栏展示：主行工作室名（无则平台），副行用户名 */
export function useSessionDisplayUser() {
  const [raw, setRaw] = useState(() => getSessionDisplay())

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
