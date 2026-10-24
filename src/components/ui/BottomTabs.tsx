import * as React from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface TabItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export interface BottomTabsProps {
  items: TabItem[];
}

export const BottomTabs = ({ items }: BottomTabsProps) => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-kilari-card-border px-6 py-3 pb-8 flex justify-between items-center z-50">
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-1 transition-colors',
              isActive ? 'text-kilari-primary' : 'text-kilari-muted'
            )}
          >
            <div className={cn('transition-transform', isActive && 'scale-110')}>
              {item.icon}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tighter">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};
