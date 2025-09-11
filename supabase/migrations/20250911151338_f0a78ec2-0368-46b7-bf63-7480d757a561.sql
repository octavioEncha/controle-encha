-- Corrigir funções com search_path mutable
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Corrigir função de criar categorias padrão
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Corrigir função de criar conta padrão
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;