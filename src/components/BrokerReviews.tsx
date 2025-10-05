import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, "Comentário deve ter pelo menos 10 caracteres").max(1000, "Comentário muito longo"),
});

interface BrokerReview {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles: {
    full_name: string | null;
  };
}

interface BrokerReviewsProps {
  brokerId: string;
}

export function BrokerReviews({ brokerId }: BrokerReviewsProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<BrokerReview[]>([]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [brokerId]);

  const loadReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("broker_reviews")
        .select(`
          id,
          rating,
          comment,
          created_at,
          profiles!broker_reviews_user_id_fkey (
            full_name
          )
        `)
        .eq("broker_id", brokerId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error("Error loading broker reviews:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Você precisa estar logado para avaliar");
      return;
    }

    const validation = reviewSchema.safeParse({ rating, comment });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("broker_reviews")
        .insert({
          broker_id: brokerId,
          user_id: user.id,
          rating,
          comment: comment.trim(),
        });

      if (error) throw error;

      toast.success("Avaliação enviada com sucesso!");
      setRating(0);
      setComment("");
      setShowForm(false);
      loadReviews();
    } catch (error: any) {
      toast.error(error.message || "Erro ao enviar avaliação");
    } finally {
      setLoading(false);
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Avaliações do Corretor</h2>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${
                  star <= Math.round(averageRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-lg font-semibold">
            {averageRating.toFixed(1)}
          </span>
          <span className="text-sm text-muted-foreground">
            ({reviews.length} {reviews.length === 1 ? "avaliação" : "avaliações"})
          </span>
        </div>

        {!showForm && user && (
          <Button onClick={() => setShowForm(true)} variant="outline" className="mb-4">
            Escrever uma avaliação
          </Button>
        )}

        {showForm && user && (
          <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 border rounded-lg">
            <div className="space-y-2">
              <Label>Sua avaliação</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        star <= (hoverRating || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="broker-comment">Comentário</Label>
              <Textarea
                id="broker-comment"
                placeholder="Compartilhe sua experiência com este corretor..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={loading || rating === 0}>
                {loading ? "Enviando..." : "Enviar Avaliação"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setRating(0);
                  setComment("");
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </div>

      <Separator />

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Ainda não há avaliações para este corretor.
          </p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b pb-4 last:border-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-semibold">
                    {review.profiles?.full_name || "Usuário"}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(review.created_at), "PPP", { locale: ptBR })}
                </span>
              </div>
              <p className="text-muted-foreground">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
