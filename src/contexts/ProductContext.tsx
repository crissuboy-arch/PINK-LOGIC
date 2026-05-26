import React, { createContext, useContext, useCallback, useMemo, type ReactNode } from 'react';
import { useCentralStore } from '../store/CentralStore';
import { Product as ProductItem } from '../store/types';

interface ProductContextType {
  products: ProductItem[];
  addProduct: (data: Omit<ProductItem, 'id' | 'projectId'>) => Promise<ProductItem>;
  updateProduct: (id: string, data: Partial<ProductItem>) => void;
  deleteProduct: (id: string) => void;
  getProductName: (id: string) => string;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const {
    products: centralProducts,
    activeProjectId,
    createProduct,
    updateProduct: centralUpdateProduct,
    deleteProduct: centralDeleteProduct,
  } = useCentralStore();

  const projectProducts = useMemo(() => {
    return centralProducts.filter(p => p.projectId === activeProjectId);
  }, [centralProducts, activeProjectId]);

  const addProduct = useCallback(async (data: Omit<ProductItem, 'id' | 'projectId'>) => {
    return await createProduct({
      ...data,
      projectId: activeProjectId || 'default-project-1',
    });
  }, [createProduct, activeProjectId]);

  const updateProduct = useCallback((id: string, data: Partial<ProductItem>) => {
    centralUpdateProduct(id, data);
  }, [centralUpdateProduct]);

  const deleteProduct = useCallback((id: string) => {
    centralDeleteProduct(id);
  }, [centralDeleteProduct]);

  const getProductName = useCallback((id: string) => {
    return projectProducts.find(p => p.id === id)?.name || id;
  }, [projectProducts]);

  return (
    <ProductContext.Provider value={{
      products: projectProducts,
      addProduct,
      updateProduct,
      deleteProduct,
      getProductName,
    }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts(): ProductContextType {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error('useProducts must be used within ProductProvider');
  return ctx;
}
export type { ProductItem };