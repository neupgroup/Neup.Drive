import { Header } from '@/components/prodrive/header';
import { Sidebar } from '@/components/prodrive/sidebar';

export default function DriveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-white">
      <Header />
      <div className="flex flex-1 w-full max-w-[1440px] mx-auto">
        <Sidebar />
        <main className="flex-1 p-4 sm:px-6 sm:py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
