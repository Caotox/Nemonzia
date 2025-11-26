import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import type { Champion, ChampionSynergy } from "@shared/schema";

export default function SynergyMap() {
  const [selectedChampionId, setSelectedChampionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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

  return (
    <div className="h-full p-8">
      <div className="mb-6">
        <h1 className="font-rajdhani text-3xl font-bold uppercase tracking-wide text-foreground mb-2">
          Carte des Synergies
        </h1>
        <p className="text-sm text-muted-foreground">
          Cliquez sur un champion pour visualiser ses synergies
        </p>
      </div>

      <div className="grid h-[calc(100vh-12rem)] gap-6 lg:grid-cols-[350px_1fr]">
        {/* Liste des champions */}
        <Card className="h-full overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg">Champions</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="h-[calc(100%-8rem)] overflow-y-auto">
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
                    className={`flex w-full items-center gap-3 rounded-lg p-3 transition-all ${
                      selectedChampionId === champion.id
                        ? "bg-primary text-primary-foreground shadow-md"
                        : hasSynergies
                        ? "bg-muted/50 hover:bg-muted"
                        : "opacity-50 hover:opacity-75"
                    }`}
                  >
                    <img
                      src={champion.imageUrl}
                      alt={champion.name}
                      className="h-10 w-10 rounded object-cover"
                    />
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">{champion.name}</div>
                      {champion.roles && champion.roles.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {champion.roles.map((role) => (
                            <Badge
                              key={role}
                              variant="secondary"
                              className="text-[10px] px-1 py-0"
                            >
                              {role}
                            </Badge>
                          ))}
                        </div>
                      )}
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
          </CardContent>
        </Card>

        {/* Carte mentale */}
        <Card className="h-full overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedChampion ? `Synergies de ${selectedChampion.name}` : "Carte des Synergies"}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100%-5rem)] overflow-hidden">
            {!selectedChampion ? (
              <div className="flex h-full items-center justify-center text-center text-muted-foreground">
                <div>
                  <p className="text-lg font-medium mb-2">Sélectionnez un champion</p>
                  <p className="text-sm">
                    {championsWithSynergies?.length || 0} champions ont des synergies configurées
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative h-full w-full overflow-auto">
                <div className="min-h-full min-w-full p-8">
                  {/* Champion central */}
                  <div className="flex justify-center mb-12">
                    <div className="relative">
                      <div className="absolute -inset-4 rounded-full bg-primary/20 blur-xl" />
                      <div className="relative flex flex-col items-center gap-3 rounded-2xl bg-card border-4 border-primary p-6 shadow-2xl">
                        <img
                          src={selectedChampion.imageUrl}
                          alt={selectedChampion.name}
                          className="h-24 w-24 rounded-lg object-cover"
                        />
                        <div className="text-center">
                          <h3 className="font-rajdhani text-2xl font-bold uppercase">
                            {selectedChampion.name}
                          </h3>
                          {selectedChampion.roles && selectedChampion.roles.length > 0 && (
                            <div className="flex gap-1 justify-center mt-2">
                              {selectedChampion.roles.map((role) => (
                                <Badge key={role} variant="secondary">
                                  {role}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Synergies positives */}
                  {positiveSynergies.length > 0 && (
                    <div className="mb-12">
                      <div className="mb-6 flex items-center justify-center gap-2">
                        <div className="h-px flex-1 bg-green-500/30" />
                        <Badge className="bg-green-500/20 text-green-700 dark:text-green-400">
                          Synergies Positives ({positiveSynergies.length})
                        </Badge>
                        <div className="h-px flex-1 bg-green-500/30" />
                      </div>
                      <div className="flex gap-4 overflow-x-auto pb-4">
                        {positiveSynergies.map((synergy) => {
                          const otherChamp = getOtherChampion(synergy);
                          if (!otherChamp) return null;

                          return (
                            <div key={synergy.id} className="relative flex-shrink-0">
                              <button
                                onClick={() => setSelectedChampionId(otherChamp.id)}
                                className="group flex w-56 flex-col items-center gap-3 rounded-xl border-2 border-green-500/30 bg-card p-4 transition-all hover:border-green-500 hover:shadow-lg hover:shadow-green-500/20 hover:-translate-y-1"
                              >
                                <img
                                  src={otherChamp.imageUrl}
                                  alt={otherChamp.name}
                                  className="h-16 w-16 rounded-lg object-cover ring-2 ring-green-500/50 group-hover:ring-green-500"
                                />
                                <div className="text-center">
                                  <h4 className="font-medium text-sm">{otherChamp.name}</h4>
                                  {otherChamp.roles && otherChamp.roles.length > 0 && (
                                    <div className="flex gap-1 justify-center mt-1">
                                      {otherChamp.roles.map((role) => (
                                        <Badge
                                          key={role}
                                          variant="outline"
                                          className="text-[10px] px-1 py-0"
                                        >
                                          {role}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                  <div className="mt-2 flex items-center justify-center gap-1">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                      <div
                                        key={i}
                                        className={`h-1.5 w-1.5 rounded-full ${
                                          i < synergy.rating
                                            ? "bg-green-500"
                                            : "bg-muted"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  {synergy.notes && (
                                    <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                                      {synergy.notes}
                                    </p>
                                  )}
                                </div>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Synergies négatives / Contre-picks */}
                  {negativeSynergies.length > 0 && (
                    <div>
                      <div className="mb-6 flex items-center justify-center gap-2">
                        <div className="h-px flex-1 bg-red-500/30" />
                        <Badge className="bg-red-500/20 text-red-700 dark:text-red-400">
                          Contre-picks ({negativeSynergies.length})
                        </Badge>
                        <div className="h-px flex-1 bg-red-500/30" />
                      </div>
                      <div className="flex gap-4 overflow-x-auto pb-4">
                        {negativeSynergies.map((synergy) => {
                          const otherChamp = getOtherChampion(synergy);
                          if (!otherChamp) return null;

                          return (
                            <div key={synergy.id} className="relative flex-shrink-0">
                              <button
                                onClick={() => setSelectedChampionId(otherChamp.id)}
                                className="group flex w-56 flex-col items-center gap-3 rounded-xl border-2 border-red-500/30 bg-card p-4 transition-all hover:border-red-500 hover:shadow-lg hover:shadow-red-500/20 hover:-translate-y-1"
                              >
                                <img
                                  src={otherChamp.imageUrl}
                                  alt={otherChamp.name}
                                  className="h-16 w-16 rounded-lg object-cover ring-2 ring-red-500/50 group-hover:ring-red-500"
                                />
                                <div className="text-center">
                                  <h4 className="font-medium text-sm">{otherChamp.name}</h4>
                                  {otherChamp.roles && otherChamp.roles.length > 0 && (
                                    <div className="flex gap-1 justify-center mt-1">
                                      {otherChamp.roles.map((role) => (
                                        <Badge
                                          key={role}
                                          variant="outline"
                                          className="text-[10px] px-1 py-0"
                                        >
                                          {role}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                  <div className="mt-2 flex items-center justify-center gap-1">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                      <div
                                        key={i}
                                        className={`h-1.5 w-1.5 rounded-full ${
                                          i < synergy.rating
                                            ? "bg-red-500"
                                            : "bg-muted"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  {synergy.notes && (
                                    <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                                      {synergy.notes}
                                    </p>
                                  )}
                                </div>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {positiveSynergies.length === 0 && negativeSynergies.length === 0 && (
                    <div className="flex h-64 items-center justify-center text-center text-muted-foreground">
                      <div>
                        <p className="text-lg font-medium mb-2">Aucune synergie configurée</p>
                        <p className="text-sm">
                          Ajoutez des synergies depuis la page détails du champion
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
