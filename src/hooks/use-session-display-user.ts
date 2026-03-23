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
    is_super_admin: boolean | null
    is_team_manager: boolean | null
  }>({
    username: null,
    studio_name: null,
    is_super_admin: null,
    is_team_manager: null,
  })

  useEffect(() => {
    const sync = () => setRaw(getSessionDisplay())
    sync()
    window.addEventListener('apex-session-updated', sync)
    return () => window.removeEventListener('apex-session-updated', sync)
  }, [])

  return useMemo(() => {
    const username = raw.username?.trim()
    const studioName = raw.studio_name?.trim()
    const isSuperAdmin = raw.is_super_admin === true
    const isTeamManager = raw.is_team_manager === true
    const canSwitchStudios =
      username === 'root' || isSuperAdmin || isTeamManager
      
    // If username is null, it means we either haven't hydrated yet, or the user is not logged in.
    // In our app, a logged in user will always have a username in localStorage.
    if (raw.username === null) {
      return {
        fullName: '—',
        emailAddresses: [{ emailAddress: '—' }],
        imageUrl: '' as const,
        isLoggedIn: undefined, // undefined indicates loading/hydrating state
        isSuperAdmin: null,
        is_team_manager: null, // explicit null indicates loading/hydrating state
        canSwitchStudios: false,
      }
    }
    
    if (!username && !studioName) {
      return {
        fullName: '—',
        emailAddresses: [{ emailAddress: '—' }],
        imageUrl: '' as const,
        isLoggedIn: false,
        isSuperAdmin: false,
        is_team_manager: false,
        canSwitchStudios: false,
      }
    }
    return {
      fullName: studioName || '平台',
      emailAddresses: [{ emailAddress: username || '—' }],
      imageUrl: '' as const,
      isLoggedIn: Boolean(username),
      isSuperAdmin,
      is_team_manager: isTeamManager, // expose exactly as is_team_manager for the guard
      canSwitchStudios,
    }
  }, [raw])
}
