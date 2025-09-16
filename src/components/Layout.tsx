import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import ThemeToggle from '@/components/ThemeToggle';
import {
  Menu,
  Home,
  CreditCard,
  Tags,
  PieChart,
  Settings,
  LogOut,
  DollarSign,
  User,
  Building2
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  const { user, perfil, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao fazer logout.",
        variant: "destructive",
      });
    }
  };

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'transacoes', name: 'Transações', icon: CreditCard },
    { id: 'categorias', name: 'Categorias', icon: Tags },
    { id: 'relatorios', name: 'Relatórios', icon: PieChart },
    { id: 'configuracoes', name: 'Configurações', icon: Settings },
  ];

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Header do Sidebar */}
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-success rounded-xl flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg">ENCHA</h2>
            <p className="text-xs text-muted-foreground">Controle Financeiro</p>
          </div>
        </div>
      </div>

      {/* Perfil */}
      <div className="p-4 border-b">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            perfil?.tipo_perfil === 'empresarial' ? 'bg-success/10' : 'bg-primary/10'
          }`}>
            {perfil?.tipo_perfil === 'empresarial' ? (
              <Building2 className="w-4 h-4 text-success" />
            ) : (
              <User className="w-4 h-4 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">
              {perfil?.tipo_perfil === 'empresarial' && perfil.nome_empresa
                ? perfil.nome_empresa
                : perfil?.nome_completo || 'Usuário'}
            </p>
            <p className="text-xs text-muted-foreground">
              {perfil?.tipo_perfil === 'empresarial' ? 'Empresarial' : 'Pessoal'}
            </p>
          </div>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <li key={item.id}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={`w-full justify-start ${
                    isActive ? 'bg-primary/10 text-primary hover:bg-primary/20' : ''
                  }`}
                  onClick={() => {
                    onTabChange(item.id);
                    setSidebarOpen(false); // Fechar sidebar no mobile
                  }}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.name}
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Tema</span>
          <ThemeToggle />
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-danger hover:text-danger hover:bg-danger/10"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sair
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-72 lg:overflow-y-auto lg:bg-card lg:border-r">
        <NavContent />
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4 border-b bg-card">
          <div className="flex items-center space-x-3">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                <NavContent />
              </SheetContent>
            </Sheet>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-success rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold">ENCHA</span>
            </div>
          </div>
          
          <div className="flex items-center">
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="lg:pl-72">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}