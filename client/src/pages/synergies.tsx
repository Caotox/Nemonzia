import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ThumbsUp, ThumbsDown, ArrowRight } from "lucide-react";
import type { Champion, ChampionSynergy } from "@shared/schema";

export default function Synergies() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("Tous");

  const { data: champions, isLoading: championsLoading } = useQuery<Champion[]>({
    queryKey: ["/api/champions"],
  });

  const { data: synergies, isLoading: synergiesLoading } = useQuery<ChampionSynergy[]>({
    queryKey: ["/api/synergies"],
  });

  const championsWithSynergies = champions?.filter((champion) =>
    synergies?.some(
      (s) => s.champion1Id === champion.id || s.champion2Id === champion.id
    )
  );

  const filteredChampions = championsWithSynergies?.filter((champion) => {
    const matchesSearch = champion.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesRole =
      selectedRole === "Tous" || champion.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getChampionSynergies = (championId: string) => {
    return synergies?.filter(
      (s) => s.champion1Id === championId || s.champion2Id === championId
    );
  };

  const getPositiveSynergiesCount = (championId: string) => {
    return (
      synergies?.filter(
        (s) =>
          (s.champion1Id === championId || s.champion2Id === championId) &&
          s.synergyType === "positive"
      ).length || 0
    );
  };

  const getNegativeSynergiesCount = (championId: string) => {
    return (
      synergies?.filter(
        (s) =>
          (s.champion1Id === championId || s.champion2Id === championId) &&
          s.synergyType === "negative"
      ).length || 0
    );
  };

  if (championsLoading || synergiesLoading) {
    return (
      <div className="space-y-6 p-8">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="font-rajdhani text-3xl font-bold uppercase tracking-wide text-foreground">
          Synergies
        </h1>
        <p className="text-sm text-muted-foreground">
          Champions avec synergies et contre-picks renseignés
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un champion..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Badge variant="secondary" className="font-mono">
                {filteredChampions?.length || 0} champions
              </Badge>
            </div>
            <Tabs value={selectedRole} onValueChange={setSelectedRole}>
              <TabsList className="grid w-full grid-cols-6">
                {["Tous", "TOP", "JGL", "MID", "ADC", "SUP"].map((role) => (
                  <TabsTrigger key={role} value={role}>
                    {role}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {filteredChampions && filteredChampions.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredChampions.map((champion) => {
                const positiveSynergies = getPositiveSynergiesCount(champion.id);
                const negativeSynergies = getNegativeSynergiesCount(champion.id);

                return (
                  <Link key={champion.id} href={`/champions/${champion.id}`}>
                    <Card className="cursor-pointer transition-all hover-elevate hover:border-primary/50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 overflow-hidden rounded-lg bg-muted">
                            <img
                              src={champion.imageUrl}
                              alt={champion.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{champion.name}</h3>
                              {champion.role && (
                                <Badge variant="outline" className="text-xs">
                                  {champion.role}
                                </Badge>
                              )}
                            </div>
                            <div className="mt-2 flex gap-3 text-xs">
                              <div className="flex items-center gap-1 text-green-600">
                                <ThumbsUp className="h-3 w-3" />
                                <span>{positiveSynergies}</span>
                              </div>
                              <div className="flex items-center gap-1 text-red-600">
                                <ThumbsDown className="h-3 w-3" />
                                <span>{negativeSynergies}</span>
                              </div>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ThumbsUp className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 font-medium">Aucune synergie enregistrée</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Commencez par ajouter des synergies sur les pages des champions
              </p>
              <Link href="/champions">
                <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                  Aller aux champions
                </button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
