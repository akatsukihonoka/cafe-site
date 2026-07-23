import type { ReactNode } from 'react';
import Link from 'next/link';
import { LogoutButton } from '@/components/layout/LogoutButton';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
        <span className="font-semibold">YouTube社員AI</span>
        <nav className="flex items-center gap-4">
          <Link
            href="/settings"
            className="text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            設定
          </Link>
          <LogoutButton />
        </nav>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
