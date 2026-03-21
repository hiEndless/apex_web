'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';

import { authApi } from '@/api/auth';
import type { StudioListItem } from '@/api/auth';
import { ApiError } from '@/api/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useSessionDisplayUser } from '@/hooks/use-session-display-user';
import {
  getSessionDisplay,
  persistAuthToken,
  persistRefreshToken,
  persistSessionDisplay,
} from '@/lib/auth-session';
import { IconCheck, IconChevronDown } from '@tabler/icons-react';

export function SidebarStudioSwitcher() {
  const t = useTranslations('StudioSwitcher');
  const user = useSessionDisplayUser();
  const [studios, setStudios] = React.useState<StudioListItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [switching, setSwitching] = React.useState(false);

  const loadStudios = React.useCallback(async () => {
    setLoading(true);
    try {
      const list = await authApi.listStudios();
      setStudios(list);
    } catch {
      setStudios([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadStudios();
  }, [loadStudios]);

  const onSelectStudio = React.useCallback(
    async (code: string) => {
      if (switching) return;
      setSwitching(true);
      try {
        const data = await authApi.switchStudio({ studio_code: code });
        persistAuthToken(data.access_token);
        persistRefreshToken(data.refresh_token);
        const prev = getSessionDisplay();
        persistSessionDisplay({
          username: data.username,
          studio_name: data.studio_name,
          is_team_manager: data.is_team_manager,
          ...(prev.is_super_admin != null
            ? { is_super_admin: prev.is_super_admin }
            : {}),
        });
        window.location.reload();
      } catch (err) {
        if (err instanceof ApiError) {
          console.error(err.message);
        }
      } finally {
        setSwitching(false);
      }
    },
    [switching]
  );

  const displayName = user.fullName;

  return (
    <div className='border-sidebar-border border-b px-3 py-2'>
      <div className='text-muted-foreground text-xs font-medium'>{t('label')}</div>
      <SidebarMenu className='mt-1'>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size='sm'
                disabled={switching}
                className='h-auto w-full min-w-0 justify-between gap-1 px-2 py-1.5'
                tooltip={displayName}
              >
                <span className='min-w-0 flex-1 truncate text-left text-sm font-medium'>
                  {switching ? t('switching') : displayName}
                </span>
                <IconChevronDown className='size-4 shrink-0 opacity-60' />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='w-[var(--radix-dropdown-menu-trigger-width)] min-w-56 max-w-[min(100vw-2rem,20rem)]'
              align='start'
              sideOffset={4}
            >
              {loading ? (
                <div className='text-muted-foreground px-2 py-1.5 text-sm'>
                  {t('loading')}
                </div>
              ) : (
                studios.map((item) => (
                  <DropdownMenuItem
                    key={item.studio_id}
                    disabled={item.is_current || switching}
                    onClick={() => void onSelectStudio(item.studio_code)}
                    className='flex items-center gap-2'
                  >
                    <span className='min-w-0 flex-1 truncate'>
                      {item.studio_name}
                    </span>
                    {item.is_current ? (
                      <IconCheck className='text-primary size-4 shrink-0' />
                    ) : null}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </div>
  );
}
