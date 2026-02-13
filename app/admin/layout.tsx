'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BarChart3, 
  BookOpen, 
  Calendar, 
  Users, 
  AlertTriangle, 
  Target,
  Mail,
  Sun, 
  Moon, 
  Search,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Home,
  Settings,
  ChevronDown
} from 'lucide-react';
import NotificationCenter from '@/components/admin/NotificationCenter';
import UniversalModal from '@/components/admin/UniversalModal';
import CommandPalette from '@/components/admin/CommandPalette';
import ImpersonationMode from '@/components/admin/ImpersonationMode';
import LiveFeedSidebar from '@/components/admin/LiveFeedSidebar';

export default function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<any>('ADD_COURSE');
  const [modalData, setModalData] = useState<any>(null);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonatedUser, setImpersonatedUser] = useState<any>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/assessments');
      router.refresh();
    } catch {
      router.push('/assessments');
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  };

  // Mock notifications
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'warning' as const,
      title: 'Trainer Conflict Detected',
      message: 'John Doe is double-booked for two batches on Monday',
      time: '2 mins ago',
      user: 'System',
      actionUrl: '/admin/conflicts',
      actionText: 'View Conflict',
      read: false
    },
    {
      id: '2',
      type: 'error' as const,
      title: 'Low Enrollment Alert',
      message: 'Data Science batch has only 3 students (min: 10)',
      time: '5 mins ago',
      user: 'System',
      actionUrl: '/admin/batches',
      actionText: 'View Batch',
      read: false
    },
    {
      id: '3',
      type: 'info' as const,
      title: 'Contract Expiring Soon',
      message: 'Jane Smith\'s contract expires in 7 days',
      time: '1 hour ago',
      user: 'System',
      actionUrl: '/admin/trainers',
      actionText: 'Renew Contract',
      read: false
    },
    {
      id: '4',
      type: 'success' as const,
      title: 'New Course Created',
      message: 'AI/ML Engineering course has been successfully created',
      time: '2 hours ago',
      user: 'Admin User',
      read: true
    }
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNotificationClick = (notification: any) => {
    // Mark as read
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    );
    
    // Navigate to action URL if available
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleModalSubmit = (data: any) => {
    console.log('Modal submitted:', modalType, data);
    setIsModalOpen(false);
    setModalData(null);
  };

  const handleImpersonate = (userId: string, userType: 'student' | 'trainer') => {
    console.log('Impersonating user:', userId, userType);
    // In real app, this would fetch user data and set impersonation state
    setImpersonatedUser({
      id: userId,
      name: userType === 'student' ? 'John Doe' : 'Jane Smith',
      email: userType === 'student' ? 'john@example.com' : 'jane@example.com',
      type: userType
    });
    setIsImpersonating(true);
  };

  const handleStopImpersonating = () => {
    console.log('Stopping impersonation');
    setIsImpersonating(false);
    setImpersonatedUser(null);
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className={`min-h-screen antialiased ${isDarkMode ? 'bg-gray-900' : 'bg-background'}`}>
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Sidebar - hidden on small screens, toggle via menu if needed later */}
        <aside className={`hidden md:flex md:w-64 lg:w-72 shrink-0 flex-col border-r min-h-screen ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-card border-border'}`}>
          {/* Logo */}
          <div className={`p-4 lg:p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-border'}`}>
            <h1 className={`text-xl lg:text-2xl font-display font-semibold ${isDarkMode ? 'text-white' : 'text-foreground'}`}>
              Sudaksha Admin
            </h1>
          </div>

          {/* Search */}
          <div className="p-3 lg:p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Quick search (Ctrl+K)..."
                onClick={() => setIsCommandPaletteOpen(true)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-muted border-input'}`}
                readOnly
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 lg:px-4 overflow-y-auto">
            <ul className="space-y-1">
              {[
                { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
                { href: '/admin/courses', label: 'Courses', icon: BookOpen },
                { href: '/admin/batches', label: 'Batches', icon: Calendar },
                { href: '/admin/trainers', label: 'Trainers', icon: Users },
                { href: '/admin/enrollments', label: 'Enrollments', icon: Users },
                { href: '/admin/industries', label: 'Industries', icon: Target },
                { href: '/admin/training-types', label: 'Training Types', icon: Target },
                { href: '/admin/conflicts', label: 'Conflicts', icon: AlertTriangle, badge: 3 },
                { href: '/admin/audit', label: 'Audit Trail', icon: Target },
                { href: '/admin/communication', label: 'Communication', icon: Mail },
                { href: '/admin/settings', label: 'Settings', icon: Settings },
              ].map(({ href, label, icon: Icon, badge }) => (
                <li key={href}>
                  <a
                    href={href}
                    className={`flex items-center gap-3 px-3 py-2.5 lg:px-4 lg:py-3 rounded-lg transition-colors text-sm ${
                      isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="truncate">{label}</span>
                    {badge != null && (
                      <span className="ml-auto bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full shrink-0">{badge}</span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Dark Mode Toggle */}
          <div className={`p-3 lg:p-4 border-t shrink-0 ${isDarkMode ? 'border-gray-700' : 'border-border'}`}>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              type="button"
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm ${
                isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-muted text-muted-foreground hover:bg-secondary'
              }`}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex">
          <main className="flex-1 flex flex-col">
            {/* Header */}
            <header className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-8 py-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Management Dashboard
                  </h1>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Welcome back! Here's what's happening with your platform.
                  </p>
                </div>
                
                <div className="flex items-center space-x-4">
                  {/* Quick Actions */}
                  <button
                    onClick={() => {
                      setModalType('ADD_COURSE');
                      setIsModalOpen(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Add Course</span>
                  </button>

                  <button
                    onClick={() => {
                      setModalType('CREATE_BATCH');
                      setIsModalOpen(true);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Create Batch</span>
                  </button>

                  {/* Notifications */}
                  <NotificationCenter
                    notifications={notifications}
                    onNotificationClick={handleNotificationClick}
                    onMarkAllRead={handleMarkAllRead}
                    onClearAll={handleClearAll}
                  />

                  {/* Impersonation Mode */}
                  <ImpersonationMode
                    onImpersonate={handleImpersonate}
                    onStopImpersonating={handleStopImpersonating}
                    isImpersonating={isImpersonating}
                    currentUser={impersonatedUser}
                  />

                  {/* User Profile & Logout */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="hidden sm:block text-right">
                      <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-foreground'}`}>
                        Admin User
                      </div>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}>
                        admin@sudaksha.com
                      </div>
                    </div>
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm shrink-0">
                      A
                    </div>
                    <button
                      onClick={handleLogout}
                      disabled={loggingOut}
                      type="button"
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50 ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-muted-foreground hover:bg-muted'} shrink-0`}
                      title="Sign out"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="hidden sm:inline">{loggingOut ? 'Signing out…' : 'Sign out'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </header>

            {/* Page Content - responsive */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
              {children}
            </div>
          </main>

          {/* Live Feed Sidebar - hidden on small screens */}
          <div className="hidden lg:block shrink-0">
            <LiveFeedSidebar />
          </div>
        </div>
      </div>

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />

      {/* Universal Modal */}
      <UniversalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={modalType}
        title={modalType === 'ADD_COURSE' ? 'Add New Course' : 
              modalType === 'CREATE_BATCH' ? 'Create New Batch' : 
              modalType === 'EDIT_TRAINER' ? 'Edit Trainer' : 'Modal'}
        data={modalData}
        onSubmit={handleModalSubmit}
        isLoading={false}
      />
    </div>
  );
}
