import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Project, Brand, Campaign, Post, ChecklistItem, Product } from './types';
import { supabase } from '../lib/supabaseClient';
import { apiService } from '../services/api';

interface CentralStoreContextType {
  userId: string | null;
  isLoading: boolean;
  error: string | null;
  projects: Project[];
  brands: Brand[];
  campaigns: Campaign[];
  posts: Post[];
  products: Product[];
  checklist: ChecklistItem[];
  activeProjectId: string | null;
  activeProject: Project | null;
  activeBrand: Brand | null;
  
  // Setters & Switcher
  setActiveProjectId: (id: string | null) => void;
  
  // Projects CRUD
  createProject: (data: Omit<Project, 'id' | 'createdAt'>) => Promise<Project>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  // Brands CRUD
  createBrand: (data: Omit<Brand, 'id'>) => Promise<Brand>;
  updateBrand: (id: string, data: Partial<Brand>) => Promise<void>;

  // Campaigns CRUD
  createCampaign: (data: Omit<Campaign, 'id'>) => Promise<Campaign>;
  updateCampaign: (id: string, data: Partial<Campaign>) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;

  // Posts CRUD
  createPost: (data: Omit<Post, 'id' | 'reach' | 'engagement'>) => Promise<Post>;
  updatePost: (id: string, data: Partial<Post>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  // Releitura dos posts (ex.: após aprovar pelo endpoint, que não passa
  // pelo savePosts da UI). Não escreve nada — só recarrega do Supabase.
  refreshPosts: () => Promise<void>;

  // Products CRUD
  createProduct: (data: Omit<Product, 'id'>) => Promise<Product>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  // Checklist CRUD
  addChecklistItem: (text: string, responsible?: string | null) => Promise<ChecklistItem>;
  toggleChecklistItem: (id: string) => Promise<void>;
  deleteChecklistItem: (id: string) => Promise<void>;
}

const CentralStoreContext = createContext<CentralStoreContextType | undefined>(undefined);

export const CentralStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) { setIsLoading(false); setError('Conexão com Supabase não configurada.'); return; }
    let alive = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (alive) { setUserId(session?.user.id || null); }
    });
    return () => { alive = false; subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setProjects([]); setBrands([]); setCampaigns([]); setPosts([]); setProducts([]); setChecklist([]); setActiveProjectId(null);
    if (!userId) { setIsLoading(false); return; }
    setIsLoading(true); setError(null);
    Promise.all([apiService.getProjects(), apiService.getBrands(), apiService.getCampaigns(), apiService.getPosts(), apiService.getProducts(), apiService.getChecklist()])
      .then(([projs, brs, camps, pts, prods, chk]) => {
        if (cancelled) return;
        setProjects(projs); setBrands(brs); setCampaigns(camps); setPosts(pts); setProducts(prods); setChecklist(chk);
        setActiveProjectId(projs[0]?.id || null);
      }).catch(err => { if (!cancelled) setError(err instanceof Error ? err.message : 'Falha ao carregar seus projetos.'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [userId]);

  const activeProject = activeProjectId ? projects.find(p => p.id === activeProjectId) || null : null;
  const activeBrand = activeProject ? brands.find(b => b.projectId === activeProjectId) || null : null;

  // 2. CSS Custom Variables Surcharging (Auto brand adapting theme)
  useEffect(() => {
    if (activeBrand) {
      const root = document.documentElement;
      const primary = activeBrand.colors.primary;
      const secondary = activeBrand.colors.secondary;
      const accent = activeBrand.colors.accent || secondary;
      const background = activeBrand.colors.background;
      const text = activeBrand.colors.text || '#FFFFFF';
      
      // Calculate surface color if not saved
      const isBgDark = background === '#0D0D12' || background === '#0D0D0D' || background.startsWith('#0') || background.startsWith('#1');
      const surface = activeBrand.colors.surface || (isBgDark ? '#15151F' : '#FFFFFF');

      root.style.setProperty('--primary', primary);
      root.style.setProperty('--secondary', secondary);
      root.style.setProperty('--accent', accent);
      root.style.setProperty('--background', background);
      root.style.setProperty('--card', surface);
      root.style.setProperty('--text-primary', text);
      root.style.setProperty('--gradient', `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`);
      root.style.setProperty('--glow', activeBrand.glow || primary);
      
      // Inject glows and borders
      root.style.setProperty('--glow-pink', `${primary}33`);
      root.style.setProperty('--glow-purple', `${secondary}26`);
      root.style.setProperty('--shadow-glow-pink', `0 0 30px ${primary}33`);
      root.style.setProperty('--shadow-glow-purple', `0 0 30px ${secondary}26`);
      root.style.setProperty('--border-focus', `${primary}66`);

      // Fonts synchronization
      if (activeBrand.fonts?.heading) {
        root.style.setProperty('--font-heading', `'${activeBrand.fonts.heading}', sans-serif`);
      }
      if (activeBrand.fonts?.body) {
        root.style.setProperty('--font-body', `'${activeBrand.fonts.body}', sans-serif`);
      }

      // Inject some pl tokens for back-compat
      root.style.setProperty('--pl-brand-primary', primary);
      root.style.setProperty('--pl-brand-secondary', secondary);
      root.style.setProperty('--pl-brand-accent', accent);
    } else {
      // Fallback defaults
      const root = document.documentElement;
      root.style.setProperty('--primary', '#FF2D9B');
      root.style.setProperty('--secondary', '#FF4DB2');
      root.style.setProperty('--accent', '#00E5FF');
      root.style.setProperty('--background', '#0D0D0D');
      root.style.setProperty('--card', '#151515');
      root.style.setProperty('--text-primary', '#FFFFFF');
      root.style.setProperty('--gradient', 'linear-gradient(135deg, #FF2D9B 0%, #FF4DB2 100%)');
      root.style.setProperty('--glow', '#FF2D9B');
      root.style.setProperty('--glow-pink', 'rgba(255, 45, 155, 0.2)');
      root.style.setProperty('--glow-purple', 'rgba(255, 77, 178, 0.15)');
      root.style.setProperty('--shadow-glow-pink', '0 0 30px rgba(255, 45, 155, 0.2)');
      root.style.setProperty('--shadow-glow-purple', '0 0 30px rgba(255, 77, 178, 0.15)');
      root.style.setProperty('--font-heading', "'Plus Jakarta Sans', sans-serif");
      root.style.setProperty('--font-body', "'Inter', sans-serif");
    }
  }, [activeBrand]);

  // 3. Mutation Operations (Writing back to Repositories)

  // Projects CRUD
  const createProject = useCallback(async (data: Omit<Project, 'id' | 'createdAt'>): Promise<Project> => {
    const id = crypto.randomUUID();
    const newProj: Project = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };
    
    // Auto-create matching brand
    const newBrand: Brand = {
      id: crypto.randomUUID(),
      projectId: id,
      name: `Branding ${data.name}`,
      colors: {
        primary: '#FF2D8D',
        secondary: '#7000FF',
        accent: '#00E0FF',
        background: '#0D0D12',
        text: '#FFFFFF',
        glow: '#FF2D8D',
      },
      fonts: {
        heading: 'Outfit',
        body: 'Inter',
      },
      glow: '#FF2D8D',
      hashtags: [],
      cta: 'Acesse o PinkLogic',
      tone: 'profissional',
      style: 'moderno',
      overlays: [],
    };

    await apiService.saveProjects([newProj]);
    try { await apiService.saveBrands([newBrand]); }
    catch (error) { await apiService.deleteRecord('projects', id); throw error; }
    setProjects(current => [...current, newProj]);
    setBrands(current => [...current, newBrand]);

    // Auto-switch to newly created project
    setActiveProjectId(id);
    return newProj;
  }, []);

  const updateProject = useCallback(async (id: string, data: Partial<Project>): Promise<void> => {
    const list = projects.map(p => p.id === id ? { ...p, ...data } : p);
    await apiService.saveProjects(list.filter(item => item.id === id));
    setProjects(current => {
      const changed = list.find(item => item.id === id);
      return changed ? (current.some(item => item.id === id) ? current.map(item => item.id === id ? changed : item) : [...current, changed]) : current;
    });
  }, [projects]);

  const deleteProject = useCallback(async (id: string): Promise<void> => {
    await apiService.deleteRecord('projects', id);
    setProjects(current => current.filter(p => p.id !== id));
    setBrands(current => current.filter(p => p.projectId !== id));
    setCampaigns(current => current.filter(p => p.projectId !== id));
    setPosts(current => current.filter(p => p.projectId !== id));
    setProducts(current => current.filter(p => p.projectId !== id));
    setChecklist(current => current.filter(p => p.projectId !== id));
    setActiveProjectId(current => current === id ? null : current);
  }, []);

  // Brands CRUD
  const createBrand = useCallback(async (data: Omit<Brand, 'id'>): Promise<Brand> => {
    const id = crypto.randomUUID();
    const item: Brand = { ...data, id };
    const list = [...brands, item];
    await apiService.saveBrands(list.filter(item => item.id === id));
    setBrands(current => {
      const changed = list.find(item => item.id === id);
      return changed ? (current.some(item => item.id === id) ? current.map(item => item.id === id ? changed : item) : [...current, changed]) : current;
    });
    return item;
  }, [brands]);

  const updateBrand = useCallback(async (id: string, data: Partial<Brand>): Promise<void> => {
    const list = brands.map(b => b.id === id ? { ...b, ...data } : b);
    await apiService.saveBrands(list.filter(item => item.id === id));
    setBrands(current => {
      const changed = list.find(item => item.id === id);
      return changed ? (current.some(item => item.id === id) ? current.map(item => item.id === id ? changed : item) : [...current, changed]) : current;
    });
  }, [brands]);

  // Campaigns CRUD
  const createCampaign = useCallback(async (data: Omit<Campaign, 'id'>): Promise<Campaign> => {
    const id = crypto.randomUUID();
    const item: Campaign = { ...data, id };
    const list = [...campaigns, item];
    await apiService.saveCampaigns(list.filter(item => item.id === id));
    setCampaigns(current => {
      const changed = list.find(item => item.id === id);
      return changed ? (current.some(item => item.id === id) ? current.map(item => item.id === id ? changed : item) : [...current, changed]) : current;
    });
    return item;
  }, [campaigns]);

  const updateCampaign = useCallback(async (id: string, data: Partial<Campaign>): Promise<void> => {
    const list = campaigns.map(c => c.id === id ? { ...c, ...data } : c);
    await apiService.saveCampaigns(list.filter(item => item.id === id));
    setCampaigns(current => {
      const changed = list.find(item => item.id === id);
      return changed ? (current.some(item => item.id === id) ? current.map(item => item.id === id ? changed : item) : [...current, changed]) : current;
    });
  }, [campaigns]);

  const deleteCampaign = useCallback(async (id: string): Promise<void> => {
    await apiService.deleteRecord('campaigns', id);
    setCampaigns(current => current.filter(item => item.id !== id));
  }, []);

  // Posts CRUD
  const createPost = useCallback(async (data: Omit<Post, 'id' | 'reach' | 'engagement'>): Promise<Post> => {
    const id = crypto.randomUUID();
    const item: Post = {
      ...data,
      id,
      reach: '-',
      engagement: '-',
    };
    const list = [...posts, item];
    await apiService.savePosts(list.filter(item => item.id === id));
    setPosts(current => {
      const changed = list.find(item => item.id === id);
      return changed ? (current.some(item => item.id === id) ? current.map(item => item.id === id ? changed : item) : [...current, changed]) : current;
    });
    return item;
  }, [posts]);

  const updatePost = useCallback(async (id: string, data: Partial<Post>): Promise<void> => {
    const list = posts.map(p => p.id === id ? { ...p, ...data } : p);
    await apiService.savePosts(list.filter(item => item.id === id));
    setPosts(current => {
      const changed = list.find(item => item.id === id);
      return changed ? (current.some(item => item.id === id) ? current.map(item => item.id === id ? changed : item) : [...current, changed]) : current;
    });
  }, [posts]);

  const deletePost = useCallback(async (id: string): Promise<void> => {
    await apiService.deleteRecord('scheduled_posts', id);
    setPosts(current => current.filter(item => item.id !== id));
  }, []);

  // Releitura dos posts a partir do Supabase (após aprovar pelo endpoint).
  const refreshPosts = useCallback(async (): Promise<void> => {
    const pts = await apiService.getPosts();
    setPosts(pts);
  }, []);

  // Products CRUD
  const createProduct = useCallback(async (data: Omit<Product, 'id'>): Promise<Product> => {
    const id = crypto.randomUUID();
    const item: Product = { ...data, id };
    const list = [...products, item];
    await apiService.saveProducts(list.filter(item => item.id === id));
    setProducts(current => {
      const changed = list.find(item => item.id === id);
      return changed ? (current.some(item => item.id === id) ? current.map(item => item.id === id ? changed : item) : [...current, changed]) : current;
    });
    return item;
  }, [products]);

  const updateProduct = useCallback(async (id: string, data: Partial<Product>): Promise<void> => {
    const list = products.map(p => p.id === id ? { ...p, ...data } : p);
    await apiService.saveProducts(list.filter(item => item.id === id));
    setProducts(current => {
      const changed = list.find(item => item.id === id);
      return changed ? (current.some(item => item.id === id) ? current.map(item => item.id === id ? changed : item) : [...current, changed]) : current;
    });
  }, [products]);

  const deleteProduct = useCallback(async (id: string): Promise<void> => {
    await apiService.deleteRecord('products', id);
    setProducts(current => current.filter(item => item.id !== id));
  }, []);

  // Checklist CRUD
  const addChecklistItem = useCallback(async (text: string, responsible?: string | null): Promise<ChecklistItem> => {
    const id = crypto.randomUUID();
    if (!activeProjectId) throw new Error('Selecione um projeto antes de criar uma tarefa.');
    const item: ChecklistItem = {
      id,
      projectId: activeProjectId,
      text,
      completed: false,
      responsible: responsible || 'Social Media',
    };
    const list = [...checklist, item];
    await apiService.saveChecklist(list.filter(item => item.id === id));
    setChecklist(current => {
      const changed = list.find(item => item.id === id);
      return changed ? (current.some(item => item.id === id) ? current.map(item => item.id === id ? changed : item) : [...current, changed]) : current;
    });
    return item;
  }, [checklist, activeProjectId]);

  const toggleChecklistItem = useCallback(async (id: string): Promise<void> => {
    const list = checklist.map(c => c.id === id ? { ...c, completed: !c.completed } : c);
    await apiService.saveChecklist(list.filter(item => item.id === id));
    setChecklist(current => {
      const changed = list.find(item => item.id === id);
      return changed ? (current.some(item => item.id === id) ? current.map(item => item.id === id ? changed : item) : [...current, changed]) : current;
    });
  }, [checklist]);

  const deleteChecklistItem = useCallback(async (id: string): Promise<void> => {
    await apiService.deleteRecord('checklist_items', id);
    setChecklist(current => current.filter(item => item.id !== id));
  }, []);

  // Every mutation exposes persistence failures in the shared layout as well as to its caller.
  const reportError = <Args extends unknown[], Result>(operation: (...args: Args) => Promise<Result>) => async (...args: Args): Promise<Result> => {
    try { setError(null); return await operation(...args); }
    catch (error) { setError(error instanceof Error ? error.message : 'Não foi possível salvar.'); throw error; }
  };

  return (
    <CentralStoreContext.Provider value={{
      userId, isLoading, error, projects, brands, campaigns, posts, products, checklist,
      activeProjectId, activeProject, activeBrand,
      setActiveProjectId,
      createProject: reportError(createProject), updateProject: reportError(updateProject), deleteProject: reportError(deleteProject),
      createBrand: reportError(createBrand), updateBrand: reportError(updateBrand),
      createCampaign: reportError(createCampaign), updateCampaign: reportError(updateCampaign), deleteCampaign: reportError(deleteCampaign),
      createPost: reportError(createPost), updatePost: reportError(updatePost), deletePost: reportError(deletePost), refreshPosts: reportError(refreshPosts),
      createProduct: reportError(createProduct), updateProduct: reportError(updateProduct), deleteProduct: reportError(deleteProduct),
      addChecklistItem: reportError(addChecklistItem), toggleChecklistItem: reportError(toggleChecklistItem), deleteChecklistItem: reportError(deleteChecklistItem),
    }}>
      {children}
    </CentralStoreContext.Provider>
  );
};

export const useCentralStore = () => {
  const context = useContext(CentralStoreContext);
  if (!context) {
    throw new Error('useCentralStore must be used within CentralStoreProvider');
  }
  return context;
};
