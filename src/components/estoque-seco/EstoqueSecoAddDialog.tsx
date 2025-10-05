import React, { useState } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from '@/hooks/use-toast';
import { ChevronDown, BarChart3, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NewItem {
  nome: string;
  quantidade: number;
  unidade: string;
  categoria: string;
  minimo: number;
  unidade_item: 'juazeiro_norte' | 'fortaleza';
  data_validade?: string;
  fornecedor?: string;
  batch_number?: string;
  // Campos ABC
  unit_cost?: number;
  annual_demand?: number;
  ordering_cost?: number;
  carrying_cost_percentage?: number;
  lead_time_days?: number;
}

interface EstoqueSecoAddDialogProps {
  newItem: NewItem;
  setNewItem: (item: NewItem) => void;
  onAddNewItem: () => void;
  setDialogOpen: (open: boolean) => void;
  categorias: string[];
  selectedUnidade?: 'juazeiro_norte' | 'fortaleza' | 'todas';
}

export function EstoqueSecoAddDialog({
  newItem,
  setNewItem,
  onAddNewItem,
  setDialogOpen,
  categorias,
  selectedUnidade
}: EstoqueSecoAddDialogProps) {
  const [abcSectionOpen, setAbcSectionOpen] = useState(false);
  const isFormValid = newItem.nome.trim() !== '' && newItem.categoria !== '';

  const handleQuantidadeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (value === '') {
      setNewItem({...newItem, quantidade: 0});
      return;
    }
    
    const numValue = parseInt(value, 10);
    
    if (!isNaN(numValue) && numValue >= 0) {
      setNewItem({...newItem, quantidade: numValue});
    }
  };

  const handleMinimoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setNewItem({...newItem, minimo: 0});
    } else {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue >= 0) {
        setNewItem({...newItem, minimo: numValue});
      }
    }
  };

  const handleAddItem = () => {
    if (!newItem.nome.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, digite o nome do item.",
        variant: "destructive",
      });
      return;
    }
    
    if (!newItem.categoria) {
      toast({
        title: "Categoria obrigatória",
        description: "Por favor, selecione uma categoria.",
        variant: "destructive",
      });
      return;
    }
    
    const quantidadeValidada = Number(newItem.quantidade);
    
    const itemValidado = {
      ...newItem,
      quantidade: quantidadeValidada
    };
    
    setNewItem(itemValidado);
    
    try {
      onAddNewItem();
    } catch (error) {
      console.error('Erro ao chamar onAddNewItem:', error);
      toast({
        title: "Erro ao adicionar item",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden flex flex-col" aria-describedby="dialog-description">
      <DialogHeader className="flex-shrink-0">
        <DialogTitle>Adicionar Novo Item</DialogTitle>
        <DialogDescription id="dialog-description">
          Preencha os dados do novo item do estoque seco para adicionar ao inventário
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 overflow-y-auto pr-2 flex-1" style={{ maxHeight: 'calc(85vh - 140px)' }}>
        <div className="space-y-2">
          <Label htmlFor="nome">Nome do Item *</Label>
          <Input
            id="nome"
            placeholder="Ex: Arroz, Feijão, Óleo..."
            value={newItem.nome}
            onChange={(e) => setNewItem({...newItem, nome: e.target.value})}
            className={!newItem.nome.trim() ? 'border-red-300' : ''}
            aria-describedby={!newItem.nome.trim() ? 'nome-error' : undefined}
          />
          {!newItem.nome.trim() && (
            <p id="nome-error" className="text-xs text-red-500" role="alert">
              Nome é obrigatório
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="quantidade">Quantidade em Estoque</Label>
          <Input
            id="quantidade"
            type="number"
            min="0"
            step="1"
            placeholder="Digite a quantidade"
            value={newItem.quantidade === 0 ? '' : newItem.quantidade.toString()}
            onChange={handleQuantidadeChange}
            aria-describedby="quantidade-help"
          />
          <p id="quantidade-help" className="text-xs text-gray-500">
            Você pode adicionar com quantidade zero para registrar o item no estoque
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="unidade">Unidade de Medida</Label>
          <Select 
            value={newItem.unidade}
            onValueChange={(value) => setNewItem({...newItem, unidade: value})}
          >
            <SelectTrigger id="unidade">
              <SelectValue placeholder="Selecione a unidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kg">Quilogramas (kg)</SelectItem>
              <SelectItem value="unidades">Unidades</SelectItem>
              <SelectItem value="pacotes">Pacotes</SelectItem>
              <SelectItem value="litros">Litros</SelectItem>
              <SelectItem value="latas">Latas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="categoria">Categoria do Item *</Label>
          <Select 
            value={newItem.categoria}
            onValueChange={(value) => setNewItem({...newItem, categoria: value})}
          >
            <SelectTrigger 
              id="categoria"
              className={!newItem.categoria ? 'border-red-300' : ''}
              aria-describedby={!newItem.categoria ? 'categoria-error' : undefined}
            >
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              {categorias.slice(1).map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!newItem.categoria && (
            <p id="categoria-error" className="text-xs text-red-500" role="alert">
              Categoria é obrigatória
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="minimo">Estoque Mínimo</Label>
          <Input
            id="minimo"
            type="number"
            min="0"
            step="1"
            placeholder="Digite o estoque mínimo (pode ser 0)"
            value={newItem.minimo === 0 ? '' : newItem.minimo.toString()}
            onChange={handleMinimoChange}
            aria-describedby="minimo-help"
          />
          <p id="minimo-help" className="text-xs text-gray-500">
            Quando o estoque atingir esta quantidade, será exibido um alerta
          </p>
        </div>

        {selectedUnidade === 'todas' && (
          <div className="space-y-2">
            <Label htmlFor="unidade_item">Unidade</Label>
            <Select 
              value={newItem.unidade_item}
              onValueChange={(value: 'juazeiro_norte' | 'fortaleza') => setNewItem({...newItem, unidade_item: value})}
            >
              <SelectTrigger id="unidade_item">
                <SelectValue placeholder="Selecione a unidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="juazeiro_norte">Juazeiro do Norte</SelectItem>
                <SelectItem value="fortaleza">Fortaleza</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="data_validade">Data de Validade ⚠️</Label>
          <Input
            id="data_validade"
            type="date"
            value={newItem.data_validade || ''}
            onChange={(e) => setNewItem({...newItem, data_validade: e.target.value})}
            aria-describedby="validade-help"
            className="cursor-pointer"
          />
          <p id="validade-help" className="text-xs text-gray-500">
            Importante para alertas de vencimento automáticos
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="fornecedor">Fornecedor (Opcional)</Label>
          <Input
            id="fornecedor"
            placeholder="Nome do fornecedor"
            value={newItem.fornecedor || ''}
            onChange={(e) => setNewItem({...newItem, fornecedor: e.target.value})}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="batch_number">Número do Lote (Opcional)</Label>
          <Input
            id="batch_number"
            placeholder="Ex: L2025-001"
            value={newItem.batch_number || ''}
            onChange={(e) => setNewItem({...newItem, batch_number: e.target.value})}
          />
        </div>
        
        {/* Seção ABC - Análise de Inventário */}
        <Collapsible
          open={abcSectionOpen}
          onOpenChange={setAbcSectionOpen}
          className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50/50"
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between p-0 hover:bg-transparent"
              type="button"
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-900">
                  📊 Dados para Análise ABC (Opcional)
                </span>
              </div>
              <ChevronDown
                className={`h-5 w-5 text-blue-600 transition-transform ${
                  abcSectionOpen ? 'rotate-180' : ''
                }`}
              />
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-4 mt-4">
            <div className="bg-blue-100 border border-blue-300 rounded-md p-3 mb-4">
              <p className="text-sm text-blue-900">
                <strong>💡 Dica:</strong> Preencha estes campos para ativar a <strong>Análise ABC</strong> automática,
                que classifica produtos por importância e sugere estratégias de estoque (EOQ, ponto de reordenamento, etc).
              </p>
            </div>

            <TooltipProvider>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="unit_cost">Custo Unitário (R$)</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-blue-500 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Preço de compra de uma unidade deste produto. Usado para calcular o valor total de consumo anual.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="unit_cost"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ex: 15.00"
                  value={newItem.unit_cost || ''}
                  onChange={(e) => setNewItem({...newItem, unit_cost: parseFloat(e.target.value) || undefined})}
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="annual_demand">Demanda Anual (unidades/ano)</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-blue-500 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Quantidade estimada que você vende/usa por ano. Essencial para classificação ABC e cálculo de EOQ.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="annual_demand"
                  type="number"
                  min="0"
                  placeholder="Ex: 2000"
                  value={newItem.annual_demand || ''}
                  onChange={(e) => setNewItem({...newItem, annual_demand: parseInt(e.target.value) || undefined})}
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="ordering_cost">Custo de Pedido (R$)</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-blue-500 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Custo fixo para fazer um pedido (frete, processamento, etc). Padrão sugerido: R$ 80,00</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="ordering_cost"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ex: 80.00 (padrão sugerido)"
                  value={newItem.ordering_cost || ''}
                  onChange={(e) => setNewItem({...newItem, ordering_cost: parseFloat(e.target.value) || undefined})}
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="carrying_cost_percentage">% Custo de Manutenção</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-blue-500 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Percentual do custo para manter produto em estoque (energia, espaço, etc). Padrão: 22%</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="carrying_cost_percentage"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="Ex: 22 (padrão sugerido)"
                  value={newItem.carrying_cost_percentage || ''}
                  onChange={(e) => setNewItem({...newItem, carrying_cost_percentage: parseFloat(e.target.value) || undefined})}
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="lead_time_days">Lead Time (dias)</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-blue-500 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Tempo entre fazer o pedido e receber o produto. Usado para calcular ponto de reordenamento.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="lead_time_days"
                  type="number"
                  min="0"
                  placeholder="Ex: 5"
                  value={newItem.lead_time_days || ''}
                  onChange={(e) => setNewItem({...newItem, lead_time_days: parseInt(e.target.value) || undefined})}
                  className="bg-white"
                />
              </div>
            </TooltipProvider>

            <div className="bg-green-100 border border-green-300 rounded-md p-3 mt-4">
              <p className="text-sm text-green-900">
                ✅ Após salvar, vá em <strong>"Análise ABC"</strong> no menu e clique em <strong>"Classificar Agora"</strong>
                para ver a categoria do produto (A, B ou C) e recomendações automáticas!
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
      
      {/* Botões fixos no rodapé */}
      <div className="flex gap-2 justify-end pt-4 border-t mt-4 flex-shrink-0">
        <Button variant="outline" onClick={() => setDialogOpen(false)}>
          Cancelar
        </Button>
        <Button 
          onClick={handleAddItem} 
          className="bg-amber-500 hover:bg-amber-600"
          disabled={!isFormValid}
          aria-describedby={!isFormValid ? 'button-help' : undefined}
        >
          Adicionar
        </Button>
        {!isFormValid && (
          <span id="button-help" className="sr-only">
            Preencha os campos obrigatórios para habilitar o botão
          </span>
        )}
      </div>
    </DialogContent>
  );
}
