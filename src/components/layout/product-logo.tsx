'use client';

import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from '@/components/ui/sidebar';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';

export function ProductLogo() {
  const { state } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size='lg'
          asChild
          className={`data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground`}
        >
          <Link href="/">
            <div className={`relative transition-all duration-200 ${state === 'collapsed' ? 'h-8 w-8' : 'h-8 w-full'}`}>
               <Image 
                 src="/black-logo.png" 
                 alt="UTaker Logo" 
                 fill 
                 className="object-contain dark:hidden object-left"
                 priority
               />
               <Image 
                 src="/white-logo.png" 
                 alt="UTaker Logo" 
                 fill 
                 className="object-contain hidden dark:block object-left"
                 priority
               />
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
