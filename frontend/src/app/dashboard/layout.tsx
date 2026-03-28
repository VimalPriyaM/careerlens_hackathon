'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import { useProfileStore } from '@/store/useProfileStore';
import {
  SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarGroup,
  SidebarItem, SidebarFooter, SidebarToggle, SidebarTopBar,
  SidebarMobileOverlay, SidebarMobile, useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard, ScanSearch, History, MessageSquare,
  LogOut, Menu, X,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/scan', label: 'New Scan', icon: ScanSearch },
  { href: '/dashboard/history', label: 'History', icon: History },
  { href: '/dashboard/chat', label: 'AI Co-pilot', icon: MessageSquare },
];

function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const { user, setUser, setLoading } = useProfileStore();
  const { collapsed, mobileOpen, setMobileOpen } = useSidebar();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email || '',
        });
      }
      setLoading(false);
    };
    getUser();
  }, [supabase, setUser, setLoading]);

  useEffect(() => { setMobileOpen(false); }, [pathname, setMobileOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    useProfileStore.getState().clearStore();
    router.push('/login');
    router.refresh();
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const sidebarNav = (
    <>
      <SidebarHeader>
        {!collapsed && (
          <a href="/dashboard" className="flex items-center gap-2 no-underline">
            <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center">
              <span className="text-white text-xs font-bold">C</span>
            </div>
            <span className="text-[15px] font-bold tracking-tight text-slate-900">CareerLens</span>
          </a>
        )}
        {collapsed && (
          <a href="/dashboard" className="mx-auto no-underline">
            <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center">
              <span className="text-white text-xs font-bold">C</span>
            </div>
          </a>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup label="Menu">
          {navItems.map(item => (
            <SidebarItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              active={isActive(item.href)}
            />
          ))}
        </SidebarGroup>
      </SidebarContent>

      <SidebarToggle />

      <SidebarFooter>
        {user && !collapsed && (
          <div className="mb-2 px-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center flex-shrink-0">
                <span className="text-[11px] font-semibold text-white">{user.name?.charAt(0)?.toUpperCase() || 'U'}</span>
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-slate-900 truncate">{user.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}
        {user && collapsed && (
          <div className="flex justify-center mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
              <span className="text-[11px] font-semibold text-white">{user.name?.charAt(0)?.toUpperCase() || 'U'}</span>
            </div>
          </div>
        )}
        <SidebarItem
          icon={LogOut}
          label="Log out"
          onClick={handleLogout}
          className="text-slate-400 hover:!bg-red-50 hover:!text-red-600"
        />
      </SidebarFooter>
    </>
  );

  return (
    <div className="min-h-screen flex bg-slate-50/60">
      {/* Desktop sidebar */}
      <Sidebar>{sidebarNav}</Sidebar>

      {/* Mobile top bar */}
      <SidebarTopBar>
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            {mobileOpen ? <X className="w-5 h-5 text-slate-700" /> : <Menu className="w-5 h-5 text-slate-700" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-slate-900 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">C</span>
            </div>
            <span className="text-sm font-bold tracking-tight text-slate-900">CareerLens</span>
          </div>
        </div>
      </SidebarTopBar>

      {/* Mobile sidebar */}
      <SidebarMobileOverlay />
      <SidebarMobile>{sidebarNav}</SidebarMobile>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="p-3 pt-16 sm:p-4 sm:pt-18 md:p-8 md:pt-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DashboardShell>{children}</DashboardShell>
    </SidebarProvider>
  );
}
