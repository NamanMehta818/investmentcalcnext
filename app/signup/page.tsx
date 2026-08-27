'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'react-qr-code';
import { authClient, signUp } from '../lib/auth-client';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpURI, setTotpURI] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const { error: signUpError } = await signUp.email({
      email,
      password,
      name: email,
    });

    if (signUpError) {
      setError(signUpError.message || 'Something went wrong.');
      return;
    }

    const { data, error: enableError } = await authClient.twoFactor.enable({ password });

    if (enableError) {
      setError(enableError.message || 'Could not set up two-factor authentication.');
      return;
    }

    if (data?.method !== 'totp') {
      setError('Could not create an authenticator setup code.');
      return;
    }

    setTotpURI(data.totpURI);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const { error: verifyError } = await authClient.twoFactor.verifyTotp({ code: verifyCode });

    if (verifyError) {
      setError(verifyError.message || 'Invalid code.');
      return;
    }

    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">{totpURI ? 'Set Up Two-Factor Authentication' : 'Sign Up'}</h1>
        {totpURI ? (
          <form onSubmit={handleVerify}>
            <div className="bg-white p-4 rounded border border-gray-200 mb-4 flex justify-center">
              <QRCode value={totpURI} size={200} />
            </div>
            <input
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
              placeholder="000000"
              maxLength={6}
              required
              inputMode="numeric"
              className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 text-center text-xl tracking-widest mb-4"
            />
            {error && <p className="text-red-600 dark:text-red-400 text-sm mb-4">{error}</p>}
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full">Confirm Setup</button>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block mb-1 text-gray-900 dark:text-gray-100">Email:</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700" />
            </div>
            <div className="mb-4">
              <label className="block mb-1 text-gray-900 dark:text-gray-100">Password:</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700" />
            </div>
            {error && <p className="text-red-600 dark:text-red-400 text-sm mb-4">{error}</p>}
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full">Sign Up</button>
          </form>
        )}
        {!totpURI && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Already have an account? <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">Log in</Link>
          </p>
        )}
      </div>
    </div>
  );
}