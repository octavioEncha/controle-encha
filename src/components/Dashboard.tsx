import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFinanceiro } from '@/hooks/useFinanceiro';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Plus,
  Eye,
  Calendar
} from 'lucide-react';
import { ResumoFinanceiro, Transacao } from '@/types/database';
import { formatCurrency } from '@/utils/formatters';

interface DashboardProps {
  onNovaTransacao: () => void;
}

export default function Dashboard({ onNovaTransacao }: DashboardProps) {
  const { perfil } = useAuth();
  const { getResumoFinanceiro, getTransacoes } = useFinanceiro();
  const [resumo, setResumo] = useState<ResumoFinanceiro | null>(null);
  const [transacoesRecentes, setTransacoesRecentes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        const [resumoData, transacoesData] = await Promise.all([
          getResumoFinanceiro(),
          getTransacoes({ limite: 5 })
        ]);
        
        setResumo(resumoData);
        setTransacoesRecentes(transacoesData);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const saudacao = () => {
    const hora = new Date().getHours();
    if (hora < 12) return 'Bom dia';
    if (hora < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getNomeDisplay = () => {
    if (perfil?.tipo_perfil === 'empresarial' && perfil.nome_empresa) {
      return perfil.nome_empresa;
    }
    return perfil?.nome_completo?.split(' ')[0] || 'Usuário';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {saudacao()}, {getNomeDisplay()}!
          </h1>
          <p className="text-muted-foreground">
            Aqui está um resumo das suas finanças
          </p>
        </div>
        <Button onClick={onNovaTransacao} className="shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          Nova Transação
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Saldo Total */}
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Saldo Total
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(resumo?.saldo_total || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Receitas do Mês */}
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Receitas do Mês
                </p>
                <p className="text-2xl font-bold text-success">
                  {formatCurrency(resumo?.receitas_mes || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Despesas do Mês */}
        <Card className="border-l-4 border-l-danger">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Despesas do Mês
                </p>
                <p className="text-2xl font-bold text-danger">
                  {formatCurrency(resumo?.despesas_mes || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-danger/10 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-danger" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Balanço Mensal */}
        <Card className={`border-l-4 ${
          (resumo?.balanco_mes || 0) >= 0 ? 'border-l-success' : 'border-l-danger'
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Balanço Mensal
                </p>
                <p className={`text-2xl font-bold ${
                  (resumo?.balanco_mes || 0) >= 0 ? 'text-success' : 'text-danger'
                }`}>
                  {formatCurrency(resumo?.balanco_mes || 0)}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                (resumo?.balanco_mes || 0) >= 0 ? 'bg-success/10' : 'bg-danger/10'
              }`}>
                {(resumo?.balanco_mes || 0) >= 0 ? (
                  <TrendingUp className="w-6 h-6 text-success" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-danger" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas e Transações Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alertas */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Clock className="w-5 h-5 mr-2 text-warning" />
              Pendências
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg border border-warning/20">
                <div>
                  <p className="font-medium text-sm">Transações Pendentes</p>
                  <p className="text-xs text-muted-foreground">
                    Aguardando pagamento
                  </p>
                </div>
                <Badge variant="outline" className="bg-warning/20 text-warning border-warning/30">
                  {resumo?.transacoes_pendentes || 0}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
                <div>
                  <p className="font-medium text-sm">Vencimentos Hoje</p>
                  <p className="text-xs text-muted-foreground">
                    Verifique suas contas
                  </p>
                </div>
                <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
                  <Calendar className="w-3 h-3 mr-1" />
                  0
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transações Recentes */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Transações Recentes</CardTitle>
              <Button variant="ghost" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Ver Todas
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {transacoesRecentes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhuma transação encontrada</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onNovaTransacao}
                  className="mt-3"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar primeira transação
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {transacoesRecentes.map((transacao) => (
                  <div 
                    key={transacao.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        transacao.tipo_transacao === 'receita' 
                          ? 'bg-success/10' 
                          : 'bg-danger/10'
                      }`}>
                        {transacao.tipo_transacao === 'receita' ? (
                          <TrendingUp className="w-5 h-5 text-success" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-danger" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {transacao.descricao}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {transacao.categoria?.nome_categoria} • {' '}
                          {new Date(transacao.data_vencimento).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transacao.tipo_transacao === 'receita' 
                          ? 'text-success' 
                          : 'text-danger'
                      }`}>
                        {transacao.tipo_transacao === 'receita' ? '+' : '-'}
                        {formatCurrency(transacao.valor)}
                      </p>
                      <Badge 
                        variant={transacao.status === 'pago' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {transacao.status === 'pago' ? 'Pago' : 
                         transacao.status === 'pendente' ? 'Pendente' : 'Cancelado'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}