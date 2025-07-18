import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export function Layout({ children, title, description }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="lg:ml-60">
        <Header 
          title={title}
          description={description}
          onMenuClick={() => setSidebarOpen(true)}
        />
        
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
