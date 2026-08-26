'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const linkClass = (path: string) =>
    `block px-4 py-2 rounded ${pathname === path ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`;

  return (
    <div className="w-48 min-h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-2">
      <Link href="/dashboard" className={linkClass('/dashboard')}>
        Dashboard
      </Link>
      <Link href="/" className={linkClass('/')}>
        Investment Form
      </Link>
      <Link href="/past-investments" className={linkClass('/past-investments')}>
        Past Investments
      </Link>
      <Link href="/retirement-calculator" className={linkClass('/retirement-calculator')}>
        Retirement Calculator
      </Link>
      <Link href="/past-retirement-plans" className={linkClass('/past-retirement-plans')}>
        Past Retirement Plans
      </Link>
    </div>
  );
}