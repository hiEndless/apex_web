import { redirect } from 'next/navigation';

export default async function Page({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Always redirect to overview in demo
  redirect(`/${locale}/dashboard/overview`);
}
