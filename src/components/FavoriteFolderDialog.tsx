import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Loader2, Plus, Folder } from "lucide-react";

interface FavoriteFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  onSuccess?: () => void;
}

export const FavoriteFolderDialog = ({
  open,
  onOpenChange,
  propertyId,
  onSuccess,
}: FavoriteFolderDialogProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [folders, setFolders] = useState<any[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);

  useEffect(() => {
    if (open && user) {
      fetchFolders();
    }
  }, [open, user]);

  const fetchFolders = async () => {
    try {
      const { data, error } = await supabase
        .from("favorite_folders")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFolders(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar pastas");
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error("Digite um nome para a pasta");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("favorite_folders")
        .insert({
          user_id: user?.id,
          name: newFolderName.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      setFolders([data, ...folders]);
      setSelectedFolder(data.id);
      setNewFolderName("");
      setShowNewFolder(false);
      toast.success("Pasta criada com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao criar pasta");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFavorite = async () => {
    if (!selectedFolder) {
      toast.error("Selecione uma pasta");
      return;
    }

    setLoading(true);
    try {
      // Check if already favorited
      const { data: existing } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user?.id)
        .eq("property_id", propertyId)
        .single();

      if (existing) {
        // Update existing favorite
        const { error } = await supabase
          .from("favorites")
          .update({ folder_id: selectedFolder })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        // Create new favorite
        const { error } = await supabase
          .from("favorites")
          .insert({
            user_id: user?.id,
            property_id: propertyId,
            folder_id: selectedFolder,
          });

        if (error) throw error;
      }

      toast.success("Imóvel adicionado à pasta!");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error("Erro ao salvar favorito");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar aos Favoritos</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!showNewFolder && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowNewFolder(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Pasta
            </Button>
          )}

          {showNewFolder && (
            <div className="space-y-2 p-4 border rounded-lg">
              <Label>Nome da Nova Pasta</Label>
              <div className="flex gap-2">
                <Input
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Ex: Apartamentos SP"
                  onKeyPress={(e) => e.key === "Enter" && handleCreateFolder()}
                />
                <Button onClick={handleCreateFolder} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar"}
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowNewFolder(false);
                  setNewFolderName("");
                }}
              >
                Cancelar
              </Button>
            </div>
          )}

          {folders.length > 0 && (
            <div className="space-y-2">
              <Label>Escolha uma pasta:</Label>
              <RadioGroup value={selectedFolder} onValueChange={setSelectedFolder}>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {folders.map((folder) => (
                    <div
                      key={folder.id}
                      className="flex items-center space-x-2 p-2 rounded hover:bg-accent"
                    >
                      <RadioGroupItem value={folder.id} id={folder.id} />
                      <Label
                        htmlFor={folder.id}
                        className="flex items-center gap-2 cursor-pointer flex-1"
                      >
                        <Folder className="h-4 w-4" />
                        {folder.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          )}

          {folders.length === 0 && !showNewFolder && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Você ainda não tem pastas. Crie uma para organizar seus favoritos!
            </p>
          )}

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button
              onClick={handleSaveFavorite}
              disabled={!selectedFolder || loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
