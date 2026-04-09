import React from 'react';
import { Sidebar } from '@/components/layouts/Sidebar';
import { Header, ContentWrapper } from '@/components/layouts/Header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar className="hidden lg:flex" />
      <div className="flex-1 flex flex-col relative w-full lg:w-[calc(100%-16rem)]">
        <Header />
        <ContentWrapper>
          {children}
        </ContentWrapper>
      </div>
    </div>
  );
}
