
import { FC } from "react";
import { Heart, Book, HandHeart, Building, Shield, Leaf, Trophy, Compass, Home, Construction } from "lucide-react";

const modules = [
  {
    icon: Heart,
    title: "Saúde",
    description: "Agendamentos, controle de medicamentos, campanhas e programas de saúde.",
    color: "bg-red-100 text-red-600"
  },
  {
    icon: Book,
    title: "Educação",
    description: "Matrículas, gestão escolar, transporte e merenda escolar.",
    color: "bg-blue-100 text-blue-600"
  },
  {
    icon: HandHeart,
    title: "Assistência Social",
    description: "CRAS, CREAS, programas sociais e benefícios assistenciais.",
    color: "bg-purple-100 text-purple-600"
  },
  {
    icon: Building,
    title: "Planejamento Urbano",
    description: "Aprovação de projetos, alvarás e consultas públicas.",
    color: "bg-gray-100 text-gray-600"
  },
  {
    icon: Shield,
    title: "Segurança Pública",
    description: "Ocorrências, apoio da guarda e vigilância integrada.",
    color: "bg-green-100 text-green-600"
  },
  {
    icon: Leaf,
    title: "Meio Ambiente",
    description: "Licenças ambientais, denúncias e áreas protegidas.",
    color: "bg-emerald-100 text-emerald-600"
  },
  {
    icon: Trophy,
    title: "Esportes",
    description: "Equipes, competições, atletas e infraestrutura esportiva.",
    color: "bg-orange-100 text-orange-600"
  },
  {
    icon: Compass,
    title: "Turismo",
    description: "Pontos turísticos, estabelecimentos e programas turísticos.",
    color: "bg-cyan-100 text-cyan-600"
  },
  {
    icon: Home,
    title: "Habitação",
    description: "Programas habitacionais e regularização fundiária.",
    color: "bg-indigo-100 text-indigo-600"
  },
  {
    icon: Construction,
    title: "Obras Públicas",
    description: "Gestão de obras, progresso e mapa de intervenções.",
    color: "bg-yellow-100 text-yellow-600"
  }
];

export const ModulesGrid: FC = () => {
  return (
    <section id="modules" className="py-24 bg-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-10 left-1/4 w-20 h-20 gradient-accent rounded-full opacity-5 animate-float"></div>
        <div className="absolute bottom-20 right-1/4 w-16 h-16 gradient-secondary rounded-full opacity-5 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-10 w-12 h-12 gradient-warm rounded-full opacity-5 animate-float" style={{animationDelay: '4s'}}></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20 animate-slide-up">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Módulos <span className="text-gradient">Especializados</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Cada área da administração municipal tem suas especificidades. 
            O Digiurban oferece módulos dedicados para atender todas as demandas com eficiência.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {modules.map((module, index) => (
            <div
              key={index}
              className="group bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-card hover:shadow-glow hover-lift transition-all duration-500 border border-gray-100/50 relative overflow-hidden"
              style={{animationDelay: `${index * 0.05}s`}}
            >
              {/* Hover gradient background */}
              <div className="absolute inset-0 gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
              
              <div className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 ${module.color}`}>
                <module.icon className="h-7 w-7 sm:h-8 sm:w-8" />
              </div>
              <h3 className="relative text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-purple-600 transition-colors duration-300">
                {module.title}
              </h3>
              <p className="relative text-sm sm:text-base text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                {module.description}
              </p>
              
              {/* Animated border */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
