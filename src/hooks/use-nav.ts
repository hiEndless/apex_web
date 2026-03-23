'use client';
import type { NavItem } from '@/types';
import { useSessionDisplayUser } from '@/hooks/use-session-display-user';

/**
 * Hook to filter navigation items based on RBAC (fully client-side)
 *
 * @param items - Array of navigation items to filter
 * @returns Filtered items
 */
export function useFilteredNavItems(items: NavItem[]) {
  const user = useSessionDisplayUser();

  const filterItem = (item: NavItem): boolean => {
    // Only check if user object is fully loaded/hydrated
    if (user.isLoggedIn === undefined || user.is_team_manager === null) {
      return false; // Safely hide items until auth state is resolved
    }

    // Check if the item requires team manager access
    if (item.access?.requireTeamManager && !user.is_team_manager) {
      return false;
    }
    
    // Check if the item requires super admin access
    if (item.access?.requireSuperAdmin && !user.is_super_admin) {
      return false;
    }

    // Additional custom RBAC logic can be added here based on item.access

    return true;
  };

  const processItems = (navItems: NavItem[]): NavItem[] => {
    return navItems
      .filter(filterItem)
      .map(item => {
        if (item.items && item.items.length > 0) {
          return {
            ...item,
            items: processItems(item.items)
          };
        }
        return item;
      });
  };

  return processItems(items);
}
