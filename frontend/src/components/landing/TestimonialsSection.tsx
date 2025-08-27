
import { FC } from "react";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Maria Silva",
    role: "Prefeita de Cidade Nova",
    content: "O Digiurban revolucionou nossa gestão. Agora conseguimos atender os cidadãos com muito mais eficiência e transparência.",
    rating: 5
  },
  {
    name: "João Santos",
    role: "Secretário de Saúde",
    content: "A organização dos agendamentos médicos melhorou drasticamente. Os cidadãos estão muito mais satisfeitos com o atendimento.",
    rating: 5
  },
  {
    name: "Ana Costa",
    role: "Coordenadora de TI",
    content: "A implementação foi surpreendentemente rápida e o suporte técnico é excepcional. Recomendo para qualquer município.",
    rating: 5
  }
];

export const TestimonialsSection: FC = () => {
  return (
    <section id="testimonials" className="py-24 bg-gradient-to-br from-purple-50 to-pink-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 right-20 w-28 h-28 gradient-accent rounded-full opacity-10 animate-float"></div>
      <div className="absolute bottom-20 left-20 w-36 h-36 gradient-cool rounded-full opacity-10 animate-float" style={{animationDelay: '2s'}}></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20 animate-slide-up">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            O que nossos <span className="text-gradient">clientes dizem</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Depoimentos reais de gestores públicos que já transformaram suas cidades com Digiurban 
            e vivem a experiência da modernização municipal
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl hover-lift shadow-card hover:shadow-glow transition-all duration-500 border border-white/50 relative overflow-hidden"
              style={{animationDelay: `${index * 0.1}s`}}
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
              
              <div className="relative">
                <div className="flex items-center mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-yellow-400 fill-current mr-1 group-hover:animate-glow" />
                  ))}
                </div>
                <blockquote className="text-gray-700 mb-8 leading-relaxed text-lg italic relative">
                  <span className="text-6xl text-purple-200 absolute -top-4 -left-2 leading-none">"</span>
                  <span className="relative">{testimonial.content}</span>
                </blockquote>
                <div className="flex items-center">
                  <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center mr-4 group-hover:animate-glow">
                    <span className="text-white font-bold text-lg">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-lg group-hover:text-purple-600 transition-colors duration-300">
                      {testimonial.name}
                    </div>
                    <div className="text-gray-600 font-medium">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Animated border */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-pink-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
