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
            <div className={`flex items-center gap-2 transition-all duration-200 ${state === 'collapsed' ? 'w-8' : 'w-full'}`}>
              <div className="relative h-8 w-8">
                <Image 
                  src="/logo.png"
                  alt="Logo"
                  fill 
                  className="object-contain"
                  priority
                />
              </div>
              {!state || state !== 'collapsed' ? (
                <span className="font-semibold text-lg">ApeX Studio</span>
              ) : null}
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
