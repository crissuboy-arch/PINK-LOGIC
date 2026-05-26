import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

const STORAGE_KEY = 'pink_logic_products';
const UPDATE_EVENT = 'pinklogic:products-updated';

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  link: string;
  platform: string;
  price: string;
  type: string;
  model: string;
}

interface ProductContextType {
  products: ProductItem[];
  addProduct: (data: Omit<ProductItem, 'id'>) => ProductItem;
  updateProduct: (id: string, data: Partial<ProductItem>) => void;
  deleteProduct: (id: string) => void;
  getProductName: (id: string) => string;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

function loadProducts(): ProductItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : (parsed && typeof parsed === 'object' ? Object.values(parsed) as ProductItem[] : []);
  } catch { return []; }
}

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<ProductItem[]>(loadProducts);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    window.dispatchEvent(new Event(UPDATE_EVENT));
  }, [products]);

  const addProduct = useCallback((data: Omit<ProductItem, 'id'>) => {
    const product: ProductItem = { ...data, id: Math.random().toString(36).substr(2, 9) };
    setProducts(prev => [...prev, product]);
    return product;
  }, []);

  const updateProduct = useCallback((id: string, data: Partial<ProductItem>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  const getProductName = useCallback((id: string) => {
    return products.find(p => p.id === id)?.name || id;
  }, [products]);

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, getProductName }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts(): ProductContextType {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error('useProducts must be used within ProductProvider');
  return ctx;
}