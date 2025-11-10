import { Database, Users, Trophy, Calendar, Sword, BarChart3, FileText } from "lucide-react";
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
} from "@/components/ui/sidebar";
import { Link, useLocation } from "wouter";
import nmzLogo from "@assets/nmz-logo.png";

const menuItems = [
  {
    title: "Champions",
    url: "/champions",
    icon: Database,
  },
  {
    title: "Drafting",
    url: "/drafting",
    icon: Sword,
  },
  {
    title: "Scrims",
    url: "/scrims",
    icon: Trophy,
  },
  {
    title: "Statistiques",
    url: "/statistics",
    icon: BarChart3,
  },
  {
    title: "Patch Notes",
    url: "/patchnotes",
    icon: FileText,
  },
  {
    title: "Disponibilités",
    url: "/availability",
    icon: Calendar,
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-md bg-black">
            <img src={nmzLogo} alt="NMZ Logo" className="h-full w-full object-contain" />
          </div>
          <div>
            <h1 className="font-rajdhani text-xl font-bold uppercase tracking-wide text-sidebar-foreground">
              Nemonzia
            </h1>
            <p className="text-xs font-semibold tracking-wider text-primary">NMZ</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-rajdhani text-xs font-semibold uppercase tracking-wider">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`link-${item.title.toLowerCase()}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
