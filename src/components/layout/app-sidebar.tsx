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
  ApiError,
  AUTH_EXPIRE_RETRY_CODES,
  getAccessTokenExpiryMs,
} from '@/api/client';
import { AUTH_REFRESH_TOKEN_STORAGE_KEY } from '@/constants/auth-token';
import * as React from 'react';
import { Icons } from '../icons';
import { ProductLogo } from './product-logo';
import { SidebarStudioSwitcher } from './sidebar-studio-switcher';

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

    type RefreshOnceResult = 'ok' | 'auth_fail' | 'retry_soon';

    async function refreshOnce(): Promise<RefreshOnceResult> {
      if (cancelled) return 'ok';
      if (refreshInFlightRef.current) return 'ok';
      refreshInFlightRef.current = true;
      try {
        const refreshToken = localStorage.getItem(AUTH_REFRESH_TOKEN_STORAGE_KEY);
        if (!refreshToken) {
          signOut(router);
          return 'auth_fail';
        }

        const data = await authApi.refresh({ refresh_token: refreshToken });
        persistAuthToken(data.access_token);
        persistRefreshToken(data.refresh_token);
        persistSessionDisplay({
          username: data.username,
          studio_name: data.studio_name,
          is_super_admin: data.is_super_admin,
          is_team_manager: data.is_team_manager,
        });
        return 'ok';
      } catch (err) {
        const fatal =
          err instanceof ApiError &&
          err.code != null &&
          AUTH_EXPIRE_RETRY_CODES.has(err.code);
        if (fatal) {
          signOut(router);
          return 'auth_fail';
        }
        return 'retry_soon';
      } finally {
        refreshInFlightRef.current = false;
      }
    }

    function scheduleNext(networkRetryMs?: number) {
      if (cancelled) return;
      if (timerId) window.clearTimeout(timerId);

      const refreshToken = localStorage.getItem(AUTH_REFRESH_TOKEN_STORAGE_KEY);
      if (!refreshToken) return;

      const nowMs = Date.now();
      const expMs = getAccessTokenExpiryMs();

      let nextDelayMs: number;
      if (networkRetryMs != null) {
        nextDelayMs = networkRetryMs;
      } else if (expMs == null) {
        // 无有效 access 或无法解析 exp：尽快续期，避免误用 5 分钟固定间隔
        nextDelayMs = 0;
      } else {
        const msLeft = expMs - nowMs;
        const leadMs = 60_000;
        if (msLeft <= 0) {
          nextDelayMs = 0;
        } else if (msLeft <= 90_000) {
          // 剩余不足约 90s 时不能再套「至少 30s 后再刷新」，否则会在过期后才刷新
          nextDelayMs = Math.max(0, msLeft - 10_000);
        } else {
          nextDelayMs = msLeft - leadMs;
        }
      }

      timerId = window.setTimeout(async () => {
        const result = await refreshOnce();
        if (result === 'auth_fail') return;
        scheduleNext(result === 'retry_soon' ? 15_000 : undefined);
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
        {user.canSwitchStudios ? <SidebarStudioSwitcher /> : null}
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
