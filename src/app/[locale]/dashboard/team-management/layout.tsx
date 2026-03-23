'use client';

import { useSessionDisplayUser } from '@/hooks/use-session-display-user';
import { useRouter } from '@/i18n/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function TeamManagementLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = useSessionDisplayUser();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for the user object to fully hydrate from local storage
    if (user.isLoggedIn !== undefined && user.is_team_manager !== null) {
      if (user.isLoggedIn && !user.is_team_manager) {
        // If logged in but not a team manager, redirect to dashboard home
        router.replace('/dashboard/overview');
      } else {
        // If authorized, stop checking
        setIsChecking(false);
      }
    }
  }, [user.isLoggedIn, user.is_team_manager, router]);

  if (isChecking || (!user.is_team_manager && user.isLoggedIn)) {
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}