'use client';

import { signOut } from 'next-auth/react';

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/admin/login' })}
      className="font-mono text-xs text-mist hover:text-paper"
    >
      Sign out
    </button>
  );
}
