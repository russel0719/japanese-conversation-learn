'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, XCircle, Star, RotateCcw } from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: '홈' },
  { path: '/search', icon: Search, label: '검색' },
  { path: '/wrong', icon: XCircle, label: '오답' },
  { path: '/favorites', icon: Star, label: '즐겨찾기' },
  { path: '/review', icon: RotateCcw, label: '복습' },
];

export default function BottomNav() {
  const pathname = usePathname();

  // unit 페이지나 auth 콜백에서는 숨김
  if (pathname.startsWith('/unit/') || pathname.startsWith('/auth/')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-[60px] bg-white dark:bg-[#0b0b0c] border-t border-gray-200 dark:border-gray-800 flex items-center safe-area-pb">
      <div className="w-full max-w-2xl mx-auto flex">
        {navItems.map(({ path, icon: Icon, label }) => {
          const active = pathname === path;
          return (
            <Link
              key={path}
              href={path}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-opacity active:opacity-60
                ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-600'}`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
