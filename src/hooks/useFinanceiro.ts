import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Transacao, 
  Categoria, 
  Conta, 
  ResumoFinanceiro,
  Transferencia 
} from '@/types/database';

export function useFinanceiro() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Buscar resumo financeiro
  const getResumoFinanceiro = async (): Promise<ResumoFinanceiro | null> => {
    if (!user) return null;
    
    try {
      setLoading(true);
      
      // Buscar transações do mês atual
      const inicioMes = new Date();
      inicioMes.setDate(1);
      const fimMes = new Date(inicioMes.getFullYear(), inicioMes.getMonth() + 1, 0);
      
      const { data: transacoes, error } = await supabase
        .from('transacoes')
        .select('*')
        .eq('user_id', user.id)
        .gte('data_vencimento', inicioMes.toISOString().split('T')[0])
        .lte('data_vencimento', fimMes.toISOString().split('T')[0]);
        
      if (error) throw error;
      
      // Calcular totais
      let receitas_mes = 0;
      let despesas_mes = 0;
      let transacoes_pendentes = 0;
      
      transacoes?.forEach(t => {
        if (t.status === 'pendente') {
          transacoes_pendentes++;
        }
        
        if (t.status === 'pago') {
          if (t.tipo_transacao === 'receita') {
            receitas_mes += Number(t.valor);
          } else if (t.tipo_transacao === 'despesa') {
            despesas_mes += Number(t.valor);
          }
        }
      });
      
      // Buscar saldo total das contas
      const { data: contas } = await supabase
        .from('contas')
        .select('saldo_atual')
        .eq('user_id', user.id)
        .eq('ativa', true);
        
      const saldo_total = contas?.reduce((acc, conta) => acc + Number(conta.saldo_atual), 0) || 0;
      
      return {
        saldo_total,
        receitas_mes,
        despesas_mes,
        balanco_mes: receitas_mes - despesas_mes,
        transacoes_pendentes,
      };
    } catch (error) {
      console.error('Erro ao buscar resumo financeiro:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Buscar transações
  const getTransacoes = async (filtros?: {
    limite?: number;
    offset?: number;
    categoria_id?: string;
    tipo_transacao?: string;
    status?: string;
    data_inicio?: string;
    data_fim?: string;
  }): Promise<Transacao[]> => {
    if (!user) return [];
    
    try {
      setLoading(true);
      
      let query = supabase
        .from('transacoes')
        .select(`
          *,
          categoria:categorias(*),
          conta:contas(*)
        `)
        .eq('user_id', user.id)
        .order('data_vencimento', { ascending: false });
        
      if (filtros?.categoria_id) {
        query = query.eq('categoria_id', filtros.categoria_id);
      }
      
      if (filtros?.tipo_transacao) {
        query = query.eq('tipo_transacao', filtros.tipo_transacao);  
      }
      
      if (filtros?.status) {
        query = query.eq('status', filtros.status);
      }
      
      if (filtros?.data_inicio) {
        query = query.gte('data_vencimento', filtros.data_inicio);
      }
      
      if (filtros?.data_fim) {
        query = query.lte('data_vencimento', filtros.data_fim);
      }
      
      if (filtros?.limite) {
        query = query.limit(filtros.limite);
      }
      
      if (filtros?.offset) {
        query = query.range(filtros.offset, filtros.offset + (filtros.limite || 10) - 1);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return (data as Transacao[]) || [];
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Criar transação
  const criarTransacao = async (transacao: Omit<Transacao, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('transacoes')
        .insert({
          ...transacao,
          user_id: user.id,
        })
        .select()
        .single();
        
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar transação
  const atualizarTransacao = async (id: string, updates: Partial<Transacao>) => {
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('transacoes')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
        
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Excluir transação
  const excluirTransacao = async (id: string) => {
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('transacoes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) throw error;
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Buscar categorias
  const getCategorias = async (): Promise<Categoria[]> => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .eq('user_id', user.id)
        .order('nome_categoria');
        
      if (error) throw error;
      
      return (data as Categoria[]) || [];
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      return [];
    }
  };

  // Buscar contas
  const getContas = async (): Promise<Conta[]> => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('contas')
        .select('*')
        .eq('user_id', user.id)
        .eq('ativa', true)
        .order('nome_conta');
        
      if (error) throw error;
      
      return (data as Conta[]) || [];
    } catch (error) {
      console.error('Erro ao buscar contas:', error);
      return [];
    }
  };

  return {
    loading,
    getResumoFinanceiro,
    getTransacoes,
    criarTransacao,
    atualizarTransacao,
    excluirTransacao,
    getCategorias,
    getContas,
  };
}