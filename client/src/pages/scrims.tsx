import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { Plus, Trophy, Target, Calendar, Trash2, X, Edit } from "lucide-react";
import type { Scrim, Draft, DraftWithDetails, ChampionWithEvaluation } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GameComposition {
  gameNumber: number;
  top?: string;
  jungle?: string;
  mid?: string;
  adc?: string;
  support?: string;
}

interface GameDraft {
  gameNumber: number;
  draftId?: string;
}

export default function Scrims() {
  const [opponent, setOpponent] = useState("");
  const [score, setScore] = useState("");
  const [isWin, setIsWin] = useState<boolean>(true);
  const [comments, setComments] = useState("");
  const [numberOfGames, setNumberOfGames] = useState<number>(1);
  const [compositions, setCompositions] = useState<GameComposition[]>([]);
  const [gameDrafts, setGameDrafts] = useState<GameDraft[]>([]);
  const [showCompositions, setShowCompositions] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingScrim, setEditingScrim] = useState<Scrim | null>(null);
  const { toast } = useToast();

  const { data: scrims, isLoading } = useQuery<Scrim[]>({
    queryKey: ["/api/scrims"],
  });

  const { data: drafts } = useQuery<DraftWithDetails[]>({
    queryKey: ["/api/drafts"],
  });

  const { data: champions } = useQuery<ChampionWithEvaluation[]>({
    queryKey: ["/api/champions"],
  });

  const addScrimMutation = useMutation({
    mutationFn: async () => {
      if (!opponent.trim() || !score.trim()) {
        throw new Error("Adversaire et score sont requis");
      }
      
      if (editingScrim) {
        // Mode édition
        return await apiRequest("PUT", `/api/scrims/${editingScrim.id}`, {
          opponent,
          score,
          isWin,
          comments,
          numberOfGames: numberOfGames > 0 ? numberOfGames : undefined,
          compositions: compositions.length > 0 ? compositions : undefined,
          drafts: gameDrafts.length > 0 ? gameDrafts : undefined,
        });
      } else {
        // Mode création
        return await apiRequest("POST", "/api/scrims", {
          opponent,
          score,
          isWin,
          comments,
          numberOfGames: numberOfGames > 0 ? numberOfGames : undefined,
          compositions: compositions.length > 0 ? compositions : undefined,
          drafts: gameDrafts.length > 0 ? gameDrafts : undefined,
        });
      }
    },
    onMutate: async () => {
      if (!editingScrim) {
        // Optimistic update uniquement pour la création
        await queryClient.cancelQueries({ queryKey: ["/api/scrims"] });
        const previousScrims = queryClient.getQueryData<Scrim[]>(["/api/scrims"]);
        
        const optimisticScrim: Scrim = {
          id: `temp-${Date.now()}`,
          opponent,
          score,
          isWin,
          comments,
          date: new Date().toISOString(),
          numberOfGames: numberOfGames > 0 ? numberOfGames : null,
          compositions: compositions.length > 0 ? compositions : null,
          drafts: gameDrafts.length > 0 ? gameDrafts : null,
        };
        
        queryClient.setQueryData<Scrim[]>(["/api/scrims"], (old) => 
          old ? [optimisticScrim, ...old] : [optimisticScrim]
        );
        
        return { previousScrims };
      }
      return {};
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scrims"] });
      resetForm();
      toast({
        title: editingScrim ? "Scrim modifié" : "Scrim ajouté",
        description: editingScrim ? "Le scrim a été mis à jour." : "Le résultat du scrim a été enregistré.",
      });
    },
    onError: (error: Error, variables, context: any) => {
      if (context?.previousScrims) {
        queryClient.setQueryData(["/api/scrims"], context.previousScrims);
      }
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible d'ajouter le scrim.",
      });
    },
  });

  const deleteScrimMutation = useMutation({
    mutationFn: async (scrimId: string) => {
      await apiRequest("DELETE", `/api/scrims/${scrimId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scrims"] });
      toast({
        title: "Scrim supprimé",
        description: "Le scrim a été supprimé avec succès.",
      });
    },
  });

  const resetForm = () => {
    setOpponent("");
    setScore("");
    setIsWin(true);
    setComments("");
    setNumberOfGames(1);
    setCompositions([]);
    setGameDrafts([]);
    setShowCompositions(false);
    setIsDialogOpen(false);
    setEditingScrim(null);
  };

  const openEditDialog = (scrim: Scrim) => {
    setEditingScrim(scrim);
    setOpponent(scrim.opponent);
    setScore(scrim.score);
    setIsWin(scrim.isWin);
    setComments(scrim.comments || "");
    setNumberOfGames(scrim.numberOfGames || 1);
    setCompositions(scrim.compositions || []);
    setGameDrafts(scrim.drafts || []);
    setShowCompositions((scrim.compositions && scrim.compositions.length > 0) || (scrim.drafts && scrim.drafts.length > 0));
    setIsDialogOpen(true);
  };

  const wins = scrims?.filter((s) => s.isWin).length || 0;
  const total = scrims?.length || 0;
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

  if (isLoading) {
    return (
      <div className="space-y-6 p-8">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-rajdhani text-3xl font-bold uppercase tracking-wide text-foreground">
            Scrims
          </h1>
          <p className="text-sm text-muted-foreground">
            Suivez les résultats de vos matchs d'entraînement
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-scrim">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un Scrim
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-rajdhani text-xl font-bold uppercase">
                {editingScrim ? "Modifier le Scrim" : "Nouveau Scrim"}
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
              <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Adversaire
                </label>
                <Input
                  placeholder="Nom de l'équipe adverse"
                  value={opponent}
                  onChange={(e) => setOpponent(e.target.value)}
                  data-testid="input-opponent"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Score
                </label>
                <Input
                  placeholder="Ex: 2-1"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  data-testid="input-score"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Résultat
                </label>
                <Select
                  value={isWin ? "win" : "loss"}
                  onValueChange={(value) => setIsWin(value === "win")}
                >
                  <SelectTrigger data-testid="select-result">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="win">Victoire</SelectItem>
                    <SelectItem value="loss">Défaite</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Nombre de games
                </label>
                <Input
                  type="number"
                  min="1"
                  max="99"
                  placeholder="Ex: 3"
                  value={numberOfGames}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setNumberOfGames(val);
                    // Ajuster le tableau des compositions
                    if (val > compositions.length) {
                      const newComps = [...compositions];
                      for (let i = compositions.length; i < val; i++) {
                        newComps.push({ gameNumber: i + 1 });
                      }
                      setCompositions(newComps);
                    } else if (val < compositions.length) {
                      setCompositions(compositions.slice(0, val));
                    }
                    // Ajuster le tableau des drafts
                    if (val > gameDrafts.length) {
                      const newDrafts = [...gameDrafts];
                      for (let i = gameDrafts.length; i < val; i++) {
                        newDrafts.push({ gameNumber: i + 1 });
                      }
                      setGameDrafts(newDrafts);
                    } else if (val < gameDrafts.length) {
                      setGameDrafts(gameDrafts.slice(0, val));
                    }
                  }}
                  data-testid="input-number-of-games"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Commentaires
                </label>
                <Textarea
                  placeholder="Notes sur le scrim, points à améliorer..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={3}
                  data-testid="textarea-comments"
                />
              </div>

              <Collapsible open={showCompositions} onOpenChange={setShowCompositions}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full" type="button">
                    {showCompositions ? "Masquer" : "Ajouter"} les compositions (facultatif)
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4 space-y-4">
                  {Array.from({ length: numberOfGames }, (_, i) => i + 1).map((gameNum) => {
                    const compIndex = compositions.findIndex(c => c.gameNumber === gameNum);
                    const comp = compIndex >= 0 ? compositions[compIndex] : { gameNumber: gameNum };
                    
                    const updateComposition = (field: keyof GameComposition, value: string) => {
                      const newComps = [...compositions];
                      if (compIndex >= 0) {
                        newComps[compIndex] = { ...newComps[compIndex], [field]: value };
                      } else {
                        newComps.push({ ...comp, [field]: value });
                      }
                      setCompositions(newComps);
                    };

                    const draftIndex = gameDrafts.findIndex(d => d.gameNumber === gameNum);
                    const gameDraft = draftIndex >= 0 ? gameDrafts[draftIndex] : { gameNumber: gameNum };

                    const updateDraft = (draftId: string) => {
                      const newDrafts = [...gameDrafts];
                      if (draftIndex >= 0) {
                        newDrafts[draftIndex] = { ...newDrafts[draftIndex], draftId };
                      } else {
                        newDrafts.push({ gameNumber: gameNum, draftId });
                      }
                      setGameDrafts(newDrafts);
                      
                      // Auto-remplir les champions de l'équipe alliée depuis le draft sélectionné
                      if (draftId !== "none") {
                        const selectedDraft = drafts?.find(d => d.id === draftId);
                        if (selectedDraft) {
                          const newComps = [...compositions];
                          const newComp: GameComposition = {
                            gameNumber: gameNum,
                            top: selectedDraft.teamTopChampion?.name || "",
                            jungle: selectedDraft.teamJglChampion?.name || "",
                            mid: selectedDraft.teamMidChampion?.name || "",
                            adc: selectedDraft.teamAdcChampion?.name || "",
                            support: selectedDraft.teamSupChampion?.name || "",
                          };
                          
                          if (compIndex >= 0) {
                            newComps[compIndex] = newComp;
                          } else {
                            newComps.push(newComp);
                          }
                          setCompositions(newComps);
                        }
                      }
                    };

                    return (
                      <Card key={gameNum} className="p-4">
                        <h4 className="mb-3 font-medium">Game {gameNum}</h4>
                        <div className="grid gap-3">
                          <div>
                            <Label className="text-xs">Draft utilisé</Label>
                            <Select
                              value={gameDraft.draftId || "none"}
                              onValueChange={(value) => {
                                if (value !== "none") {
                                  updateDraft(value);
                                }
                              }}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="Sélectionner un draft" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Aucun</SelectItem>
                                {drafts?.map((draft) => (
                                  <SelectItem key={draft.id} value={draft.id}>
                                    {draft.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs">Top</Label>
                              <Select
                                value={comp.top || "none"}
                                onValueChange={(value) => updateComposition("top", value === "none" ? "" : value)}
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue placeholder="Champion" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Aucun</SelectItem>
                                  {champions?.map((champion) => (
                                    <SelectItem key={champion.id} value={champion.name}>
                                      {champion.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-xs">Jungle</Label>
                              <Select
                                value={comp.jungle || "none"}
                                onValueChange={(value) => updateComposition("jungle", value === "none" ? "" : value)}
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue placeholder="Champion" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Aucun</SelectItem>
                                  {champions?.map((champion) => (
                                    <SelectItem key={champion.id} value={champion.name}>
                                      {champion.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <Label className="text-xs">Mid</Label>
                              <Select
                                value={comp.mid || "none"}
                                onValueChange={(value) => updateComposition("mid", value === "none" ? "" : value)}
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue placeholder="Champion" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Aucun</SelectItem>
                                  {champions?.map((champion) => (
                                    <SelectItem key={champion.id} value={champion.name}>
                                      {champion.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-xs">ADC</Label>
                              <Select
                                value={comp.adc || "none"}
                                onValueChange={(value) => updateComposition("adc", value === "none" ? "" : value)}
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue placeholder="Champion" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Aucun</SelectItem>
                                  {champions?.map((champion) => (
                                    <SelectItem key={champion.id} value={champion.name}>
                                      {champion.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-xs">Support</Label>
                              <Select
                                value={comp.support || "none"}
                                onValueChange={(value) => updateComposition("support", value === "none" ? "" : value)}
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue placeholder="Champion" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Aucun</SelectItem>
                                  {champions?.map((champion) => (
                                    <SelectItem key={champion.id} value={champion.name}>
                                      {champion.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>

              <Button
                onClick={() => addScrimMutation.mutate()}
                disabled={addScrimMutation.isPending}
                className="w-full"
                data-testid="button-save-scrim"
              >
                {addScrimMutation.isPending ? "Sauvegarde..." : "Sauvegarder"}
              </Button>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scrims</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-bold" data-testid="text-total-scrims">
              {total}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Victoires</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-bold text-primary" data-testid="text-wins">
              {wins}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Winrate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-bold text-accent" data-testid="text-winrate">
              {winRate}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-rajdhani text-xl font-bold uppercase">
            Historique
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {scrims?.map((scrim) => (
              <div
                key={scrim.id}
                className="flex items-start justify-between rounded-lg border border-border p-4 hover-elevate transition-colors"
                data-testid={`card-scrim-${scrim.id}`}
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <Badge variant={scrim.isWin ? "default" : "destructive"}>
                      {scrim.isWin ? "Victoire" : "Défaite"}
                    </Badge>
                    <h3 className="font-medium text-foreground">
                      vs {scrim.opponent}
                    </h3>
                    <span className="font-mono text-sm text-muted-foreground">
                      {scrim.score}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(scrim.date).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  {scrim.numberOfGames && (
                    <p className="text-xs text-muted-foreground">
                      {scrim.numberOfGames} game{scrim.numberOfGames > 1 ? "s" : ""}
                    </p>
                  )}
                  {scrim.comments && (
                    <p className="text-sm text-foreground">{scrim.comments}</p>
                  )}
                  {((scrim.compositions && Array.isArray(scrim.compositions) && scrim.compositions.length > 0) ||
                    (scrim.drafts && Array.isArray(scrim.drafts) && scrim.drafts.length > 0)) && (
                    <div className="mt-2 space-y-2">
                      {Array.from({ length: scrim.numberOfGames || 1 }, (_, i) => i + 1).map((gameNum) => {
                        const comp = scrim.compositions?.find((c: GameComposition) => c.gameNumber === gameNum);
                        const draftInfo = scrim.drafts?.find((d: GameDraft) => d.gameNumber === gameNum);
                        const draft = draftInfo ? drafts?.find(d => d.id === draftInfo.draftId) : undefined;

                        if (!comp && !draft) return null;

                        return (
                          <div key={gameNum} className="rounded border border-border/50 bg-muted/30 p-2">
                            <div className="mb-1 flex items-center justify-between">
                              <p className="text-xs font-medium">Game {gameNum}</p>
                              {draft && (
                                <Badge variant="outline" className="text-xs">
                                  Draft: {draft.name}
                                </Badge>
                              )}
                            </div>
                            {comp && (
                              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                {comp.top && <span>Top: {comp.top}</span>}
                                {comp.jungle && <span>JGL: {comp.jungle}</span>}
                                {comp.mid && <span>Mid: {comp.mid}</span>}
                                {comp.adc && <span>ADC: {comp.adc}</span>}
                                {comp.support && <span>Sup: {comp.support}</span>}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => openEditDialog(scrim)}
                    data-testid={`button-edit-scrim-${scrim.id}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteScrimMutation.mutate(scrim.id)}
                    data-testid={`button-delete-scrim-${scrim.id}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
