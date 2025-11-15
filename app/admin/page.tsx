import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { checkAdminAccess } from '../../lib/admin';
import AdminDashboard from '@/components/admin/AdminDashboard';

export default async function AdminPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  const isAdmin = await checkAdminAccess(userId);
  
  if (!isAdmin) {
    redirect('/dashboard');
  }

  return <AdminDashboard />;
}