import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  toolId?: string;
}

export function Layout({ children, title, description, toolId }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="lg:ml-60">
        <Header 
          title={title}
          description={description}
          onMenuClick={() => setSidebarOpen(true)}
          toolId={toolId}
        />
        
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
