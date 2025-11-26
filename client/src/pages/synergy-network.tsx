import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, ThumbsUp, ThumbsDown } from "lucide-react";
import type { Champion, ChampionSynergy } from "@shared/schema";

export default function SynergyNetwork() {
  const [selectedChampionId, setSelectedChampionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"all" | "positive" | "negative">("all");

  const { data: champions } = useQuery<Champion[]>({
    queryKey: ["/api/champions"],
  });

  const { data: synergies } = useQuery<ChampionSynergy[]>({
    queryKey: ["/api/synergies"],
  });

  const selectedChampion = champions?.find((c) => c.id === selectedChampionId);

  const championSynergies = synergies?.filter(
    (s) => s.champion1Id === selectedChampionId || s.champion2Id === selectedChampionId
  );

  const positiveSynergies = championSynergies?.filter((s) => s.synergyType === "positive") || [];
  const negativeSynergies = championSynergies?.filter((s) => s.synergyType === "negative") || [];

  const getOtherChampion = (synergy: ChampionSynergy) => {
    const otherChampionId =
      synergy.champion1Id === selectedChampionId ? synergy.champion2Id : synergy.champion1Id;
    return champions?.find((c) => c.id === otherChampionId);
  };

  const filteredChampions = champions?.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const championsWithSynergies = champions?.filter((c) =>
    synergies?.some((s) => s.champion1Id === c.id || s.champion2Id === c.id)
  );

  // Calculer la disposition en cercle pour les synergies
  const getCirclePosition = (index: number, total: number, radius: number) => {
    const angle = (index * 2 * Math.PI) / total - Math.PI / 2;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  };

  // Filtrer selon la vue sélectionnée
  const displayedSynergies = 
    view === "all" 
      ? [...positiveSynergies, ...negativeSynergies]
      : view === "positive"
      ? positiveSynergies
      : negativeSynergies;

  return (
    <div className="h-full p-8">
      <div className="mb-6">
        <h1 className="font-rajdhani text-3xl font-bold uppercase tracking-wide text-foreground mb-2">
          Réseau de Synergies
        </h1>
        <p className="text-sm text-muted-foreground">
          Vue matricielle des synergies par rôle
        </p>
      </div>

      <div className="grid h-[calc(100vh-12rem)] gap-6 lg:grid-cols-[300px_1fr]">
        {/* Liste des champions */}
        <Card className="h-full overflow-hidden p-4">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {championsWithSynergies?.length || 0} champions configurés
            </div>
          </div>
          <div className="mt-4 h-[calc(100%-6rem)] overflow-y-auto">
            <div className="space-y-1">
              {filteredChampions?.map((champion) => {
                const hasSynergies = synergies?.some(
                  (s) => s.champion1Id === champion.id || s.champion2Id === champion.id
                );
                const synergyCount = synergies?.filter(
                  (s) => s.champion1Id === champion.id || s.champion2Id === champion.id
                ).length || 0;

                return (
                  <button
                    key={champion.id}
                    onClick={() => setSelectedChampionId(champion.id)}
                    className={`flex w-full items-center gap-2 rounded-lg p-2 transition-all ${
                      selectedChampionId === champion.id
                        ? "bg-primary text-primary-foreground"
                        : hasSynergies
                        ? "hover:bg-muted"
                        : "opacity-40 hover:opacity-60"
                    }`}
                  >
                    <img
                      src={champion.imageUrl}
                      alt={champion.name}
                      className="h-8 w-8 rounded object-cover"
                    />
                    <div className="flex-1 text-left text-sm font-medium truncate">
                      {champion.name}
                    </div>
                    {hasSynergies && (
                      <Badge variant="outline" className="text-xs">
                        {synergyCount}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Vue matricielle */}
        <Card className="h-full overflow-hidden">
          <div className="h-full overflow-auto p-6">
            {!selectedChampion ? (
              <div className="flex h-full items-center justify-center text-center text-muted-foreground">
                <div>
                  <p className="text-lg font-medium mb-2">Sélectionnez un champion</p>
                  <p className="text-sm">pour visualiser ses synergies</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* En-tête avec champion */}
                <div className="flex items-center gap-4 pb-4 border-b">
                  <img
                    src={selectedChampion.imageUrl}
                    alt={selectedChampion.name}
                    className="h-16 w-16 rounded-lg object-cover ring-2 ring-primary"
                  />
                  <div className="flex-1">
                    <h2 className="font-rajdhani text-2xl font-bold uppercase">
                      {selectedChampion.name}
                    </h2>
                    {selectedChampion.roles && selectedChampion.roles.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {selectedChampion.roles.map((role) => (
                          <Badge key={role} variant="secondary">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">
                        {positiveSynergies.length}
                      </div>
                      <div className="text-xs text-muted-foreground">Synergies</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-500">
                        {negativeSynergies.length}
                      </div>
                      <div className="text-xs text-muted-foreground">Contre-picks</div>
                    </div>
                  </div>
                </div>

                {/* Tabs pour filtrer */}
                <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">
                      Tout ({positiveSynergies.length + negativeSynergies.length})
                    </TabsTrigger>
                    <TabsTrigger value="positive" className="text-green-600">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Synergies ({positiveSynergies.length})
                    </TabsTrigger>
                    <TabsTrigger value="negative" className="text-red-600">
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      Contre-picks ({negativeSynergies.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value={view} className="mt-6">
                    {displayedSynergies.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <p>Aucune synergie de ce type</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Regroupement par rôle */}
                        {["TOP", "JGL", "MID", "ADC", "SUP"].map((role) => {
                          const roleSynergies = displayedSynergies.filter((synergy) => {
                            const otherChamp = getOtherChampion(synergy);
                            return otherChamp?.roles?.includes(role);
                          });

                          if (roleSynergies.length === 0) return null;

                          return (
                            <div key={role}>
                              <div className="flex items-center gap-2 mb-3">
                                <Badge variant="outline" className="text-sm font-bold">
                                  {role}
                                </Badge>
                                <div className="h-px flex-1 bg-border" />
                                <span className="text-xs text-muted-foreground">
                                  {roleSynergies.length} champion{roleSynergies.length > 1 ? "s" : ""}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                {roleSynergies.map((synergy) => {
                                  const otherChamp = getOtherChampion(synergy);
                                  if (!otherChamp) return null;

                                  const isPositive = synergy.synergyType === "positive";

                                  return (
                                    <button
                                      key={synergy.id}
                                      onClick={() => setSelectedChampionId(otherChamp.id)}
                                      className={`group relative rounded-lg border-2 p-3 transition-all hover:scale-105 hover:shadow-lg ${
                                        isPositive
                                          ? "border-green-500/30 hover:border-green-500 hover:shadow-green-500/20"
                                          : "border-red-500/30 hover:border-red-500 hover:shadow-red-500/20"
                                      }`}
                                    >
                                      <div className="flex flex-col items-center gap-2">
                                        <img
                                          src={otherChamp.imageUrl}
                                          alt={otherChamp.name}
                                          className={`h-16 w-16 rounded-lg object-cover ring-2 ${
                                            isPositive
                                              ? "ring-green-500/50 group-hover:ring-green-500"
                                              : "ring-red-500/50 group-hover:ring-red-500"
                                          }`}
                                        />
                                        <div className="w-full text-center">
                                          <div className="text-sm font-medium truncate">
                                            {otherChamp.name}
                                          </div>
                                          <div className="flex items-center justify-center gap-1 mt-1">
                                            {Array.from({ length: 3 }).map((_, i) => (
                                              <div
                                                key={i}
                                                className={`h-1.5 w-1.5 rounded-full ${
                                                  i < synergy.rating
                                                    ? isPositive
                                                      ? "bg-green-500"
                                                      : "bg-red-500"
                                                    : "bg-muted"
                                                }`}
                                              />
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                      {synergy.notes && (
                                        <div className="mt-2 text-xs text-muted-foreground line-clamp-2 text-left">
                                          {synergy.notes}
                                        </div>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}

                        {/* Champions sans rôle */}
                        {(() => {
                          const noRoleSynergies = displayedSynergies.filter((synergy) => {
                            const otherChamp = getOtherChampion(synergy);
                            return !otherChamp?.roles || otherChamp.roles.length === 0;
                          });

                          if (noRoleSynergies.length === 0) return null;

                          return (
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <Badge variant="outline" className="text-sm font-bold">
                                  Sans rôle
                                </Badge>
                                <div className="h-px flex-1 bg-border" />
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                {noRoleSynergies.map((synergy) => {
                                  const otherChamp = getOtherChampion(synergy);
                                  if (!otherChamp) return null;

                                  const isPositive = synergy.synergyType === "positive";

                                  return (
                                    <button
                                      key={synergy.id}
                                      onClick={() => setSelectedChampionId(otherChamp.id)}
                                      className={`group relative rounded-lg border-2 p-3 transition-all hover:scale-105 hover:shadow-lg ${
                                        isPositive
                                          ? "border-green-500/30 hover:border-green-500 hover:shadow-green-500/20"
                                          : "border-red-500/30 hover:border-red-500 hover:shadow-red-500/20"
                                      }`}
                                    >
                                      <div className="flex flex-col items-center gap-2">
                                        <img
                                          src={otherChamp.imageUrl}
                                          alt={otherChamp.name}
                                          className={`h-16 w-16 rounded-lg object-cover ring-2 ${
                                            isPositive
                                              ? "ring-green-500/50 group-hover:ring-green-500"
                                              : "ring-red-500/50 group-hover:ring-red-500"
                                          }`}
                                        />
                                        <div className="w-full text-center">
                                          <div className="text-sm font-medium truncate">
                                            {otherChamp.name}
                                          </div>
                                          <div className="flex items-center justify-center gap-1 mt-1">
                                            {Array.from({ length: 3 }).map((_, i) => (
                                              <div
                                                key={i}
                                                className={`h-1.5 w-1.5 rounded-full ${
                                                  i < synergy.rating
                                                    ? isPositive
                                                      ? "bg-green-500"
                                                      : "bg-red-500"
                                                    : "bg-muted"
                                                }`}
                                              />
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                      {synergy.notes && (
                                        <div className="mt-2 text-xs text-muted-foreground line-clamp-2 text-left">
                                          {synergy.notes}
                                        </div>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
