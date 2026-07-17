import type { Metadata } from 'next';
import { Inter, Space_Grotesk, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { PostHogProvider } from '@/components/PostHogProvider';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
});

const spaceGrotesk = Space_Grotesk({
  variable: '--font-display',
  subsets: ['latin'],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'Website Health Check | Hotis Studio',
  description:
    'Free instant website audit — performance, SEO, and accessibility scored in seconds. Get a full PDF report emailed to you.',
  openGraph: {
    title: 'Website Health Check | Hotis Studio',
    description:
      'Free instant website audit — performance, SEO, and accessibility scored in seconds.',
    url: 'https://webbsite-health-check.vercel.app/',
    siteName: 'Hotis Studio',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Website Health Check | Hotis Studio',
    description:
      'Free instant website audit — performance, SEO, and accessibility scored in seconds.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased`}>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${ibmPlexMono.variable} antialiased`}
      >
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
