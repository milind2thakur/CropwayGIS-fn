'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, Menu, ShoppingBasket, Users, X } from 'lucide-react';
import { useState, useRef, useEffect, type ReactNode } from 'react';

import { CropwayGisLogo } from '@/components/CropwayGisLogo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { gisNavItems } from './config';

function ProductDivider() {
  return <span aria-hidden="true" className="h-6 w-0 border-l border-black/10" />;
}

function ProductNavIcon({
  kind,
  active,
}: {
  kind: 'gis' | 'seller' | 'market';
  active: boolean;
}) {
  const className = cn('h-6 w-6 shrink-0', active ? 'text-[#203A13]' : 'text-black');

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
    <div className="relative h-6 w-6 shrink-0">
      <span className="absolute inset-0 rounded-full bg-[#7e869e]/25" />
      <span className="absolute left-1/2 top-[6px] h-2 w-2 -translate-x-1/2 rounded-full bg-[#222222]" />
      <span className="absolute bottom-[3px] left-1/2 h-[7px] w-[13px] -translate-x-1/2 rounded-t-[8px] bg-[#222222]" />
    </div>
  );
}

function ProfileDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button 
        type="button" 
        className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-black/5"
        onClick={() => setOpen(!open)}
        aria-label="User profile"
        aria-expanded={open}
      >
        <UserCircleDuotone />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[200px] overflow-hidden rounded-[12px] border border-black/10 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
          <div className="flex flex-col py-2">
            <button className="flex w-full items-center px-4 py-2 font-montserrat text-[14px] text-black transition-colors hover:bg-[#f3f6ef]">
              Profile
            </button>
            <button className="flex w-full items-center px-4 py-2 font-montserrat text-[14px] text-black transition-colors hover:bg-[#f3f6ef]">
              Settings
            </button>
            <div className="my-1 h-px w-full bg-black/10" />
            <button className="flex w-full items-center px-4 py-2 font-montserrat text-[14px] font-medium text-[#d34b4b] transition-colors hover:bg-[#d34b4b]/10">
              Login / Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductTopNav() {
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
    <header className="h-[64px] w-full border-b border-black/20 bg-white px-6">
      <div className="flex h-full w-full items-center justify-between">
        <nav className="flex h-full items-center gap-4 lg:gap-6">
          {productNavItems.map((item, index) => {
            const active = item.activePaths.includes(pathname);

            return (
              <div key={item.label} className="flex h-full items-center gap-4 lg:gap-6">
                <Link
                  href={item.href}
                  className={cn(
                    'font-montserrat relative flex h-full items-center gap-2 whitespace-nowrap text-[14px] font-medium leading-[1.3] transition lg:text-[15px]',
                    active
                      ? 'text-[#203A13] border-b-2 border-[#203A13] font-semibold'
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
    <svg width="23" height="18" viewBox="0 0 23 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 0.75H19C20.7949 0.75 22.25 2.20507 22.25 4V14C22.25 15.7949 20.7949 17.25 19 17.25H4C2.20507 17.25 0.75 15.7949 0.75 14V4C0.75 2.20507 2.20507 0.75 4 0.75Z" stroke="black" strokeWidth={1.5}/>
      <path d="M7.75 0.75V17.25" stroke="black" strokeWidth={1.5}/>
    </svg>
  );
}

function Sidebar({
  mobile = false,
  onNavigate,
  onToggleDesktop,
}: {
  mobile?: boolean;
  onNavigate?: () => void;
  onToggleDesktop?: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'border-r border-[#000000]/20 bg-white backdrop-blur-[7px]',
        mobile ? 'h-full w-[250px]' : 'hidden min-h-screen w-[250px] shrink-0 lg:block'
      )}
    >
      <div className="relative h-[64px] border-b border-black/20">
        <div className="absolute left-[19px] top-[23px] flex h-[18px] w-[215px] items-center justify-between">
          <CropwayGisLogo className="h-[15px] w-[102px] shrink-0" />
          <button
            type="button"
            className="flex h-[18px] w-[23px] items-center justify-center"
            aria-label={mobile ? 'Close sidebar' : 'Toggle sidebar'}
            onClick={mobile ? onNavigate : onToggleDesktop}
          >
            <SidebarToggleGlyph />
          </button>
        </div>
      </div>
      <nav className="flex flex-col gap-2 px-[19px] pt-[21px]">
        {gisNavItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'font-montserrat flex h-[42px] items-center gap-[12px] rounded-[6px] px-[12px] py-[8px] text-[14px] font-medium leading-[1.3] text-black transition',
                active
                  ? 'bg-[#2B4D1A] text-white'
                  : 'opacity-50 hover:bg-[#f3f6ef] hover:opacity-100'
              )}
            >
              <Icon className={cn('h-[22px] w-[22px] shrink-0', active ? 'text-white' : 'text-black')} strokeWidth={1.7} />
              <span>{item.label}</span>
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
      <div className="min-h-screen w-full lg:h-screen lg:min-h-0 lg:overflow-hidden lg:flex">
        <div
          className={cn(
            'hidden shrink-0 overflow-hidden transition-[width,opacity,transform] duration-300 ease-in-out lg:block',
            desktopCollapsed ? 'w-0 -translate-x-6 opacity-0' : 'w-[250px] translate-x-0 opacity-100'
          )}
          aria-hidden={desktopCollapsed}
        >
          <Sidebar onToggleDesktop={() => setDesktopCollapsed(true)} />
        </div>
        <div className="relative flex min-h-screen min-w-0 flex-1 flex-col lg:h-full lg:min-h-0">
          <div className="border-b border-line bg-white px-4 py-3 lg:hidden">
            <Button variant="secondary" className="gap-2" onClick={() => setMobileOpen(true)}>
              <Menu className="h-4 w-4" />
              GIS Menu
            </Button>
          </div>
          <div
            className={cn(
              'hidden overflow-hidden transition-[max-height,opacity,transform,border-color] duration-300 ease-in-out lg:block',
              desktopCollapsed ? 'max-h-0 -translate-y-3 opacity-0' : 'max-h-[64px] translate-y-0 opacity-100'
            )}
          >
            <ProductTopNav />
          </div>
          <main
            className={cn(
              'flex-1 p-4 transition-[height,padding] duration-300 ease-in-out lg:flex-none lg:overflow-y-auto lg:p-0',
              desktopCollapsed
                ? 'lg:h-screen lg:pl-[68px] lg:pt-[16px]'
                : 'lg:h-[calc(100vh-64px)]'
            )}
          >
            {desktopCollapsed ? (
              <button
                type="button"
                aria-label="Open sidebar"
                className="fixed left-5 top-5 z-40 hidden h-[36px] w-[36px] items-center justify-center rounded-[8px] border border-black/15 bg-white text-ink shadow-sm transition hover:bg-[#f6f7f4] lg:flex"
                onClick={() => setDesktopCollapsed(false)}
              >
                <SidebarToggleGlyph />
              </button>
            ) : null}
            {children}
          </main>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 bg-[#21311f]/40 lg:hidden">
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
