// =====================================================
// COMPONENT: CreateOrderDialog - Criar Novo Pedido
// =====================================================

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Plus, Trash2, Info } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { ProductSearchInput } from './ProductSearchInput';
import type { CreateOrderInput, CreateOrderItemInput, OrderType, LocationType, ItemTable } from '@/types/orders';
import { 
  ORDER_TYPE_LABELS, 
  LOCATION_LABELS, 
  ITEM_TABLE_LABELS 
} from '@/types/orders';

interface CreateOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateOrderDialog({ open, onOpenChange }: CreateOrderDialogProps) {
  const { createOrder, isCreating } = useOrders();
  
  const [formData, setFormData] = useState<Partial<CreateOrderInput>>({
    order_type: 'purchase',
    items: []
  });
  
  const [errors, setErrors] = useState<string[]>([]);
  
  // Reset form when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setFormData({ order_type: 'purchase', items: [] });
      setErrors([]);
    }
    onOpenChange(newOpen);
  };
  
  // Add item to order
  const addItem = () => {
    const newItem: CreateOrderItemInput = {
      item_table: 'estoque_seco_items',
      item_id: '',
      item_name: '',
      quantity: 1,
      unit_price: 0,
      discount_percentage: 0,
      tax_percentage: 0
    };
    
    setFormData(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem]
    }));
  };
  
  // Remove item
  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items?.filter((_, i) => i !== index) || []
    }));
  };
  
  // Update item
  const updateItem = (index: number, field: keyof CreateOrderItemInput, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items?.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      ) || []
    }));
  };
  
  // Validate form
  const validate = (): boolean => {
    const newErrors: string[] = [];
    
    if (!formData.order_type) {
      newErrors.push('Tipo de pedido é obrigatório');
    }
    
    if (!formData.items || formData.items.length === 0) {
      newErrors.push('Adicione pelo menos um item ao pedido');
    }
    
    formData.items?.forEach((item, index) => {
      if (!item.item_name || item.item_name.trim() === '') {
        newErrors.push(`Item ${index + 1}: Selecione um produto`);
      }
      
      if (!item.item_id || item.item_id.trim() === '') {
        newErrors.push(`Item ${index + 1}: Produto não foi selecionado corretamente`);
      }
      
      if (!item.item_table) {
        newErrors.push(`Item ${index + 1}: Tabela é obrigatória`);
      }
      
      const qty = parseInt(String(item.quantity)) || 0;
      if (qty <= 0) {
        newErrors.push(`Item ${index + 1}: Quantidade deve ser maior que zero`);
      }
      
      const price = parseFloat(String(item.unit_price)) || 0;
      if (price < 0) {
        newErrors.push(`Item ${index + 1}: Preço não pode ser negativo`);
      }
    });
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };
  
  // Submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    // Log para debug (remover em produção)
    console.log('Criando pedido com dados:', formData);
    
    createOrder(formData as CreateOrderInput);
    handleOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Pedido</DialogTitle>
          <DialogDescription>
            Preencha as informações do pedido e adicione os itens
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Errors */}
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside">
                  {errors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Helper Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium mb-2">💡 Dica:</p>
              <p className="text-sm">
                Use o campo de busca de produtos para selecionar itens automaticamente. 
                Comece digitando o nome do produto e selecione da lista.
              </p>
            </AlertDescription>
          </Alert>
          
          {/* Basic Info */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="order_type">Tipo de Pedido *</Label>
              <Select
                value={formData.order_type}
                onValueChange={(value: OrderType) => 
                  setFormData(prev => ({ ...prev, order_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ORDER_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="expected_delivery_date">Data de Entrega Prevista</Label>
              <Input
                id="expected_delivery_date"
                type="date"
                value={formData.expected_delivery_date || ''}
                onChange={(e) => 
                  setFormData(prev => ({ ...prev, expected_delivery_date: e.target.value }))
                }
              />
            </div>
          </div>
          
          {/* Cliente/Fornecedor */}
          <div className="space-y-2">
            <Label htmlFor="supplier_customer_name">
              {formData.order_type === 'purchase' ? 'Fornecedor' : 'Cliente'}
            </Label>
            <Input
              id="supplier_customer_name"
              value={formData.supplier_customer_name || ''}
              onChange={(e) => 
                setFormData(prev => ({ ...prev, supplier_customer_name: e.target.value }))
              }
              placeholder="Nome do fornecedor/cliente"
            />
          </div>
          
          {/* Locations */}
          {formData.order_type === 'transfer' && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="from_location">De</Label>
                <Select
                  value={formData.from_location}
                  onValueChange={(value: LocationType) => 
                    setFormData(prev => ({ ...prev, from_location: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Origem" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LOCATION_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="to_location">Para</Label>
                <Select
                  value={formData.to_location}
                  onValueChange={(value: LocationType) => 
                    setFormData(prev => ({ ...prev, to_location: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Destino" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LOCATION_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          {/* Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Itens do Pedido *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
            </div>
            
            {formData.items && formData.items.length > 0 ? (
              <div className="space-y-3">
                {formData.items.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Item {index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {/* Seletor de Tabela */}
                      <div className="space-y-2">
                        <Label>Tabela *</Label>
                        <Select
                          value={item.item_table}
                          onValueChange={(value: ItemTable) => 
                            updateItem(index, 'item_table', value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(ITEM_TABLE_LABELS).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Busca de Produto com Autocomplete */}
                      <ProductSearchInput
                        table={item.item_table}
                        selectedId={item.item_id}
                        onSelect={(product) => {
                          updateItem(index, 'item_id', product.id);
                          updateItem(index, 'item_name', product.nome);
                          updateItem(index, 'unit_price', product.preco_unitario);
                        }}
                      />
                      
                      {/* Nome do Produto (preenchido automaticamente) */}
                      <div className="space-y-2">
                        <Label>Nome do Produto *</Label>
                        <Input
                          value={item.item_name}
                          onChange={(e) => updateItem(index, 'item_name', e.target.value)}
                          placeholder="Nome será preenchido automaticamente"
                          readOnly
                          className="bg-muted"
                        />
                      </div>
                      
                      {/* SKU Opcional */}
                      <div className="space-y-2">
                        <Label>SKU (Opcional)</Label>
                        <Input
                          value={item.item_sku || ''}
                          onChange={(e) => updateItem(index, 'item_sku', e.target.value)}
                          placeholder="Código SKU"
                        />
                      </div>
                      
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Quantidade *</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity || ''}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Preço Unitário *</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unit_price || ''}
                            onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                            placeholder="Preenchido automaticamente"
                          />
                          <p className="text-xs text-muted-foreground">
                            Ajuste se necessário
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Desconto (%)</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={item.discount_percentage || ''}
                            onChange={(e) => updateItem(index, 'discount_percentage', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Taxa (%)</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.tax_percentage || ''}
                            onChange={(e) => updateItem(index, 'tax_percentage', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum item adicionado. Clique em "Adicionar Item" para começar.
              </div>
            )}
          </div>
          
          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => 
                setFormData(prev => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Informações adicionais sobre o pedido"
              rows={3}
            />
          </div>
          
          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Criando...' : 'Criar Pedido'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateOrderDialog;

