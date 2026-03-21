'use client'

import {
  AUTH_TOKEN_COOKIE_MAX_AGE_SEC,
  AUTH_TOKEN_COOKIE_NAME,
  AUTH_TOKEN_STORAGE_KEY,
  AUTH_REFRESH_TOKEN_STORAGE_KEY,
  SESSION_IS_SUPER_ADMIN_KEY,
  SESSION_IS_TEAM_MANAGER_KEY,
  SESSION_STUDIO_NAME_KEY,
  SESSION_USERNAME_KEY,
} from '@/constants/auth-token'

export function persistAuthToken(token: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${AUTH_TOKEN_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${AUTH_TOKEN_COOKIE_MAX_AGE_SEC}; SameSite=Lax${secure}`
}

export function persistRefreshToken(token: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem(AUTH_REFRESH_TOKEN_STORAGE_KEY, token)
}

export function clearAuthToken() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
  localStorage.removeItem(AUTH_REFRESH_TOKEN_STORAGE_KEY)
  localStorage.removeItem(SESSION_USERNAME_KEY)
  localStorage.removeItem(SESSION_STUDIO_NAME_KEY)
  localStorage.removeItem(SESSION_IS_SUPER_ADMIN_KEY)
  localStorage.removeItem(SESSION_IS_TEAM_MANAGER_KEY)
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${AUTH_TOKEN_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax${secure}`
}

export function persistSessionDisplay(payload: {
  username: string
  studio_name: string | null
  is_super_admin?: boolean
  is_team_manager?: boolean
}) {
  if (typeof window === 'undefined') return
  localStorage.setItem(SESSION_USERNAME_KEY, payload.username)
  if (payload.studio_name != null && payload.studio_name !== '') {
    localStorage.setItem(SESSION_STUDIO_NAME_KEY, payload.studio_name)
  } else {
    localStorage.removeItem(SESSION_STUDIO_NAME_KEY)
  }
  if (payload.is_super_admin === true) {
    localStorage.setItem(SESSION_IS_SUPER_ADMIN_KEY, '1')
  } else if (payload.is_super_admin === false) {
    localStorage.setItem(SESSION_IS_SUPER_ADMIN_KEY, '0')
  }
  if (payload.is_team_manager === true) {
    localStorage.setItem(SESSION_IS_TEAM_MANAGER_KEY, '1')
  } else if (payload.is_team_manager === false) {
    localStorage.setItem(SESSION_IS_TEAM_MANAGER_KEY, '0')
  }
  window.dispatchEvent(new Event('apex-session-updated'))
}

export function getSessionDisplay(): {
  username: string | null
  studio_name: string | null
  is_super_admin: boolean | null
  is_team_manager: boolean | null
} {
  if (typeof window === 'undefined') {
    return {
      username: null,
      studio_name: null,
      is_super_admin: null,
      is_team_manager: null,
    }
  }
  const sa = localStorage.getItem(SESSION_IS_SUPER_ADMIN_KEY)
  const tm = localStorage.getItem(SESSION_IS_TEAM_MANAGER_KEY)
  return {
    username: localStorage.getItem(SESSION_USERNAME_KEY),
    studio_name: localStorage.getItem(SESSION_STUDIO_NAME_KEY),
    is_super_admin: sa === '1' ? true : sa === '0' ? false : null,
    is_team_manager: tm === '1' ? true : tm === '0' ? false : null,
  }
}

/** 退出登录：清理本地 token 与 cookie，并跳转登录页（replace 避免返回受保护页） */
export function signOut(router: { replace: (href: string) => void }) {
  clearAuthToken()
  router.replace('/auth/sign-in')
}
