import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Project, Brand, Campaign, Post, ChecklistItem, Product } from './types';
import { apiService } from '../services/api';

interface CentralStoreContextType {
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

  // 1. Initial Load (Supabase-ready LocalStorage Mock)
  useEffect(() => {
    async function loadData() {
      try {
        const projs = await apiService.getProjects();
        const brs = await apiService.getBrands();
        const camps = await apiService.getCampaigns();
        const pts = await apiService.getPosts();
        const prods = await apiService.getProducts();
        const chk = await apiService.getChecklist();

        setProjects(projs);
        setBrands(brs);
        setCampaigns(camps);
        setPosts(pts);
        setProducts(prods);
        setChecklist(chk);

        // Auto select active project if available
        if (projs.length > 0) {
          const storedActiveId = localStorage.getItem('pink_logic_v2_active_project_id');
          if (storedActiveId && projs.some(p => p.id === storedActiveId)) {
            setActiveProjectId(storedActiveId);
          } else {
            setActiveProjectId(projs[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load initial CentralStore data:', err);
      }
    }
    loadData();
  }, []);

  // Sync active project id to localStorage for page-reload persistence
  useEffect(() => {
    if (activeProjectId) {
      localStorage.setItem('pink_logic_v2_active_project_id', activeProjectId);
    } else {
      localStorage.removeItem('pink_logic_v2_active_project_id');
    }
  }, [activeProjectId]);

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

    const updatedProjects = [...projects, newProj];
    const updatedBrands = [...brands, newBrand];

    setProjects(updatedProjects);
    setBrands(updatedBrands);
    await apiService.saveProjects(updatedProjects);
    await apiService.saveBrands(updatedBrands);

    // Auto-switch to newly created project
    setActiveProjectId(id);
    return newProj;
  }, [projects, brands]);

  const updateProject = useCallback(async (id: string, data: Partial<Project>): Promise<void> => {
    const list = projects.map(p => p.id === id ? { ...p, ...data } : p);
    setProjects(list);
    await apiService.saveProjects(list);
  }, [projects]);

  const deleteProject = useCallback(async (id: string): Promise<void> => {
    const list = projects.filter(p => p.id !== id);
    setProjects(list);
    await apiService.saveProjects(list);

    // Cleanup cascaded brands, campaigns, etc.
    const remainingBrands = brands.filter(b => b.projectId !== id);
    setBrands(remainingBrands);
    await apiService.saveBrands(remainingBrands);

    const remainingCamps = campaigns.filter(c => c.projectId !== id);
    setCampaigns(remainingCamps);
    await apiService.saveCampaigns(remainingCamps);

    const remainingPosts = posts.filter(p => p.projectId !== id);
    setPosts(remainingPosts);
    await apiService.savePosts(remainingPosts);

    const remainingProducts = products.filter(p => p.projectId !== id);
    setProducts(remainingProducts);
    await apiService.saveProducts(remainingProducts);

    const remainingChecklist = checklist.filter(c => c.projectId !== id);
    setChecklist(remainingChecklist);
    await apiService.saveChecklist(remainingChecklist);

    // Shift active project if deleted
    if (activeProjectId === id) {
      setActiveProjectId(list.length > 0 ? list[0].id : null);
    }
  }, [projects, brands, campaigns, posts, products, checklist, activeProjectId]);

  // Brands CRUD
  const createBrand = useCallback(async (data: Omit<Brand, 'id'>): Promise<Brand> => {
    const id = crypto.randomUUID();
    const item: Brand = { ...data, id };
    const list = [...brands, item];
    setBrands(list);
    await apiService.saveBrands(list);
    return item;
  }, [brands]);

  const updateBrand = useCallback(async (id: string, data: Partial<Brand>): Promise<void> => {
    const list = brands.map(b => b.id === id ? { ...b, ...data } : b);
    setBrands(list);
    await apiService.saveBrands(list);
  }, [brands]);

  // Campaigns CRUD
  const createCampaign = useCallback(async (data: Omit<Campaign, 'id'>): Promise<Campaign> => {
    const id = crypto.randomUUID();
    const item: Campaign = { ...data, id };
    const list = [...campaigns, item];
    setCampaigns(list);
    await apiService.saveCampaigns(list);
    return item;
  }, [campaigns]);

  const updateCampaign = useCallback(async (id: string, data: Partial<Campaign>): Promise<void> => {
    const list = campaigns.map(c => c.id === id ? { ...c, ...data } : c);
    setCampaigns(list);
    await apiService.saveCampaigns(list);
  }, [campaigns]);

  const deleteCampaign = useCallback(async (id: string): Promise<void> => {
    const list = campaigns.filter(c => c.id !== id);
    setCampaigns(list);
    await apiService.saveCampaigns(list);
  }, [campaigns]);

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
    setPosts(list);
    await apiService.savePosts(list);
    return item;
  }, [posts]);

  const updatePost = useCallback(async (id: string, data: Partial<Post>): Promise<void> => {
    const list = posts.map(p => p.id === id ? { ...p, ...data } : p);
    setPosts(list);
    await apiService.savePosts(list);
  }, [posts]);

  const deletePost = useCallback(async (id: string): Promise<void> => {
    const list = posts.filter(p => p.id !== id);
    setPosts(list);
    await apiService.savePosts(list);
  }, [posts]);

  // Products CRUD
  const createProduct = useCallback(async (data: Omit<Product, 'id'>): Promise<Product> => {
    const id = crypto.randomUUID();
    const item: Product = { ...data, id };
    const list = [...products, item];
    setProducts(list);
    await apiService.saveProducts(list);
    return item;
  }, [products]);

  const updateProduct = useCallback(async (id: string, data: Partial<Product>): Promise<void> => {
    const list = products.map(p => p.id === id ? { ...p, ...data } : p);
    setProducts(list);
    await apiService.saveProducts(list);
  }, [products]);

  const deleteProduct = useCallback(async (id: string): Promise<void> => {
    const list = products.filter(p => p.id !== id);
    setProducts(list);
    await apiService.saveProducts(list);
  }, [products]);

  // Checklist CRUD
  const addChecklistItem = useCallback(async (text: string, responsible?: string | null): Promise<ChecklistItem> => {
    const id = crypto.randomUUID();
    const item: ChecklistItem = {
      id,
      projectId: activeProjectId || 'default-project-1',
      text,
      completed: false,
      responsible: responsible || 'Social Media',
    };
    const list = [...checklist, item];
    setChecklist(list);
    await apiService.saveChecklist(list);
    return item;
  }, [checklist, activeProjectId]);

  const toggleChecklistItem = useCallback(async (id: string): Promise<void> => {
    const list = checklist.map(c => c.id === id ? { ...c, completed: !c.completed } : c);
    setChecklist(list);
    await apiService.saveChecklist(list);
  }, [checklist]);

  const deleteChecklistItem = useCallback(async (id: string): Promise<void> => {
    const list = checklist.filter(c => c.id !== id);
    setChecklist(list);
    await apiService.saveChecklist(list);
  }, [checklist]);

  return (
    <CentralStoreContext.Provider value={{
      projects, brands, campaigns, posts, products, checklist,
      activeProjectId, activeProject, activeBrand,
      setActiveProjectId,
      createProject, updateProject, deleteProject,
      createBrand, updateBrand,
      createCampaign, updateCampaign, deleteCampaign,
      createPost, updatePost, deletePost,
      createProduct, updateProduct, deleteProduct,
      addChecklistItem, toggleChecklistItem, deleteChecklistItem,
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
