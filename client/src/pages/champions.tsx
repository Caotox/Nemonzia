import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Star, Plus, X } from "lucide-react";
import type { ChampionWithEvaluation } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type CharacteristicKey = "prioLane" | "strongside" | "weakside" | "engage" | "peeling" | "split" | "hypercarry" | "controle";

const CHARACTERISTICS: Array<{ key: CharacteristicKey; label: string }> = [
  { key: "prioLane", label: "Prio de Lane" },
  { key: "strongside", label: "Strongside" },
  { key: "weakside", label: "Weakside" },
  { key: "engage", label: "Engage" },
  { key: "peeling", label: "Peeling" },
  { key: "split", label: "Split" },
  { key: "hypercarry", label: "Hypercarry" },
  { key: "controle", label: "Contrôle" },
];

function StarRating({ 
  value, 
  onChange, 
  readonly = false 
}: { 
  value: number; 
  onChange?: (value: number) => void;
  readonly?: boolean;
}) {
  const handleClick = (star: number) => {
    if (readonly) return;
    if (star === value) {
      onChange?.(0);
    } else {
      onChange?.(star);
    }
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          disabled={readonly}
          className={`transition-colors ${!readonly ? 'hover-elevate cursor-pointer' : 'cursor-default'}`}
          data-testid={`star-${star}`}
        >
          <Star
            className={`h-4 w-4 ${
              star <= value
                ? "fill-primary text-primary"
                : "fill-muted text-muted"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

const ROLES = ["Tous", "TOP", "JGL", "MID", "ADC", "SUP"] as const;

export default function Champions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("Tous");
  const { toast } = useToast();

  const { data: champions, isLoading } = useQuery<ChampionWithEvaluation[]>({
    queryKey: ["/api/champions"],
  });

  const updateRolesMutation = useMutation({
    mutationFn: async ({ championId, roles }: { championId: string; roles: string[] }) => {
      return await apiRequest("PUT", `/api/champions/${championId}/roles`, { roles });
    },
    onMutate: async ({ championId, roles }) => {
      await queryClient.cancelQueries({ queryKey: ["/api/champions"] });
      const previousChampions = queryClient.getQueryData<ChampionWithEvaluation[]>(["/api/champions"]);
      
      queryClient.setQueryData<ChampionWithEvaluation[]>(["/api/champions"], (old) => 
        old?.map(c => c.id === championId ? { ...c, roles } : c)
      );
      
      return { previousChampions };
    },
    onSuccess: () => {
      toast({
        title: "Rôles mis à jour",
        description: "Les rôles du champion ont été enregistrés.",
      });
    },
    onError: (error, variables, context) => {
      if (context?.previousChampions) {
        queryClient.setQueryData(["/api/champions"], context.previousChampions);
      }
      console.error("Error updating roles:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour les rôles.",
      });
    },
  });

  const updateEvaluationMutation = useMutation({
    mutationFn: async ({ 
      championId, 
      characteristic, 
      value 
    }: { 
      championId: string; 
      characteristic: string; 
      value: number;
    }) => {
      return await apiRequest("POST", "/api/champions/evaluate", {
        championId,
        [characteristic]: value,
      });
    },
    onMutate: async ({ championId, characteristic, value }) => {
      await queryClient.cancelQueries({ queryKey: ["/api/champions"] });
      const previousChampions = queryClient.getQueryData<ChampionWithEvaluation[]>(["/api/champions"]);
      
      queryClient.setQueryData<ChampionWithEvaluation[]>(["/api/champions"], (old) => 
        old?.map(c => {
          if (c.id === championId) {
            return {
              ...c,
              evaluation: c.evaluation 
                ? { ...c.evaluation, [characteristic]: value }
                : { championId, [characteristic]: value } as any
            };
          }
          return c;
        })
      );
      
      return { previousChampions };
    },
    onSuccess: () => {
      toast({
        title: "Évaluation mise à jour",
        description: "L'évaluation du champion a été enregistrée.",
      });
    },
    onError: (error, variables, context) => {
      if (context?.previousChampions) {
        queryClient.setQueryData(["/api/champions"], context.previousChampions);
      }
      console.error("Error updating evaluation:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour l'évaluation.",
      });
    },
  });

  const filteredChampions = champions?.filter((champion) => {
    const matchesSearch = champion.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole =
      selectedRole === "Tous" ||
      (selectedRole && champion.roles?.includes(selectedRole));
    return matchesSearch && matchesRole;
  });

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
      <div>
        <h1 className="font-rajdhani text-3xl font-bold uppercase tracking-wide text-foreground">
          Database Champions
        </h1>
        <p className="text-sm text-muted-foreground">
          Évaluez les caractéristiques de chaque champion (0-3)
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
                  data-testid="input-search-champion"
                />
              </div>
              <Badge variant="secondary" className="font-mono">
                {filteredChampions?.length || 0} champions
              </Badge>
            </div>
            <Tabs value={selectedRole} onValueChange={setSelectedRole}>
              <TabsList className="grid w-full grid-cols-6">
                {ROLES.map((role) => (
                  <TabsTrigger key={role} value={role}>
                    {role}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="sticky left-0 z-10 bg-card px-4 py-3 text-left">
                    <span className="font-rajdhani text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Champion
                    </span>
                  </th>
                  <th className="px-4 py-3 text-center">
                    <span className="font-rajdhani text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Rôle
                    </span>
                  </th>
                  {CHARACTERISTICS.map((char) => (
                    <th key={char.key} className="px-4 py-3 text-center">
                      <span className="font-rajdhani text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {char.label}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredChampions?.map((champion) => (
                  <tr
                    key={champion.id}
                    className="border-b border-border hover-elevate transition-colors"
                    data-testid={`row-champion-${champion.id}`}
                  >
                    <td className="sticky left-0 z-10 bg-card px-4 py-3">
                      <Link href={`/champions/${champion.id}`}>
                        <div className="flex cursor-pointer items-center gap-3 transition-opacity hover:opacity-80">
                          <div className="h-12 w-12 overflow-hidden rounded-md bg-muted">
                            <img
                              src={champion.imageUrl}
                              alt={champion.name}
                              className="h-full w-full object-cover"
                              data-testid={`img-champion-${champion.id}`}
                            />
                          </div>
                          <span className="font-medium text-foreground">
                            {champion.name}
                          </span>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 gap-1">
                              {champion.roles && champion.roles.length > 0 ? (
                                <div className="flex gap-1">
                                  {champion.roles.map((role) => (
                                    <Badge key={role} variant="secondary" className="text-xs px-1 py-0">
                                      {role}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <>
                                  <Plus className="h-3 w-3" />
                                  <span className="text-xs">Rôles</span>
                                </>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-48">
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm mb-2">Sélectionner les rôles</h4>
                              {["TOP", "JGL", "MID", "ADC", "SUP"].map((role) => (
                                <div key={role} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`${champion.id}-${role}`}
                                    checked={champion.roles?.includes(role) || false}
                                    onCheckedChange={(checked) => {
                                      const currentRoles = champion.roles || [];
                                      const newRoles = checked
                                        ? [...currentRoles, role]
                                        : currentRoles.filter((r) => r !== role);
                                      updateRolesMutation.mutate({
                                        championId: champion.id,
                                        roles: newRoles,
                                      });
                                    }}
                                  />
                                  <label
                                    htmlFor={`${champion.id}-${role}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                  >
                                    {role}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </td>
                    {CHARACTERISTICS.map((char) => {
                      const evalValue = champion.evaluation?.[char.key as keyof typeof champion.evaluation];
                      const currentValue = typeof evalValue === 'number' ? evalValue : 0;
                      
                      return (
                        <td key={char.key} className="px-4 py-3">
                          <div className="flex justify-center">
                            <StarRating
                              value={currentValue}
                              onChange={(value) =>
                                updateEvaluationMutation.mutate({
                                  championId: champion.id,
                                  characteristic: char.key,
                                  value,
                                })
                              }
                            />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
