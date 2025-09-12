import React, { useState, useEffect } from 'react';
import { useFinanceiro } from '@/hooks/useFinanceiro';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Plus, 
  Edit, 
  Trash2, 
  TrendingUp, 
  TrendingDown,
  Tags,
  Palette
} from 'lucide-react';
import { Categoria } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const categoriaSchema = z.object({
  nome_categoria: z.string().min(1, 'Nome é obrigatório'),
  tipo_categoria: z.enum(['receita', 'despesa']),
  cor_categoria: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor inválida'),
});

type CategoriaFormData = z.infer<typeof categoriaSchema>;

const coresPreDefinidas = [
  '#10B981', '#059669', '#047857', '#065F46', // Verdes
  '#EF4444', '#DC2626', '#B91C1C', '#991B1B', // Vermelhos
  '#3B82F6', '#2563EB', '#1D4ED8', '#1E40AF', // Azuis
  '#F59E0B', '#D97706', '#B45309', '#92400E', // Amarelos/Laranja
  '#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6', // Roxos
  '#06B6D4', '#0891B2', '#0E7490', '#155E75', // Ciano
];

export default function CategoriasList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { getCategorias } = useFinanceiro();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<Categoria | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CategoriaFormData>({
    resolver: zodResolver(categoriaSchema),
    defaultValues: {
      nome_categoria: '',
      tipo_categoria: 'despesa',
      cor_categoria: '#3B82F6',
    },
  });

  const corSelecionada = watch('cor_categoria');

  const carregarCategorias = async () => {
    try {
      setLoading(true);
      const data = await getCategorias();
      setCategorias(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar categorias.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarCategorias();
  }, []);

  const criarCategoria = async (data: CategoriaFormData) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('categorias')
      .insert({
        nome_categoria: data.nome_categoria,
        tipo_categoria: data.tipo_categoria,
        cor_categoria: data.cor_categoria,
        user_id: user.id,
      });
      
    if (error) throw error;
  };

  const atualizarCategoria = async (id: string, data: CategoriaFormData) => {
    const { error } = await supabase
      .from('categorias')
      .update(data)
      .eq('id', id)
      .eq('user_id', user?.id);
      
    if (error) throw error;
  };

  const excluirCategoria = async (id: string) => {
    // Verificar se há transações vinculadas
    const { data: transacoes } = await supabase
      .from('transacoes')
      .select('id')
      .eq('categoria_id', id)
      .limit(1);
      
    if (transacoes && transacoes.length > 0) {
      throw new Error('Não é possível excluir categoria com transações vinculadas');
    }

    const { error } = await supabase
      .from('categorias')
      .delete()
      .eq('id', id)
      .eq('user_id', user?.id);
      
    if (error) throw error;
  };

  const abrirModal = (categoria?: Categoria) => {
    if (categoria) {
      setCategoriaSelecionada(categoria);
      setModoEdicao(true);
      reset({
        nome_categoria: categoria.nome_categoria,
        tipo_categoria: categoria.tipo_categoria,
        cor_categoria: categoria.cor_categoria,
      });
    } else {
      setCategoriaSelecionada(null);
      setModoEdicao(false);
      reset({
        nome_categoria: '',
        tipo_categoria: 'despesa',
        cor_categoria: '#3B82F6',
      });
    }
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setCategoriaSelecionada(null);
    setModoEdicao(false);
    reset();
  };

  const onSubmit = async (data: CategoriaFormData) => {
    try {
      if (modoEdicao && categoriaSelecionada) {
        await atualizarCategoria(categoriaSelecionada.id, data);
        toast({
          title: "Sucesso",
          description: "Categoria atualizada com sucesso!",
        });
      } else {
        await criarCategoria(data);
        toast({
          title: "Sucesso",
          description: "Categoria criada com sucesso!",
        });
      }
      fecharModal();
      carregarCategorias();
    } catch (error: any) {
      console.error('Erro ao salvar categoria:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar categoria.",
        variant: "destructive",
      });
    }
  };

  const handleExcluir = async (id: string) => {
    try {
      await excluirCategoria(id);
      toast({
        title: "Sucesso",
        description: "Categoria excluída com sucesso!",
      });
      carregarCategorias();
    } catch (error: any) {
      console.error('Erro ao excluir categoria:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir categoria.",
        variant: "destructive",
      });
    }
  };

  const categoriasReceita = categorias.filter(c => c.tipo_categoria === 'receita');
  const categoriasDespesa = categorias.filter(c => c.tipo_categoria === 'despesa');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Categorias</h1>
          <p className="text-muted-foreground">
            Organize suas transações por categoria
          </p>
        </div>
        
        <Dialog open={modalAberto} onOpenChange={setModalAberto}>
          <DialogTrigger asChild>
            <Button onClick={() => abrirModal()}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {modoEdicao ? 'Editar Categoria' : 'Nova Categoria'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Nome */}
              <div>
                <Label htmlFor="nome_categoria">Nome *</Label>
                <Input
                  id="nome_categoria"
                  {...register('nome_categoria')}
                  placeholder="Ex: Alimentação, Salário..."
                />
                {errors.nome_categoria && (
                  <p className="text-sm text-danger mt-1">{errors.nome_categoria.message}</p>
                )}
              </div>

              {/* Tipo */}
              <div>
                <Label>Tipo *</Label>
                <Select
                  value={watch('tipo_categoria')}
                  onValueChange={(value) => setValue('tipo_categoria', value as 'receita' | 'despesa')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receita">Receita</SelectItem>
                    <SelectItem value="despesa">Despesa</SelectItem>
                  </SelectContent>
                </Select>
                {errors.tipo_categoria && (
                  <p className="text-sm text-danger mt-1">{errors.tipo_categoria.message}</p>
                )}
              </div>

              {/* Cor */}
              <div>
                <Label>Cor *</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Input
                      type="color"
                      {...register('cor_categoria')}
                      className="w-16 h-10"
                    />
                    <div 
                      className="w-10 h-10 rounded border-2 border-muted"
                      style={{ backgroundColor: corSelecionada }}
                    />
                    <Input
                      {...register('cor_categoria')}
                      placeholder="#3B82F6"
                      className="flex-1"
                    />
                  </div>
                  
                  <div className="grid grid-cols-8 gap-2">
                    {coresPreDefinidas.map((cor) => (
                      <button
                        key={cor}
                        type="button"
                        onClick={() => setValue('cor_categoria', cor)}
                        className={`w-8 h-8 rounded border-2 ${
                          corSelecionada === cor ? 'border-foreground' : 'border-muted'
                        }`}
                        style={{ backgroundColor: cor }}
                      />
                    ))}
                  </div>
                </div>
                {errors.cor_categoria && (
                  <p className="text-sm text-danger mt-1">{errors.cor_categoria.message}</p>
                )}
              </div>

              {/* Botões */}
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={fecharModal}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {modoEdicao ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categorias de Receita */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-success">
            <TrendingUp className="w-5 h-5 mr-2" />
            Receitas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {categoriasReceita.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Tags className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma categoria de receita encontrada</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => abrirModal()}
                className="mt-3"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar categoria
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoriasReceita.map((categoria) => (
                <div 
                  key={categoria.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-8 h-8 rounded-lg"
                        style={{ backgroundColor: categoria.cor_categoria }}
                      />
                      <div>
                        <h3 className="font-medium">{categoria.nome_categoria}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-success border-success">
                            Receita
                          </Badge>
                          {categoria.is_default && (
                            <Badge variant="secondary">Padrão</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => abrirModal(categoria)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    {!categoria.is_default && (
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
                              Tem certeza que deseja excluir a categoria "{categoria.nome_categoria}"?
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleExcluir(categoria.id)}
                              className="bg-danger text-danger-foreground hover:bg-danger/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Categorias de Despesa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-danger">
            <TrendingDown className="w-5 h-5 mr-2" />
            Despesas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {categoriasDespesa.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Tags className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma categoria de despesa encontrada</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => abrirModal()}
                className="mt-3"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar categoria
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoriasDespesa.map((categoria) => (
                <div 
                  key={categoria.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-8 h-8 rounded-lg"
                        style={{ backgroundColor: categoria.cor_categoria }}
                      />
                      <div>
                        <h3 className="font-medium">{categoria.nome_categoria}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-danger border-danger">
                            Despesa
                          </Badge>
                          {categoria.is_default && (
                            <Badge variant="secondary">Padrão</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => abrirModal(categoria)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    {!categoria.is_default && (
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
                              Tem certeza que deseja excluir a categoria "{categoria.nome_categoria}"?
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleExcluir(categoria.id)}
                              className="bg-danger text-danger-foreground hover:bg-danger/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
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