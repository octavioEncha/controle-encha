import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Building2 } from 'lucide-react';

export default function SetupPerfil() {
  const navigate = useNavigate();
  const { user, updatePerfil } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [perfil, setPerfil] = useState({
    tipo_perfil: 'pessoal' as 'pessoal' | 'empresarial',
    nome_completo: '',
    nome_empresa: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    // Validações
    if (perfil.tipo_perfil === 'pessoal' && !perfil.nome_completo.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, informe seu nome completo.",
        variant: "destructive",
      });
      return;
    }
    
    if (perfil.tipo_perfil === 'empresarial' && (!perfil.nome_completo.trim() || !perfil.nome_empresa.trim())) {
      toast({
        title: "Erro",
        description: "Por favor, informe seu nome e o nome da empresa.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Criar perfil do usuário
      await updatePerfil(perfil);
      
      // Criar categorias padrão
      await supabase.rpc('criar_categorias_padrao', {
        p_user_id: user.id,
        p_tipo_perfil: perfil.tipo_perfil
      });
      
      // Criar conta padrão
      await supabase.rpc('criar_conta_padrao', {
        p_user_id: user.id,
        p_tipo_perfil: perfil.tipo_perfil
      });
      
      toast({
        title: "Sucesso!",
        description: "Perfil configurado com sucesso!",
      });
      
      navigate('/');
    } catch (error: any) {
      console.error('Erro ao configurar perfil:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao configurar perfil. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-success/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Configure seu Perfil</CardTitle>
          <CardDescription>
            Personalize sua experiência financeira
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tipo de Perfil */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Tipo de Perfil</Label>
              <RadioGroup
                value={perfil.tipo_perfil}
                onValueChange={(value: 'pessoal' | 'empresarial') => 
                  setPerfil(prev => ({ ...prev, tipo_perfil: value }))
                }
                className="grid grid-cols-1 gap-4"
              >
                <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="pessoal" id="pessoal" />
                  <Label 
                    htmlFor="pessoal" 
                    className="flex-1 flex items-center space-x-3 cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">Pessoal</div>
                      <div className="text-sm text-muted-foreground">
                        Para controle das suas finanças pessoais
                      </div>
                    </div>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="empresarial" id="empresarial" />
                  <Label 
                    htmlFor="empresarial" 
                    className="flex-1 flex items-center space-x-3 cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <div className="font-semibold">Empresarial</div>
                      <div className="text-sm text-muted-foreground">
                        Para gestão financeira da sua empresa
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            {/* Campos do formulário */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome_completo">
                  {perfil.tipo_perfil === 'pessoal' ? 'Nome Completo' : 'Seu Nome'}
                </Label>
                <Input
                  id="nome_completo"
                  type="text"
                  placeholder={perfil.tipo_perfil === 'pessoal' ? 'João Silva' : 'João Silva'}
                  value={perfil.nome_completo}
                  onChange={(e) => setPerfil(prev => ({ ...prev, nome_completo: e.target.value }))}
                  disabled={loading}
                />
              </div>
              
              {perfil.tipo_perfil === 'empresarial' && (
                <div className="space-y-2">
                  <Label htmlFor="nome_empresa">Nome da Empresa</Label>
                  <Input
                    id="nome_empresa"
                    type="text"
                    placeholder="Minha Empresa Ltda"
                    value={perfil.nome_empresa}
                    onChange={(e) => setPerfil(prev => ({ ...prev, nome_empresa: e.target.value }))}
                    disabled={loading}
                  />
                </div>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Configurando...
                </>
              ) : (
                'Finalizar Configuração'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}