import React, { useState } from 'react';
import { Check, Star, ArrowRight, Building2, Users, HardDrive, Phone, Mail, Headphones } from 'lucide-react';

interface PricingPlan {
  name: string;
  price: number;
  yearlyPrice: number;
  description: string;
  popular?: boolean;
  maxHabitants: string;
  features: string[];
  limits: {
    secretarias: string;
    usuarios: string;
    protocolos: string;
    storage: string;
    support: string;
  };
  addons?: {
    name: string;
    price: number;
    description: string;
  }[];
}

const plans: PricingPlan[] = [
  {
    name: 'Starter',
    price: 1997,
    yearlyPrice: 1697, // 15% desconto
    description: 'Ideal para municípios pequenos que estão começando a digitalização',
    maxHabitants: 'Até 10.000',
    features: [
      'Gabinete do Prefeito',
      'Secretaria de Saúde',
      'Secretaria de Educação',
      'Sistema de Protocolos',
      'Relatórios Básicos',
      'Portal do Cidadão',
      'Notificações por Email',
      'Backup Automatizado',
      'Implementação Básica Inclusa'
    ],
    limits: {
      secretarias: '3 secretarias ativas',
      usuarios: '10 usuários',
      protocolos: '1.000 protocolos/mês',
      storage: '5GB storage',
      support: 'Suporte por email'
    }
  },
  {
    name: 'Professional',
    price: 3997,
    yearlyPrice: 3397, // 15% desconto
    description: 'Solução completa para a maioria dos municípios brasileiros',
    popular: true,
    maxHabitants: 'Até 50.000',
    features: [
      'Todas as 13 Secretarias',
      'Sistema Completo de Protocolos',
      'BI e Analytics Avançado',
      'Portal da Transparência',
      'App Mobile para Cidadãos',
      'Integrações Governamentais',
      'Workflows Personalizados',
      'Auditoria Completa',
      'Treinamento Incluso',
      'Implementação Completa',
      'Customizações Básicas'
    ],
    limits: {
      secretarias: 'Todas as secretarias',
      usuarios: 'Usuários ilimitados',
      protocolos: 'Protocolos ilimitados',
      storage: '50GB storage',
      support: 'Suporte telefônico'
    },
    addons: [
      {
        name: 'Portal da Transparência Avançado',
        price: 497,
        description: 'Portal completo com dados em tempo real'
      },
      {
        name: 'BI Avançado',
        price: 797,
        description: 'Dashboards executivos e relatórios customizados'
      }
    ]
  },
  {
    name: 'Enterprise',
    price: 7997,
    yearlyPrice: 6797, // 15% desconto
    description: 'Solução premium para grandes municípios e demandas especiais',
    maxHabitants: '50.000+',
    features: [
      'Todas as funcionalidades Professional',
      'Funcionalidades Customizadas',
      'Integrações Personalizadas',
      'Gestor de Conta Dedicado',
      'SLA 99.9% Garantido',
      'Suporte 24/7',
      'Consultoria Estratégica',
      'Desenvolvimento sob Demanda',
      'Storage Ilimitado',
      'Backup em Tempo Real',
      'Ambiente de Homologação',
      'Treinamento Presencial'
    ],
    limits: {
      secretarias: 'Todas + customizadas',
      usuarios: 'Ilimitado',
      protocolos: 'Ilimitado',
      storage: 'Storage ilimitado',
      support: 'Suporte 24/7 + Gestor dedicado'
    },
    addons: [
      {
        name: 'Módulo Personalizado',
        price: 2997,
        description: 'Desenvolvimento de módulo específico'
      },
      {
        name: 'Integração Personalizada',
        price: 1497,
        description: 'Integração com sistema existente'
      }
    ]
  }
];

