'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-browser';
import { useProfileStore } from '@/store/useProfileStore';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard, ScanSearch, History, MessageSquare,
  LogOut, Menu, X, PanelLeftClose, PanelLeft,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/scan', label: 'New Scan', icon: ScanSearch },
  { href: '/dashboard/history', label: 'History', icon: History },
  { href: '/dashboard/chat', label: 'AI Co-pilot', icon: MessageSquare },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const { user, setUser, setLoading } = useProfileStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

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

  useEffect(() => { setMobileOpen(false); }, [pathname]);

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

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <aside className={`hidden md:flex flex-col border-r bg-card flex-shrink-0 transition-all duration-200 ${collapsed ? 'w-14' : 'w-56'}`}>
        {/* Brand */}
        <div className={`border-b flex items-center ${collapsed ? 'justify-center p-3' : 'p-4 justify-between'}`}>
          {!collapsed && (
            <Link href="/dashboard" className="block min-w-0">
              <span className="text-sm font-semibold tracking-tight">CareerLens AI</span>
              <p className="text-[10px] text-muted-foreground">Prove It or Build It</p>
            </Link>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="p-1 rounded-md hover:bg-secondary transition-colors flex-shrink-0">
            {collapsed ? <PanelLeft className="w-4 h-4 text-muted-foreground" /> : <PanelLeftClose className="w-4 h-4 text-muted-foreground" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-0.5">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors ${collapsed ? 'justify-center' : ''} ${
                  active ? 'bg-secondary text-foreground font-medium' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && item.label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className={`border-t ${collapsed ? 'p-2' : 'p-3'}`}>
          {user && !collapsed && (
            <div className="mb-2 px-2">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className={`w-full text-muted-foreground hover:text-destructive ${collapsed ? 'justify-center px-0' : 'justify-start'}`}
            onClick={handleLogout}
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span className="ml-2">Log out</span>}
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-12 border-b bg-card flex items-center justify-between px-3">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-1.5 rounded-md hover:bg-secondary transition-colors">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="text-sm font-semibold tracking-tight">CareerLens AI</span>
        </div>
      </div>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <>
          <div className="md:hidden fixed inset-0 z-40 bg-black/20" onClick={() => setMobileOpen(false)} />
          <aside className="md:hidden fixed top-12 left-0 bottom-0 z-50 w-56 flex flex-col border-r bg-card">
            <nav className="flex-1 p-2 space-y-0.5">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link key={item.href} href={item.href}
                    className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors ${active ? 'bg-secondary text-foreground font-medium' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'}`}>
                    <item.icon className="w-4 h-4 flex-shrink-0" /> {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="p-3 border-t">
              {user && (
                <div className="mb-2 px-2">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                </div>
              )}
              <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-destructive" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" /> Log out
              </Button>
            </div>
          </aside>
        </>
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="md:p-6 p-4 pt-16 md:pt-6 max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
