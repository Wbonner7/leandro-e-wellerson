import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Loader2 } from "lucide-react";

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    nickname: "",
    email: "",
    income: "",
    cpf: "",
    income_last_updated: null as string | null,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) throw error;

      setProfile({
        full_name: data.full_name || "",
        nickname: data.nickname || "",
        email: user?.email || "",
        income: data.income || "",
        cpf: data.cpf || "",
        income_last_updated: data.income_last_updated,
      });
    } catch (error: any) {
      toast.error("Erro ao carregar perfil");
    }
  };

  const getInitials = () => {
    if (profile.nickname) return profile.nickname.substring(0, 2).toUpperCase();
    if (profile.full_name) {
      const names = profile.full_name.split(" ");
      if (names.length >= 2) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
      }
      return profile.full_name.substring(0, 2).toUpperCase();
    }
    return "??";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData: any = {
        full_name: profile.full_name,
        nickname: profile.nickname,
      };

      // Only include income if it's different from current
      if (profile.income && profile.income !== "") {
        updateData.income = parseFloat(profile.income);
      }

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user?.id);

      if (error) {
        if (error.message.includes("3 meses")) {
          throw new Error(error.message);
        }
        throw error;
      }

      toast.success("Perfil atualizado com sucesso!");
      fetchProfile();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.full_name} />
                <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">Meu Perfil</CardTitle>
                <p className="text-muted-foreground">{profile.email}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="full_name">Nome Completo</Label>
                <Input
                  id="full_name"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="nickname">Apelido / Nome de Exibição</Label>
                <Input
                  id="nickname"
                  value={profile.nickname}
                  onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
                  placeholder="Como você quer ser chamado?"
                />
              </div>

              <div>
                <Label htmlFor="cpf">CPF/CNPJ</Label>
                <Input
                  id="cpf"
                  value={profile.cpf}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  CPF/CNPJ não pode ser alterado
                </p>
              </div>

              <div>
                <Label htmlFor="income">Renda Mensal (R$)</Label>
                <Input
                  id="income"
                  type="number"
                  step="0.01"
                  value={profile.income}
                  onChange={(e) => setProfile({ ...profile, income: e.target.value })}
                  placeholder="0.00"
                />
                {profile.income_last_updated && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Última atualização: {new Date(profile.income_last_updated).toLocaleDateString("pt-BR")}
                    {" - Próxima atualização disponível em: "}
                    {new Date(
                      new Date(profile.income_last_updated).getTime() + 90 * 24 * 60 * 60 * 1000
                    ).toLocaleDateString("pt-BR")}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Você pode atualizar sua renda a cada 3 meses
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
