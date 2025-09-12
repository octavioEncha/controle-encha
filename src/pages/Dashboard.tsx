import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';
import TransacoesList from '@/components/TransacoesList';
import CategoriasList from '@/components/CategoriasList';
import Relatorios from '@/components/Relatorios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const { user, perfil } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleNovaTransacao = () => {
    setActiveTab('transacoes');
    // TODO: Abrir modal de nova transação
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNovaTransacao={handleNovaTransacao} />;
      
      case 'transacoes':
        return <TransacoesList />;
      
      case 'categorias':
        return <CategoriasList />;
      
      case 'relatorios':
        return <Relatorios />;
      
      case 'configuracoes':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Configurações</h1>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Configurações da Conta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Informações do Perfil</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Tipo:</span>{' '}
                        {perfil?.tipo_perfil === 'empresarial' ? 'Empresarial' : 'Pessoal'}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Nome:</span>{' '}
                        {perfil?.nome_completo || 'Não informado'}
                      </div>
                      {perfil?.tipo_perfil === 'empresarial' && (
                        <div>
                          <span className="text-muted-foreground">Empresa:</span>{' '}
                          {perfil?.nome_empresa || 'Não informado'}
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground">Email:</span>{' '}
                        {user?.email}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      default:
        return <Dashboard onNovaTransacao={handleNovaTransacao} />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}