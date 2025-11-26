import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Trophy,
  Target,
  Calendar,
  Users,
  Swords,
  TrendingUp,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import type { Scrim, Player, Champion, ChampionSynergy } from "@shared/schema";

export default function Home() {
  const { data: scrims, isLoading: scrimsLoading } = useQuery<Scrim[]>({
    queryKey: ["/api/scrims"],
  });

  const { data: players, isLoading: playersLoading } = useQuery<Player[]>({
    queryKey: ["/api/players"],
  });

  const { data: champions, isLoading: championsLoading } = useQuery<Champion[]>({
    queryKey: ["/api/champions"],
  });

  const { data: synergies, isLoading: synergiesLoading } = useQuery<ChampionSynergy[]>({
    queryKey: ["/api/synergies"],
  });

  const totalScrims = scrims?.length || 0;
  const wins = scrims?.filter((s) => s.isWin).length || 0;
  const winrate = totalScrims > 0 ? Math.round((wins / totalScrims) * 100) : 0;

  const championsWithRole = champions?.filter((c) => c.role).length || 0;
  const totalChampions = champions?.length || 0;

  const recentScrims = scrims?.slice(-3).reverse() || [];

  const isLoading = scrimsLoading || playersLoading || championsLoading || synergiesLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 p-8">
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="font-rajdhani text-3xl font-bold uppercase tracking-wide text-foreground">
          Tableau de Bord
        </h1>
        <p className="text-sm text-muted-foreground">
          Vue d'ensemble de votre équipe et performances
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scrims</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-bold">{totalScrims}</div>
            <p className="text-xs text-muted-foreground">
              {wins} victoires / {totalScrims - wins} défaites
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Winrate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-bold text-primary">
              {winrate}%
            </div>
            <p className="text-xs text-muted-foreground">Performance globale</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Équipe</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-bold">
              {players?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Joueurs actifs</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-rajdhani text-xl font-bold uppercase">
              <Calendar className="h-5 w-5" />
              Scrims Récents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentScrims.length > 0 ? (
              <div className="space-y-3">
                {recentScrims.map((scrim) => (
                  <div
                    key={scrim.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant={scrim.isWin ? "default" : "destructive"}>
                        {scrim.isWin ? "V" : "D"}
                      </Badge>
                      <div>
                        <p className="font-medium text-sm">vs {scrim.opponent}</p>
                        <p className="text-xs text-muted-foreground">
                          {scrim.score}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(scrim.date).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                ))}
                <Link href="/scrims">
                  <Button variant="outline" className="w-full">
                    Voir tous les scrims
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Trophy className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Aucun scrim enregistré
                </p>
                <Link href="/scrims">
                  <Button variant="outline" className="mt-4" size="sm">
                    Ajouter un scrim
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-rajdhani text-xl font-bold uppercase">
              <TrendingUp className="h-5 w-5" />
              Accès Rapide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href="/champions">
                <Button variant="outline" className="w-full justify-start">
                  <Swords className="mr-2 h-4 w-4" />
                  Champions
                  <Badge variant="secondary" className="ml-auto">
                    {championsWithRole}/{totalChampions} avec rôle
                  </Badge>
                </Button>
              </Link>
              <Link href="/synergies">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Synergies
                  <Badge variant="secondary" className="ml-auto">
                    {synergies?.length || 0}
                  </Badge>
                </Button>
              </Link>
              <Link href="/drafting">
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Drafting
                </Button>
              </Link>
              <Link href="/availability">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  Disponibilités
                </Button>
              </Link>
              <Link href="/statistics">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Statistiques
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
