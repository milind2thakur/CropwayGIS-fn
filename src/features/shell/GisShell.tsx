'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Map, Menu, ShoppingBasket, Users, X } from 'lucide-react';
import { useState, useRef, useEffect, type ReactNode } from 'react';

import { CropwayGisLogo } from '@/components/CropwayGisLogo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

import { gisNavItems } from './config';

function ProductDivider() {
  return <span aria-hidden="true" className="h-[43px] w-0 border-l border-black/20" />;
}

function ProductNavIcon({
  kind,
  active,
}: {
  kind: 'gis' | 'seller' | 'market';
  active: boolean;
}) {
  const className = cn('h-6 w-6 shrink-0', active ? 'text-greenDarkActive' : 'text-ink');

  if (kind === 'gis') {
    return <Map className={className} strokeWidth={1.8} />;
  }

  if (kind === 'seller') {
    return <Users className={className} strokeWidth={1.8} />;
  }

  return <ShoppingBasket className={className} strokeWidth={1.8} />;
}

function UserCircleDuotone() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z" fill="#7E869E" fillOpacity="0.25"/>
      <circle cx="12" cy="10" r="4" fill="#222222"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M12 15C14.7073 15 17.0552 16.3177 18.2196 18.2454C18.2778 18.3418 18.2601 18.4652 18.1782 18.5425C16.5662 20.0654 14.3926 21 12 21C9.60732 21 7.43366 20.0654 5.82167 18.5425C5.73985 18.4652 5.72211 18.3418 5.7803 18.2454C6.94469 16.3177 9.29263 15 12 15Z" fill="#222222"/>
    </svg>
  );
}

