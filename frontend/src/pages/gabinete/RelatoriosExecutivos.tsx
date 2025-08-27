

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, ChevronDown, Download, FileText, Printer, Share2, TrendingUp, TrendingDown, AlertCircle, RefreshCw, Loader2, DollarSign, BarChart3, PieChart } from "lucide-react";
import { FC, useState } from "react";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";
import { ResponsivePie } from "@nivo/pie";
import { useReports } from "@/hooks/useReports";
import { toast } from "react-hot-toast";

// =====================================================
// COMPONENTES DE KPI
// =====================================================

const KPICard: FC<{
  title: string
  value: string | number
  trend?: 'up' | 'down' | 'stable'
  trendValue?: string
  icon?: React.ReactNode
  color?: 'blue' | 'green' | 'yellow' | 'red'
}> = ({ title, value, trend, trendValue, icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-500 text-blue-50',
    green: 'bg-green-500 text-green-50',
    yellow: 'bg-yellow-500 text-yellow-50',
    red: 'bg-red-500 text-red-50'
  }

  const trendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {trend && trendValue && (
              <div className={`flex items-center mt-2 text-sm ${
                trend === 'up' ? 'text-green-600' : 
                trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {trendIcon && <trendIcon className="h-4 w-4 mr-1" />}
                {trendValue}
              </div>
            )}
          </div>
          {icon && (
            <div className={`rounded-full p-3 ${colorClasses[color]}`}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// =====================================================
// COMPONENTES DE AÇÃO E FILTRO
// =====================================================

const FilterSection: FC<{
  onDateChange: (start: string, end: string) => void
  loading: boolean
}> = ({ onDateChange, loading }) => {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const handleFilter = () => {
    if (startDate && endDate) {
      onDateChange(startDate, endDate)
    }
  }

  return (
    <div className="flex flex-wrap items-end gap-4 p-4 bg-muted/50 rounded-lg">
      <div className="space-y-2">
        <Label htmlFor="start-date">Data Inicial</Label>
        <Input
          id="start-date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-40"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="end-date">Data Final</Label>
        <Input
          id="end-date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-40"
        />
      </div>
      <Button onClick={handleFilter} disabled={loading || !startDate || !endDate}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Filtrando...
          </>
        ) : (
          'Filtrar Período'
        )}
      </Button>
    </div>
  )
}

const ActionBar: FC<{
  onExportPDF: () => void
  onExportExcel: () => void
  onShare: () => void
}> = ({ onExportPDF, onExportExcel, onShare }) => (
  <div className="flex space-x-2">
    <Button variant="outline" size="sm" onClick={onExportPDF}>
      <Download className="h-4 w-4 mr-2" /> PDF
    </Button>
    <Button variant="outline" size="sm" onClick={onExportExcel}>
      <FileText className="h-4 w-4 mr-2" /> Excel
    </Button>
    <Button variant="outline" size="sm" onClick={onShare}>
      <Share2 className="h-4 w-4 mr-2" /> Compartilhar
    </Button>
  </div>
)

// =====================================================
// COMPONENTES DE GRÁFICOS
// =====================================================

const ChartContainer: FC<{ 
  title: string
  description?: string
  children: React.ReactNode
  actions?: React.ReactNode
}> = ({ title, description, children, actions }) => (
  <Card>
    <CardHeader className="pb-3">
      <div className="flex justify-between items-start">
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
          {description && (
            <CardDescription>{description}</CardDescription>
          )}
        </div>
        {actions}
      </div>
    </CardHeader>
    <CardContent>
      <div className="h-80">
        {children}
      </div>
    </CardContent>
  </Card>
);

const RelatoriosExecutivos: FC = () => {
  const {
    kpis,
    financialData,
    reports,
    loading,
    error,
    exportToPDF,
    exportToExcel,
    shareReport,
    filterByPeriod,
    formatCurrency,
    formatPercentage,
    loadAllData
  } = useReports()

  if (loading) {
    return (
      
        <div className="p-6 flex justify-center items-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Carregando relatórios...</span>
          </div>
        </div>
      
    )
  }

  return (
    
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Relatórios Executivos</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={loadAllData}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800 dark:text-red-300">Erro</h3>
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Filtros Globais */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros e Configurações</CardTitle>
            <CardDescription>Configure o período e parâmetros para geração dos relatórios</CardDescription>
          </CardHeader>
          <CardContent>
            <FilterSection onDateChange={filterByPeriod} loading={loading} />
          </CardContent>
        </Card>

        <Tabs defaultValue="overview">
          <TabsList className="mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Visão Geral
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Desempenho
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" /> Financeiro
            </TabsTrigger>
            <TabsTrigger value="operational" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" /> Operacional
            </TabsTrigger>
          </TabsList>

          {/* Visão Geral - KPIs */}
          <TabsContent value="overview" className="space-y-6">
            {kpis && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <KPICard
                    title="Total de Protocolos"
                    value={kpis.total_protocolos.toLocaleString()}
                    trend="up"
                    trendValue="+12% este mês"
                    icon={<FileText className="h-6 w-6" />}
                    color="blue"
                  />
                  <KPICard
                    title="Protocolos Resolvidos"
                    value={kpis.protocolos_resolvidos.toLocaleString()}
                    trend="up"
                    trendValue={`${formatPercentage((kpis.protocolos_resolvidos / kpis.total_protocolos) * 100)} do total`}
                    icon={<TrendingUp className="h-6 w-6" />}
                    color="green"
                  />
                  <KPICard
                    title="Tempo Médio de Resolução"
                    value={`${kpis.tempo_medio_resolucao} dias`}
                    trend="down"
                    trendValue="-0.5 dias"
                    icon={<Calendar className="h-6 w-6" />}
                    color="yellow"
                  />
                  <KPICard
                    title="Eficiência Mensal"
                    value={`${kpis.eficiencia_mensal}%`}
                    trend="up"
                    trendValue="+2% vs mês anterior"
                    icon={<BarChart3 className="h-6 w-6" />}
                    color="green"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ChartContainer
                    title="Status dos Protocolos"
                    description="Distribuição atual por status"
                    actions={
                      <ActionBar
                        onExportPDF={() => exportToPDF('protocolos-status')}
                        onExportExcel={() => exportToExcel('protocolos-status')}
                        onShare={() => shareReport('protocolos-status')}
                      />
                    }
                  >
                    <ResponsivePie
                      data={[
                        { id: 'Resolvidos', value: kpis.protocolos_resolvidos },
                        { id: 'Pendentes', value: kpis.protocolos_pendentes }
                      ]}
                      margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                      innerRadius={0.5}
                      padAngle={0.7}
                      cornerRadius={3}
                      colors={{ scheme: 'nivo' }}
                      borderWidth={1}
                      legends={[
                        {
                          anchor: 'bottom',
                          direction: 'row',
                          justify: false,
                          translateX: 0,
                          translateY: 56,
                          itemsSpacing: 0,
                          itemWidth: 100,
                          itemHeight: 18
                        }
                      ]}
                    />
                  </ChartContainer>

                  <ChartContainer
                    title="Satisfação do Cidadão"
                    description="Avaliação média dos serviços"
                  >
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="text-6xl font-bold text-primary">
                          {kpis.satisfacao_media.toFixed(1)}
                        </div>
                        <div className="text-xl text-muted-foreground">/ 5.0</div>
                        <div className="flex justify-center mt-4">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <div
                              key={star}
                              className={`text-2xl ${
                                star <= Math.round(kpis.satisfacao_media)
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            >
                              ★
                            </div>
                          ))}
                        </div>
                        <Badge variant="secondary" className="mt-2">
                          Muito Satisfatório
                        </Badge>
                      </div>
                    </div>
                  </ChartContainer>
                </div>
              </>
            )}
          </TabsContent>

          {/* Relatórios de Desempenho */}
          <TabsContent value="performance" className="space-y-6">
            {reports
              .filter(r => r.categoria === 'desempenho')
              .map((report) => (
                <ChartContainer
                  key={report.id}
                  title={report.nome}
                  description={report.descricao}
                  actions={
                    <ActionBar
                      onExportPDF={() => exportToPDF(report.id)}
                      onExportExcel={() => exportToExcel(report.id)}
                      onShare={() => shareReport(report.id)}
                    />
                  }
                >
                  <ResponsiveBar
                    data={report.dados}
                    keys={['total', 'resolvidos']}
                    indexBy="mes"
                    margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                    padding={0.3}
                    colors={{ scheme: 'nivo' }}
                    axisBottom={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: 'Período',
                      legendPosition: 'middle',
                      legendOffset: 32
                    }}
                    axisLeft={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: 'Quantidade',
                      legendPosition: 'middle',
                      legendOffset: -40
                    }}
                    legends={[
                      {
                        dataFrom: 'keys',
                        anchor: 'bottom-right',
                        direction: 'column',
                        justify: false,
                        translateX: 120,
                        translateY: 0,
                        itemsSpacing: 2,
                        itemWidth: 100,
                        itemHeight: 20
                      }
                    ]}
                  />
                </ChartContainer>
              ))}
          </TabsContent>

          {/* Relatórios Financeiros */}
          <TabsContent value="financial" className="space-y-6">
            {financialData && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <KPICard
                    title="Orçamento Total"
                    value={formatCurrency(financialData.orcamento_total)}
                    icon={<DollarSign className="h-6 w-6" />}
                    color="blue"
                  />
                  <KPICard
                    title="Orçamento Executado"
                    value={formatCurrency(financialData.orcamento_executado)}
                    trend="up"
                    trendValue={formatPercentage(
                      (financialData.orcamento_executado / financialData.orcamento_total) * 100
                    )}
                    icon={<TrendingUp className="h-6 w-6" />}
                    color="green"
                  />
                  <KPICard
                    title="Saldo Disponível"
                    value={formatCurrency(financialData.orcamento_disponivel)}
                    icon={<BarChart3 className="h-6 w-6" />}
                    color="yellow"
                  />
                </div>

                <ChartContainer
                  title="Execução Orçamentária por Secretaria"
                  description="Percentual de execução do orçamento por órgão"
                  actions={
                    <ActionBar
                      onExportPDF={() => exportToPDF('orcamento-secretarias')}
                      onExportExcel={() => exportToExcel('orcamento-secretarias')}
                      onShare={() => shareReport('orcamento-secretarias')}
                    />
                  }
                >
                  <ResponsiveBar
                    data={financialData.execucao_por_secretaria}
                    keys={['percentual']}
                    indexBy="secretaria"
                    margin={{ top: 50, right: 130, bottom: 90, left: 60 }}
                    padding={0.3}
                    colors={{ scheme: 'blues' }}
                    axisBottom={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: -45,
                      legend: 'Secretarias',
                      legendPosition: 'middle',
                      legendOffset: 80
                    }}
                    axisLeft={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: 'Percentual Executado (%)',
                      legendPosition: 'middle',
                      legendOffset: -50
                    }}
                    valueFormat=" >-.1%"
                  />
                </ChartContainer>
              </>
            )}
          </TabsContent>

          {/* Relatórios Operacionais */}
          <TabsContent value="operational" className="space-y-6">
            {reports
              .filter(r => r.categoria === 'operacional')
              .map((report) => (
                <ChartContainer
                  key={report.id}
                  title={report.nome}
                  description={report.descricao}
                  actions={
                    <ActionBar
                      onExportPDF={() => exportToPDF(report.id)}
                      onExportExcel={() => exportToExcel(report.id)}
                      onShare={() => shareReport(report.id)}
                    />
                  }
                >
                  <ResponsivePie
                    data={report.dados}
                    margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                    innerRadius={0.5}
                    padAngle={0.7}
                    cornerRadius={3}
                    colors={{ scheme: 'category10' }}
                    borderWidth={1}
                    legends={[
                      {
                        anchor: 'bottom',
                        direction: 'row',
                        justify: false,
                        translateX: 0,
                        translateY: 56,
                        itemsSpacing: 0,
                        itemWidth: 100,
                        itemHeight: 18
                      }
                    ]}
                  />
                </ChartContainer>
              ))}
          </TabsContent>
        </Tabs>
      </div>
    
  )
};

export default RelatoriosExecutivos;
