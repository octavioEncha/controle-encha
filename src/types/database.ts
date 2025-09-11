export interface PerfilUsuario {
  id: string;
  user_id: string;
  tipo_perfil: 'pessoal' | 'empresarial';
  nome_completo: string | null;
  nome_empresa: string | null;
  created_at: string;
  updated_at: string;
}

export interface Categoria {
  id: string;
  user_id: string;
  nome_categoria: string;
  tipo_categoria: 'receita' | 'despesa';
  cor_categoria: string;
  is_default: boolean;
  created_at: string;
}

export interface Conta {
  id: string;
  user_id: string;
  nome_conta: string;
  tipo_conta: 'conta_corrente' | 'poupanca' | 'carteira' | 'cartao' | 'investimento';
  saldo_inicial: number;
  saldo_atual: number;
  ativa: boolean;
  created_at: string;
}

export interface Transacao {
  id: string;
  user_id: string;
  conta_id: string;
  categoria_id: string;
  descricao: string;
  valor: number;
  tipo_transacao: 'receita' | 'despesa' | 'transferencia';
  data_vencimento: string;
  data_pagamento: string | null;
  status: 'pendente' | 'pago' | 'cancelado';
  observacao: string | null;
  recorrente: boolean;
  frequencia_recorrencia: 'mensal' | 'semanal' | 'anual' | null;
  transacao_pai_id: string | null;
  created_at: string;
  updated_at: string;
  categoria?: Categoria;
  conta?: Conta;
}

export interface Transferencia {
  id: string;
  user_id: string;
  conta_origem_id: string;
  conta_destino_id: string;
  valor: number;
  descricao: string | null;
  data_transferencia: string;
  created_at: string;
  conta_origem?: Conta;
  conta_destino?: Conta;
}

export interface MetaFinanceira {
  id: string;
  user_id: string;
  nome_meta: string;
  valor_meta: number;
  valor_atual: number;
  data_limite: string | null;
  ativa: boolean;
  created_at: string;
}

export interface ResumoFinanceiro {
  saldo_total: number;
  receitas_mes: number;
  despesas_mes: number;
  balanco_mes: number;
  transacoes_pendentes: number;
}