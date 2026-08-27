'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from '../lib/auth-client';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const linkClass = (path: string) =>
    `block px-4 py-2 rounded ${pathname === path ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`;

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="w-48 min-h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col justify-between">
      <div className="flex flex-col gap-2">
        <Link href="/dashboard" className={linkClass('/dashboard')}>
          Dashboard
        </Link>
        <Link href="/past-investments" className={linkClass('/past-investments')}>
          Investments
        </Link>
        <Link href="/retirement-calculator" className={linkClass('/retirement-calculator')}>
          Retirement Calculator
        </Link>
        <Link href="/past-retirement-plans" className={linkClass('/past-retirement-plans')}>
          Past Retirement Plans
        </Link>
      </div>

      <button onClick={handleSignOut} className="text-left px-4 py-2 rounded text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950">
        Sign Out
      </button>
    </div>
  );
}