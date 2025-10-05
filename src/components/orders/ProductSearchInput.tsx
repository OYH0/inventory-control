// =====================================================
// COMPONENT: ProductSearchInput - Busca de Produtos
// Autocomplete para selecionar produtos no pedido
// =====================================================

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Search, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { ItemTable } from '@/types/orders';

interface Product {
  id: string;
  nome: string;
  preco_unitario: number;
  quantidade: number;
  unidade: string;
}

interface ProductSearchInputProps {
  table: ItemTable;
  onSelect: (product: Product) => void;
  selectedId?: string;
}

export function ProductSearchInput({ 
  table, 
  onSelect, 
  selectedId 
}: ProductSearchInputProps) {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Buscar produtos da tabela selecionada
  const fetchProducts = async (search: string = '') => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data: memberData } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', userData.user.id)
        .eq('is_active', true)
        .single();

      if (!memberData) return;

      let query = supabase
        .from(table)
        .select('id, nome, preco_unitario, quantidade, unidade')
        .eq('organization_id', memberData.organization_id)
        .order('nome', { ascending: true })
        .limit(50);

      if (search) {
        query = query.ilike('nome', `%${search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar produtos:', error);
        return;
      }

      setProducts(data || []);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Buscar produtos quando a tabela mudar
  useEffect(() => {
    fetchProducts();
  }, [table]);

  // Buscar quando o termo de busca mudar
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        fetchProducts(searchTerm);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSelect = (product: Product) => {
    setSelectedProduct(product);
    onSelect(product);
    setOpen(false);
    setSearchTerm('');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-2">
      <Label>Buscar Produto</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedProduct ? (
              <span className="truncate">
                {selectedProduct.nome} - {formatCurrency(selectedProduct.preco_unitario)}
              </span>
            ) : (
              <span className="text-muted-foreground">
                Selecione um produto...
              </span>
            )}
            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Digite o nome do produto..." 
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList>
              {loading ? (
                <div className="p-4 text-sm text-center text-muted-foreground">
                  Carregando...
                </div>
              ) : (
                <>
                  <CommandEmpty>
                    Nenhum produto encontrado.
                  </CommandEmpty>
                  <CommandGroup>
                    {products.map((product) => (
                      <CommandItem
                        key={product.id}
                        value={product.nome}
                        onSelect={() => handleSelect(product)}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex-1">
                            <p className="font-medium">{product.nome}</p>
                            <p className="text-xs text-muted-foreground">
                              Estoque: {product.quantidade} {product.unidade}
                            </p>
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-medium text-sm">
                              {formatCurrency(product.preco_unitario)}
                            </p>
                          </div>
                          {selectedId === product.id && (
                            <Check className="ml-2 h-4 w-4 text-primary" />
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {selectedProduct && (
        <p className="text-xs text-muted-foreground">
          ID: {selectedProduct.id}
        </p>
      )}
    </div>
  );
}

export default ProductSearchInput;

