import { 
  Package, 
  Plus, 
  ArrowRightLeft, 
  Gauge, 
  QrCode, 
  FileText,
  Brain,
  Shield,
  Anchor,
  TrendingUp
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  { 
    title: "Readiness Overview", 
    url: "/", 
    icon: Gauge,
    description: "Command Center Dashboard"
  },
  { 
    title: "Inventory", 
    url: "/inventory", 
    icon: Package,
    description: "View All Ordnance"
  },
  { 
    title: "Add Inventory", 
    url: "/add-inventory", 
    icon: Plus,
    description: "Register New Items"
  },
  { 
    title: "AI Recommendations", 
    url: "/ai-recommendations", 
    icon: Brain,
    description: "Mission Planning AI"
  },
  { 
    title: "Readiness Forecasting", 
    url: "/forecasting", 
    icon: TrendingUp,
    description: "Predictive Analytics"
  },
  { 
    title: "Transfer Items", 
    url: "/transfer", 
    icon: ArrowRightLeft,
    description: "Move Between Units"
  },
  { 
    title: "Barcode Gen", 
    url: "/barcode", 
    icon: QrCode,
    description: "Generate & Scan Codes"
  },
  { 
    title: "Reports", 
    url: "/reports", 
    icon: FileText,
    description: "Analytics & Logs"
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(path);
  };

  const getNavClassName = (path: string) => {
    const baseClasses = "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200";
    if (isActive(path)) {
      return `${baseClasses} bg-primary/10 text-primary shadow-sm border border-primary/20`;
    }
    return `${baseClasses} text-muted-foreground hover:bg-primary/5 hover:text-foreground`;
  };

  return (
    <Sidebar
      className="transition-all duration-300 border-r border-border/50 bg-gradient-to-b from-sidebar to-sidebar/95"
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-border/50 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center">
            <img 
              src="/tldm_logo.png" 
              alt="TLDM Logo" 
              className="h-10 w-10 rounded-full object-contain"
            />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <h1 className="font-display text-lg font-bold text-foreground">
                BITS
              </h1>
              <p className="text-xs text-muted-foreground font-medium">
                Bullet Inventory Tracking System
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-6">
        <SidebarGroup>
          <SidebarGroupLabel className="mb-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {!collapsed ? "Mission Control" : ""}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="p-0">
                    <NavLink to={item.url} className={getNavClassName(item.url)}>
                      <div className="flex h-5 w-5 items-center justify-center">
                        <item.icon className="h-4 w-4" />
                      </div>
                      {!collapsed && (
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="truncate font-medium">
                            {item.title}
                          </span>
                          <span className="text-xs text-muted-foreground/70 truncate">
                            {item.description}
                          </span>
                        </div>
                      )}
                      {isActive(item.url) && (
                        <div className="absolute right-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-l-full bg-primary" />
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Naval Status Indicator */}
        {!collapsed && (
          <div className="mt-8 rounded-lg bg-card/50 border border-border/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Anchor className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Fleet Status</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs text-muted-foreground">All Systems Operational</span>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}