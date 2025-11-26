import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Home from "@/pages/home";
import Champions from "@/pages/champions";
import ChampionDetail from "@/pages/champion-detail";
import Synergies from "@/pages/synergies";
import Drafting from "@/pages/drafting";
import Scrims from "@/pages/scrims";
import Statistics from "@/pages/statistics";
import PatchNotes from "@/pages/patchnotes";
import Availability from "@/pages/availability";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/champions/:id" component={ChampionDetail} />
      <Route path="/champions" component={Champions} />
      <Route path="/synergies" component={Synergies} />
      <Route path="/drafting" component={Drafting} />
      <Route path="/scrims" component={Scrims} />
      <Route path="/statistics" component={Statistics} />
      <Route path="/patchnotes" component={PatchNotes} />
      <Route path="/availability" component={Availability} />
      <Route component={Home} />
    </Switch>
  );
}

export default function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex flex-1 flex-col">
              <header className="flex h-16 items-center justify-between border-b border-border px-6">
                <div className="flex items-center gap-4">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                  <div className="hidden md:block">
                    <h2 className="font-rajdhani text-lg font-bold uppercase tracking-wide text-foreground">
                      Nemonzia <span className="text-primary">Team Manager</span>
                    </h2>
                  </div>
                </div>
              </header>
              <main className="flex-1 overflow-auto">
                <Router />
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
