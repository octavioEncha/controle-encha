import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { 
  DollarSign, 
  TrendingUp, 
  Shield, 
  Smartphone,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user, perfil, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      // Aguardar um pouco para o perfil carregar se o usuário acabou de logar
      const timer = setTimeout(() => {
        if (perfil) {
          // Se tem perfil, vai direto para dashboard
          navigate('/dashboard');
        } else {
          // Se não tem perfil, vai para setup (só na primeira vez)
          navigate('/setup');
        }
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [user, perfil, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-success/5 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl mx-auto mb-4"></div>
          <div className="w-32 h-4 bg-primary/20 rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  // Se o usuário está logado, será redirecionado pelo useEffect
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-success/5 flex items-center justify-center">
        <div className="animate-pulse">Redirecionando...</div>
      </div>
    );
  }

  const features = [
    {
      icon: TrendingUp,
      title: 'Controle Completo',
      description: 'Acompanhe receitas, despesas e saldo em tempo real',
    },
    {
      icon: Shield,
      title: 'Segurança Total',
      description: 'Seus dados protegidos com criptografia avançada',
    },
    {
      icon: Smartphone,
      title: 'Acesso Móvel',
      description: 'Interface responsiva para todos os dispositivos',
    },
  ];

  const benefits = [
    'Dashboard interativo com métricas em tempo real',
    'Categorização automática de transações',
    'Relatórios financeiros detalhados',
    'Controle de vencimentos e alertas',
    'Modo pessoal e empresarial',
    'Backup automático na nuvem',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-success/5">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-success rounded-3xl mb-8 shadow-lg">
            <DollarSign className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
            ENCHA Controle
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Sistema completo de controle financeiro para pessoas físicas e empresas. 
            Gerencie suas finanças com inteligência e segurança.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="text-lg px-8 py-6"
            >
              Começar Agora
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/auth')}
              className="text-lg px-8 py-6"
            >
              Fazer Login
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Benefits Section */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold mb-4">
              Por que escolher o ENCHA?
            </CardTitle>
            <CardDescription className="text-lg">
              Funcionalidades poderosas para transformar sua gestão financeira
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-success shrink-0" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Button 
                size="lg"
                onClick={() => navigate('/auth')}
                className="px-12 py-6 text-lg"
              >
                Começar Gratuitamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
