import { NavItem } from '@/types';

/**
 * Navigation configuration with RBAC support
 *
 * This configuration is used for both the sidebar navigation and Cmd+K bar.
 *
 * RBAC Access Control:
 * Each navigation item can have an `access` property that controls visibility
 * based on permissions, plans, features, roles, and organization context.
 *
 * Examples:
 *
 * 1. Require organization:
 *    access: { requireOrg: true }
 *
 * 2. Require specific permission:
 *    access: { requireOrg: true, permission: 'org:teams:manage' }
 *
 * 3. Require specific plan:
 *    access: { plan: 'pro' }
 *
 * 4. Require specific feature:
 *    access: { feature: 'premium_access' }
 *
 * 5. Require specific role:
 *    access: { role: 'admin' }
 *
 * 6. Multiple conditions (all must be true):
 *    access: { requireOrg: true, permission: 'org:teams:manage', plan: 'pro' }
 *
 * Note: The `visible` function is deprecated but still supported for backward compatibility.
 * Use the `access` property for new items.
 */
export const navItems: NavItem[] = [
  {
    title: '主页',
    url: '/dashboard/overview',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: []
  },
  // {
  //   title: 'Workspaces',
  //   url: '/dashboard/workspaces',
  //   icon: 'workspace',
  //   isActive: false,
  //   items: []
  // },
  {
    title: '跟单管理',
    url: '/dashboard/copy-task',
    icon: 'teams',
    isActive: false,
    items: [],
    // Require organization to be active
    // access: { requireOrg: true }
    // Alternative: require specific permission
    // access: { requireOrg: true, permission: 'org:teams:view' }
  },
  {
    title: '交易员历史持仓',
    url: '/dashboard/positions-history',
    icon: 'product',
    shortcut: ['p', 'p'],
    isActive: false,
    items: []
  },
  // {
  //   title: 'Kanban',
  //   url: '/dashboard/kanban',
  //   icon: 'kanban',
  //   shortcut: ['k', 'k'],
  //   isActive: false,
  //   items: []
  // },
  {
    title: '会员服务',
    url: '/dashboard/vip-service', // Placeholder as there is no direct link for the parent
    icon: 'billing',
    isActive: true,
    shortcut: ['v', 'v'],
    items: []
  },
  {
    title: '设置',
    url: '#', // Placeholder as there is no direct link for the parent
    icon: 'settings',
    isActive: true,
    items: [
      {
        title: 'API 管理',
        url: '/dashboard/api-settings',
        icon: 'profile',
        shortcut: ['a', 'a']
      },
      {
        title: '消息通知',
        url: '/dashboard/notifications',
        icon: 'profile',
        shortcut: ['n', 'n']
      },
    ]
  }
];
