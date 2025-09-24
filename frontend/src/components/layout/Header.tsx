import { Bell, Settings, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

export function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="h-9 w-9 bg-primary/10 hover:bg-primary/20 border border-primary/20" />
          
          <div className="hidden md:flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-tactical flex items-center justify-center">
              <span className="text-xs font-bold text-white">TL</span>
            </div>
            <div>
              <h1 className="font-display text-lg font-bold text-foreground">
                Tentera Laut Diraja Malaysia
              </h1>
              <p className="text-xs text-muted-foreground">
                Royal Malaysian Navy - Defense Command
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Time Display */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card/50 border border-border/50">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">
              <div className="font-mono font-medium text-foreground">
                {formatTime(currentTime)}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDate(currentTime)}
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
            <div className="w-2 h-2 rounded-full bg-success mr-2 animate-pulse" />
            OPERATIONAL
          </Badge>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="relative h-9 w-9 rounded-lg border border-border/50 hover:bg-primary/10"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
                  2
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-popover border-border/50">
              <div className="px-3 py-2 border-b border-border/50">
                <h4 className="font-medium text-sm">Notifications</h4>
              </div>
              <DropdownMenuItem className="py-3">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">Low Inventory Alert</p>
                  <p className="text-xs text-muted-foreground">
                    Torpedo inventory below 30% at Armada Timur
                  </p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="py-3">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">Transfer Completed</p>
                  <p className="text-xs text-muted-foreground">
                    12x 76mm rounds transferred to KD Jebat
                  </p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-9 w-9 rounded-lg border border-border/50 hover:bg-primary/10"
              >
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-popover border-border/50">
              <div className="px-3 py-2 border-b border-border/50">
                <p className="text-sm font-medium">Commander</p>
                <p className="text-xs text-muted-foreground">Ops.Officer@tldm.mil.my</p>
              </div>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}