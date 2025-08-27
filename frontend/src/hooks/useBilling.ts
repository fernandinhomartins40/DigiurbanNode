import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { BaseEntity, StatusBase } from "@/types/common";

export interface FaturaPadrao extends BaseEntity {
  tenant_id: string;
  assinatura_id: string;
  numero_fatura: string;
  data_emissao: string;
  data_vencimento: string;
  valor_bruto: number;
  desconto: number;
  valor_liquido: number;
  status: 'pendente' | 'paga' | 'vencida' | 'cancelada';
  data_pagamento?: string;
  metodo_pagamento?: string;
  itens_fatura: ItemFaturaPadrao[];
  gateway_transaction_id?: string;
  gateway_status?: string;
}

export interface ItemFaturaPadrao extends BaseEntity {
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  tipo_item: 'plano' | 'addon' | 'servico';
}

export interface MetodoPagamentoPadrao extends BaseEntity {
  tenant_id: string;
  tipo_metodo: 'cartao' | 'pix' | 'boleto' | 'transferencia';
  dados_metodo: any;
  status: StatusBase;
  metodo_padrao: boolean;
}

export interface ConfiguracoesCobrancaPadrao {
  tenant_id: string;
  dia_vencimento: number;
  enviar_email_cobranca: boolean;
  enviar_email_vencimento: boolean;
  dias_antecedencia_aviso: number;
  dias_auto_suspensao: number;
  dias_auto_cancelamento: number;
}

