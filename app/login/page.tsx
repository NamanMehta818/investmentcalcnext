'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:4000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Something went wrong.');
        return;
      }

      localStorage.setItem('user', JSON.stringify(result.user));
      router.push('/dashboard');
    } catch (err) {
      setError('Could not reach the server.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Log In</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1 text-gray-900 dark:text-gray-100">Email:</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700" />
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-gray-900 dark:text-gray-100">Password:</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700" />
          </div>
          {error && <p className="text-red-600 dark:text-red-400 text-sm mb-4">{error}</p>}
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full">Log In</button>
        </form>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          Don't have an account? <Link href="/signup" className="text-blue-600 dark:text-blue-400 hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}