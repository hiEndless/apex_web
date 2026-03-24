'use client';

import React, { useEffect, useState } from 'react';
import { settingsApi, CurrentMembershipResponse } from '@/api/settings';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';

export function MembershipDisplay() {
  const [membership, setMembership] = useState<CurrentMembershipResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const t = useTranslations('Membership');

  useEffect(() => {
    settingsApi.getCurrentMembership()
      .then((data) => {
        setMembership(data);
      })
      .catch((err) => {
        console.error('Failed to fetch membership:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <Skeleton className="h-6 w-32" />;
  }

  if (!membership || !membership.plan_name) return null;

  // Calculate remaining days
  let isExpired = false;
  let diffDays = 0;
  
  if (membership.subscription_end_at) {
    const now = new Date();
    const endAt = new Date(membership.subscription_end_at);
    const diffTime = endAt.getTime() - now.getTime();
    diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    isExpired = diffDays <= 0;
  }

  return (
    <div className="flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 p-[1px]">
      <Badge className="bg-background hover:bg-background text-foreground border-none shadow-none gap-2 font-normal rounded-full px-2.5 py-0.5 text-xs">
        <span className="font-semibold uppercase">{membership.plan_name}</span>
        {membership.subscription_end_at && (
          <span className="text-muted-foreground border-l border-border pl-2">
            {isExpired ? t('expired') : t('remainingDays', { days: diffDays })}
          </span>
        )}
      </Badge>
    </div>
  );
}
