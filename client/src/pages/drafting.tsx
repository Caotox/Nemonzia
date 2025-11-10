import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Save, Trash2 } from "lucide-react";
import type { Champion, Draft, DraftWithDetails } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const POSITIONS = ["TOP", "JGL", "MID", "ADC", "SUP"] as const;

function ChampionSelector({
  champions,
  value,
  onChange,
  placeholder,
}: {
  champions: Champion[];
  value: string | null | undefined;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const selectedChampion = champions.find((c) => c.id === value);

  return (
    <Select 
      value={value || "none"} 
      onValueChange={(val) => onChange(val === "none" ? "" : val)}
    >
      <SelectTrigger className="w-full" data-testid={`select-${placeholder.toLowerCase()}`}>
        <SelectValue placeholder={placeholder}>
          {selectedChampion && (
            <div className="flex items-center gap-2">
              <img
                src={selectedChampion.imageUrl}
                alt={selectedChampion.name}
                className="h-6 w-6 rounded object-cover"
              />
              <span>{selectedChampion.name}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">Aucun</SelectItem>
        {champions.map((champion) => (
          <SelectItem key={champion.id} value={champion.id}>
            <div className="flex items-center gap-2">
              <img
                src={champion.imageUrl}
                alt={champion.name}
                className="h-6 w-6 rounded object-cover"
              />
              <span>{champion.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function Drafting() {
  const [draftName, setDraftName] = useState("");
  const [currentDraft, setCurrentDraft] = useState<Partial<Draft>>({
    teamBans: [],
    enemyBans: [],
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: champions, isLoading: championsLoading } = useQuery<Champion[]>({
    queryKey: ["/api/champions"],
  });

  const { data: drafts, isLoading: draftsLoading } = useQuery<DraftWithDetails[]>({
    queryKey: ["/api/drafts"],
  });

  const saveDraftMutation = useMutation({
    mutationFn: async () => {
      if (!draftName.trim()) {
        throw new Error("Le nom du draft est requis");
      }
      await apiRequest("POST", "/api/drafts", {
        ...currentDraft,
        name: draftName,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drafts"] });
      setDraftName("");
      setCurrentDraft({ teamBans: [], enemyBans: [] });
      setIsDialogOpen(false);
      toast({
        title: "Draft sauvegardé",
        description: "Le draft a été enregistré avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder le draft.",
      });
    },
  });

  const deleteDraftMutation = useMutation({
    mutationFn: async (draftId: string) => {
      await apiRequest("DELETE", `/api/drafts/${draftId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drafts"] });
      toast({
        title: "Draft supprimé",
        description: "Le draft a été supprimé avec succès.",
      });
    },
  });

  if (championsLoading || draftsLoading) {
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
            Drafting
          </h1>
          <p className="text-sm text-muted-foreground">
            Créez et sauvegardez vos compositions d'équipe
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-draft">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Draft
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="font-rajdhani text-xl font-bold uppercase">
                Créer un Draft
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Nom du Draft
                </label>
                <Input
                  placeholder="Ex: Composition Tank"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  data-testid="input-draft-name"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-rajdhani text-lg font-bold uppercase text-primary">
                    Notre Équipe
                  </h3>
                  {POSITIONS.map((position) => (
                    <div key={position}>
                      <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {position}
                      </label>
                      <ChampionSelector
                        champions={champions || []}
                        value={currentDraft[`team${position.charAt(0) + position.slice(1).toLowerCase()}ChampionId` as keyof Draft] as string}
                        onChange={(value) =>
                          setCurrentDraft({
                            ...currentDraft,
                            [`team${position.charAt(0) + position.slice(1).toLowerCase()}ChampionId`]: value,
                          })
                        }
                        placeholder={`Champion ${position}`}
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h3 className="font-rajdhani text-lg font-bold uppercase text-destructive">
                    Équipe Ennemie
                  </h3>
                  {POSITIONS.map((position) => (
                    <div key={position}>
                      <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {position}
                      </label>
                      <ChampionSelector
                        champions={champions || []}
                        value={currentDraft[`enemy${position.charAt(0) + position.slice(1).toLowerCase()}ChampionId` as keyof Draft] as string}
                        onChange={(value) =>
                          setCurrentDraft({
                            ...currentDraft,
                            [`enemy${position.charAt(0) + position.slice(1).toLowerCase()}ChampionId`]: value,
                          })
                        }
                        placeholder={`Champion ${position}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => saveDraftMutation.mutate()}
                disabled={saveDraftMutation.isPending}
                className="w-full"
                data-testid="button-save-draft"
              >
                <Save className="mr-2 h-4 w-4" />
                {saveDraftMutation.isPending ? "Sauvegarde..." : "Sauvegarder le Draft"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {drafts?.map((draft) => (
          <Card key={draft.id} className="overflow-hidden" data-testid={`card-draft-${draft.id}`}>
            <CardHeader className="border-b border-card-border">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="font-rajdhani text-lg font-bold uppercase">
                    {draft.name}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {new Date(draft.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => deleteDraftMutation.mutate(draft.id)}
                  data-testid={`button-delete-draft-${draft.id}`}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
                    Notre équipe
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {[draft.teamTopChampion, draft.teamJglChampion, draft.teamMidChampion, draft.teamAdcChampion, draft.teamSupChampion]
                      .filter(Boolean)
                      .map((champion) => champion && (
                        <img
                          key={champion.id}
                          src={champion.imageUrl}
                          alt={champion.name}
                          title={champion.name}
                          className="h-10 w-10 rounded object-cover"
                        />
                      ))}
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-destructive">
                    Équipe ennemie
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {[draft.enemyTopChampion, draft.enemyJglChampion, draft.enemyMidChampion, draft.enemyAdcChampion, draft.enemySupChampion]
                      .filter(Boolean)
                      .map((champion) => champion && (
                        <img
                          key={champion.id}
                          src={champion.imageUrl}
                          alt={champion.name}
                          title={champion.name}
                          className="h-10 w-10 rounded object-cover"
                        />
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
