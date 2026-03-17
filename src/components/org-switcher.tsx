'use client';

import { ChevronsUpDown, GalleryVerticalEnd, Plus, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar';
import Image from 'next/image';

export function OrgSwitcher() {
  const { isMobile, state } = useSidebar();
  const router = useRouter();

  // Mock data
  const activeOrganization = {
    id: 'org_1',
    name: 'Acme Inc',
    imageUrl: '',
    hasImage: false
  };
  
  const userMemberships = {
    data: [
        { id: 'mem_1', organization: activeOrganization, role: 'admin' },
        { id: 'mem_2', organization: { id: 'org_2', name: 'Other Org', imageUrl: '', hasImage: false }, role: 'member' }
    ]
  };

  const displayOrganization = activeOrganization;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg'>
                  <GalleryVerticalEnd className='size-4' />
              </div>
              <div
                className={`grid flex-1 text-left text-sm leading-tight transition-all duration-200 ease-in-out ${
                  state === 'collapsed'
                    ? 'invisible max-w-0 overflow-hidden opacity-0'
                    : 'visible max-w-full opacity-100'
                }`}
              >
                <span className='truncate font-medium'>
                  {displayOrganization.name}
                </span>
                <span className='text-muted-foreground truncate text-xs'>
                  {userMemberships.data[0].role || 'Organization'}
                </span>
              </div>
              <ChevronsUpDown
                className={`ml-auto transition-all duration-200 ease-in-out ${
                  state === 'collapsed'
                    ? 'invisible max-w-0 opacity-0'
                    : 'visible max-w-full opacity-100'
                }`}
              />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
            align='start'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className='text-muted-foreground text-xs'>
              Organizations
            </DropdownMenuLabel>
            {userMemberships.data.map((membership, index) => {
              const isActive = membership.organization.id === activeOrganization.id;
              return (
                <DropdownMenuItem
                  key={membership.id}
                  onClick={() => console.log('Switch org')}
                  className='gap-2 p-2'
                >
                  <div className='flex size-6 items-center justify-center overflow-hidden rounded-md border'>
                      <GalleryVerticalEnd className='size-3.5 shrink-0' />
                  </div>
                  {membership.organization.name}
                  {isActive && <Check className='ml-auto size-4' />}
                  {!isActive && (
                    <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                  )}
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className='gap-2 p-2'
              onClick={() => {
                router.push('/dashboard/workspaces');
              }}
            >
              <div className='flex size-6 items-center justify-center rounded-md border bg-transparent'>
                <Plus className='size-4' />
              </div>
              <div className='text-muted-foreground font-medium'>
                Add organization
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
