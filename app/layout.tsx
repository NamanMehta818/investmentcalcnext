'use client';

import "./globals.css";
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from "./components/Sidebar";
import ThemeToggle from "./components/ThemeToggle";
import { useSession } from './lib/auth-client';
import { useEffect } from 'react';

const PUBLIC_PATHS = ['/signup', '/login'];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isPublicPath = PUBLIC_PATHS.includes(pathname);
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (isPending) return;

    if (!isPublicPath && !session) {
      router.replace('/login');
      return;
    }

  }, [isPending, session, isPublicPath, pathname, router]);

  if (!isPublicPath && (isPending || !session)) {
    return (
      <html lang="en">
        <body className="dark:bg-gray-950" />
      </html>
    );
  }

  return (
    <html lang="en">
      <body className="dark:bg-gray-950">
        <div className="flex">
          {!isPublicPath && <Sidebar />}
          <div className="flex-1">
            <div className="flex items-center justify-end gap-3 p-4">
              <ThemeToggle />
              {session?.user?.email && <span className="text-sm text-gray-600 dark:text-gray-400">{session.user.email}</span>}
            </div>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}