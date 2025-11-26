import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Star } from "lucide-react";
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
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/champions"] });
      toast({
        title: "Évaluation mise à jour",
        description: "L'évaluation du champion a été enregistrée.",
      });
    },
    onError: (error) => {
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
      (selectedRole && champion.role === selectedRole);
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
