import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FileText, Plus, Trash2, Calendar } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface PatchNote {
  id: string;
  version: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
}

const patchNoteSchema = z.object({
  version: z.string().min(1, "Version requise"),
  title: z.string().min(1, "Titre requis"),
  content: z.string().min(1, "Contenu requis"),
  category: z.string().min(1, "Catégorie requise"),
});

type PatchNoteForm = z.infer<typeof patchNoteSchema>;

export default function PatchNotes() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: patchNotes, isLoading } = useQuery<PatchNote[]>({
    queryKey: ["/api/patchnotes"],
  });

  const form = useForm<PatchNoteForm>({
    resolver: zodResolver(patchNoteSchema),
    defaultValues: {
      version: "",
      title: "",
      content: "",
      category: "champion",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: PatchNoteForm) => {
      return await apiRequest("POST", "/api/patchnotes", data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/patchnotes"] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: "Note de patch ajoutée",
        description: "La note de patch a été créée avec succès.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer la note de patch.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/patchnotes/${id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/patchnotes"] });
      toast({
        title: "Note supprimée",
        description: "La note de patch a été supprimée.",
      });
    },
  });

  const onSubmit = (data: PatchNoteForm) => {
    createMutation.mutate(data);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "champion":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "item":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "system":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "meta":
        return "bg-primary/10 text-primary border-primary/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-8">
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-rajdhani text-3xl font-bold uppercase tracking-wide text-foreground">
            Notes de Patch & Méta
          </h1>
          <p className="text-sm text-muted-foreground">
            Suivez les changements du jeu et adaptez votre stratégie
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-patchnote">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une Note
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-rajdhani uppercase">Nouvelle Note de Patch</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="version"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Version</FormLabel>
                        <FormControl>
                          <Input placeholder="14.23" {...field} data-testid="input-version" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catégorie</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-category">
                              <SelectValue placeholder="Sélectionner une catégorie" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="champion">Champion</SelectItem>
                            <SelectItem value="item">Objet</SelectItem>
                            <SelectItem value="system">Système</SelectItem>
                            <SelectItem value="meta">Méta</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre</FormLabel>
                      <FormControl>
                        <Input placeholder="Nerf de Zed" {...field} data-testid="input-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contenu</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Description des changements..."
                          className="min-h-[120px]"
                          {...field}
                          data-testid="input-content"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending} data-testid="button-save">
                    {createMutation.isPending ? "Enregistrement..." : "Enregistrer"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {!patchNotes || patchNotes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium text-muted-foreground">
              Aucune note de patch
            </p>
            <p className="text-sm text-muted-foreground">
              Ajoutez votre première note pour suivre les changements
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {patchNotes.map((note) => (
            <Card key={note.id} className="relative" data-testid={`patchnote-${note.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="font-rajdhani text-sm font-bold uppercase tracking-wide text-primary">
                        v{note.version}
                      </span>
                      <span className={`rounded-md border px-2 py-0.5 text-xs font-medium ${getCategoryColor(note.category)}`}>
                        {note.category}
                      </span>
                    </div>
                    <CardTitle className="font-rajdhani text-lg uppercase">
                      {note.title}
                    </CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-1 text-xs">
                      <Calendar className="h-3 w-3" />
                      {new Date(note.createdAt).toLocaleDateString("fr-FR")}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(note.id)}
                    disabled={deleteMutation.isPending}
                    data-testid={`button-delete-${note.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {note.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
