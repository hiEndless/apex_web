'use client';
import type { NavItem } from '@/types';

/**
 * Hook to filter navigation items based on RBAC (fully client-side)
 *
 * @param items - Array of navigation items to filter
 * @returns Filtered items
 */
export function useFilteredNavItems(items: NavItem[]) {
  // Return all items directly since Clerk is removed.
  // We can add custom RBAC logic here if needed.
  return items;
}
