-- Ensure foreign keys for relational selects and data integrity
-- Add FK: transacoes.categoria_id -> categorias.id
DO $$ BEGIN
IF NOT EXISTS (
  SELECT 1 FROM pg_constraint WHERE conname = 'fk_transacoes_categoria'
) THEN
  ALTER TABLE public.transacoes
  ADD CONSTRAINT fk_transacoes_categoria
  FOREIGN KEY (categoria_id)
  REFERENCES public.categorias (id)
  ON DELETE RESTRICT;
END IF;
END $$;

-- Add FK: transacoes.conta_id -> contas.id
DO $$ BEGIN
IF NOT EXISTS (
  SELECT 1 FROM pg_constraint WHERE conname = 'fk_transacoes_conta'
) THEN
  ALTER TABLE public.transacoes
  ADD CONSTRAINT fk_transacoes_conta
  FOREIGN KEY (conta_id)
  REFERENCES public.contas (id)
  ON DELETE RESTRICT;
END IF;
END $$;

-- Add FK: transferencias.conta_origem_id -> contas.id
DO $$ BEGIN
IF NOT EXISTS (
  SELECT 1 FROM pg_constraint WHERE conname = 'fk_transferencias_conta_origem'
) THEN
  ALTER TABLE public.transferencias
  ADD CONSTRAINT fk_transferencias_conta_origem
  FOREIGN KEY (conta_origem_id)
  REFERENCES public.contas (id)
  ON DELETE RESTRICT;
END IF;
END $$;

-- Add FK: transferencias.conta_destino_id -> contas.id
DO $$ BEGIN
IF NOT EXISTS (
  SELECT 1 FROM pg_constraint WHERE conname = 'fk_transferencias_conta_destino'
) THEN
  ALTER TABLE public.transferencias
  ADD CONSTRAINT fk_transferencias_conta_destino
  FOREIGN KEY (conta_destino_id)
  REFERENCES public.contas (id)
  ON DELETE RESTRICT;
END IF;
END $$;

-- Useful indexes for performance
CREATE INDEX IF NOT EXISTS idx_transacoes_user_date ON public.transacoes (user_id, data_vencimento DESC);
CREATE INDEX IF NOT EXISTS idx_transacoes_categoria ON public.transacoes (categoria_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_conta ON public.transacoes (conta_id);

-- Keep updated_at in sync
DO $$ BEGIN
IF NOT EXISTS (
  SELECT 1 FROM pg_trigger WHERE tgname = 'update_transacoes_updated_at'
) THEN
  CREATE TRIGGER update_transacoes_updated_at
  BEFORE UPDATE ON public.transacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
END IF;
END $$;

DO $$ BEGIN
IF NOT EXISTS (
  SELECT 1 FROM pg_trigger WHERE tgname = 'update_perfis_usuario_updated_at'
) THEN
  CREATE TRIGGER update_perfis_usuario_updated_at
  BEFORE UPDATE ON public.perfis_usuario
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
END IF;
END $$;