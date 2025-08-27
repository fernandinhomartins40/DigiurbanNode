import { FC, ReactNode } from "react";
import { CidadaoSidebar } from "./CidadaoSidebar";
import { Header } from "./Header";
import { SidebarProvider } from "@/contexts/SidebarContext";

interface CidadaoLayoutProps {
  children: ReactNode;
}

export const CidadaoLayout: FC<CidadaoLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gray-50 dark:bg-gray-900">
        <CidadaoSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};