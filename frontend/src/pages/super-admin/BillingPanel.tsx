import React, { useState } from 'react';
import {
  CreditCard,
  FileText,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Mail,
  RefreshCw,
  Filter,
  Search,
  MoreHorizontal,
  Eye,
  Send,
  X
} from 'lucide-react';
import { useBilling, useInvoiceGeneration } from "@/hooks/useBilling";
import { useTenants } from "@/hooks/useTenants";

const BillingPanel: React.FC = () => {
  const { tenants } = useTenants();
  const { generateMonthlyInvoices, loading: generatingInvoices } = useInvoiceGeneration();
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const {
    invoices,
    loading: invoicesLoading,
    generateInvoice,
    processPayment,
    cancelInvoice,
    resendInvoice
  } = useBilling(selectedTenant);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesStatus = statusFilter === 'ALL' || invoice.status === statusFilter;
    const matchesSearch = invoice.numero_fatura.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.valor_liquido.toString().includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDENTE: 'bg-yellow-100 text-yellow-800',
      PAGA: 'bg-green-100 text-green-800',
      VENCIDA: 'bg-red-100 text-red-800',
      CANCELADA: 'bg-gray-100 text-gray-800'
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDENTE':
        return <Clock className="h-4 w-4" />;
      case 'PAGA':
        return <CheckCircle className="h-4 w-4" />;
      case 'VENCIDA':
        return <AlertCircle className="h-4 w-4" />;
      case 'CANCELADA':
        return <X className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const handleGenerateMonthlyInvoices = async () => {
    try {
      const results = await generateMonthlyInvoices();
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      alert(`Geração concluída: ${successful} faturas criadas com sucesso, ${failed} falharam.`);
    } catch (error) {
      console.error('Erro ao gerar faturas:', error);
    }
  };

  const handleProcessPayment = async (invoiceId: string) => {
    try {
      await processPayment(invoiceId, {
        metodo: 'PIX',
        dados: { transaction_id: `PIX-${Date.now()}` }
      });
      alert('Pagamento processado com sucesso!');
    } catch (error: Error | unknown) {
      alert(`Erro ao processar pagamento: ${error.message}`);
    }
  };

  const handleResendInvoice = async (invoiceId: string) => {
    try {
      await resendInvoice(invoiceId);
      alert('Fatura reenviada por email com sucesso!');
    } catch (error: Error | unknown) {
      alert(`Erro ao reenviar fatura: ${error.message}`);
    }
  };

  const calculateTotalRevenue = () => {
    return filteredInvoices
      .filter(inv => inv.status === 'PAGA')
      .reduce((sum, inv) => sum + inv.valor_liquido, 0);
  };

  const calculatePendingRevenue = () => {
    return filteredInvoices
      .filter(inv => inv.status === 'PENDENTE')
      .reduce((sum, inv) => sum + inv.valor_liquido, 0);
  };

  const calculateOverdueRevenue = () => {
    return filteredInvoices
      .filter(inv => inv.status === 'VENCIDA')
      .reduce((sum, inv) => sum + inv.valor_liquido, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestão de Cobrança</h1>
              <p className="text-gray-600 mt-1">Controle de faturas e pagamentos da plataforma</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleGenerateMonthlyInvoices}
                disabled={generatingInvoices}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {generatingInvoices ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <FileText className="h-5 w-5" />
                    Gerar Faturas Mensais
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Métricas de Receita */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Receita Coletada</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {calculateTotalRevenue().toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Receita Pendente</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {calculatePendingRevenue().toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Receita Vencida</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {calculateOverdueRevenue().toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Faturas</p>
                <p className="text-2xl font-bold text-gray-900">{filteredInvoices.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar fatura..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <select
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todas as Prefeituras</option>
              {tenants.map(tenant => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.nome}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">Todos os Status</option>
              <option value="PENDENTE">Pendente</option>
              <option value="PAGA">Paga</option>
              <option value="VENCIDA">Vencida</option>
              <option value="CANCELADA">Cancelada</option>
            </select>

            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition-colors">
              <Filter className="h-4 w-4" />
              Mais Filtros
            </button>
          </div>
        </div>

        {/* Lista de Faturas */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Faturas ({filteredInvoices.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fatura
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prefeitura
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vencimento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pagamento
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoicesLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-500 mt-2">Carregando faturas...</p>
                    </td>
                  </tr>
                ) : filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      Nenhuma fatura encontrada
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {invoice.numero_fatura}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(invoice.data_emissao).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {tenants.find(t => t.id === invoice.tenant_id)?.nome || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          R$ {invoice.valor_liquido.toLocaleString('pt-BR')}
                        </div>
                        {invoice.desconto > 0 && (
                          <div className="text-xs text-gray-500">
                            Desconto: R$ {invoice.desconto.toLocaleString('pt-BR')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(invoice.status)}`}>
                            {getStatusIcon(invoice.status)}
                            <span className="ml-1">{invoice.status}</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(invoice.data_vencimento).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invoice.data_pagamento ? (
                          <div>
                            <div>{new Date(invoice.data_pagamento).toLocaleDateString('pt-BR')}</div>
                            <div className="text-xs text-gray-500">{invoice.metodo_pagamento}</div>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setShowInvoiceModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {invoice.status === 'PENDENTE' && (
                            <>
                              <button
                                onClick={() => handleProcessPayment(invoice.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleResendInvoice(invoice.id)}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                <Mail className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          <button className="text-gray-600 hover:text-gray-900">
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Detalhes da Fatura */}
      {showInvoiceModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowInvoiceModal(false)}></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Detalhes da Fatura
                </h3>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Informações da Fatura */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Número da Fatura
                    </label>
                    <p className="text-sm text-gray-900">{selectedInvoice.numero_fatura}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(selectedInvoice.status)}`}>
                      {getStatusIcon(selectedInvoice.status)}
                      <span className="ml-1">{selectedInvoice.status}</span>
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Data de Emissão
                    </label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedInvoice.data_emissao).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Data de Vencimento
                    </label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedInvoice.data_vencimento).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                {/* Itens da Fatura */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Itens da Fatura</h4>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Descrição
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            Qtd
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            Valor Unit.
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedInvoice.itens.map((item: any, index: number) => (
                          <tr key={index}>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {item.descricao}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">
                              {item.quantidade}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">
                              R$ {item.valor_unitario.toLocaleString('pt-BR')}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">
                              R$ {item.valor_total.toLocaleString('pt-BR')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totais */}
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Subtotal:</span>
                      <span className="text-sm text-gray-900">
                        R$ {selectedInvoice.valor_bruto.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    {selectedInvoice.desconto > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Desconto:</span>
                        <span className="text-sm text-red-600">
                          -R$ {selectedInvoice.desconto.toLocaleString('pt-BR')}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total:</span>
                      <span>R$ {selectedInvoice.valor_liquido.toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowInvoiceModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
                  >
                    Fechar
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Baixar PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingPanel;