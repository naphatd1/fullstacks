import { Inter } from 'next/font/google';
import { defaultMetadata } from './metadata';
import ClientLayout from '@/components/ClientLayout';
import './globals.css';

export const metadata = defaultMetadata;

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" suppressHydrationWarning={true}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className} suppressHydrationWarning={true}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}