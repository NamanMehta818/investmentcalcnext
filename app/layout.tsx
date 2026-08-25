import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import ThemeToggle from "./components/ThemeToggle";

export const metadata: Metadata = {
  title: "Investment Calculator",
  description: "Calculate and compare investment returns",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="dark:bg-gray-950">
        <div className="flex">
          <Sidebar />
          <div className="flex-1">
            <div className="flex justify-end p-4">
              <ThemeToggle />
            </div>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}