// ====================================================================
// 💰 CALCULADORA DE ROI - MATERIAL DE VENDAS
// Ferramenta interativa para demonstrar o retorno do investimento
// ====================================================================

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Users, 
  FileText,
  CheckCircle,
  ArrowRight,
  Download,
  Share2,
  BarChart3,
  Target
} from 'lucide-react';

interface MunicipalData {
  populacao: number;
  funcionarios: number;
  protocolos_mes: number;
  secretarias: number;
  orcamento_anual_ti: number;
  custo_funcionario_hora: number;
  horas_trabalho_mes: number;
}

interface ROIResults {
  investimento_anual: number;
  economia_anual: number;
  roi_percentual: number;
  payback_meses: number;
  economia_5_anos: number;
  beneficios_quantitativos: {
    economia_papel: number;
    economia_tempo: number;
    reducao_retrabalho: number;
    melhoria_eficiencia: number;
  };
  beneficios_qualitativos: string[];
}

export const ROICalculator: React.FC = () => {
  const [municipalData, setMunicipalData] = useState<MunicipalData>({
    populacao: 50000,
    funcionarios: 150,
    protocolos_mes: 500,
    secretarias: 8,
    orcamento_anual_ti: 200000,
    custo_funcionario_hora: 35,
    horas_trabalho_mes: 160
  });

  const [results, setResults] = useState<ROIResults | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'>('PROFESSIONAL');
  const [showDetailedView, setShowDetailedView] = useState(false);

  // Preços dos planos
  const planPricing = {
    STARTER: { mensal: 1997, anual: 19970 * 0.85, limite_populacao: 10000 },
    PROFESSIONAL: { mensal: 3997, anual: 39970 * 0.85, limite_populacao: 50000 },
    ENTERPRISE: { mensal: 7997, anual: 79970 * 0.85, limite_populacao: 999999 }
  };

  // ====================================================================
  // CÁLCULO DE ROI
  // ====================================================================

  const calculateROI = () => {
    const plan = planPricing[selectedPlan];
    const investimentoAnual = plan.anual;

    // Economias calculadas
    const economiaPapel = municipalData.protocolos_mes * 12 * 0.75; // R$ 0.75 por protocolo em papel
    const economiaDeslocamento = municipalData.funcionarios * 4 * 12 * 25; // R$ 25 por deslocamento evitado
    const economiaRetrabalho = municipalData.funcionarios * municipalData.horas_trabalho_mes * municipalData.custo_funcionario_hora * 0.15 * 12; // 15% menos retrabalho
    const economiaEficiencia = municipalData.funcionarios * 2 * municipalData.custo_funcionario_hora * 12 * 4; // 2h/semana mais eficiente
    const economiaAtendimento = municipalData.protocolos_mes * 12 * 8; // R$ 8 por atendimento otimizado

    const economiaTotal = 
      economiaPapel + 
      economiaDeslocamento + 
      economiaRetrabalho + 
      economiaEficiencia + 
      economiaAtendimento;

    const roiPercentual = ((economiaTotal - investimentoAnual) / investimentoAnual) * 100;
    const paybackMeses = (investimentoAnual / (economiaTotal / 12));
    const economia5Anos = (economiaTotal * 5) - investimentoAnual;

    const beneficiosQualitativos = [
      'Melhoria na transparência e accountability',
      'Redução significativa de erros manuais',
      'Aumento da satisfação dos cidadãos',
      'Compliance com LGPD automatizado',
      'Decisões baseadas em dados em tempo real',
      'Redução do tempo de espera para atendimento',
      'Eliminação de filas presenciais',
      'Modernização da imagem institucional',
      'Facilidade para auditoria e prestação de contas',
      'Integração completa entre secretarias'
    ];

    setResults({
      investimento_anual: investimentoAnual,
      economia_anual: economiaTotal,
      roi_percentual: roiPercentual,
      payback_meses: paybackMeses,
      economia_5_anos: economia5Anos,
      beneficios_quantitativos: {
        economia_papel: economiaPapel,
        economia_tempo: economiaEficiencia,
        reducao_retrabalho: economiaRetrabalho,
        melhoria_eficiencia: economiaAtendimento
      },
      beneficios_qualitativos: beneficiosQualitativos
    });
  };

  // Recalcular quando dados mudarem
  useEffect(() => {
    calculateROI();
  }, [municipalData, selectedPlan]);

  // Sugerir plano baseado na população
  useEffect(() => {
    if (municipalData.populacao <= 10000) {
      setSelectedPlan('STARTER');
    } else if (municipalData.populacao <= 50000) {
      setSelectedPlan('PROFESSIONAL');
    } else {
      setSelectedPlan('ENTERPRISE');
    }
  }, [municipalData.populacao]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(Math.round(value));
  };

  const getROIColor = (roi: number) => {
    if (roi >= 300) return 'text-green-600';
    if (roi >= 200) return 'text-blue-600';
    if (roi >= 100) return 'text-yellow-600';
    return 'text-red-600';
  };

  const exportResults = () => {
    const reportData = {
      municipio: 'Sua Prefeitura',
      data_calculo: new Date().toLocaleDateString('pt-BR'),
      dados_entrada: municipalData,
      plano_selecionado: selectedPlan,
      resultados: results
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'relatorio-roi-digiurban.json';
    link.click();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3">
          <Calculator className="w-10 h-10 text-blue-600" />
          Calculadora de ROI DigiUrban
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Descubra quanto sua prefeitura pode economizar com a transformação digital
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Formulário de Entrada */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Dados do Município
              </CardTitle>
              <CardDescription>
                Informe os dados atuais da sua prefeitura
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* População */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  População
                </label>
                <input
                  type="number"
                  value={municipalData.populacao}
                  onChange={(e) => setMunicipalData(prev => ({ ...prev, populacao: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="50.000"
                />
              </div>

              {/* Funcionários */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Funcionários Públicos
                </label>
                <input
                  type="number"
                  value={municipalData.funcionarios}
                  onChange={(e) => setMunicipalData(prev => ({ ...prev, funcionarios: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="150"
                />
              </div>

              {/* Protocolos por mês */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Protocolos/Atendimentos por Mês
                </label>
                <input
                  type="number"
                  value={municipalData.protocolos_mes}
                  onChange={(e) => setMunicipalData(prev => ({ ...prev, protocolos_mes: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="500"
                />
              </div>

              {/* Secretarias */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Secretarias
                </label>
                <select
                  value={municipalData.secretarias}
                  onChange={(e) => setMunicipalData(prev => ({ ...prev, secretarias: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={3}>3 - Básicas</option>
                  <option value={5}>5 - Principais</option>
                  <option value={8}>8 - Completas</option>
                  <option value={13}>13 - Todas</option>
                </select>
              </div>

              {/* Custo por funcionário/hora */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custo Médio Funcionário/Hora (R$)
                </label>
                <input
                  type="number"
                  value={municipalData.custo_funcionario_hora}
                  onChange={(e) => setMunicipalData(prev => ({ ...prev, custo_funcionario_hora: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="35.00"
                  step="0.01"
                />
              </div>

            </CardContent>
          </Card>

          {/* Seleção de Plano */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                Plano Recomendado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(planPricing).map(([plan, pricing]) => {
                  const isRecommended = plan === selectedPlan;
                  const isAvailable = municipalData.populacao <= pricing.limite_populacao;
                  
                  return (
                    <div
                      key={plan}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        isRecommended 
                          ? 'border-blue-500 bg-blue-50' 
                          : isAvailable 
                            ? 'border-gray-200 hover:border-gray-300' 
                            : 'border-gray-100 bg-gray-50 opacity-60'
                      }`}
                      onClick={() => isAvailable && setSelectedPlan(plan as any)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{plan}</span>
                            {isRecommended && <Badge className="bg-blue-600">Recomendado</Badge>}
                            {!isAvailable && <Badge variant="outline">Não disponível</Badge>}
                          </div>
                          <p className="text-sm text-gray-600">
                            Até {formatNumber(pricing.limite_populacao)} habitantes
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            {formatCurrency(pricing.anual)}
                          </p>
                          <p className="text-sm text-gray-600">por ano</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resultados */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Resultados Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">ROI Anual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className={`w-6 h-6 ${results ? getROIColor(results.roi_percentual) : 'text-gray-400'}`} />
                  <span className={`text-3xl font-bold ${results ? getROIColor(results.roi_percentual) : 'text-gray-400'}`}>
                    {results ? `${results.roi_percentual.toFixed(0)}%` : '--%'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {results && results.roi_percentual > 0 
                    ? 'Retorno positivo garantido' 
                    : 'Calculando retorno...'
                  }
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Payback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Clock className="w-6 h-6 text-blue-600" />
                  <span className="text-3xl font-bold text-blue-600">
                    {results ? `${results.payback_meses.toFixed(0)}` : '--'}
                  </span>
                  <span className="text-lg text-gray-600">meses</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Tempo para recuperar investimento
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Economia Anual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-green-600" />
                  <span className="text-3xl font-bold text-green-600">
                    {results ? formatCurrency(results.economia_anual) : 'R$ --'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Total economizado por ano
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Economia 5 Anos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                  <span className="text-3xl font-bold text-purple-600">
                    {results ? formatCurrency(results.economia_5_anos) : 'R$ --'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Economia acumulada líquida
                </p>
              </CardContent>
            </Card>

          </div>

          {/* Detalhamento das Economias */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Detalhamento das Economias</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowDetailedView(!showDetailedView)}
                >
                  {showDetailedView ? 'Ocultar' : 'Ver Detalhes'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              
              {results && (
                <div className="space-y-4">
                  
                  {/* Economias Quantificadas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <div className="p-3 border border-green-200 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">💰 Economia com Papel</h4>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(results.beneficios_quantitativos.economia_papel)}
                      </p>
                      <p className="text-sm text-green-700">
                        Eliminação de formulários físicos e impressões
                      </p>
                    </div>

                    <div className="p-3 border border-blue-200 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">⚡ Ganho de Eficiência</h4>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(results.beneficios_quantitativos.melhoria_eficiencia)}
                      </p>
                      <p className="text-sm text-blue-700">
                        Atendimentos mais rápidos e eficientes
                      </p>
                    </div>

                    <div className="p-3 border border-purple-200 bg-purple-50 rounded-lg">
                      <h4 className="font-medium text-purple-800 mb-2">🔄 Menos Retrabalho</h4>
                      <p className="text-2xl font-bold text-purple-600">
                        {formatCurrency(results.beneficios_quantitativos.reducao_retrabalho)}
                      </p>
                      <p className="text-sm text-purple-700">
                        Redução de erros e correções manuais
                      </p>
                    </div>

                    <div className="p-3 border border-orange-200 bg-orange-50 rounded-lg">
                      <h4 className="font-medium text-orange-800 mb-2">⏱️ Economia de Tempo</h4>
                      <p className="text-2xl font-bold text-orange-600">
                        {formatCurrency(results.beneficios_quantitativos.economia_tempo)}
                      </p>
                      <p className="text-sm text-orange-700">
                        2h/semana mais produtivas por funcionário
                      </p>
                    </div>

                  </div>

                  {/* Benefícios Qualitativos */}
                  {showDetailedView && (
                    <div className="mt-6">
                      <h4 className="font-medium text-gray-800 mb-3">🏆 Benefícios Adicionais Inclusos</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {results.beneficios_qualitativos.map((beneficio, index) => (
                          <div key={index} className="flex items-start gap-2 p-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{beneficio}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}

            </CardContent>
          </Card>

          {/* Ações */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                
                <Button onClick={exportResults} variant="outline" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Exportar Relatório
                </Button>

                <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                  <ArrowRight className="w-4 h-4" />
                  Solicitar Demonstração
                </Button>

                <Button variant="outline" className="flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Compartilhar
                </Button>

              </div>

              {results && results.roi_percentual > 200 && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                  <h3 className="font-bold text-green-800 mb-2">🎉 ROI Excepcional!</h3>
                  <p className="text-green-700 text-sm">
                    Com um ROI de {results.roi_percentual.toFixed(0)}%, sua prefeitura teria um retorno extraordinário. 
                    <strong> Agende uma demonstração para começar a economizar hoje mesmo!</strong>
                  </p>
                </div>
              )}

            </CardContent>
          </Card>

        </div>
      </div>

      {/* Disclaimer */}
      <div className="text-center text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
        <p>
          * Cálculos baseados em médias de clientes similares. Os resultados reais podem variar. 
          Entre em contato para uma análise personalizada da sua prefeitura.
        </p>
      </div>

    </div>
  );
};

export default ROICalculator;