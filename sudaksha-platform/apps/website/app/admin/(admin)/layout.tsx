import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import AdminSidebar from '@/components/admin/AdminSidebar';

async function getAdminSession() {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get('admin_session')?.value;
    if (!raw) return null;
    const session = JSON.parse(raw);
    return session?.email ? session : null;
  } catch {
    return null;
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  if (!session) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar adminName={session.name} adminEmail={session.email} />
      <main className="lg:ml-56 flex-1 pt-12 p-6 min-h-screen">
        {children}
      </main>
    </div>
  );
}
