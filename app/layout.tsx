import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/prodrive/header';
import { Sidebar } from '@/components/prodrive/sidebar';
import { UploadStatusToast } from '@/components/prodrive/upload-status-toast';

export const metadata: Metadata = {
  title: 'Neup.Drive',
  description: 'Secure cloud storage and collaboration platform.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <div className="flex min-h-screen w-full flex-col bg-white">
          <Header />
          <div className="flex flex-1 w-full max-w-[1440px] mx-auto">
            <Sidebar />
            <main className="flex-1 p-6 sm:px-8 sm:py-8">
              {children}
            </main>
          </div>
        </div>
        <UploadStatusToast />
        <Toaster />
      </body>
    </html>
  );
}
