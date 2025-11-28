import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Trophy, Target, TrendingUp, Users } from "lucide-react";

interface ChampionUsage {
  championId: string;
  count: number;
}

interface PerformanceData {
  date: string;
  victories: number;
  defeats: number;
  total: number;
}

interface DraftPerformance {
  draftId: string;
  wins: number;
  losses: number;
  total: number;
  winrate: number;
}

interface Statistics {
  totalScrims: number;
  wins: number;
  losses: number;
  winrate: number;
  topChampions: ChampionUsage[];
  performanceOverTime: PerformanceData[];
  draftPerformance?: DraftPerformance[];
}

const COLORS = ['#D4AF37', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

const TOOLTIP_STYLES = {
  contentStyle: {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '6px',
    color: 'hsl(var(--foreground))'
  },
  itemStyle: { color: 'hsl(var(--foreground))' },
  labelStyle: { color: 'hsl(var(--foreground))' }
};

export default function Statistics() {
  const { data: statistics, isLoading } = useQuery<Statistics>({
    queryKey: ["/api/scrims/statistics"],
  });

  const { data: champions } = useQuery<Array<{ id: string; name: string }>>({
    queryKey: ["/api/champions"],
  });

  const { data: drafts } = useQuery<Array<{ id: string; name: string }>>({
    queryKey: ["/api/drafts"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6 p-8">
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-muted-foreground">Aucune statistique disponible</p>
      </div>
    );
  }

  const championMap = new Map(champions?.map(c => [c.id, c.name]) || []);
  
  const topChampionsData = statistics.topChampions.map(({ championId, count }) => ({
    name: championMap.get(championId) || championId,
    utilisations: count,
  }));

  const winLossData = [
    { name: "Victoires", value: statistics.wins, color: "#10B981" },
    { name: "Défaites", value: statistics.losses, color: "#EF4444" },
  ];

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="font-rajdhani text-3xl font-bold uppercase tracking-wide text-foreground">
          Statistiques
        </h1>
        <p className="text-sm text-muted-foreground">
          Analyse des performances de l'équipe
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scrims</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-scrims">
              {statistics.totalScrims}
            </div>
            <p className="text-xs text-muted-foreground">
              Matchs d'entraînement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Victoires</CardTitle>
            <Trophy className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500" data-testid="stat-wins">
              {statistics.wins}
            </div>
            <p className="text-xs text-muted-foreground">
              Matchs gagnés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Défaites</CardTitle>
            <Target className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500" data-testid="stat-losses">
              {statistics.losses}
            </div>
            <p className="text-xs text-muted-foreground">
              Matchs perdus
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Winrate</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary" data-testid="stat-winrate">
              {statistics.winrate}%
            </div>
            <p className="text-xs text-muted-foreground">
              Taux de victoire
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-rajdhani uppercase">Champions les plus joués</CardTitle>
          </CardHeader>
          <CardContent>
            {topChampionsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topChampionsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip {...TOOLTIP_STYLES} />
                  <Bar dataKey="utilisations" fill="#D4AF37" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                Aucune donnée disponible
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-rajdhani uppercase">Répartition Victoires/Défaites</CardTitle>
          </CardHeader>
          <CardContent>
            {statistics.totalScrims > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={winLossData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {winLossData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip {...TOOLTIP_STYLES} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                Aucune donnée disponible
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {statistics.draftPerformance && statistics.draftPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-rajdhani uppercase">Performance des Drafts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statistics.draftPerformance.map((draftStat) => {
                const draft = drafts?.find(d => d.id === draftStat.draftId);
                return (
                  <div
                    key={draftStat.draftId}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{draft?.name || 'Draft inconnu'}</h4>
                      <p className="text-xs text-muted-foreground">
                        {draftStat.total} game{draftStat.total > 1 ? 's' : ''} jouée{draftStat.total > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-500">{draftStat.wins}V</p>
                        <p className="text-xs text-muted-foreground">Victoires</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-red-500">{draftStat.losses}D</p>
                        <p className="text-xs text-muted-foreground">Défaites</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">{draftStat.winrate}%</p>
                        <p className="text-xs text-muted-foreground">Winrate</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="font-rajdhani uppercase">Performance au fil du temps</CardTitle>
        </CardHeader>
        <CardContent>
          {statistics.performanceOverTime.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={statistics.performanceOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip {...TOOLTIP_STYLES} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="victories" 
                  stroke="#10B981" 
                  name="Victoires"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="defeats" 
                  stroke="#EF4444" 
                  name="Défaites"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[350px] items-center justify-center text-muted-foreground">
              Aucune donnée disponible
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
