
import { FC } from "react";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Phone, Mail } from "lucide-react";

export const CTASection: FC = () => {
  return (
    <section className="py-24 gradient-primary relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-48 h-48 gradient-accent rounded-full opacity-10 animate-float"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 gradient-secondary rounded-full opacity-10 animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 gradient-warm rounded-full opacity-5 animate-float" style={{animationDelay: '3s'}}></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-slide-up">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight drop-shadow-lg">
            Pronto para <span className="bg-gradient-to-r from-yellow-200 via-pink-200 to-cyan-200 bg-clip-text text-transparent drop-shadow-lg">transformar</span> sua cidade?
          </h2>
          <p className="text-xl text-white/95 mb-12 max-w-4xl mx-auto leading-relaxed drop-shadow-md">
            Junte-se a centenas de municípios que já modernizaram sua gestão com Digiurban.
            Nossa equipe está pronta para ajudar você a dar o próximo passo na transformação digital.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 animate-fade-in-delay">
            <Button size="lg" variant="secondary" asChild className="hover-lift glow-primary text-lg px-8 py-4 bg-white text-purple-600 hover:bg-white/90 shadow-glow">
              <a href="mailto:contato@digiurbis.com">
                Solicitar Demonstração
                <ArrowRight className="ml-2 h-6 w-6" />
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild className="hover-lift text-lg px-8 py-4 border-white/50 text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all">
              <a href="tel:(11)99999999">Falar com Consultor</a>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto animate-fade-in-delay" id="contact">
          <div className="flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover-lift">
            <Phone className="h-6 w-6 mr-3 text-white/90" />
            <span className="text-white/90 text-lg font-medium">(11) 9999-9999</span>
          </div>
          <div className="flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover-lift">
            <Mail className="h-6 w-6 mr-3 text-white/90" />
            <span className="text-white/90 text-lg font-medium">contato@digiurbis.com</span>
          </div>
        </div>
      </div>
    </section>
  );
};