function ProfileDropdown() {
  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  function handleToggle() {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setDropPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setOpen(v => !v);
  }

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className="flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:bg-black/5"
        onClick={handleToggle}
        aria-label="User profile"
        aria-expanded={open}
      >
        <UserCircleDuotone />
      </button>

      {open && (
        <div
          ref={panelRef}
          style={{ top: dropPos.top, right: dropPos.right }}
          className="fixed z-[300] w-[220px] rounded-[14px] border border-black/10 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.14)]"
        >
          {/* User info header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-black/8">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-greenDarkHover/15">
              <UserCircleDuotone />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-montserrat text-[13px] font-semibold leading-normal text-ink">
                {user?.username || 'My Account'}
              </span>
              <span className="font-montserrat text-[11px] leading-normal text-muted">
                {user?.phone_number || 'CropwayGIS User'}
              </span>
            </div>
          </div>

          <div className="flex flex-col py-1.5">
            {/* 1. Profile */}
            <button 
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-montserrat text-[13px] text-ink transition-colors hover:bg-greenLight"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-greenDarkHover">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Profile
            </button>

            {/* 2. Settings */}
            <button 
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-montserrat text-[13px] text-ink transition-colors hover:bg-greenLight"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-greenDarkHover">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              Settings
            </button>

            <div className="mx-3 my-1 h-px bg-black/10" />

            {/* 3. Login / Logout */}
            <button 
              onClick={() => {
                setOpen(false);
                if (isAuthenticated) {
                  logout();
                }
                router.push('/login');
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-montserrat text-[13px] font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              {isAuthenticated ? 'Logout' : 'Login'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function ProductTopNav({
  collapsed,
  onToggleSidebar,
}: {
  collapsed: boolean;
  onToggleSidebar: () => void;
}) {
  const pathname = usePathname();

  const productNavItems = [
    {
      label: 'GIS',
      href: '/home',
      icon: 'gis' as const,
      activePaths: [
        '/home',
        '/crop-planning',
        '/monitoring-detection',
        '/land-intelligence',
        '/climate-risk',
        '/supply-chain-logistics',
        '/carbon-sustainability',
      ],
    },
    {
      label: 'Seller Studio',
      href: '/home',
      icon: 'seller' as const,
      activePaths: [] as string[],
    },
    {
      label: 'Market Place',
      href: '/home',
      icon: 'market' as const,
      activePaths: [] as string[],
    },
  ];

  return (
    <header className="flex h-[49px] w-full border-b border-black/20 bg-white">
      <div
        className={cn(
          'flex h-full shrink-0 items-center',
          collapsed ? 'w-[64px] justify-center px-2' : 'w-[233px] items-center justify-center px-[18px]'
        )}
      >
        {collapsed ? (
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-[10px] transition hover:bg-greenLight"
            aria-label="Expand sidebar"
            onClick={onToggleSidebar}
          >
            <CropwayGisLogo
              className="justify-center"
              iconClassName="h-8 w-8"
              showWordmark={false}
            />
          </button>
        ) : (
          <div className="flex h-[24px] w-[214px] items-center justify-between">
            <CropwayGisLogo className="min-w-0 shrink-0" iconClassName="h-[16px] w-[110px]" showWordmark />
            <button
              type="button"
              className="flex h-[18px] w-[23px] shrink-0 items-center justify-center rounded-[4px] border-[1.5px] border-ink text-ink transition hover:bg-greenLight"
              aria-label="Collapse sidebar"
              onClick={onToggleSidebar}
            >
              <span className="scale-[0.72]">
                <SidebarToggleGlyph />
              </span>
            </button>
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-between pr-[20px] pl-0">
        <nav className="flex h-[43px] items-center gap-[22px]">
          <ProductDivider />
          {productNavItems.map((item, index) => {
            const active = item.activePaths.includes(pathname);

            return (
              <div key={item.label} className="flex h-full items-center gap-[22px]">
                <Link
                  href={item.href}
                  className={cn(
                    'font-montserrat relative inline-flex h-full items-center gap-[2px] self-start whitespace-nowrap px-0 text-[18px] font-medium leading-[130%] transition text-black',
                    active
                      ? ''
                      : 'opacity-40 hover:opacity-70'
                  )}
                >
                  <ProductNavIcon kind={item.icon} active={active} />
                  <span>{item.label}</span>
                </Link>
                {index < productNavItems.length - 1 ? <ProductDivider /> : null}
              </div>
            );
          })}
        </nav>
        <div className="flex items-center">
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
}

function SidebarToggleGlyph() {
  return (
    <Image src="/menu-logo.svg" alt="" aria-hidden="true" width={23} height={18} className="h-[18px] w-[23px]" />
  );
}

function Sidebar({
  mobile = false,
  onNavigate,
  collapsed = false,
}: {
  mobile?: boolean;
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'border-r border-black/10 bg-white backdrop-blur-[7px] transition-[width] duration-300 ease-in-out',
        mobile ? 'h-full w-[248px]' : collapsed ? 'hidden min-h-screen w-[64px] shrink-0 lg:block' : 'hidden min-h-screen w-[248px] shrink-0 lg:block'
      )}
    >
      <nav
        className={cn(
          'flex flex-col',
          collapsed ? 'items-center gap-[5px] px-2 py-3' : 'gap-[5px] px-3 pt-2'
        )}
      >
        {gisNavItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'font-montserrat transition',
                active
                  ? 'bg-greenDarkHover text-white'
                  : 'text-black/65 hover:bg-greenLight hover:text-ink',
                collapsed
                  ? 'flex h-9 w-9 items-center justify-center rounded-[4px]'
                  : 'flex h-[34px] w-full max-w-[209px] items-center gap-[10px] rounded-[4px] px-[10px] py-[5px] text-[12px] font-medium leading-[130%]'
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={cn(collapsed ? 'h-4 w-4' : 'h-6 w-6', 'shrink-0', active ? 'text-white' : 'text-current')} strokeWidth={1.3} />
              {collapsed ? null : <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function GisShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  return (
    <div className="bg-canvas text-ink">
      <div className="min-h-screen w-full lg:h-screen lg:min-h-0 lg:overflow-hidden">
        <div className="hidden lg:block">
          <ProductTopNav collapsed={desktopCollapsed} onToggleSidebar={() => setDesktopCollapsed((value) => !value)} />
        </div>
        <div className="lg:flex lg:h-[calc(100vh-49px)]">
          <Sidebar collapsed={desktopCollapsed} />
          <div className="relative flex min-h-screen min-w-0 flex-1 flex-col lg:h-full lg:min-h-0">
          <div className="border-b border-line bg-white px-4 py-3 lg:hidden">
            <Button variant="secondary" className="gap-2" onClick={() => setMobileOpen(true)}>
              <Menu className="h-4 w-4" />
              GIS Menu
            </Button>
          </div>
          <main className="flex-1 p-4 lg:flex-none lg:h-full lg:overflow-y-auto lg:p-0">
            {children}
          </main>
        </div>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 bg-greenDarker/40 lg:hidden">
          <div className="flex h-full">
            <Sidebar mobile onNavigate={() => setMobileOpen(false)} />
            <button className="flex-1" aria-label="Close menu" onClick={() => setMobileOpen(false)}>
              <span className="sr-only">Close menu</span>
            </button>
            <button
              aria-label="Close menu"
              className="absolute right-4 top-4 rounded-full bg-white p-2 text-ink shadow-panel"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
