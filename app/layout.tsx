import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kilari — Charge Today. Go Further.',
  description: 'Kilari EV charging community prototype.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: '100vh' }}>{children}</body>
    </html>
  );
}
