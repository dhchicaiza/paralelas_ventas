import { useState, useEffect } from 'react';
import { Input } from '../ui/Input';
import { ProductCard } from './ProductCard';
import { Search, Loader2, AlertCircle, Package } from 'lucide-react';
import { searchProducts } from '../../services/inventoryApi';
import type { Product } from '../../types';

interface ProductSearchProps {
  onAddToCart: (product: Product, quantity: number) => void;
  disabled?: boolean;
}

export const ProductSearch = ({ onAddToCart, disabled = false }: ProductSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        handleSearch();
      } else if (searchQuery.trim().length === 0) {
        setProducts([]);
        setHasSearched(false);
        setError(null);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const results = await searchProducts(searchQuery);
      setProducts(results);
    } catch (err) {
      setError('Error al buscar productos. Por favor, intenta nuevamente.');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
          ) : (
            <Search className="h-5 w-5 text-gray-400" />
          )}
        </div>
        <Input
          type="text"
          placeholder="Buscar productos por nombre o SKU..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4"
          disabled={disabled}
        />
      </div>

      {/* Search Helper Text */}
      {!hasSearched && searchQuery.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          Ingresa al menos 2 caracteres para buscar productos
        </p>
      )}

      {searchQuery.length > 0 && searchQuery.length < 2 && (
        <p className="text-sm text-gray-500 text-center py-4">
          Ingresa al menos {2 - searchQuery.length} carácter{2 - searchQuery.length > 1 ? 'es' : ''} más...
        </p>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Results */}
      {!isLoading && !error && hasSearched && (
        <>
          {products.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {products.length} producto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="space-y-3">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={onAddToCart}
                    disabled={disabled}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No se encontraron productos
              </h3>
              <p className="text-gray-600">
                Intenta con otros términos de búsqueda
              </p>
            </div>
          )}
        </>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Buscando productos...</p>
        </div>
      )}
    </div>
  );
};
