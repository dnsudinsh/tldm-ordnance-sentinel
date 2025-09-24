import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Header } from "./Header";
import { InventoryProvider } from "../../contexts/InventoryContext";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <InventoryProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <Header />
            <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </InventoryProvider>
  );
}