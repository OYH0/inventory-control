// =====================================================
// COMPONENT: ABCProductsTable - Tabela de produtos ABC
// =====================================================

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, TrendingUp, TrendingDown } from 'lucide-react';
import { useABCProducts } from '@/hooks/useABCProducts';
import type { ABCCategory } from '@/types/abc-analysis';
import { Skeleton } from '@/components/ui/skeleton';

export function ABCProductsTable() {
  const [category, setCategory] = useState<ABCCategory | undefined>();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'value' | 'name' | 'demand'>('value');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const { 
    products, 
    total, 
    page, 
    totalPages, 
    isLoading,
    nextPage,
    prevPage
  } = useABCProducts({
    category,
    search,
    sortBy,
    sortOrder,
    pageSize: 20
  });
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };
  
  const getCategoryBadgeColor = (cat: ABCCategory) => {
    switch (cat) {
      case 'A': return 'bg-red-500 hover:bg-red-600';
      case 'B': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'C': return 'bg-green-500 hover:bg-green-600';
    }
  };
  
  const toggleSort = (column: 'value' | 'name' | 'demand') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Produtos por Categoria ABC</CardTitle>
        <CardDescription>
          Listagem completa de produtos com classificação ABC
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select 
            value={category || 'all'} 
            onValueChange={(value) => setCategory(value === 'all' ? undefined : value as ABCCategory)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="A">Categoria A</SelectItem>
              <SelectItem value="B">Categoria B</SelectItem>
              <SelectItem value="C">Categoria C</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={sortBy} 
            onValueChange={(value) => setSortBy(value as any)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="value">Valor</SelectItem>
              <SelectItem value="name">Nome</SelectItem>
              <SelectItem value="demand">Demanda</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Tabela */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">Nenhum produto encontrado</p>
            <p className="text-sm mt-2">
              {search ? 'Tente buscar com outros termos' : 'Configure produtos com dados ABC'}
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Cat.</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => toggleSort('name')}
                      >
                        Produto
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => toggleSort('demand')}
                      >
                        Demanda Anual
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">Custo Unit.</TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => toggleSort('value')}
                      >
                        Valor Anual
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">EOQ</TableHead>
                    <TableHead className="text-right">Reorder Point</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Badge className={`${getCategoryBadgeColor(product.abc_category!)} text-white font-bold`}>
                          {product.abc_category}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>
                          <p>{product.product_name}</p>
                          {product.source_table && (
                            <p className="text-xs text-muted-foreground">
                              {product.source_table.replace('_items', '').replace(/_/g, ' ')}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div>
                          <p className="font-medium">{formatNumber(product.annual_demand)}</p>
                          <p className="text-xs text-muted-foreground">
                            {(product.annual_demand / 12).toFixed(0)}/mês
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(product.unit_cost)}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(product.annual_consumption_value)}
                      </TableCell>
                      <TableCell className="text-right">
                        {product.eoq ? (
                          <div>
                            <p className="font-medium">{formatNumber(product.eoq)}</p>
                            <p className="text-xs text-muted-foreground">unidades</p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {product.reorder_point ? (
                          <div>
                            <p className="font-medium">{formatNumber(product.reorder_point)}</p>
                            <p className="text-xs text-muted-foreground">unidades</p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Paginação */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {products.length} de {total} produtos
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevPage}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                
                <div className="text-sm font-medium px-3">
                  Página {page} de {totalPages}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextPage}
                  disabled={page >= totalPages}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default ABCProductsTable;

