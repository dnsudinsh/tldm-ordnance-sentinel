import { Bell, Settings, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "@/components/ui/sidebar";

export function Header() {
  const { toggleSidebar, isMobile } = useSidebar();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 lg:px-6">
        <div className="flex items-center gap-2 sm:gap-4">
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="p-2"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          )}
          
          <div className="hidden sm:flex items-center gap-3">
            <img 
              src="/tldm_logo.png" 
              alt="TLDM Logo" 
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-contain"
            />
            <div>
              <h1 className="font-display text-base sm:text-lg font-bold text-foreground">
                Tentera Laut Diraja Malaysia
              </h1>
              <p className="text-xs text-muted-foreground">
                Royal Malaysian Navy - BITS (Bullet Inventory Tracking System)
              </p>
            </div>
          </div>
          
          {/* Mobile header - just logo */}
          <div className="flex sm:hidden items-center gap-2">
            <img 
              src="/tldm_logo.png" 
              alt="TLDM Logo" 
              className="h-8 w-8 rounded-full object-contain"
            />
            <span className="font-display text-sm font-bold">BITS</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* System Status */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-success/10 border border-success/20">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
              <span className="text-xs font-medium text-success">OPERATIONAL</span>
            </div>
          </div>

          {/* Time Display */}
          <div className="hidden lg:flex flex-col items-end text-xs">
            <div className="font-mono font-medium">
              {new Date().toLocaleTimeString('en-GB', { 
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </div>
            <div className="text-muted-foreground text-xs">
              {new Date().toLocaleDateString('en-GB', {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </div>
          </div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative p-2">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-4 w-4 text-xs flex items-center justify-center p-0 min-w-0"
                >
                  2
                </Badge>
                <span className="sr-only">View notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 sm:w-80">
              <DropdownMenuLabel>System Alerts</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start p-3 space-y-1">
                <div className="flex items-center gap-2 w-full">
                  <Badge variant="destructive" className="text-xs">Critical</Badge>
                  <span className="text-xs text-muted-foreground">2 min ago</span>
                </div>
                <p className="text-sm font-medium">EXOCET MM40 Stock Low</p>
                <p className="text-xs text-muted-foreground">Current: 4 units, Minimum: 8 units</p>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start p-3 space-y-1">
                <div className="flex items-center gap-2 w-full">
                  <Badge variant="secondary" className="text-xs">Info</Badge>
                  <span className="text-xs text-muted-foreground">1 hour ago</span>
                </div>
                <p className="text-sm font-medium">Scheduled Maintenance</p>
                <p className="text-xs text-muted-foreground">System backup at 02:00 MYT</p>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 sm:w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Commander Ahmad</p>
                  <p className="text-xs leading-none text-muted-foreground">TLDM Operations</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}