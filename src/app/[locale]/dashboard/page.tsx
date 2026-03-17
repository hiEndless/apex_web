import { redirect } from 'next/navigation';

export default async function Dashboard() {
  // Always redirect to overview in demo
  redirect('/dashboard/overview');
}
