// =====================================================
// PAGE: OrderEdit - Editar Pedido
// =====================================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Save, Plus, Trash2, AlertCircle } from 'lucide-react';
import { useOrder, useOrders } from '@/hooks/useOrders';
import { ProductSearchInput } from '@/components/orders/ProductSearchInput';
import type { OrderType, LocationType, ItemTable, CreateOrderItemInput } from '@/types/orders';
import {
  ORDER_TYPE_LABELS,
  LOCATION_LABELS,
  ITEM_TABLE_LABELS
} from '@/types/orders';

export function OrderEdit() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  
  const { order, isLoading: loadingOrder } = useOrder(orderId || null);
  const { updateOrder, isUpdating } = useOrders();
  
  const [formData, setFormData] = useState({
    order_type: 'purchase' as OrderType,
    order_date: new Date().toISOString().split('T')[0],
    expected_delivery_date: '',
    supplier_customer_name: '',
    from_location: 'estoque_seco' as LocationType,
    to_location: 'estoque_seco' as LocationType,
    notes: '',
    items: [] as CreateOrderItemInput[]
  });
  
  const [errors, setErrors] = useState<string[]>([]);
  
  // Carregar dados do pedido
  useEffect(() => {
    if (order) {
      setFormData({
        order_type: order.order_type,
        order_date: order.order_date,
        expected_delivery_date: order.expected_delivery_date || '',
        supplier_customer_name: order.supplier_customer_name || '',
        from_location: order.from_location || 'estoque_seco',
        to_location: order.to_location || 'estoque_seco',
        notes: order.notes || '',
        items: (order.items || []).map(item => ({
          item_table: item.item_table,
          item_id: item.item_id,
          item_name: item.item_name,
          item_sku: item.item_sku || '',
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_percentage: item.discount_percentage || 0,
          tax_percentage: item.tax_percentage || 0,
          notes: item.notes || ''
        }))
      });
    }
  }, [order]);
  
  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          item_table: 'estoque_seco_items' as ItemTable,
          item_id: '',
          item_name: '',
          item_sku: '',
          quantity: 1,
          unit_price: 0,
          discount_percentage: 0,
          tax_percentage: 0,
          notes: ''
        }
      ]
    }));
  };
  
  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };
  
  const updateItem = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };
  
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    if (!orderId) {
      return;
    }
    
    updateOrder(orderId, formData);
    navigate(`/pedidos/${orderId}`);
  };
  
  if (loadingOrder) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[600px]" />
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-destructive font-medium">Pedido não encontrado</p>
              <Button onClick={() => navigate('/pedidos')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Pedidos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (order.order_status !== 'draft') {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-orange-600 mx-auto" />
              <p className="font-medium">Apenas pedidos em rascunho podem ser editados</p>
              <p className="text-sm text-muted-foreground">
                Status atual: {order.order_status}
              </p>
              <Button onClick={() => navigate(`/pedidos/${orderId}`)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Detalhes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/pedidos/${orderId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Editar Pedido {order.order_number}
          </h1>
          <p className="text-muted-foreground">
            Modifique as informações do pedido
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Erros */}
        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium mb-2">Corrija os seguintes erros:</p>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="order_type">Tipo de Pedido *</Label>
                <Select
                  value={formData.order_type}
                  onValueChange={(value: OrderType) => 
                    setFormData(prev => ({ ...prev, order_type: value }))
                  }
                >
                  <SelectTrigger id="order_type">
                    <SelectValue />
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
                <Label htmlFor="order_date">Data do Pedido *</Label>
                <Input
                  id="order_date"
                  type="date"
                  value={formData.order_date}
                  onChange={(e) => 
                    setFormData(prev => ({ ...prev, order_date: e.target.value }))
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="supplier">
                  {formData.order_type === 'purchase' ? 'Fornecedor' : 'Cliente'}
                </Label>
                <Input
                  id="supplier"
                  value={formData.supplier_customer_name}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, supplier_customer_name: e.target.value }))
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expected_date">Data Prevista de Entrega</Label>
                <Input
                  id="expected_date"
                  type="date"
                  value={formData.expected_delivery_date}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, expected_delivery_date: e.target.value }))
                  }
                />
              </div>
              
              {formData.order_type === 'transfer' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="from">Origem</Label>
                    <Select
                      value={formData.from_location}
                      onValueChange={(value: LocationType) =>
                        setFormData(prev => ({ ...prev, from_location: value }))
                      }
                    >
                      <SelectTrigger id="from">
                        <SelectValue />
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
                    <Label htmlFor="to">Destino</Label>
                    <Select
                      value={formData.to_location}
                      onValueChange={(value: LocationType) =>
                        setFormData(prev => ({ ...prev, to_location: value }))
                      }
                    >
                      <SelectTrigger id="to">
                        <SelectValue />
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
                </>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, notes: e.target.value }))
                }
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Itens do Pedido */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Itens do Pedido</CardTitle>
              <Button type="button" onClick={addItem} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum item adicionado</p>
                <p className="text-sm">Clique em "Adicionar Item" para começar</p>
              </div>
            ) : (
              formData.items.map((item, index) => (
                <Card key={index} className="relative">
                  <CardContent className="pt-6">
                    <div className="absolute top-2 right-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
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
                      
                      <ProductSearchInput
                        table={item.item_table}
                        selectedId={item.item_id}
                        onSelect={(product) => {
                          updateItem(index, 'item_id', product.id);
                          updateItem(index, 'item_name', product.nome);
                          updateItem(index, 'unit_price', product.preco_unitario);
                        }}
                      />
                      
                      <div className="space-y-2">
                        <Label>Nome do Produto *</Label>
                        <Input
                          value={item.item_name}
                          readOnly
                          className="bg-muted"
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
                          />
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
                          <Label>Taxa/Imposto (%)</Label>
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
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
        
        {/* Ações */}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/pedidos/${orderId}`)}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isUpdating}>
            <Save className="h-4 w-4 mr-2" />
            {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default OrderEdit;

