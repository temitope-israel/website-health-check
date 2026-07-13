'use client';

import { useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid email or password');
      setLoading(false);
      return;
    }

    router.push('/admin');
  }

  return (
    <main className="mx-auto max-w-sm px-6 py-24">
      <p className="font-mono text-xs uppercase tracking-widest text-mist">
        Hotis Studio
      </p>
      <h1 className="mt-2 font-display text-2xl text-paper">Admin Login</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full rounded-md border border-mist/20 bg-void px-4 py-3 font-mono text-sm text-paper placeholder:text-mist/50 focus:outline-none focus:ring-2 focus:ring-beacon"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded-md border border-mist/20 bg-void px-4 py-3 font-mono text-sm text-paper placeholder:text-mist/50 focus:outline-none focus:ring-2 focus:ring-beacon"
        />
        {error && <p className="font-mono text-sm text-red-400">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Signing in…' : 'Sign In'}
        </Button>
      </form>
    </main>
  );
}
