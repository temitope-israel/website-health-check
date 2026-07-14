import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  pages: { signIn: '/admin/login' },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        console.log('LOGIN ATTEMPT:', {
          email,
          passwordLength: password?.length,
        });

        if (!email || !password) {
          console.log('FAILED: missing email or password');
          return null;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          console.log('FAILED: no user found for email', email);
          return null;
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        console.log('bcrypt.compare result:', isValid);
        if (!isValid) return null;

        return { id: user.id, email: user.email };
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin =
        nextUrl.pathname.startsWith('/admin') &&
        nextUrl.pathname !== '/admin/login';

      if (isOnAdmin) return isLoggedIn;
      return true;
    },
  },
});
