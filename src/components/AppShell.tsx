"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, MoreHorizontal, LogOut, Zap, Home, Map as MapIcon, Calendar, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BottomTabs } from '@/components/ui/BottomTabs';

export interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell = ({ children }: AppShellProps) => {
  const pathname = usePathname();
  const [mode, setMode] = useState<'renter' | 'host'>('renter');
  const [menuOpen, setMenuOpen] = useState(false);

  const renterTabs = [
    { label: 'Explore', href: '/map', icon: <MapIcon size={24} /> },
    { label: 'Bookings', href: '/bookings', icon: <Calendar size={24} /> },
    { label: 'Chat', href: '/chat', icon: <MessageSquare size={24} /> },
  ];

  const hostTabs = [
    { label: 'Host', href: '/host', icon: <Home size={24} /> },
    { label: 'Requests', href: '/host/requests', icon: <Calendar size={24} /> },
    { label: 'Earnings', href: '/host/earnings', icon: <Zap size={24} /> },
  ];

  const currentTabs = mode === 'renter' ? renterTabs : hostTabs;

  return (
    <div className="min-h-screen bg-kilari-bg flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-kilari-card-border p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-kilari-light-green rounded-xl flex items-center justify-center">
            <Zap size={24} className="text-kilari-primary" />
          </div>
          <span className="text-xl font-extrabold text-kilari-main">Kilari</span>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          {currentTabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all',
                pathname === tab.href
                  ? 'bg-kilari-notice text-kilari-primary'
                  : 'text-kilari-muted hover:bg-kilari-card'
              )}
            >
              {tab.icon}
              {tab.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-kilari-card-border">
          <button
            onClick={() => {}} // Sign out logic
            className="flex items-center gap-3 px-4 py-3 w-full rounded-2xl text-kilari-muted hover:bg-red-50 hover:text-red-600 transition-colors font-medium"
          >
            <LogOut size={20} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-kilari-card-border px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            {/* Mobile Logo */}
            <div className="md:hidden flex items-center gap-2">
              <Zap size={20} className="text-kilari-primary" />
              <span className="font-extrabold text-kilari-main">Kilari</span>
            </div>
            <h2 className="hidden md:block text-lg font-bold text-kilari-main">
              {currentTabs.find(t => t.href === pathname)?.label || 'Kilari'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Rent/Lend Switch */}
            <div className="bg-kilari-bg p-1 rounded-full border border-kilari-card-border flex items-center">
              <button
                onClick={() => setMode('renter')}
                className={cn(
                  'px-4 py-1.5 rounded-full text-xs font-bold transition-all',
                  mode === 'renter' ? 'bg-white text-kilari-primary shadow-sm' : 'text-kilari-muted'
                )}
              >
                Rent
              </button>
              <button
                onClick={() => setMode('host')}
                className={cn(
                  'px-4 py-1.5 rounded-full text-xs font-bold transition-all',
                  mode === 'host' ? 'bg-white text-kilari-primary shadow-sm' : 'text-kilari-muted'
                )}
              >
                Lend
              </button>
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-full hover:bg-kilari-card text-kilari-muted"
            >
              <MoreHorizontal size={24} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 pb-24 md:pb-0">
          {children}
        </main>

        {/* Mobile Tabs */}
        <div className="md:hidden">
          <BottomTabs items={currentTabs} />
        </div>

        {/* Menu Dropdown */}
        {menuOpen && (
          <div className="fixed top-16 right-6 w-48 bg-white border border-kilari-card-border rounded-2xl shadow-xl z-50 p-2 animate-in slide-in-from-top-2">
            <button
              onClick={() => {}} // Sign out logic
              className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-600 hover:bg-red-50 transition-colors font-medium text-sm"
            >
              <LogOut size={18} />
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
