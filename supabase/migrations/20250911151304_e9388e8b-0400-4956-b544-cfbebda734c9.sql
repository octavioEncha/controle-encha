-- Criar tabela de perfis de usuário
CREATE TABLE public.perfis_usuario (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  tipo_perfil text CHECK (tipo_perfil IN ('pessoal', 'empresarial')) NOT NULL,
  nome_completo text,
  nome_empresa text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Criar tabela de categorias
CREATE TABLE public.categorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome_categoria text NOT NULL,
  tipo_categoria text CHECK (tipo_categoria IN ('receita', 'despesa')) NOT NULL,
  cor_categoria text DEFAULT '#3B82F6',
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Criar tabela de contas/carteiras
CREATE TABLE public.contas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome_conta text NOT NULL,
  tipo_conta text CHECK (tipo_conta IN ('conta_corrente', 'poupanca', 'carteira', 'cartao', 'investimento')) NOT NULL,
  saldo_inicial decimal(15,2) DEFAULT 0 NOT NULL,
  saldo_atual decimal(15,2) DEFAULT 0 NOT NULL,
  ativa boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Criar tabela de transações
CREATE TABLE public.transacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  conta_id uuid REFERENCES public.contas(id) ON DELETE CASCADE NOT NULL,
  categoria_id uuid REFERENCES public.categorias(id) ON DELETE RESTRICT NOT NULL,
  descricao text NOT NULL,
  valor decimal(15,2) NOT NULL CHECK (valor > 0),
  tipo_transacao text CHECK (tipo_transacao IN ('receita', 'despesa', 'transferencia')) NOT NULL,
  data_vencimento date NOT NULL,
  data_pagamento date,
  status text CHECK (status IN ('pendente', 'pago', 'cancelado')) DEFAULT 'pendente',
  observacao text,
  recorrente boolean DEFAULT false,
  frequencia_recorrencia text CHECK (frequencia_recorrencia IN ('mensal', 'semanal', 'anual')),
  transacao_pai_id uuid REFERENCES public.transacoes(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Criar tabela de transferências
CREATE TABLE public.transferencias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  conta_origem_id uuid REFERENCES public.contas(id) ON DELETE CASCADE NOT NULL,
  conta_destino_id uuid REFERENCES public.contas(id) ON DELETE CASCADE NOT NULL,
  valor decimal(15,2) NOT NULL CHECK (valor > 0),
  descricao text,
  data_transferencia date DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Criar tabela de metas financeiras
CREATE TABLE public.metas_financeiras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome_meta text NOT NULL,
  valor_meta decimal(15,2) NOT NULL CHECK (valor_meta > 0),
  valor_atual decimal(15,2) DEFAULT 0 NOT NULL,
  data_limite date,
  ativa boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.perfis_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transferencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metas_financeiras ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para perfis_usuario
CREATE POLICY "Usuários podem ver apenas seu próprio perfil" ON public.perfis_usuario
FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para categorias
CREATE POLICY "Usuários podem ver apenas suas próprias categorias" ON public.categorias
FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para contas
CREATE POLICY "Usuários podem ver apenas suas próprias contas" ON public.contas
FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para transações
CREATE POLICY "Usuários podem ver apenas suas próprias transações" ON public.transacoes
FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para transferências
CREATE POLICY "Usuários podem ver apenas suas próprias transferências" ON public.transferencias
FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para metas
CREATE POLICY "Usuários podem ver apenas suas próprias metas" ON public.metas_financeiras
FOR ALL USING (auth.uid() = user_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_perfis_usuario_updated_at
  BEFORE UPDATE ON public.perfis_usuario
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transacoes_updated_at
  BEFORE UPDATE ON public.transacoes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Função para criar categorias padrão
CREATE OR REPLACE FUNCTION public.criar_categorias_padrao(
  p_user_id uuid,
  p_tipo_perfil text
)
RETURNS void AS $$
BEGIN
  IF p_tipo_perfil = 'pessoal' THEN
    -- Categorias pessoais de receita
    INSERT INTO public.categorias (user_id, nome_categoria, tipo_categoria, cor_categoria, is_default) VALUES
    (p_user_id, 'Salário', 'receita', '#10B981', true),
    (p_user_id, 'Freelance', 'receita', '#059669', true),
    (p_user_id, 'Investimentos', 'receita', '#047857', true),
    (p_user_id, 'Outros', 'receita', '#065F46', true);
    
    -- Categorias pessoais de despesa
    INSERT INTO public.categorias (user_id, nome_categoria, tipo_categoria, cor_categoria, is_default) VALUES
    (p_user_id, 'Alimentação', 'despesa', '#EF4444', true),
    (p_user_id, 'Transporte', 'despesa', '#DC2626', true),
    (p_user_id, 'Saúde', 'despesa', '#B91C1C', true),
    (p_user_id, 'Lazer', 'despesa', '#991B1B', true),
    (p_user_id, 'Moradia', 'despesa', '#7F1D1D', true),
    (p_user_id, 'Educação', 'despesa', '#F59E0B', true),
    (p_user_id, 'Outros', 'despesa', '#D97706', true);
  ELSE
    -- Categorias empresariais de receita
    INSERT INTO public.categorias (user_id, nome_categoria, tipo_categoria, cor_categoria, is_default) VALUES
    (p_user_id, 'Vendas', 'receita', '#10B981', true),
    (p_user_id, 'Serviços', 'receita', '#059669', true),
    (p_user_id, 'Juros Recebidos', 'receita', '#047857', true),
    (p_user_id, 'Outros', 'receita', '#065F46', true);
    
    -- Categorias empresariais de despesa
    INSERT INTO public.categorias (user_id, nome_categoria, tipo_categoria, cor_categoria, is_default) VALUES
    (p_user_id, 'Fornecedores', 'despesa', '#EF4444', true),
    (p_user_id, 'Marketing', 'despesa', '#DC2626', true),
    (p_user_id, 'Funcionários', 'despesa', '#B91C1C', true),
    (p_user_id, 'Impostos', 'despesa', '#991B1B', true),
    (p_user_id, 'Equipamentos', 'despesa', '#7F1D1D', true),
    (p_user_id, 'Aluguel', 'despesa', '#F59E0B', true),
    (p_user_id, 'Outros', 'despesa', '#D97706', true);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para criar conta padrão
CREATE OR REPLACE FUNCTION public.criar_conta_padrao( 
  p_user_id uuid,
  p_tipo_perfil text
)
RETURNS void AS $$
BEGIN
  IF p_tipo_perfil = 'pessoal' THEN
    INSERT INTO public.contas (user_id, nome_conta, tipo_conta, saldo_inicial, saldo_atual) VALUES
    (p_user_id, 'Conta Principal', 'conta_corrente', 0, 0);
  ELSE
    INSERT INTO public.contas (user_id, nome_conta, tipo_conta, saldo_inicial, saldo_atual) VALUES
    (p_user_id, 'Conta Empresarial', 'conta_corrente', 0, 0);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;