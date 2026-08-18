'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const linkClass = (path: string) =>
    `block px-4 py-2 rounded ${pathname === path ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`;

  return (
    <div className="w-48 min-h-screen bg-white border-r border-gray-200 p-4 flex flex-col gap-2">
      <Link href="/" className={linkClass('/')}>Investment Form</Link>
      <Link href="/past-investments" className={linkClass('/past-investments')}>Past Investments</Link>
    </div>
  );
}