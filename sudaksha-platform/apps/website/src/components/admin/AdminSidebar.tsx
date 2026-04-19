'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  Menu,
  X,
  FileText,
  Database,
  Video,
  Plus,
  LogOut,
  Search,
  Building2,
  Bell,
  LayoutTemplate,
  MessageSquare,
  Award,
  Briefcase,
  HelpCircle,
} from 'lucide-react';
import CommandPalette from '@/components/admin/CommandPalette';
import UniversalModal from '@/components/admin/UniversalModal';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/courses', label: 'Courses', icon: BookOpen },
  { href: '/admin/blog', label: 'Blog', icon: FileText },
  { href: '/admin/webinars', label: 'Webinars', icon: Video },
  { href: '/admin/batches', label: 'Batches', icon: Calendar },
  { href: '/admin/offlinebatches', label: 'Corp Engagements', icon: Building2 },
  { href: '/admin/trainers', label: 'Trainers', icon: Users },
  { href: '/admin/conflicts', label: 'Conflicts', icon: AlertTriangle, badge: 3 },
  { href: '/admin/audit', label: 'Audit Trail', icon: Target },
  { href: '/admin/communication', label: 'Communication', icon: Mail },
  { href: '/admin/master-data', label: 'Master Data', icon: Database },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/homepage/hero', label: 'Hero Config', icon: LayoutTemplate },
  { href: '/admin/homepage/announcements', label: 'Announcements', icon: Bell },
  { href: '/admin/testimonials', label: 'Testimonials', icon: MessageSquare },
  { href: '/admin/success-stories', label: 'Success Stories', icon: Award },
  { href: '/admin/faqs', label: 'FAQs', icon: HelpCircle },
  { href: '/admin/job-postings', label: 'Job Postings', icon: Briefcase },
];

interface AdminSidebarProps {
  adminName?: string;
  adminEmail?: string;
}

export default function AdminSidebar({ adminName, adminEmail }: AdminSidebarProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [modalType] = useState<any>('ADD_COURSE');
  const pathname = usePathname();

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

  const isActive = (href: string, isExact?: boolean) => {
    if (isExact || href === '/admin') return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Left Sidebar */}
      <aside
        className={`w-56 bg-white border-r border-gray-200 flex-shrink-0 fixed inset-y-0 left-0 z-40 transition-transform duration-300 shadow-sm ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-12 flex items-center px-4 border-b border-gray-200 gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600 shrink-0" />
            <span className="text-sm font-bold text-gray-900">Sudaksha Admin</span>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-2 py-2 overflow-y-auto">
            <ul className="space-y-0.5">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href, item.href === '/admin');
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${
                        active
                          ? 'bg-indigo-50 text-indigo-600 border-l-2 border-indigo-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="font-medium text-xs">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-100 p-3 space-y-2">
            {adminEmail && (
              <div className="px-2 py-1">
                <p className="text-xs font-medium text-gray-900 truncate">{adminName || 'Admin'}</p>
                <p className="text-xs text-gray-500 truncate">{adminEmail}</p>
              </div>
            )}
            <div className="flex items-center justify-between px-2">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-1.5 rounded hover:bg-gray-100"
                title="Toggle dark mode"
              >
                {isDarkMode ? (
                  <Sun className="h-4 w-4 text-gray-600" />
                ) : (
                  <Moon className="h-4 w-4 text-gray-600" />
                )}
              </button>
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded text-xs text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Top bar (mobile menu button + search + actions) */}
      <header className="fixed top-0 left-0 lg:left-56 right-0 z-20 border-b bg-white border-gray-200 shadow-sm h-12">
        <div className="w-full px-3 h-full flex items-center justify-between">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded hover:bg-gray-100"
            >
              <Menu className="h-4 w-4 text-gray-600" />
            </button>

            <div className="flex-1 max-w-sm mx-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-1.5 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-8 pr-3 py-1 text-sm border border-gray-300 rounded bg-white text-gray-900 placeholder-gray-500 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  onFocus={() => setIsCommandPaletteOpen(true)}
                  readOnly
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCommandPaletteOpen(true)}
                className="p-1.5 rounded hover:bg-gray-100 text-gray-600 text-xs hidden lg:flex items-center gap-1"
              >
                <span>⌘K</span>
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="p-1.5 rounded hover:bg-gray-100 bg-indigo-50 text-indigo-600"
                title="Quick add"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
        </div>
      </header>

      {/* Command Palette */}
      {isCommandPaletteOpen && (
        <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />
      )}

      {/* Universal Modal */}
      {isModalOpen && (
        <UniversalModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          type={modalType}
          title=""
          data={null}
          onSubmit={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
