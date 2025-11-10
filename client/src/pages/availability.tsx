import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Plus, UserPlus, Trash2 } from "lucide-react";
import type { Player, PlayerAvailability } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const DAYS = [
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mer" },
  { value: 4, label: "Jeu" },
  { value: 5, label: "Ven" },
  { value: 6, label: "Sam" },
  { value: 0, label: "Dim" },
];

const ROLES = ["TOP", "JGL", "MID", "ADC", "SUP"];

export default function Availability() {
  const [playerName, setPlayerName] = useState("");
  const [playerRole, setPlayerRole] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: players, isLoading: playersLoading } = useQuery<Player[]>({
    queryKey: ["/api/players"],
  });

  const { data: availability, isLoading: availabilityLoading } = useQuery<
    PlayerAvailability[]
  >({
    queryKey: ["/api/availability"],
  });

  const addPlayerMutation = useMutation({
    mutationFn: async () => {
      if (!playerName.trim() || !playerRole) {
        throw new Error("Nom et rôle sont requis");
      }
      await apiRequest("POST", "/api/players", {
        name: playerName,
        role: playerRole,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      setPlayerName("");
      setPlayerRole("");
      setIsDialogOpen(false);
      toast({
        title: "Joueur ajouté",
        description: "Le joueur a été ajouté avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible d'ajouter le joueur.",
      });
    },
  });

  const deletePlayerMutation = useMutation({
    mutationFn: async (playerId: string) => {
      await apiRequest("DELETE", `/api/players/${playerId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      queryClient.invalidateQueries({ queryKey: ["/api/availability"] });
      toast({
        title: "Joueur supprimé",
        description: "Le joueur a été supprimé avec succès.",
      });
    },
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: async ({
      playerId,
      dayOfWeek,
      isAvailable,
    }: {
      playerId: string;
      dayOfWeek: number;
      isAvailable: boolean;
    }) => {
      await apiRequest("POST", "/api/availability", {
        playerId,
        dayOfWeek,
        isAvailable,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/availability"] });
    },
  });

  const getAvailability = (
    playerId: string,
    dayOfWeek: number
  ): boolean => {
    return (
      availability?.some(
        (a) =>
          a.playerId === playerId &&
          a.dayOfWeek === dayOfWeek &&
          a.isAvailable
      ) || false
    );
  };

  if (playersLoading || availabilityLoading) {
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
            Disponibilités
          </h1>
          <p className="text-sm text-muted-foreground">
            Gérez les disponibilités de votre équipe
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-player">
              <UserPlus className="mr-2 h-4 w-4" />
              Ajouter un Joueur
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-rajdhani text-xl font-bold uppercase">
                Nouveau Joueur
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Nom du Joueur
                </label>
                <Input
                  placeholder="Pseudo in-game"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  data-testid="input-player-name"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Rôle</label>
                <Select value={playerRole} onValueChange={setPlayerRole}>
                  <SelectTrigger data-testid="select-player-role">
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={() => addPlayerMutation.mutate()}
                disabled={addPlayerMutation.isPending}
                className="w-full"
                data-testid="button-save-player"
              >
                {addPlayerMutation.isPending ? "Ajout..." : "Ajouter"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-rajdhani text-xl font-bold uppercase">
            Calendrier Hebdomadaire
          </CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left">
                  <span className="font-rajdhani text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Joueur
                  </span>
                </th>
                {DAYS.map((day) => (
                  <th
                    key={day.value}
                    className="px-4 py-3 text-center"
                  >
                    <span className="font-rajdhani text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      {day.label}
                    </span>
                  </th>
                ))}
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {players?.map((player) => (
                <tr
                  key={player.id}
                  className="border-b border-border hover-elevate transition-colors"
                  data-testid={`row-player-${player.id}`}
                >
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-foreground">
                        {player.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {player.role}
                      </div>
                    </div>
                  </td>
                  {DAYS.map((day) => (
                    <td
                      key={day.value}
                      className="px-4 py-3 text-center"
                    >
                      <Checkbox
                        checked={getAvailability(player.id, day.value)}
                        onCheckedChange={(checked) =>
                          toggleAvailabilityMutation.mutate({
                            playerId: player.id,
                            dayOfWeek: day.value,
                            isAvailable: checked as boolean,
                          })
                        }
                        data-testid={`checkbox-availability-${player.id}-${day.value}`}
                      />
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deletePlayerMutation.mutate(player.id)}
                      data-testid={`button-delete-player-${player.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