export function useBilling(tenantId?: string) {
  const [faturas, setFaturas] = useState<FaturaPadrao[]>([]);
  const [metodos_pagamento, setMetodosPagamento] = useState<MetodoPagamentoPadrao[]>([]);
  const [configuracoes_cobranca, setConfiguracoesCobranca] = useState<ConfiguracoesCobrancaPadrao | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar faturas
  const fetchInvoices = async () => {
    if (!tenantId) return;

    try {
      const { data, error } = await supabase
        .from('tenant_faturas')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('data_emissao', { ascending: false });

      if (error) throw error;
      setFaturas(data || []);
    } catch (err: Error | unknown) {
      setError(err.message);
    }
  };

  // Gerar nova fatura
  const generateInvoice = async (assinaturaId: string) => {
    try {
      // Buscar dados da assinatura
      const { data: subscription, error: subError } = await supabase
        .from('tenant_assinaturas')
        .select('*')
        .eq('id', assinaturaId)
        .single();

      if (subError) throw subError;

      // Calcular itens da fatura
      const itens: ItemFaturaPadrao[] = [
        {
          descricao: `Plano ${subscription.plano}`,
          quantidade: 1,
          valor_unitario: subscription.valor_mensal,
          valor_total: subscription.valor_mensal,
          tipo_item: 'plano'
        }
      ];

      // Adicionar add-ons
      if (subscription.portal_transparencia > 0) {
        itens.push({
          descricao: 'Portal da Transparência',
          quantidade: 1,
          valor_unitario: subscription.portal_transparencia,
          valor_total: subscription.portal_transparencia,
          tipo_item: 'addon'
        });
      }

      if (subscription.app_mobile > 0) {
        itens.push({
          descricao: 'App Mobile Cidadão',
          quantidade: 1,
          valor_unitario: subscription.app_mobile,
          valor_total: subscription.app_mobile,
          tipo_item: 'addon'
        });
      }

      if (subscription.bi_avancado > 0) {
        itens.push({
          descricao: 'BI Avançado',
          quantidade: 1,
          valor_unitario: subscription.bi_avancado,
          valor_total: subscription.bi_avancado,
          tipo_item: 'addon'
        });
      }

      if (subscription.integracoes_federais > 0) {
        itens.push({
          descricao: 'Integrações Federais',
          quantidade: 1,
          valor_unitario: subscription.integracoes_federais,
          valor_total: subscription.integracoes_federais,
          tipo_item: 'addon'
        });
      }

      const valorBruto = itens.reduce((sum, item) => sum + item.valor_total, 0);
      const desconto = subscription.desconto_valor || 0;
      const valorLiquido = valorBruto - desconto;

      // Gerar número da fatura
      const numeroFatura = `FAT-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

      // Calcular data de vencimento
      const dataVencimento = new Date();
      dataVencimento.setDate(dataVencimento.getDate() + 30);

      // Criar fatura
      const { data: invoice, error } = await supabase
        .from('tenant_faturas')
        .insert([{
          tenant_id: subscription.tenant_id,
          assinatura_id: assinaturaId,
          numero_fatura: numeroFatura,
          data_vencimento: dataVencimento.toISOString(),
          valor_bruto: valorBruto,
          desconto: desconto,
          valor_liquido: valorLiquido,
          itens_fatura: itens,
          status: 'pendente'
        }])
        .select()
        .single();

      if (error) throw error;

      await fetchInvoices();
      return invoice;
    } catch (err: Error | unknown) {
      throw new Error(`Erro ao gerar fatura: ${err.message}`);
    }
  };

  // Processar pagamento
  const processPayment = async (invoiceId: string, paymentData: {
    metodo: 'pix' | 'cartao' | 'boleto' | 'transferencia';
    dados: Record<string, unknown>;
  }) => {
    try {
      // Simular processamento de pagamento
      // Em produção, aqui seria feita a integração com gateway de pagamento
      
      const { data: invoice, error } = await supabase
        .from('tenant_faturas')
        .update({
          status: 'paga',
          data_pagamento: new Date().toISOString(),
          metodo_pagamento: paymentData.metodo,
          gateway_transaction_id: `TXN-${Date.now()}`,
          gateway_status: 'approved'
        })
        .eq('id', invoiceId)
        .select()
        .single();

      if (error) throw error;

      await fetchInvoices();
      return invoice;
    } catch (err: Error | unknown) {
      throw new Error(`Erro ao processar pagamento: ${err.message}`);
    }
  };

  // Cancelar fatura
  const cancelInvoice = async (invoiceId: string) => {
    try {
      const { data, error } = await supabase
        .from('tenant_faturas')
        .update({ status: 'cancelada' })
        .eq('id', invoiceId)
        .select()
        .single();

      if (error) throw error;
      await fetchInvoices();
      return data;
    } catch (err: Error | unknown) {
      throw new Error(`Erro ao cancelar fatura: ${err.message}`);
    }
  };

  // Reenviar fatura por email
  const resendInvoice = async (invoiceId: string) => {
    try {
      // Aqui seria feita a integração com serviço de email
      console.log(`Reenviando fatura ${invoiceId} por email`);
      
      // Simular sucesso
      return { success: true, message: 'Fatura reenviada por email com sucesso!' };
    } catch (err: Error | unknown) {
      throw new Error(`Erro ao reenviar fatura: ${err.message}`);
    }
  };

  // Atualizar configurações de cobrança
  const updateBillingSettings = async (settings: Partial<ConfiguracoesCobrancaPadrao>) => {
    try {
      const { data, error } = await supabase
        .from('tenant_billing_settings')
        .upsert({
          tenant_id: tenantId,
          ...settings
        })
        .select()
        .single();

      if (error) throw error;
      setConfiguracoesCobranca(data);
      return data;
    } catch (err: Error | unknown) {
      throw new Error(`Erro ao atualizar configurações: ${err.message}`);
    }
  };

  // Buscar configurações de cobrança
  const fetchBillingSettings = async () => {
    if (!tenantId) return;

    try {
      const { data, error } = await supabase
        .from('tenant_billing_settings')
        .select('*')
        .eq('tenant_id', tenantId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // Ignore not found
      setConfiguracoesCobranca(data || {
        tenant_id: tenantId,
        dia_vencimento: 1,
        enviar_email_cobranca: true,
        enviar_email_vencimento: true,
        dias_antecedencia_aviso: 7,
        dias_auto_suspensao: 15,
        dias_auto_cancelamento: 45
      });
    } catch (err: Error | unknown) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (tenantId) {
      Promise.all([
        fetchInvoices(),
        fetchBillingSettings()
      ]).finally(() => setLoading(false));
    }
  }, [tenantId]);

  return {
    faturas,
    metodos_pagamento,
    configuracoes_cobranca,
    loading,
    error,
    generateInvoice,
    processPayment,
    cancelInvoice,
    resendInvoice,
    updateBillingSettings,
    refetch: fetchInvoices
  };
}

export function useInvoiceGeneration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateMonthlyInvoices = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar todas as assinaturas ativas que precisam de cobrança
      const { data: subscriptions, error: subError } = await supabase
        .from('tenant_assinaturas')
        .select('*')
        .eq('status', 'ATIVA')
        .lte('proxima_cobranca', new Date().toISOString());

      if (subError) throw subError;

      const results = [];

      for (const subscription of subscriptions || []) {
        try {
          // Gerar fatura para cada assinatura
          const numeroFatura = `FAT-${new Date().getFullYear()}-${String(Date.now() + Math.random()).slice(-6)}`;
          
          const itens: ItemFaturaPadrao[] = [
            {
              descricao: `Plano ${subscription.plano}`,
              quantidade: 1,
              valor_unitario: subscription.valor_mensal,
              valor_total: subscription.valor_mensal,
              tipo_item: 'plano'
            }
          ];

          // Adicionar add-ons
          let valorTotal = subscription.valor_mensal;
          
          if (subscription.portal_transparencia > 0) {
            itens.push({
              descricao: 'Portal da Transparência',
              quantidade: 1,
              valor_unitario: subscription.portal_transparencia,
              valor_total: subscription.portal_transparencia,
              tipo_item: 'addon'
            });
            valorTotal += subscription.portal_transparencia;
          }

          if (subscription.app_mobile > 0) {
            itens.push({
              descricao: 'App Mobile Cidadão',
              quantidade: 1,
              valor_unitario: subscription.app_mobile,
              valor_total: subscription.app_mobile,
              tipo_item: 'addon'
            });
            valorTotal += subscription.app_mobile;
          }

          if (subscription.bi_avancado > 0) {
            itens.push({
              descricao: 'BI Avançado',
              quantidade: 1,
              valor_unitario: subscription.bi_avancado,
              valor_total: subscription.bi_avancado,
              tipo_item: 'addon'
            });
            valorTotal += subscription.bi_avancado;
          }

          if (subscription.integracoes_federais > 0) {
            itens.push({
              descricao: 'Integrações Federais',
              quantidade: 1,
              valor_unitario: subscription.integracoes_federais,
              valor_total: subscription.integracoes_federais,
              tipo_item: 'addon'
            });
            valorTotal += subscription.integracoes_federais;
          }

          const desconto = subscription.desconto_valor || 0;
          const valorLiquido = valorTotal - desconto;

          // Calcular próxima data de vencimento
          const dataVencimento = new Date();
          dataVencimento.setDate(dataVencimento.getDate() + 30);

          // Criar fatura
          const { data: invoice, error: invoiceError } = await supabase
            .from('tenant_faturas')
            .insert([{
              tenant_id: subscription.tenant_id,
              assinatura_id: subscription.id,
              numero_fatura: numeroFatura,
              data_vencimento: dataVencimento.toISOString(),
              valor_bruto: valorTotal,
              desconto: desconto,
              valor_liquido: valorLiquido,
              itens_fatura: itens,
              status: 'pendente'
            }])
            .select()
            .single();

          if (invoiceError) throw invoiceError;

          // Atualizar data da próxima cobrança
          const proximaCobranca = new Date(subscription.proxima_cobranca);
          proximaCobranca.setMonth(proximaCobranca.getMonth() + 1);

          await supabase
            .from('tenant_assinaturas')
            .update({ 
              proxima_cobranca: proximaCobranca.toISOString(),
              ultima_cobranca: new Date().toISOString()
            })
            .eq('id', subscription.id);

          results.push({
            tenant_id: subscription.tenant_id,
            invoice: invoice,
            success: true
          });

        } catch (err: Error | unknown) {
          results.push({
            tenant_id: subscription.tenant_id,
            success: false,
            error: err.message
          });
        }
      }

      return results;
    } catch (err: Error | unknown) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    generateMonthlyInvoices,
    loading,
    error
  };
}