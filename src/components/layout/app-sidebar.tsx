'use client';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail
} from '@/components/ui/sidebar';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import { navItems } from '@/config/nav-config';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useFilteredNavItems } from '@/hooks/use-nav';
import { useSessionDisplayUser } from '@/hooks/use-session-display-user';
import {
  IconChevronRight,
  IconChevronsDown,
  IconLogout,
  IconUserCircle
} from '@tabler/icons-react';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import {
  persistAuthToken,
  persistRefreshToken,
  persistSessionDisplay,
  signOut,
} from '@/lib/auth-session';
import { authApi } from '@/api/auth';
import {
  AUTH_REFRESH_TOKEN_STORAGE_KEY,
  AUTH_TOKEN_STORAGE_KEY,
} from '@/constants/auth-token';
import * as React from 'react';
import { Icons } from '../icons';
import { ProductLogo } from './product-logo';

export default function AppSidebar() {
  const pathname = usePathname();
  const { isOpen } = useMediaQuery();
  const user = useSessionDisplayUser();
  const router = useRouter();
  const filteredItems = useFilteredNavItems(navItems);

  const isPathActive = React.useCallback(
    (url: string) => pathname === url || pathname.startsWith(`${url}/`),
    [pathname]
  );

  React.useEffect(() => {
    let cancelled = false;
    let timerId: number | null = null;
    const refreshInFlightRef = { current: false };

    function decodeJwtExp(accessToken: string): number | null {
      try {
        const parts = accessToken.split('.');
        if (parts.length < 2) return null;
        const payloadB64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const padding = '='.repeat((4 - (payloadB64.length % 4)) % 4);
        const json = window.atob(payloadB64 + padding);
        const payload = JSON.parse(json);
        const exp = Number(payload?.exp);
        return Number.isFinite(exp) ? exp : null;
      } catch {
        return null;
      }
    }

    async function refreshOnce() {
      if (cancelled) return;
      if (refreshInFlightRef.current) return;
      refreshInFlightRef.current = true;
      try {
        const refreshToken = localStorage.getItem(AUTH_REFRESH_TOKEN_STORAGE_KEY);
        const accessToken = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
        if (!refreshToken || !accessToken) {
          signOut(router);
          return;
        }

        const data = await authApi.refresh({ refresh_token: refreshToken });
        persistAuthToken(data.access_token);
        persistRefreshToken(data.refresh_token);
        persistSessionDisplay({
          username: data.username,
          studio_name: data.studio_name,
        });
      } catch {
        signOut(router);
      } finally {
        refreshInFlightRef.current = false;
      }
    }

    function scheduleNext() {
      if (cancelled) return;
      if (timerId) window.clearTimeout(timerId);

      const accessToken = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
      const refreshToken = localStorage.getItem(AUTH_REFRESH_TOKEN_STORAGE_KEY);
      if (!refreshToken) return;

      const expSec = accessToken ? decodeJwtExp(accessToken) : null;
      // 提前 60s 刷新；最小间隔 30s，避免抖动/死循环
      const nowMs = Date.now();
      const nextDelayMs = expSec
        ? Math.max(30_000, expSec * 1000 - nowMs - 60_000)
        : 5 * 60_000;

      timerId = window.setTimeout(async () => {
        await refreshOnce();
        scheduleNext();
      }, nextDelayMs);
    }

    scheduleNext();
    return () => {
      cancelled = true;
      if (timerId) window.clearTimeout(timerId);
    };
  }, [router]);

  React.useEffect(() => {
    // Side effects based on sidebar state changes
  }, [isOpen]);

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        <ProductLogo />
      </SidebarHeader>
      <SidebarContent className='overflow-x-hidden'>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarMenu>
            {filteredItems.map((item) => {
              const Icon = item.icon ? Icons[item.icon] : Icons.logo;
              return item?.items && item?.items?.length > 0 ? (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={item.isActive}
                  className='group/collapsible'
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={isPathActive(item.url)}
                      >
                        {item.icon && <Icon />}
                        <span>{item.title}</span>
                        <IconChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={isPathActive(subItem.url)}
                            >
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={isPathActive(item.url)}
                  >
                    <Link href={item.url}>
                      <Icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size='lg'
                  className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                >
                  {user && (
                    <UserAvatarProfile
                      className='h-8 w-8 rounded-lg'
                      showInfo
                      user={user}
                    />
                  )}
                  <IconChevronsDown className='ml-auto size-4' />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
                side='bottom'
                align='end'
                sideOffset={4}
              >
                <DropdownMenuLabel className='p-0 font-normal'>
                  <div className='px-1 py-1.5'>
                    {user && (
                      <UserAvatarProfile
                        className='h-8 w-8 rounded-lg'
                        showInfo
                        user={user}
                      />
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => router.push('/dashboard/profile')}
                  >
                    <IconUserCircle className='mr-2 h-4 w-4' />
                    Profile
                  </DropdownMenuItem>
                  {/*{organization && (*/}
                  {/*  <DropdownMenuItem*/}
                  {/*    onClick={() => router.push('/dashboard/billing')}*/}
                  {/*  >*/}
                  {/*    <IconCreditCard className='mr-2 h-4 w-4' />*/}
                  {/*    Billing*/}
                  {/*  </DropdownMenuItem>*/}
                  {/*)}*/}
                  {/*<DropdownMenuItem>*/}
                  {/*  <IconBell className='mr-2 h-4 w-4' />*/}
                  {/*  Notifications*/}
                  {/*</DropdownMenuItem>*/}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={() => signOut(router)}>
                  <IconLogout className='mr-2 h-4 w-4' />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
