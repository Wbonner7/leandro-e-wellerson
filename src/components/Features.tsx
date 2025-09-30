import { Shield, Award, HeadphonesIcon, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Segurança Garantida",
    description: "Todas as transações são verificadas e protegidas por tecnologia de ponta",
  },
  {
    icon: Award,
    title: "Imóveis Premium",
    description: "Curadoria exclusiva dos melhores imóveis em localizações privilegiadas",
  },
  {
    icon: HeadphonesIcon,
    title: "Suporte 24/7",
    description: "Equipe especializada pronta para atender você a qualquer momento",
  },
  {
    icon: TrendingUp,
    title: "Melhor Investimento",
    description: "Análise de mercado e consultoria gratuita para sua decisão",
  },
];

export const Features = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Por que Escolher a Gente?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Oferecemos a melhor experiência em transações imobiliárias do mercado
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-xl hover:shadow-card transition-all duration-300"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                <feature.icon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
