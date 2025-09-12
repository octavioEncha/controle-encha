import React, { useState, useEffect } from 'react';
import { useFinanceiro } from '@/hooks/useFinanceiro';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  PieChart, 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Download,
  Filter
} from 'lucide-react';
import { Transacao, Categoria } from '@/types/database';
import { formatCurrency } from '@/utils/formatters';

interface RelatorioPorCategoria {
  categoria: string;
  valor: number;
  count: number;
  percentual: number;
}

interface RelatorioMensal {
  mes: string;
  receitas: number;
  despesas: number;
  saldo: number;
}

export default function Relatorios() {
  const { toast } = useToast();
  const { getTransacoes, getCategorias } = useFinanceiro();
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtroMes, setFiltroMes] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [transacoesData, categoriasData] = await Promise.all([
        getTransacoes(),
        getCategorias()
      ]);
      setTransacoes(transacoesData);
      setCategorias(categoriasData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados dos relatórios.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Filtrar transações por mês
  const transacoesFiltradas = transacoes.filter(t => {
    const dataTransacao = new Date(t.data_vencimento);
    const anoMes = `${dataTransacao.getFullYear()}-${String(dataTransacao.getMonth() + 1).padStart(2, '0')}`;
    return anoMes === filtroMes;
  });

  // Relatório por categoria
  const relatorioPorCategoria = (): { receitas: RelatorioPorCategoria[], despesas: RelatorioPorCategoria[] } => {
    const receitasPorCategoria: { [key: string]: { valor: number, count: number } } = {};
    const despesasPorCategoria: { [key: string]: { valor: number, count: number } } = {};

    let totalReceitas = 0;
    let totalDespesas = 0;

    transacoesFiltradas.forEach(t => {
      if (t.status !== 'pago') return;

      const nomeCategoria = t.categoria?.nome_categoria || 'Sem categoria';
      
      if (t.tipo_transacao === 'receita') {
        totalReceitas += Number(t.valor);
        if (!receitasPorCategoria[nomeCategoria]) {
          receitasPorCategoria[nomeCategoria] = { valor: 0, count: 0 };
        }
        receitasPorCategoria[nomeCategoria].valor += Number(t.valor);
        receitasPorCategoria[nomeCategoria].count += 1;
      } else if (t.tipo_transacao === 'despesa') {
        totalDespesas += Number(t.valor);
        if (!despesasPorCategoria[nomeCategoria]) {
          despesasPorCategoria[nomeCategoria] = { valor: 0, count: 0 };
        }
        despesasPorCategoria[nomeCategoria].valor += Number(t.valor);
        despesasPorCategoria[nomeCategoria].count += 1;
      }
    });

    const receitas = Object.entries(receitasPorCategoria).map(([categoria, dados]) => ({
      categoria,
      valor: dados.valor,
      count: dados.count,
      percentual: totalReceitas > 0 ? (dados.valor / totalReceitas) * 100 : 0,
    })).sort((a, b) => b.valor - a.valor);

    const despesas = Object.entries(despesasPorCategoria).map(([categoria, dados]) => ({
      categoria,
      valor: dados.valor,
      count: dados.count,
      percentual: totalDespesas > 0 ? (dados.valor / totalDespesas) * 100 : 0,
    })).sort((a, b) => b.valor - a.valor);

    return { receitas, despesas };
  };

  // Evolução mensal (últimos 6 meses)
  const evolucaoMensal = (): RelatorioMensal[] => {
    const meses: RelatorioMensal[] = [];
    const hoje = new Date();

    for (let i = 5; i >= 0; i--) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const anoMes = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      
      const transacoesMes = transacoes.filter(t => {
        const dataTransacao = new Date(t.data_vencimento);
        const anoMesTransacao = `${dataTransacao.getFullYear()}-${String(dataTransacao.getMonth() + 1).padStart(2, '0')}`;
        return anoMesTransacao === anoMes && t.status === 'pago';
      });

      const receitas = transacoesMes
        .filter(t => t.tipo_transacao === 'receita')
        .reduce((sum, t) => sum + Number(t.valor), 0);

      const despesas = transacoesMes
        .filter(t => t.tipo_transacao === 'despesa')
        .reduce((sum, t) => sum + Number(t.valor), 0);

      meses.push({
        mes: data.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        receitas,
        despesas,
        saldo: receitas - despesas,
      });
    }

    return meses;
  };

  const exportarCSV = () => {
    const csvContent = [
      ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor', 'Status'].join(','),
      ...transacoesFiltradas.map(t => [
        new Date(t.data_vencimento).toLocaleDateString('pt-BR'),
        t.descricao,
        t.categoria?.nome_categoria || '',
        t.tipo_transacao,
        t.valor.toString().replace('.', ','),
        t.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio-${filtroMes}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Sucesso",
      description: "Relatório exportado com sucesso!",
    });
  };

  const { receitas: receitasPorCategoria, despesas: despesasPorCategoria } = relatorioPorCategoria();
  const dadosEvolucao = evolucaoMensal();

  const resumoMes = transacoesFiltradas.reduce(
    (acc, t) => {
      if (t.status === 'pago') {
        if (t.tipo_transacao === 'receita') {
          acc.receitas += Number(t.valor);
        } else if (t.tipo_transacao === 'despesa') {
          acc.despesas += Number(t.valor);
        }
      }
      return acc;
    },
    { receitas: 0, despesas: 0 }
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Relatórios</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6 animate-pulse">
                <div className="h-40 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground">
            Análise detalhada das suas finanças
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filtroMes} onValueChange={setFiltroMes}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => {
                  const data = new Date();
                  data.setMonth(data.getMonth() - i);
                  const valor = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
                  const label = data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
                  return (
                    <SelectItem key={valor} value={valor}>
                      {label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          
          <Button variant="outline" onClick={exportarCSV}>
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Resumo Mensal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Receitas
                </p>
                <p className="text-2xl font-bold text-success">
                  {formatCurrency(resumoMes.receitas)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-danger">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Despesas
                </p>
                <p className="text-2xl font-bold text-danger">
                  {formatCurrency(resumoMes.despesas)}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-danger" />
            </div>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${
          resumoMes.receitas - resumoMes.despesas >= 0 ? 'border-l-success' : 'border-l-danger'
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Saldo do Mês
                </p>
                <p className={`text-2xl font-bold ${
                  resumoMes.receitas - resumoMes.despesas >= 0 ? 'text-success' : 'text-danger'
                }`}>
                  {formatCurrency(resumoMes.receitas - resumoMes.despesas)}
                </p>
              </div>
              <div className={`w-8 h-8 ${
                resumoMes.receitas - resumoMes.despesas >= 0 ? 'text-success' : 'text-danger'
              }`}>
                {resumoMes.receitas - resumoMes.despesas >= 0 ? (
                  <TrendingUp className="w-8 h-8" />
                ) : (
                  <TrendingDown className="w-8 h-8" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Relatórios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receitas por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-success">
              <PieChart className="w-5 h-5 mr-2" />
              Receitas por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            {receitasPorCategoria.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhuma receita encontrada no período</p>
              </div>
            ) : (
              <div className="space-y-4">
                {receitasPorCategoria.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{item.categoria}</span>
                        <span className="text-sm text-success font-semibold">
                          {formatCurrency(item.valor)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div 
                            className="bg-success h-2 rounded-full"
                            style={{ width: `${item.percentual}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {item.percentual.toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.count} transaç{item.count === 1 ? 'ão' : 'ões'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Despesas por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-danger">
              <PieChart className="w-5 h-5 mr-2" />
              Despesas por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            {despesasPorCategoria.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhuma despesa encontrada no período</p>
              </div>
            ) : (
              <div className="space-y-4">
                {despesasPorCategoria.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{item.categoria}</span>
                        <span className="text-sm text-danger font-semibold">
                          {formatCurrency(item.valor)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div 
                            className="bg-danger h-2 rounded-full"
                            style={{ width: `${item.percentual}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {item.percentual.toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.count} transaç{item.count === 1 ? 'ão' : 'ões'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Evolução Mensal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Evolução Mensal (Últimos 6 Meses)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dadosEvolucao.map((mes, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold capitalize">{mes.mes}</h4>
                  <Badge 
                    variant={mes.saldo >= 0 ? 'default' : 'destructive'}
                    className={mes.saldo >= 0 ? 'bg-success' : ''}
                  >
                    {mes.saldo >= 0 ? 'Positivo' : 'Negativo'}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Receitas</p>
                    <p className="font-semibold text-success">
                      {formatCurrency(mes.receitas)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Despesas</p>
                    <p className="font-semibold text-danger">
                      {formatCurrency(mes.despesas)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Saldo</p>
                    <p className={`font-semibold ${mes.saldo >= 0 ? 'text-success' : 'text-danger'}`}>
                      {formatCurrency(mes.saldo)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}