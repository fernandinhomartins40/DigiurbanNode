
import { FC } from "react";

const stats = [
  { 
    number: "50+", 
    label: "Cidades Atendidas",
    gradient: "from-blue-400 to-cyan-400",
    bgGradient: "from-blue-500/20 to-cyan-500/20",
    glowColor: "blue-400/30"
  },
  { 
    number: "1M+", 
    label: "Cidadãos Beneficiados",
    gradient: "from-green-400 to-emerald-400", 
    bgGradient: "from-green-500/20 to-emerald-500/20",
    glowColor: "green-400/30"
  },
  { 
    number: "98%", 
    label: "Satisfação",
    gradient: "from-yellow-400 to-orange-400",
    bgGradient: "from-yellow-500/20 to-orange-500/20", 
    glowColor: "yellow-400/30"
  },
  { 
    number: "24/7", 
    label: "Suporte Disponível",
    gradient: "from-purple-400 to-pink-400",
    bgGradient: "from-purple-500/20 to-pink-500/20",
    glowColor: "purple-400/30"
  }
];

export const StatsSection: FC = () => {
  return (
    <section className="py-24 gradient-primary relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-1/4 w-40 h-40 gradient-accent rounded-full opacity-10 animate-float"></div>
        <div className="absolute bottom-20 right-1/4 w-32 h-32 gradient-secondary rounded-full opacity-10 animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 right-10 w-24 h-24 gradient-warm rounded-full opacity-10 animate-float" style={{animationDelay: '3s'}}></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20 animate-slide-up">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
            Resultados que <span className="bg-gradient-to-r from-yellow-200 via-pink-200 to-cyan-200 bg-clip-text text-transparent drop-shadow-lg">Transformam</span>
          </h2>
          <p className="text-xl text-white/95 max-w-4xl mx-auto leading-relaxed drop-shadow-md">
            Números que comprovam a eficácia do Digiurban na modernização municipal e satisfação dos cidadãos
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="text-center group animate-fade-in-delay"
              style={{animationDelay: `${index * 0.2}s`}}
            >
              <div className="relative">
                {/* Colorful glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-all duration-500`}></div>
                
                <div className="relative bg-white/15 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/30 hover-lift group-hover:bg-white/20 transition-all duration-500 min-h-[180px] flex flex-col justify-center">
                  {/* Number with gradient */}
                  <div className={`text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    {stat.number}
                  </div>
                  
                  {/* Label */}
                  <div className="text-white/90 text-sm sm:text-base lg:text-lg font-medium uppercase tracking-wider leading-tight">
                    {stat.label}
                  </div>
                  
                  {/* Bottom accent line */}
                  <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r ${stat.gradient} rounded-full opacity-60 group-hover:opacity-100 group-hover:w-24 transition-all duration-500`}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
