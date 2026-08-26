'use client';

import "./globals.css";
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from "./components/Sidebar";
import ThemeToggle from "./components/ThemeToggle";

const PUBLIC_PATHS = ['/signup', '/login'];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isPublicPath = PUBLIC_PATHS.includes(pathname);
  const [checked, setChecked] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    if (isPublicPath) {
      setChecked(true);
      setUserEmail(null);
      return;
    }
    const stored = localStorage.getItem('user');
    if (!stored) {
      router.replace('/login');
    } else {
      const user = JSON.parse(stored);
      setUserEmail(user.email);
      setChecked(true);
    }
  }, [pathname, isPublicPath, router]);

  if (!isPublicPath && !checked) {
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
              {userEmail && <span className="text-sm text-gray-600 dark:text-gray-400">{userEmail}</span>}
            </div>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}