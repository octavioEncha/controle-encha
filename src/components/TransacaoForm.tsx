import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFinanceiro } from '@/hooks/useFinanceiro';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Categoria, Conta, Transacao } from '@/types/database';
import { formatDateForInput } from '@/utils/formatters';

const transacaoSchema = z.object({
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  valor: z.string().min(1, 'Valor é obrigatório'),
  tipo_transacao: z.enum(['receita', 'despesa']),
  categoria_id: z.string().min(1, 'Categoria é obrigatória'),
  conta_id: z.string().min(1, 'Conta é obrigatória'),
  data_vencimento: z.string().min(1, 'Data é obrigatória'),
  data_pagamento: z.string().optional(),
  status: z.enum(['pendente', 'pago', 'cancelado']),
  observacao: z.string().optional(),
  recorrente: z.boolean().default(false),
  frequencia_recorrencia: z.enum(['mensal', 'semanal', 'anual']).optional(),
});

type TransacaoFormData = z.infer<typeof transacaoSchema>;

interface TransacaoFormProps {
  transacao?: Transacao;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function TransacaoForm({ transacao, onSubmit, onCancel }: TransacaoFormProps) {
  const { toast } = useToast();
  const { criarTransacao, atualizarTransacao, getCategorias, getContas } = useFinanceiro();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [contas, setContas] = useState<Conta[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransacaoFormData>({
    resolver: zodResolver(transacaoSchema),
    defaultValues: {
      descricao: transacao?.descricao || '',
      valor: transacao?.valor?.toString() || '',
      tipo_transacao: transacao?.tipo_transacao === 'transferencia' ? 'despesa' : (transacao?.tipo_transacao || 'despesa'),
      categoria_id: transacao?.categoria_id || '',
      conta_id: transacao?.conta_id || '',
      data_vencimento: transacao?.data_vencimento || formatDateForInput(new Date()),
      data_pagamento: transacao?.data_pagamento || '',
      status: transacao?.status || 'pendente',
      observacao: transacao?.observacao || '',
      recorrente: transacao?.recorrente || false,
      frequencia_recorrencia: transacao?.frequencia_recorrencia || undefined,
    },
  });

  const tipoTransacao = watch('tipo_transacao');
  const statusTransacao = watch('status');
  const recorrente = watch('recorrente');

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [categoriasData, contasData] = await Promise.all([
          getCategorias(),
          getContas(),
        ]);
        setCategorias(categoriasData);
        setContas(contasData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar categorias e contas.",
          variant: "destructive",
        });
      }
    };

    carregarDados();
  }, []);

  const categoriasFiltradas = categorias.filter(
    (categoria) => categoria.tipo_categoria === tipoTransacao
  );

  const onSubmitForm = async (data: TransacaoFormData) => {
    try {
      setLoading(true);

      const transacaoData = {
        descricao: data.descricao,
        valor: parseFloat(data.valor),
        tipo_transacao: data.tipo_transacao,
        categoria_id: data.categoria_id,
        conta_id: data.conta_id,
        data_vencimento: data.data_vencimento,
        data_pagamento: data.data_pagamento || null,
        status: data.status,
        observacao: data.observacao || null,
        recorrente: data.recorrente,
        frequencia_recorrencia: data.recorrente ? data.frequencia_recorrencia : null,
        transacao_pai_id: null,
      };

      if (transacao) {
        await atualizarTransacao(transacao.id, transacaoData);
        toast({
          title: "Sucesso",
          description: "Transação atualizada com sucesso!",
        });
      } else {
        await criarTransacao(transacaoData);
        toast({
          title: "Sucesso",
          description: "Transação criada com sucesso!",
        });
      }

      onSubmit();
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar transação.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Descrição */}
        <div className="md:col-span-2">
          <Label htmlFor="descricao">Descrição *</Label>
          <Input
            id="descricao"
            {...register('descricao')}
            placeholder="Ex: Salário, Aluguel, Supermercado..."
          />
          {errors.descricao && (
            <p className="text-sm text-danger mt-1">{errors.descricao.message}</p>
          )}
        </div>

        {/* Valor */}
        <div>
          <Label htmlFor="valor">Valor *</Label>
          <Input
            id="valor"
            type="number"
            step="0.01"
            min="0"
            {...register('valor')}
            placeholder="0,00"
          />
          {errors.valor && (
            <p className="text-sm text-danger mt-1">{errors.valor.message}</p>
          )}
        </div>

        {/* Tipo */}
        <div>
          <Label>Tipo *</Label>
          <Select
            value={tipoTransacao}
            onValueChange={(value) => {
              setValue('tipo_transacao', value as 'receita' | 'despesa');
              setValue('categoria_id', ''); // Reset categoria ao mudar tipo
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="receita">Receita</SelectItem>
              <SelectItem value="despesa">Despesa</SelectItem>
            </SelectContent>
          </Select>
          {errors.tipo_transacao && (
            <p className="text-sm text-danger mt-1">{errors.tipo_transacao.message}</p>
          )}
        </div>

        {/* Categoria */}
        <div>
          <Label>Categoria *</Label>
          <Select
            value={watch('categoria_id')}
            onValueChange={(value) => setValue('categoria_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              {categoriasFiltradas.map((categoria) => (
                <SelectItem key={categoria.id} value={categoria.id}>
                  {categoria.nome_categoria}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.categoria_id && (
            <p className="text-sm text-danger mt-1">{errors.categoria_id.message}</p>
          )}
        </div>

        {/* Conta */}
        <div>
          <Label>Conta *</Label>
          <Select
            value={watch('conta_id')}
            onValueChange={(value) => setValue('conta_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a conta" />
            </SelectTrigger>
            <SelectContent>
              {contas.map((conta) => (
                <SelectItem key={conta.id} value={conta.id}>
                  {conta.nome_conta}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.conta_id && (
            <p className="text-sm text-danger mt-1">{errors.conta_id.message}</p>
          )}
        </div>

        {/* Data de Vencimento */}
        <div>
          <Label htmlFor="data_vencimento">Data de Vencimento *</Label>
          <Input
            id="data_vencimento"
            type="date"
            {...register('data_vencimento')}
          />
          {errors.data_vencimento && (
            <p className="text-sm text-danger mt-1">{errors.data_vencimento.message}</p>
          )}
        </div>

        {/* Status */}
        <div>
          <Label>Status *</Label>
          <Select
            value={statusTransacao}
            onValueChange={(value) => setValue('status', value as 'pendente' | 'pago' | 'cancelado')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="pago">Pago</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-sm text-danger mt-1">{errors.status.message}</p>
          )}
        </div>

        {/* Data de Pagamento (se status = pago) */}
        {statusTransacao === 'pago' && (
          <div>
            <Label htmlFor="data_pagamento">Data de Pagamento</Label>
            <Input
              id="data_pagamento"
              type="date"
              {...register('data_pagamento')}
            />
          </div>
        )}
      </div>

      {/* Observação */}
      <div>
        <Label htmlFor="observacao">Observação</Label>
        <Textarea
          id="observacao"
          {...register('observacao')}
          placeholder="Informações adicionais..."
          rows={3}
        />
      </div>

      {/* Recorrência */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            checked={recorrente}
            onCheckedChange={(checked) => setValue('recorrente', checked)}
          />
          <Label>Transação Recorrente</Label>
        </div>

        {recorrente && (
          <div>
            <Label>Frequência</Label>
            <Select
              value={watch('frequencia_recorrencia') || ''}
              onValueChange={(value) => setValue('frequencia_recorrencia', value as 'mensal' | 'semanal' | 'anual')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a frequência" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semanal">Semanal</SelectItem>
                <SelectItem value="mensal">Mensal</SelectItem>
                <SelectItem value="anual">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Botões */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : transacao ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
}