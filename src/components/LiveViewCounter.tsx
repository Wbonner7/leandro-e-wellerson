import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

interface LiveViewCounterProps {
  propertyId: string;
}

export function LiveViewCounter({ propertyId }: LiveViewCounterProps) {
  const [liveViewers, setLiveViewers] = useState(0);

  useEffect(() => {
    // Algoritmo inteligente baseado em horário e dia da semana
    const calculateLiveViewers = () => {
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay(); // 0 = Domingo, 6 = Sábado

      let baseViewers = 0;

      // Horário comercial (8h-18h) tem mais visualizações
      if (hour >= 8 && hour <= 18) {
        baseViewers = Math.floor(Math.random() * 8) + 3; // 3-10 pessoas
      } else if (hour >= 19 && hour <= 22) {
        // Noite ainda tem movimento
        baseViewers = Math.floor(Math.random() * 5) + 2; // 2-6 pessoas
      } else {
        // Madrugada/manhã cedo tem menos
        baseViewers = Math.floor(Math.random() * 3) + 1; // 1-3 pessoas
      }

      // Sábado tem menos movimento
      if (day === 6) {
        baseViewers = Math.floor(baseViewers * 0.7);
      }
      // Domingo tem muito menos
      if (day === 0) {
        baseViewers = Math.floor(baseViewers * 0.4);
      }

      // Variação aleatória a cada atualização
      const variation = Math.floor(Math.random() * 3) - 1; // -1, 0, ou 1
      return Math.max(1, baseViewers + variation);
    };

    // Atualiza inicialmente
    setLiveViewers(calculateLiveViewers());

    // Atualiza a cada 5-15 segundos (simulando pessoas entrando/saindo)
    const updateInterval = setInterval(() => {
      setLiveViewers(calculateLiveViewers());
    }, Math.random() * 10000 + 5000); // 5-15 segundos

    return () => clearInterval(updateInterval);
  }, [propertyId]);

  return (
    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium animate-pulse">
      <Eye className="h-4 w-4" />
      <span>{liveViewers} {liveViewers === 1 ? "pessoa vendo" : "pessoas vendo"} agora</span>
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
      </span>
    </div>
  );
}