const PricingPlans: React.FC = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSelectPlan = (planName: string) => {
    setSelectedPlan(planName);
    // Aqui você pode implementar a lógica de redirecionamento para checkout
    console.log(`Plano selecionado: ${planName}`);
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Planos que se Adaptam ao Seu Município
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Escolha o plano ideal baseado no tamanho da sua população e necessidades específicas
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-8">
            <span className={`mr-3 ${billingPeriod === 'monthly' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              Mensal
            </span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingPeriod === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`ml-3 ${billingPeriod === 'yearly' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              Anual
            </span>
            {billingPeriod === 'yearly' && (
              <span className="ml-2 bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                Economize 15%
              </span>
            )}
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl shadow-xl overflow-hidden ${
                plan.popular
                  ? 'border-2 border-blue-500 transform scale-105'
                  : 'border border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-blue-500 text-white text-center py-2 text-sm font-semibold">
                  <Star className="inline-block h-4 w-4 mr-1" />
                  Mais Popular
                </div>
              )}

              <div className={`p-8 ${plan.popular ? 'pt-16' : ''}`}>
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  
                  <div className="flex items-center justify-center mb-2">
                    <Building2 className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-700">{plan.maxHabitants} habitantes</span>
                  </div>

                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">
                      R$ {(billingPeriod === 'yearly' ? plan.yearlyPrice : plan.price).toLocaleString('pt-BR')}
                    </span>
                    <span className="text-gray-600">/mês</span>
                    {billingPeriod === 'yearly' && (
                      <div className="text-sm text-green-600 font-medium">
                        Economize R$ {((plan.price - plan.yearlyPrice) * 12).toLocaleString('pt-BR')}/ano
                      </div>
                    )}
                  </div>
                </div>

                {/* Plan Limits */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Incluído no plano:</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      {plan.limits.usuarios}
                    </div>
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 mr-2" />
                      {plan.limits.secretarias}
                    </div>
                    <div className="flex items-center">
                      <HardDrive className="h-4 w-4 mr-2" />
                      {plan.limits.storage}
                    </div>
                    <div className="flex items-center">
                      {plan.limits.support.includes('24/7') ? (
                        <Headphones className="h-4 w-4 mr-2" />
                      ) : plan.limits.support.includes('telefônico') ? (
                        <Phone className="h-4 w-4 mr-2" />
                      ) : (
                        <Mail className="h-4 w-4 mr-2" />
                      )}
                      {plan.limits.support}
                    </div>
                  </div>
                </div>

                {/* Features List */}
                <div className="mb-8">
                  <h4 className="font-semibold text-gray-900 mb-4">Funcionalidades:</h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Add-ons */}
                {plan.addons && (
                  <div className="mb-8">
                    <h4 className="font-semibold text-gray-900 mb-4">Add-ons Disponíveis:</h4>
                    <div className="space-y-3">
                      {plan.addons.map((addon, addonIndex) => (
                        <div key={addonIndex} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-gray-900">{addon.name}</span>
                            <span className="text-blue-600 font-semibold">+R$ {addon.price}</span>
                          </div>
                          <p className="text-sm text-gray-600">{addon.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA Button */}
                <button
                  onClick={() => handleSelectPlan(plan.name)}
                  className={`w-full py-3 px-6 rounded-lg font-semibold flex items-center justify-center transition-all ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Começar Agora
                  <ArrowRight className="h-5 w-5 ml-2" />
                </button>

                {/* Trial Notice */}
                <p className="text-center text-sm text-gray-500 mt-4">
                  30 dias de trial gratuito • Sem fidelidade • Suporte em português
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Services */}
        <div className="mt-16 bg-gray-100 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Serviços Profissionais Opcionais
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <h4 className="font-semibold text-gray-900 mb-2">Setup Expresso</h4>
              <p className="text-2xl font-bold text-blue-600 mb-2">R$ 5.000</p>
              <p className="text-sm text-gray-600">Implementação completa em 7 dias</p>
            </div>
            
            <div className="text-center">
              <h4 className="font-semibold text-gray-900 mb-2">Migração de Dados</h4>
              <p className="text-2xl font-bold text-blue-600 mb-2">R$ 2.000 - 10.000</p>
              <p className="text-sm text-gray-600">Importação dos seus dados existentes</p>
            </div>
            
            <div className="text-center">
              <h4 className="font-semibold text-gray-900 mb-2">Treinamento Presencial</h4>
              <p className="text-2xl font-bold text-blue-600 mb-2">R$ 3.000/dia</p>
              <p className="text-sm text-gray-600">Capacitação da sua equipe no local</p>
            </div>
            
            <div className="text-center">
              <h4 className="font-semibold text-gray-900 mb-2">Consultoria Estratégica</h4>
              <p className="text-2xl font-bold text-blue-600 mb-2">R$ 500/hora</p>
              <p className="text-sm text-gray-600">Otimização de processos municipais</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Perguntas Frequentes
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Posso mudar de plano a qualquer momento?</h4>
              <p className="text-gray-600">Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento sem multas.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">O que acontece se ultrapassar os limites?</h4>
              <p className="text-gray-600">Oferecemos alertas proativos e sugestões de upgrade quando você se aproxima dos limites.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Como funciona o trial gratuito?</h4>
              <p className="text-gray-600">30 dias com acesso completo ao plano escolhido. Sem cobrança no cartão até o final do período.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Vocês oferecem desconto para consórcios?</h4>
              <p className="text-gray-600">Sim, temos preços especiais para consórcios municipais. Entre em contato para uma proposta personalizada.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPlans;