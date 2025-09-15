import React, { useState, useEffect } from 'react';
import { useFinanceiro } from '@/hooks/useFinanceiro';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Eye
} from 'lucide-react';
import { Transacao, Categoria } from '@/types/database';
import { formatCurrency, formatDateForInput } from '@/utils/formatters';
import TransacaoForm from './TransacaoForm';

export default function TransacoesList() {
  const { toast } = useToast();
  const { getTransacoes, getCategorias, excluirTransacao } = useFinanceiro();
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    busca: '',
    categoria_id: 'todas',
    tipo_transacao: 'todos',
    status: 'todos',
    data_inicio: '',
    data_fim: '',
  });
  const [transacaoSelecionada, setTransacaoSelecionada] = useState<Transacao | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);

  const carregarTransacoes = async () => {
    try {
      setLoading(true);
      const filtrosLimpos = Object.fromEntries(
        Object.entries(filtros).filter(([key, value]) => {
          // Manter apenas filtros com valores válidos
          if (key === 'busca' && value !== '') return true;
          if (key === 'categoria_id' && value !== 'todas' && value !== '') return true;
          if (key === 'tipo_transacao' && value !== 'todos' && value !== '') return true;
          if (key === 'status' && value !== 'todos' && value !== '') return true;
          if ((key === 'data_inicio' || key === 'data_fim') && value !== '') return true;
          return false;
        })
      );
      const data = await getTransacoes(filtrosLimpos);
      setTransacoes(data);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar transações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const carregarDados = async () => {
      const categoriasData = await getCategorias();
      setCategorias(categoriasData);
    };
    carregarDados();
  }, []);

  useEffect(() => {
    carregarTransacoes();
  }, [filtros]);

  const handleExcluir = async (id: string) => {
    try {
      await excluirTransacao(id);
      toast({
        title: "Sucesso",
        description: "Transação excluída com sucesso!",
      });
      carregarTransacoes();
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir transação.",
        variant: "destructive",
      });
    }
  };

  const abrirModal = (transacao?: Transacao) => {
    setTransacaoSelecionada(transacao || null);
    setModoEdicao(!!transacao);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setTransacaoSelecionada(null);
    setModoEdicao(false);
    carregarTransacoes();
  };

  const limparFiltros = () => {
    setFiltros({
      busca: '',
      categoria_id: 'todas',
      tipo_transacao: 'todos',
      status: 'todos',
      data_inicio: '',
      data_fim: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Transações</h1>
          <p className="text-muted-foreground">
            Gerencie suas receitas e despesas
          </p>
        </div>
        
        <Dialog open={modalAberto} onOpenChange={setModalAberto}>
          <DialogTrigger asChild>
            <Button onClick={() => abrirModal()}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Transação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {modoEdicao ? 'Editar Transação' : 'Nova Transação'}
              </DialogTitle>
            </DialogHeader>
            <TransacaoForm
              transacao={transacaoSelecionada}
              onSubmit={fecharModal}
              onCancel={() => setModalAberto(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Filter className="w-5 h-5 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Busca */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar transações..."
                  value={filtros.busca}
                  onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Categoria */}
            <div>
              <Select
                value={filtros.categoria_id}
                onValueChange={(value) => setFiltros(prev => ({ ...prev, categoria_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria.id} value={categoria.id}>
                      {categoria.nome_categoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipo */}
            <div>
              <Select
                value={filtros.tipo_transacao}
                onValueChange={(value) => setFiltros(prev => ({ ...prev, tipo_transacao: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div>
              <Select
                value={filtros.status}
                onValueChange={(value) => setFiltros(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Período */}
            <div className="lg:col-span-2 flex space-x-2">
              <Input
                type="date"
                value={filtros.data_inicio}
                onChange={(e) => setFiltros(prev => ({ ...prev, data_inicio: e.target.value }))}
                placeholder="Data início"
              />
              <Input
                type="date"
                value={filtros.data_fim}
                onChange={(e) => setFiltros(prev => ({ ...prev, data_fim: e.target.value }))}
                placeholder="Data fim"
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={limparFiltros}>
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Transações */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando transações...</p>
            </div>
          ) : transacoes.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Nenhuma transação encontrada</p>
              <p className="mb-4">Comece criando sua primeira transação</p>
              <Button onClick={() => abrirModal()}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Transação
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {transacoes.map((transacao) => (
                <div 
                  key={transacao.id}
                  className="p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Ícone do Tipo */}
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        transacao.tipo_transacao === 'receita' 
                          ? 'bg-success/10' 
                          : 'bg-danger/10'
                      }`}>
                        {transacao.tipo_transacao === 'receita' ? (
                          <TrendingUp className="w-6 h-6 text-success" />
                        ) : (
                          <TrendingDown className="w-6 h-6 text-danger" />
                        )}
                      </div>

                      {/* Informações */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-lg">
                            {transacao.descricao}
                          </h3>
                          <Badge 
                            variant={transacao.status === 'pago' ? 'default' : 
                                   transacao.status === 'pendente' ? 'secondary' : 'destructive'}
                          >
                            {transacao.status === 'pago' ? 'Pago' : 
                             transacao.status === 'pendente' ? 'Pendente' : 'Cancelado'}
                          </Badge>
                          {transacao.recorrente && (
                            <Badge variant="outline">
                              Recorrente
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>
                            {transacao.categoria?.nome_categoria}
                          </span>
                          <span>•</span>
                          <span>
                            {transacao.conta?.nome_conta}
                          </span>
                          <span>•</span>
                          <span>
                            Vencimento: {new Date(transacao.data_vencimento).toLocaleDateString('pt-BR')}
                          </span>
                          {transacao.data_pagamento && (
                            <>
                              <span>•</span>
                              <span>
                                Pago: {new Date(transacao.data_pagamento).toLocaleDateString('pt-BR')}
                              </span>
                            </>
                          )}
                        </div>
                        {transacao.observacao && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {transacao.observacao}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Valor e Ações */}
                    <div className="text-right">
                      <p className={`text-2xl font-bold mb-2 ${
                        transacao.tipo_transacao === 'receita' 
                          ? 'text-success' 
                          : 'text-danger'
                      }`}>
                        {transacao.tipo_transacao === 'receita' ? '+' : '-'}
                        {formatCurrency(transacao.valor)}
                      </p>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => abrirModal(transacao)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4 text-danger" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir a transação "{transacao.descricao}"?
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleExcluir(transacao.id)}
                                className="bg-danger text-danger-foreground hover:bg-danger/90"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}