'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// ─── Context ───
interface SidebarContextValue {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

const SidebarContext = React.createContext<SidebarContextValue>({
  collapsed: false,
  setCollapsed: () => {},
  mobileOpen: false,
  setMobileOpen: () => {},
});

export function useSidebar() {
  return React.useContext(SidebarContext);
}

// ─── Provider ───
export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, mobileOpen, setMobileOpen }}>
      <TooltipProvider>
        {children}
      </TooltipProvider>
    </SidebarContext.Provider>
  );
}

// ─── Sidebar root ───
export function Sidebar({ children, className }: { children: React.ReactNode; className?: string }) {
  const { collapsed } = useSidebar();
  return (
    <aside
      className={cn(
        'hidden md:flex flex-col border-r border-slate-200/80 bg-white flex-shrink-0 transition-all duration-300 ease-in-out h-screen sticky top-0',
        collapsed ? 'w-[60px]' : 'w-[240px]',
        className,
      )}
    >
      {children}
    </aside>
  );
}

// ─── Mobile overlay ───
export function SidebarMobileOverlay() {
  const { mobileOpen, setMobileOpen } = useSidebar();
  if (!mobileOpen) return null;
  return (
    <div
      className="md:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
      onClick={() => setMobileOpen(false)}
    />
  );
}

// ─── Mobile drawer ───
export function SidebarMobile({ children, className }: { children: React.ReactNode; className?: string }) {
  const { mobileOpen } = useSidebar();
  if (!mobileOpen) return null;
  return (
    <aside
      className={cn(
        'md:hidden fixed top-0 left-0 bottom-0 z-50 w-[80vw] max-w-[280px] flex flex-col bg-white shadow-2xl border-r border-slate-200/80',
        className,
      )}
    >
      {children}
    </aside>
  );
}

// ─── Header (brand area) ───
export function SidebarHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center h-14 border-b border-slate-100 px-4', className)}>
      {children}
    </div>
  );
}

// ─── Content / nav area ───
export function SidebarContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <nav className={cn('flex-1 px-3 py-3 space-y-0.5 overflow-y-auto', className)}>
      {children}
    </nav>
  );
}

// ─── Group ───
export function SidebarGroup({ label, children, className }: { label?: string; children: React.ReactNode; className?: string }) {
  const { collapsed } = useSidebar();
  return (
    <div className={cn('py-1', className)}>
      {label && !collapsed && (
        <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 px-3 py-1.5">{label}</p>
      )}
      {label && collapsed && <div className="h-px bg-slate-100 mx-2 my-1.5" />}
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

// ─── Nav item ───
interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href?: string;
  active?: boolean;
  onClick?: () => void;
  badge?: string | number;
  className?: string;
}

export function SidebarItem({ icon: Icon, label, href, active, onClick, badge, className }: SidebarItemProps) {
  const { collapsed, setMobileOpen } = useSidebar();

  const handleClick = () => {
    setMobileOpen(false);
    onClick?.();
  };

  const content = (
    <div
      className={cn(
        'group flex items-center gap-2.5 px-3 py-2.5 text-[13px] rounded-lg transition-all duration-150 cursor-pointer min-h-[44px]',
        collapsed ? 'justify-center' : '',
        active
          ? 'bg-slate-900 text-white font-medium shadow-sm'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        className,
      )}
      onClick={handleClick}
    >
      <Icon className={cn('w-4 h-4 flex-shrink-0', active ? 'text-white' : 'text-slate-400 group-hover:text-slate-700')} />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{label}</span>
          {badge !== undefined && (
            <span className={cn(
              'text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-[18px] text-center',
              active ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600',
            )}>
              {badge}
            </span>
          )}
        </>
      )}
    </div>
  );

  const wrappedContent = href ? (
    <a href={href} className="block no-underline">
      {content}
    </a>
  ) : content;

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger>{wrappedContent}</TooltipTrigger>
        <TooltipContent side="right" className="text-xs font-medium">
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return wrappedContent;
}

// ─── Footer ───
export function SidebarFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('border-t border-slate-100 p-3', className)}>
      {children}
    </div>
  );
}

// ─── Toggle button ───
export function SidebarToggle({ className }: { className?: string }) {
  const { collapsed, setCollapsed } = useSidebar();
  return (
    <button
      onClick={() => setCollapsed(!collapsed)}
      className={cn(
        'w-full flex items-center justify-center gap-2 px-3 py-1.5 text-[11px] text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors',
        className,
      )}
    >
      {collapsed ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          <span>Collapse</span>
        </>
      )}
    </button>
  );
}

// ─── Top bar (mobile) ───
export function SidebarTopBar({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      'md:hidden fixed top-0 left-0 right-0 z-30 h-14 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl flex items-center justify-between px-4',
      className,
    )}>
      {children}
    </div>
  );
}
