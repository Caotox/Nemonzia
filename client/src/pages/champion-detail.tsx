import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Plus, ThumbsUp, ThumbsDown, Trash2, Search } from "lucide-react";
import type { Champion, ChampionSynergy } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ChampionDetail() {
  const [, params] = useRoute("/champions/:id");
  const championId = params?.id;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedChampionId, setSelectedChampionId] = useState("");
  const [synergyType, setSynergyType] = useState<"positive" | "negative">("positive");
  const [rating, setRating] = useState(2);
  const [notes, setNotes] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: champions } = useQuery<Champion[]>({
    queryKey: ["/api/champions"],
  });

  const { data: synergies, isLoading: synergiesLoading } = useQuery<ChampionSynergy[]>({
    queryKey: ["/api/synergies"],
  });

  const champion = champions?.find((c) => c.id === championId);

  const championSynergies = synergies?.filter(
    (s) => s.champion1Id === championId || s.champion2Id === championId
  );

  const positiveSynergies = championSynergies?.filter((s) => s.synergyType === "positive");
  const negativeSynergies = championSynergies?.filter((s) => s.synergyType === "negative");

  const addSynergyMutation = useMutation({
    mutationFn: async () => {
      if (!selectedChampionId || !championId) {
        throw new Error("Champion requis");
      }
      await apiRequest("POST", "/api/synergies", {
        champion1Id: championId,
        champion2Id: selectedChampionId,
        synergyType,
        rating,
        notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/synergies"] });
      setSelectedChampionId("");
      setRating(2);
      setNotes("");
      setIsDialogOpen(false);
      toast({
        title: "Synergie ajoutée",
        description: "La synergie a été enregistrée avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible d'ajouter la synergie.",
      });
    },
  });

  const deleteSynergyMutation = useMutation({
    mutationFn: async (synergyId: string) => {
      await apiRequest("DELETE", `/api/synergies/${synergyId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/synergies"] });
      toast({
        title: "Synergie supprimée",
        description: "La synergie a été supprimée avec succès.",
      });
    },
  });

  const getOtherChampion = (synergy: ChampionSynergy) => {
    const otherChampionId =
      synergy.champion1Id === championId ? synergy.champion2Id : synergy.champion1Id;
    return champions?.find((c) => c.id === otherChampionId);
  };

  const availableChampions = champions?.filter(
    (c) =>
      c.id !== championId &&
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !championSynergies?.some(
        (s) => s.champion1Id === c.id || s.champion2Id === c.id
      )
  );

  if (!champion) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Champion non trouvé</p>
            <Link href="/champions">
              <Button className="mt-4 w-full">Retour aux champions</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center gap-4">
        <Link href="/champions">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 overflow-hidden rounded-lg bg-muted">
            <img
              src={champion.imageUrl}
              alt={champion.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h1 className="font-rajdhani text-3xl font-bold uppercase tracking-wide text-foreground">
              {champion.name}
            </h1>
            <p className="text-sm text-muted-foreground">Synergies & Contre-picks</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Badge variant="outline" className="gap-2">
            <ThumbsUp className="h-3 w-3" />
            {positiveSynergies?.length || 0} Synergies
          </Badge>
          <Badge variant="outline" className="gap-2">
            <ThumbsDown className="h-3 w-3" />
            {negativeSynergies?.length || 0} Contre-picks
          </Badge>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une synergie
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-rajdhani text-xl font-bold uppercase">
                Nouvelle Synergie
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Type</label>
                <Select
                  value={synergyType}
                  onValueChange={(value: "positive" | "negative") =>
                    setSynergyType(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="positive">
                      <div className="flex items-center gap-2">
                        <ThumbsUp className="h-4 w-4" />
                        Synergie positive
                      </div>
                    </SelectItem>
                    <SelectItem value="negative">
                      <div className="flex items-center gap-2">
                        <ThumbsDown className="h-4 w-4" />
                        Contre-pick
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Rechercher un champion
                </label>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="max-h-64 overflow-y-auto rounded-md border border-border p-2">
                  {["TOP", "JGL", "MID", "ADC", "SUP"].map((role) => {
                    const roleChampions = availableChampions?.filter((c) => c.roles?.includes(role));
                    if (!roleChampions || roleChampions.length === 0) return null;
                    
                    return (
                      <div key={role} className="mb-3">
                        <div className="mb-2 flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{role}</Badge>
                          <div className="h-px flex-1 bg-border" />
                        </div>
                        <div className="space-y-1">
                          {roleChampions.map((c) => (
                            <button
                              key={c.id}
                              onClick={() => setSelectedChampionId(c.id)}
                              className={`flex w-full items-center gap-3 rounded-md p-2 transition-colors hover:bg-muted ${
                                selectedChampionId === c.id ? "bg-muted" : ""
                              }`}
                            >
                              <img
                                src={c.imageUrl}
                                alt={c.name}
                                className="h-8 w-8 rounded object-cover"
                              />
                              <span className="text-sm">{c.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {availableChampions && availableChampions.filter((c) => !c.roles || c.roles.length === 0).length > 0 && (
                    <div className="mb-3">
                      <div className="mb-2 flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">Sans rôle</Badge>
                        <div className="h-px flex-1 bg-border" />
                      </div>
                      <div className="space-y-1">
                        {availableChampions?.filter((c) => !c.roles || c.roles.length === 0).map((c) => (
                          <button
                            key={c.id}
                            onClick={() => setSelectedChampionId(c.id)}
                            className={`flex w-full items-center gap-3 rounded-md p-2 transition-colors hover:bg-muted ${
                              selectedChampionId === c.id ? "bg-muted" : ""
                            }`}
                          >
                            <img
                              src={c.imageUrl}
                              alt={c.name}
                              className="h-8 w-8 rounded object-cover"
                            />
                            <span className="text-sm">{c.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Force (0-3)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="3"
                  value={rating}
                  onChange={(e) => setRating(parseInt(e.target.value) || 0)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Notes</label>
                <Textarea
                  placeholder="Pourquoi cette synergie fonctionne / ne fonctionne pas..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                onClick={() => addSynergyMutation.mutate()}
                disabled={addSynergyMutation.isPending || !selectedChampionId}
                className="w-full"
              >
                {addSynergyMutation.isPending ? "Ajout..." : "Ajouter"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-rajdhani text-xl font-bold uppercase">
              <ThumbsUp className="h-5 w-5 text-green-500" />
              Synergies Positives
            </CardTitle>
          </CardHeader>
          <CardContent>
            {synergiesLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : positiveSynergies && positiveSynergies.length > 0 ? (
              <div className="space-y-4">
                {["TOP", "JGL", "MID", "ADC", "SUP"].map((role) => {
                  const roleSynergies = positiveSynergies.filter((synergy) => {
                    const otherChamp = getOtherChampion(synergy);
                    return otherChamp?.roles?.includes(role);
                  });
                  
                  if (roleSynergies.length === 0) return null;
                  
                  return (
                    <div key={role}>
                      <div className="mb-2 flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs font-semibold">{role}</Badge>
                        <div className="h-px flex-1 bg-border" />
                      </div>
                      <div className="space-y-2">
                        {roleSynergies.map((synergy) => {
                          const otherChamp = getOtherChampion(synergy);
                          if (!otherChamp) return null;
                          return (
                            <div
                              key={synergy.id}
                              className="flex items-start justify-between rounded-lg border border-border p-3"
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  src={otherChamp.imageUrl}
                                  alt={otherChamp.name}
                                  className="h-10 w-10 rounded object-cover"
                                />
                                <div>
                                  <h4 className="font-medium text-sm">{otherChamp.name}</h4>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">Force: {synergy.rating}/3</Badge>
                                  </div>
                                  {synergy.notes && (
                                    <p className="mt-1 text-xs text-muted-foreground">
                                      {synergy.notes}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => deleteSynergyMutation.mutate(synergy.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                {positiveSynergies.filter((synergy) => {
                  const otherChamp = getOtherChampion(synergy);
                  return !otherChamp?.roles || otherChamp.roles.length === 0;
                }).length > 0 && (
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs font-semibold">Sans rôle</Badge>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                    <div className="space-y-2">
                      {positiveSynergies.filter((synergy) => {
                        const otherChamp = getOtherChampion(synergy);
                        return !otherChamp?.roles || otherChamp.roles.length === 0;
                      }).map((synergy) => {
                        const otherChamp = getOtherChampion(synergy);
                        if (!otherChamp) return null;
                        return (
                          <div
                            key={synergy.id}
                            className="flex items-start justify-between rounded-lg border border-border p-3"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={otherChamp.imageUrl}
                                alt={otherChamp.name}
                                className="h-10 w-10 rounded object-cover"
                              />
                              <div>
                                <h4 className="font-medium text-sm">{otherChamp.name}</h4>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">Force: {synergy.rating}/3</Badge>
                                </div>
                                {synergy.notes && (
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {synergy.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => deleteSynergyMutation.mutate(synergy.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                Aucune synergie positive enregistrée
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-rajdhani text-xl font-bold uppercase">
              <ThumbsDown className="h-5 w-5 text-red-500" />
              Contre-picks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {synergiesLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : negativeSynergies && negativeSynergies.length > 0 ? (
              <div className="space-y-4">
                {["TOP", "JGL", "MID", "ADC", "SUP"].map((role) => {
                  const roleSynergies = negativeSynergies.filter((synergy) => {
                    const otherChamp = getOtherChampion(synergy);
                    return otherChamp?.roles?.includes(role);
                  });
                  
                  if (roleSynergies.length === 0) return null;
                  
                  return (
                    <div key={role}>
                      <div className="mb-2 flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs font-semibold">{role}</Badge>
                        <div className="h-px flex-1 bg-border" />
                      </div>
                      <div className="space-y-2">
                        {roleSynergies.map((synergy) => {
                          const otherChamp = getOtherChampion(synergy);
                          if (!otherChamp) return null;
                          return (
                            <div
                              key={synergy.id}
                              className="flex items-start justify-between rounded-lg border border-border p-3"
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  src={otherChamp.imageUrl}
                                  alt={otherChamp.name}
                                  className="h-10 w-10 rounded object-cover"
                                />
                                <div>
                                  <h4 className="font-medium text-sm">{otherChamp.name}</h4>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">Force: {synergy.rating}/3</Badge>
                                  </div>
                                  {synergy.notes && (
                                    <p className="mt-1 text-xs text-muted-foreground">
                                      {synergy.notes}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => deleteSynergyMutation.mutate(synergy.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                {negativeSynergies.filter((synergy) => {
                  const otherChamp = getOtherChampion(synergy);
                  return !otherChamp?.roles || otherChamp.roles.length === 0;
                }).length > 0 && (
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs font-semibold">Sans rôle</Badge>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                    <div className="space-y-2">
                      {negativeSynergies.filter((synergy) => {
                        const otherChamp = getOtherChampion(synergy);
                        return !otherChamp?.roles || otherChamp.roles.length === 0;
                      }).map((synergy) => {
                        const otherChamp = getOtherChampion(synergy);
                        if (!otherChamp) return null;
                        return (
                          <div
                            key={synergy.id}
                            className="flex items-start justify-between rounded-lg border border-border p-3"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={otherChamp.imageUrl}
                                alt={otherChamp.name}
                                className="h-10 w-10 rounded object-cover"
                              />
                              <div>
                                <h4 className="font-medium text-sm">{otherChamp.name}</h4>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">Force: {synergy.rating}/3</Badge>
                                </div>
                                {synergy.notes && (
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {synergy.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => deleteSynergyMutation.mutate(synergy.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                Aucun contre-pick enregistré
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
