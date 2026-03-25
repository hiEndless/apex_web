/** Edge / 浏览器共用，供 middleware 与 client 读取 cookie 名 */

export const AUTH_TOKEN_STORAGE_KEY = 'jwt'

export const AUTH_TOKEN_COOKIE_NAME = 'apex_access_token'

/** 仅前端存储，用于自动续期。 */
export const AUTH_REFRESH_TOKEN_STORAGE_KEY = 'apex_refresh_token'

/** 与后端会话周期大致对齐（秒） */
export const AUTH_TOKEN_COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 7

/** 登录后展示用（非敏感），与 token 一并清理 */
export const SESSION_USERNAME_KEY = 'apex_session_username'
export const SESSION_STUDIO_NAME_KEY = 'apex_session_studio_name'
/** 登录/续期写入，与 token 一并清理；对应后端 is_super_admin（root 能力） */
export const SESSION_IS_SUPER_ADMIN_KEY = 'apex_session_is_super_admin'
/** 对应后端 is_team_manager，可切换团队下工作室 */
export const SESSION_IS_TEAM_MANAGER_KEY = 'apex_session_is_team_manager'

/**
 * 用于区分 super admin 的“主工作室”展示上下文：
 * - 登录/续期成功时写入一次
 * - 切换工作室时不更新，避免导致“系统跟单信号”误展示
 */
export const SESSION_SUPER_ADMIN_BASE_STUDIO_ID_KEY = 'apex_session_super_admin_base_studio_id'
