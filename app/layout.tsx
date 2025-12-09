import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '우리동네 장보기 - 캐파 장바구니',
  description: '우리동네 장보기 - 캐파 장바구니',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: '우리동네 장보기 - 캐파 장바구니',
    description: '우리동네 장보기 - 캐파 장바구니',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
