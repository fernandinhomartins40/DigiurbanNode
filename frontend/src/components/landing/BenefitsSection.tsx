
import { FC } from "react";
import { Clock, Users, Shield, BarChart, Smartphone, Globe } from "lucide-react";

const benefits = [
  {
    icon: Clock,
    title: "Eficiência Operacional",
    description: "Automatize processos e reduza o tempo de resposta aos cidadãos em até 70%."
  },
  {
    icon: Users,
    title: "Atendimento Centralizado",
    description: "Portal único para todos os serviços municipais, facilitando o acesso dos cidadãos."
  },
  {
    icon: Shield,
    title: "Segurança e Transparência",
    description: "Dados protegidos e processos transparentes com auditoria completa."
  },
  {
    icon: BarChart,
    title: "Gestão Baseada em Dados",
    description: "Relatórios e indicadores em tempo real para tomada de decisões estratégicas."
  },
  {
    icon: Smartphone,
    title: "Acesso Mobile",
    description: "Interface responsiva que funciona perfeitamente em qualquer dispositivo."
  },
  {
    icon: Globe,
    title: "Integração Total",
    description: "Conecte todos os departamentos e sistemas existentes em uma única plataforma."
  }
];

export const BenefitsSection: FC = () => {
  return (
    <section id="benefits" className="py-24 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-20 right-10 w-32 h-32 gradient-cool rounded-full opacity-10 animate-float"></div>
      <div className="absolute bottom-20 left-10 w-24 h-24 gradient-warm rounded-full opacity-10 animate-float" style={{animationDelay: '3s'}}></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20 animate-slide-up">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Por que escolher <span className="text-gradient">Digiurban</span>?
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Transforme sua administração municipal com tecnologia moderna e processos otimizados 
            que colocam o cidadão no centro de tudo
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group p-8 bg-white/80 backdrop-blur-sm rounded-2xl hover-lift shadow-card hover:shadow-glow transition-all duration-500 border border-white/50"
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mb-6 group-hover:animate-glow transition-all duration-300">
                <benefit.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors duration-300">
                {benefit.title}
              </h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                {benefit.description}
              </p>
              <div className="mt-6 w-full h-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
