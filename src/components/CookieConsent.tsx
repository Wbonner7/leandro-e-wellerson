import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";

export const CookieConsent = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setShow(false);
  };

  const handleReject = () => {
    localStorage.setItem("cookie-consent", "rejected");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom">
      <Card className="max-w-4xl mx-auto shadow-elegant">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">
                Usamos cookies para melhorar sua experiência
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Utilizamos cookies essenciais e de análise para garantir o funcionamento adequado 
                do site e melhorar sua experiência de navegação. Ao continuar, você concorda com 
                nossa política de privacidade.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleAccept} size="sm">
                  Aceitar todos
                </Button>
                <Button onClick={handleReject} variant="outline" size="sm">
                  Apenas essenciais
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open("/privacy", "_blank")}
                >
                  Saiba mais
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={handleReject}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
