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
import { Plus, Trophy, Target, Calendar, Trash2, X } from "lucide-react";
import type { Scrim } from "@shared/schema";
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

interface GameComposition {
  gameNumber: number;
  top?: string;
  jungle?: string;
  mid?: string;
  adc?: string;
  support?: string;
}

export default function Scrims() {
  const [opponent, setOpponent] = useState("");
  const [score, setScore] = useState("");
  const [isWin, setIsWin] = useState<boolean>(true);
  const [comments, setComments] = useState("");
  const [numberOfGames, setNumberOfGames] = useState<number>(1);
  const [compositions, setCompositions] = useState<GameComposition[]>([]);
  const [showCompositions, setShowCompositions] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: scrims, isLoading } = useQuery<Scrim[]>({
    queryKey: ["/api/scrims"],
  });

  const addScrimMutation = useMutation({
    mutationFn: async () => {
      if (!opponent.trim() || !score.trim()) {
        throw new Error("Adversaire et score sont requis");
      }
      await apiRequest("POST", "/api/scrims", {
        opponent,
        score,
        isWin,
        comments,
        numberOfGames: numberOfGames > 0 ? numberOfGames : undefined,
        compositions: compositions.length > 0 ? compositions : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scrims"] });
      setOpponent("");
      setScore("");
      setIsWin(true);
      setComments("");
      setNumberOfGames(1);
      setCompositions([]);
      setShowCompositions(false);
      setIsDialogOpen(false);
      toast({
        title: "Scrim ajouté",
        description: "Le résultat du scrim a été enregistré.",
      });
    },
    onError: (error: Error) => {
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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-scrim">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un Scrim
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-rajdhani text-xl font-bold uppercase">
                Nouveau Scrim
              </DialogTitle>
            </DialogHeader>
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

                    return (
                      <Card key={gameNum} className="p-4">
                        <h4 className="mb-3 font-medium">Game {gameNum}</h4>
                        <div className="grid gap-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs">Top</Label>
                              <Input
                                placeholder="Champion"
                                value={comp.top || ""}
                                onChange={(e) => updateComposition("top", e.target.value)}
                                className="h-8"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Jungle</Label>
                              <Input
                                placeholder="Champion"
                                value={comp.jungle || ""}
                                onChange={(e) => updateComposition("jungle", e.target.value)}
                                className="h-8"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <Label className="text-xs">Mid</Label>
                              <Input
                                placeholder="Champion"
                                value={comp.mid || ""}
                                onChange={(e) => updateComposition("mid", e.target.value)}
                                className="h-8"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">ADC</Label>
                              <Input
                                placeholder="Champion"
                                value={comp.adc || ""}
                                onChange={(e) => updateComposition("adc", e.target.value)}
                                className="h-8"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Support</Label>
                              <Input
                                placeholder="Champion"
                                value={comp.support || ""}
                                onChange={(e) => updateComposition("support", e.target.value)}
                                className="h-8"
                              />
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
                  {scrim.compositions && Array.isArray(scrim.compositions) && scrim.compositions.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {scrim.compositions.map((comp: GameComposition) => (
                        <div key={comp.gameNumber} className="rounded border border-border/50 bg-muted/30 p-2">
                          <p className="mb-1 text-xs font-medium">Game {comp.gameNumber}</p>
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            {comp.top && <span>Top: {comp.top}</span>}
                            {comp.jungle && <span>JGL: {comp.jungle}</span>}
                            {comp.mid && <span>Mid: {comp.mid}</span>}
                            {comp.adc && <span>ADC: {comp.adc}</span>}
                            {comp.support && <span>Sup: {comp.support}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => deleteScrimMutation.mutate(scrim.id)}
                  data-testid={`button-delete-scrim-${scrim.id}`}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
