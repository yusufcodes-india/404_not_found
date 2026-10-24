import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Kilari — Charge Today. Go Further.',
  description: 'Kilari EV charging community prototype.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: '100vh' }}>{children}</body>
    </html>
  );
}
