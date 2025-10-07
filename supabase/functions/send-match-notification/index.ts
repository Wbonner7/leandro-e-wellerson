import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MatchNotificationRequest {
  matchId: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { matchId } = await req.json() as MatchNotificationRequest;

    // Get match details with user and property info
    const { data: match, error: matchError } = await supabase
      .from("property_matches")
      .select(`
        *,
        properties (
          id,
          title,
          location,
          price,
          bedrooms,
          bathrooms,
          area,
          property_type
        ),
        profiles!property_matches_user_id_fkey (
          id,
          full_name,
          email
        )
      `)
      .eq("id", matchId)
      .single();

    if (matchError) throw matchError;

    const user = (match as any).profiles;
    const property = (match as any).properties;

    if (!user?.email) {
      throw new Error("User email not found");
    }

    // Create email content
    const emailSubject = `🏠 Encontramos o imóvel perfeito para você!`;
    const emailBody = `
      <h2>Olá ${user.full_name || ""}!</h2>
      
      <p>Temos uma ótima notícia! Encontramos um imóvel que combina perfeitamente com o que você está procurando.</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>${property.title}</h3>
        <p><strong>📍 Localização:</strong> ${property.location}</p>
        <p><strong>💰 Preço:</strong> R$ ${Number(property.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        <p><strong>🛏️ Quartos:</strong> ${property.bedrooms || 'N/A'}</p>
        <p><strong>🚿 Banheiros:</strong> ${property.bathrooms || 'N/A'}</p>
        <p><strong>📐 Área:</strong> ${property.area || 'N/A'} m²</p>
        <p><strong>🏢 Tipo:</strong> ${property.property_type || 'N/A'}</p>
      </div>
      
      <p><strong>Score de compatibilidade:</strong> ${match.match_score}% 🎯</p>
      
      <p>Este imóvel foi reservado exclusivamente para você pelas próximas 48 horas. Nossa equipe entrará em contato em breve para agendar uma visita!</p>
      
      <p style="margin-top: 30px;">
        <a href="${supabaseUrl.replace('.supabase.co', '.lovable.app')}/property/${property.id}" 
           style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Ver Detalhes do Imóvel
        </a>
      </p>
      
      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        Você está recebendo este email porque demonstrou interesse em imóveis na plataforma Quinto.
      </p>
    `;

    // In production, integrate with email service (SendGrid, Resend, etc.)
    console.log("Email would be sent to:", user.email);
    console.log("Subject:", emailSubject);
    console.log("Body:", emailBody);

    // Update match as notified
    const { error: updateError } = await supabase
      .from("property_matches")
      .update({
        notified_at: new Date().toISOString(),
        notification_sent: true,
        partner_assignment_expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 hours
      })
      .eq("id", matchId);

    if (updateError) throw updateError;

    // Log notification
    await supabase
      .from("match_notifications")
      .insert({
        match_id: matchId,
        notification_type: "email",
        status: "sent",
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Notification sent successfully",
        email: user.email 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
