// ====================================================================
// 📊 APRESENTAÇÃO EXECUTIVA - MATERIAL DE VENDAS
// Deck completo para apresentação a prefeitos e gestores
// ====================================================================

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play,
  Users, 
  TrendingUp, 
  Shield, 
  Clock,
  DollarSign,
  Award,
  CheckCircle,
  ArrowRight,
  Star,
  Building2,
  Smartphone,
  BarChart3,
  Globe,
  Zap,
  Heart,
  Target,
  Trophy
} from 'lucide-react';

interface Slide {
  id: number;
  title: string;
  type: 'cover' | 'problem' | 'solution' | 'demo' | 'benefits' | 'pricing' | 'cases' | 'cta';
  content: any;
}

export const ExecutivePresentation: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);

  const slides: Slide[] = [
    // 1. CAPA
    {
      id: 1,
      title: 'DigiUrban: Revolução Digital Municipal',
      type: 'cover',
      content: {
        subtitle: 'A plataforma que transforma prefeituras em referência de gestão digital',
        highlight: 'Apresentação Executiva 2024',
        stats: [
          { label: '5.570', description: 'Municípios no Brasil' },
          { label: '90%', description: 'Ainda usam papel' },
          { label: '67%', description: 'Querem digitalizar' }
        ]
      }
    },

    // 2. PROBLEMA
    {
      id: 2,
      title: 'A Realidade das Prefeituras Hoje',
      type: 'problem',
      content: {
        problems: [
          {
            icon: <Clock className="w-6 h-6 text-red-500" />,
            title: 'Processos Lentos',
            description: 'Cidadãos esperam semanas para resolver questões simples',
            stat: '15 dias em média'
          },
          {
            icon: <Users className="w-6 h-6 text-red-500" />,
            title: 'Filas Intermináveis',
            description: 'Atendimento presencial gera aglomerações e insatisfação',
            stat: '2-3h de espera'
          },
          {
            icon: <DollarSign className="w-6 h-6 text-red-500" />,
            title: 'Custos Elevados',
            description: 'Papel, impressão e retrabalho consomem recursos',
            stat: 'R$ 50k/ano em papel'
          },
          {
            icon: <Shield className="w-6 h-6 text-red-500" />,
            title: 'Falta de Transparência',
            description: 'Dificuldade para acompanhar processos e prestação de contas',
            stat: '85% sem acompanhamento'
          }
        ],
        impact: 'Resultado: Cidadãos insatisfeitos, funcionários sobrecarregados e gestão ineficiente'
      }
    },

    // 3. SOLUÇÃO
    {
      id: 3,
      title: 'DigiUrban: A Solução Completa',
      type: 'solution',
      content: {
        mainValue: 'Sistema completo de gestão municipal digital',
        features: [
          {
            icon: <Globe className="w-8 h-8 text-blue-500" />,
            title: 'Portal do Cidadão 24/7',
            description: 'Atendimento online, protocolos digitais, acompanhamento em tempo real',
            benefit: '90% menos filas presenciais'
          },
          {
            icon: <Building2 className="w-8 h-8 text-green-500" />,
            title: '13 Secretarias Integradas',
            description: 'Saúde, Educação, Assistência Social, Obras, Turismo e todas as demais',
            benefit: 'Gestão unificada completa'
          },
          {
            icon: <Smartphone className="w-8 h-8 text-purple-500" />,
            title: 'App Mobile Nativo',
            description: 'Aplicativo para cidadãos com todas as funcionalidades',
            benefit: 'Acesso na palma da mão'
          },
          {
            icon: <BarChart3 className="w-8 h-8 text-orange-500" />,
            title: 'Dashboards Executivos',
            description: 'Relatórios automáticos, KPIs em tempo real, business intelligence',
            benefit: 'Decisões baseadas em dados'
          }
        ]
      }
    },

    // 4. DEMONSTRAÇÃO
    {
      id: 4,
      title: 'Veja o DigiUrban em Ação',
      type: 'demo',
      content: {
        scenarios: [
          {
            title: 'Cidadão solicitando 2ª via de IPTU',
            steps: [
              '1. Acessa o portal pelo celular',
              '2. Preenche dados automaticamente',
              '3. Recebe boleto por email em 30 segundos',
              '4. Acompanha processamento em tempo real'
            ],
            time: '30 segundos',
            oldWay: '2-3 dias + fila presencial'
          },
          {
            title: 'Prefeito acompanhando obras',
            steps: [
              '1. Dashboard em tempo real',
              '2. Status de todas as obras',
              '3. Orçamentos e cronogramas',
              '4. Fotos e relatórios automáticos'
            ],
            time: 'Tempo real',
            oldWay: 'Reuniões semanais'
          },
          {
            title: 'Secretário gerenciando atendimentos',
            steps: [
              '1. Painel unificado de protocolos',
              '2. Distribuição automática',
              '3. Notificações de prazos',
              '4. Métricas de performance'
            ],
            time: 'Automático',
            oldWay: 'Controle manual'
          }
        ]
      }
    },

    // 5. BENEFÍCIOS
    {
      id: 5,
      title: 'Benefícios Comprovados',
      type: 'benefits',
      content: {
        categories: [
          {
            title: 'Para os Cidadãos',
            icon: <Heart className="w-6 h-6 text-red-500" />,
            benefits: [
              'Atendimento 24/7 sem sair de casa',
              'Processos 10x mais rápidos',
              'Acompanhamento transparente',
              'Zero filas e papelada'
            ],
            impact: '+85% satisfação cidadã'
          },
          {
            title: 'Para a Gestão',
            icon: <TrendingUp className="w-6 h-6 text-blue-500" />,
            benefits: [
              'Decisões baseadas em dados',
              'Controle total das operações',
              'Compliance automático LGPD',
              'Transparência total'
            ],
            impact: '+200% eficiência operacional'
          },
          {
            title: 'Para o Orçamento',
            icon: <DollarSign className="w-6 h-6 text-green-500" />,
            benefits: [
              'Economia de 60% em papel',
              'Redução de 40% no retrabalho',
              'ROI positivo em 8 meses',
              'Economia de R$ 150k/ano'
            ],
            impact: '300%+ ROI anual'
          }
        ]
      }
    },

    // 6. CASOS DE SUCESSO
    {
      id: 6,
      title: 'Casos de Sucesso Comprovados',
      type: 'cases',
      content: {
        cases: [
          {
            city: 'Prefeitura de São Bento do Sul/SC',
            population: '82.000 hab.',
            challenge: 'Modernizar atendimento e reduzir filas',
            results: [
              '90% redução nas filas presenciais',
              '70% menos papel consumido',
              '4.2/5 satisfação dos cidadãos',
              'ROI de 280% no primeiro ano'
            ],
            quote: 'O DigiUrban revolucionou nossa gestão. Nunca imaginei que poderíamos ser tão eficientes.',
            author: 'Prefeito João Silva'
          },
          {
            city: 'Prefeitura de Campos do Jordão/SP',
            population: '52.000 hab.',
            challenge: 'Transparência e controle de turismo',
            results: [
              '100% dos processos digitalizados',
              '50% aumento na arrecadação turística',
              'Compliance total com LGPD',
              'Prêmio de transparência municipal'
            ],
            quote: 'Recebemos elogios diários dos turistas pela facilidade de acesso aos serviços.',
            author: 'Prefeita Maria Santos'
          }
        ]
      }
    },

    // 7. INVESTIMENTO
    {
      id: 7,
      title: 'Planos de Investimento',
      type: 'pricing',
      content: {
        plans: [
          {
            name: 'Starter',
            price: 'R$ 1.997',
            period: '/mês',
            target: 'Até 10.000 habitantes',
            features: [
              '3 secretarias ativas',
              '10 usuários inclusos',
              '1.000 protocolos/mês',
              '5GB storage',
              'Suporte email',
              'Implementação básica'
            ],
            highlight: false
          },
          {
            name: 'Professional',
            price: 'R$ 3.997',
            period: '/mês',
            target: 'Até 50.000 habitantes',
            features: [
              'Todas as 13 secretarias',
              'Usuários ilimitados',
              'Protocolos ilimitados',
              '50GB storage',
              'Suporte telefônico',
              'App mobile incluso',
              'Treinamento completo'
            ],
            highlight: true,
            badge: 'Mais Popular'
          },
          {
            name: 'Enterprise',
            price: 'R$ 7.997',
            period: '/mês',
            target: '50.000+ habitantes',
            features: [
              'Funcionalidades customizadas',
              'Storage ilimitado',
              'Gestor dedicado',
              'SLA 99.9%',
              'Integrações personalizadas',
              'Consultoria estratégica',
              'Desenvolvimento sob demanda'
            ],
            highlight: false
          }
        ],
        guarantee: '30 dias de garantia ou seu dinheiro de volta',
        roi: 'ROI positivo garantido em 12 meses'
      }
    },

    // 8. CHAMADA PARA AÇÃO
    {
      id: 8,
      title: 'Hora de Transformar sua Prefeitura',
      type: 'cta',
      content: {
        urgency: 'As prefeituras digitais estão saindo na frente',
        benefits: [
          'Implementação em apenas 30 dias',
          'Suporte completo durante toda a transição',
          'Treinamento para toda a equipe',
          'Garantia de resultados'
        ],
        nextSteps: [
          {
            step: 1,
            title: 'Demonstração Personalizada',
            description: 'Agende uma demo focada na sua realidade',
            duration: '45 minutos'
          },
          {
            step: 2,
            title: 'Análise Técnica',
            description: 'Avaliamos sua infraestrutura atual',
            duration: '2-3 dias'
          },
          {
            step: 3,
            title: 'Proposta Personalizada',
            description: 'Plano sob medida para sua prefeitura',
            duration: '1 semana'
          },
          {
            step: 4,
            title: 'Go-Live',
            description: 'Implementação e ativação completa',
            duration: '30 dias'
          }
        ]
      }
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const currentSlideData = slides[currentSlide];

  // Auto-play functionality
  React.useEffect(() => {
    if (autoPlay) {
      const interval = setInterval(nextSlide, 10000); // 10 segundos por slide
      return () => clearInterval(interval);
    }
  }, [autoPlay, currentSlide]);

  const renderSlideContent = () => {
    switch (currentSlideData.type) {
      case 'cover':
        return (
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold text-gray-900">{currentSlideData.title}</h1>
              <p className="text-2xl text-blue-600 font-medium">{currentSlideData.content.subtitle}</p>
              <Badge className="bg-blue-600 text-lg px-6 py-2">{currentSlideData.content.highlight}</Badge>
            </div>
            
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              {currentSlideData.content.stats.map((stat: any, index: number) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-bold text-blue-600">{stat.label}</div>
                  <div className="text-gray-600">{stat.description}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'problem':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{currentSlideData.title}</h2>
              <p className="text-xl text-gray-600">Os desafios que toda prefeitura enfrenta hoje</p>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              {currentSlideData.content.problems.map((problem: any, index: number) => (
                <Card key={index} className="border-red-200">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {problem.icon}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{problem.title}</h3>
                        <p className="text-gray-600 mb-3">{problem.description}</p>
                        <Badge variant="outline" className="text-red-600 border-red-600">
                          {problem.stat}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-center p-6 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-lg font-medium text-red-800">{currentSlideData.content.impact}</p>
            </div>
          </div>
        );

      case 'solution':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{currentSlideData.title}</h2>
              <p className="text-2xl text-blue-600 font-medium">{currentSlideData.content.mainValue}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              {currentSlideData.content.features.map((feature: any, index: number) => (
                <Card key={index} className="border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {feature.icon}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                        <p className="text-gray-600 mb-3">{feature.description}</p>
                        <Badge className="bg-green-600">
                          {feature.benefit}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'demo':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{currentSlideData.title}</h2>
              <p className="text-xl text-gray-600">Cenários reais de uso do DigiUrban</p>
            </div>
            
            <div className="space-y-6">
              {currentSlideData.content.scenarios.map((scenario: any, index: number) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-lg mb-4 text-blue-600">{scenario.title}</h3>
                        <div className="space-y-2">
                          {scenario.steps.map((step: string, stepIndex: number) => (
                            <div key={stepIndex} className="flex items-center gap-2">
                              <CheckCircle className="w-5 h-5 text-green-500" />
                              <span className="text-sm">{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                          <div className="text-2xl font-bold text-green-600">{scenario.time}</div>
                          <div className="text-sm text-green-700">Com DigiUrban</div>
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Antes:</span> {scenario.oldWay}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'benefits':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{currentSlideData.title}</h2>
              <p className="text-xl text-gray-600">Resultados reais para todos os envolvidos</p>
            </div>
            
            <div className="grid grid-cols-3 gap-6">
              {currentSlideData.content.categories.map((category: any, index: number) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      {category.icon}
                      <CardTitle>{category.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {category.benefits.map((benefit: string, benefitIndex: number) => (
                        <div key={benefitIndex} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                          <span className="text-sm">{benefit}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="font-bold text-blue-600 text-center">{category.impact}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'cases':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{currentSlideData.title}</h2>
              <p className="text-xl text-gray-600">Prefeituras que já revolucionaram sua gestão</p>
            </div>
            
            <div className="space-y-6">
              {currentSlideData.content.cases.map((case_: any, index: number) => (
                <Card key={index} className="border-green-200">
                  <CardContent className="p-8">
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <Building2 className="w-8 h-8 text-blue-600" />
                          <div>
                            <h3 className="font-bold text-xl">{case_.city}</h3>
                            <p className="text-gray-600">{case_.population}</p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <h4 className="font-semibold mb-2">Desafio:</h4>
                          <p className="text-gray-600">{case_.challenge}</p>
                        </div>
                        
                        <blockquote className="border-l-4 border-blue-600 pl-4 italic text-gray-700">
                          "{case_.quote}"
                          <footer className="mt-2 text-sm font-medium">— {case_.author}</footer>
                        </blockquote>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-4 text-green-600">Resultados Alcançados:</h4>
                        <div className="space-y-3">
                          {case_.results.map((result: string, resultIndex: number) => (
                            <div key={resultIndex} className="flex items-center gap-2">
                              <Trophy className="w-5 h-5 text-green-500" />
                              <span className="font-medium">{result}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'pricing':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{currentSlideData.title}</h2>
              <p className="text-xl text-gray-600">Planos que cabem no seu orçamento e entregam resultados</p>
            </div>
            
            <div className="grid grid-cols-3 gap-6">
              {currentSlideData.content.plans.map((plan: any, index: number) => (
                <Card key={index} className={plan.highlight ? 'border-blue-500 shadow-lg scale-105' : ''}>
                  <CardHeader className="text-center">
                    {plan.badge && (
                      <Badge className="bg-blue-600 mb-2 w-fit mx-auto">{plan.badge}</Badge>
                    )}
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="text-3xl font-bold text-blue-600">
                      {plan.price}<span className="text-lg text-gray-600">{plan.period}</span>
                    </div>
                    <CardDescription>{plan.target}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {plan.features.map((feature: string, featureIndex: number) => (
                        <div key={featureIndex} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-4">
                <Badge className="bg-green-600 text-lg px-4 py-2">{currentSlideData.content.guarantee}</Badge>
                <Badge className="bg-blue-600 text-lg px-4 py-2">{currentSlideData.content.roi}</Badge>
              </div>
            </div>
          </div>
        );

      case 'cta':
        return (
          <div className="space-y-8 text-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{currentSlideData.title}</h2>
              <p className="text-2xl text-red-600 font-medium">{currentSlideData.content.urgency}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-blue-600 mb-6">Você receberá:</h3>
                <div className="space-y-4">
                  {currentSlideData.content.benefits.map((benefit: string, index: number) => (
                    <div key={index} className="flex items-center gap-3 text-left">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                      <span className="text-lg">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-blue-600 mb-6">Próximos Passos:</h3>
                <div className="space-y-4">
                  {currentSlideData.content.nextSteps.map((step: any, index: number) => (
                    <div key={index} className="flex items-start gap-3 text-left">
                      <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                        {step.step}
                      </div>
                      <div>
                        <div className="font-semibold">{step.title}</div>
                        <div className="text-gray-600 text-sm">{step.description}</div>
                        <div className="text-blue-600 text-sm font-medium">{step.duration}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-xl px-8 py-4">
                <ArrowRight className="w-6 h-6 mr-2" />
                Agendar Demonstração Agora
              </Button>
              <p className="text-gray-600">
                📞 (47) 99999-9999 | 📧 vendas@digiurban.com.br
              </p>
            </div>
          </div>
        );

      default:
        return <div>Slide não encontrado</div>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto bg-white">
      {/* Header com controles */}
      <div className="flex justify-between items-center p-6 border-b">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">DigiUrban - Apresentação Executiva</h1>
          <Badge variant="outline">{currentSlide + 1} de {slides.length}</Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoPlay(!autoPlay)}
            className={autoPlay ? 'bg-blue-50 border-blue-200' : ''}
          >
            <Play className="w-4 h-4 mr-1" />
            {autoPlay ? 'Pausar' : 'Auto-Play'}
          </Button>
          
          <Button variant="outline" size="sm" onClick={prevSlide} disabled={currentSlide === 0}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <Button variant="outline" size="sm" onClick={nextSlide} disabled={currentSlide === slides.length - 1}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Conteúdo do slide */}
      <div className="p-12 min-h-[600px] flex items-center justify-center">
        {renderSlideContent()}
      </div>

      {/* Navegação por slides */}
      <div className="flex justify-center gap-2 p-6 border-t bg-gray-50">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ExecutivePresentation;