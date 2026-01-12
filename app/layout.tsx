import React from 'react';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full overflow-hidden bg-background">
      <body className='h-full overflow-hidden bg-background'>{children}</body>
    </html>
  );
}