"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Shield,
  Swords,
  BarChart3,
  Settings,
  Building2,
  ClipboardList,
  Search,
  Target,
  Activity,
  ChevronLeft,
  ChevronRight,
  Film,
} from "lucide-react";
import { useState } from "react";

interface NavItem {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
  roles?: string[]; // if set, only these roles see it
}

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Players", href: "/players", icon: Users },
  { name: "Teams", href: "/teams", icon: Shield },
  { name: "Matches", href: "/matches", icon: Swords },
  { name: "Videos", href: "/videos", icon: Film },
  { name: "Training", href: "/training", icon: ClipboardList },
  { name: "Scouting", href: "/scouting", icon: Target, roles: ["SUPER_ADMIN", "SCOUT", "COACH", "ORG_ADMIN"] },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Organizations", href: "/organizations", icon: Building2, roles: ["SUPER_ADMIN", "ORG_ADMIN"] },
  { name: "Data Quality", href: "/data-quality", icon: Activity, roles: ["SUPER_ADMIN", "ORG_ADMIN"] },
  { name: "Search", href: "/search", icon: Search },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);

  const userRole = (session?.user as Record<string, unknown>)?.role as string | undefined;

  const visibleNav = navigation.filter(
    (item) => !item.roles || (userRole && item.roles.includes(userRole))
  );

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-card transition-all duration-200",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              DF
            </div>
            <span className="font-semibold text-lg">DataForge</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-md p-1.5 hover:bg-accent"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
        {visibleNav.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="border-t p-4">
          <div className="rounded-lg bg-primary/5 p-3">
            <p className="text-xs font-medium text-primary">Data Coverage</p>
            <div className="mt-2 h-2 w-full rounded-full bg-primary/20">
              <div className="h-2 rounded-full bg-primary" style={{ width: "67%" }} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">67% complete</p>
          </div>
        </div>
      )}
    </aside>
  );
}
