import type { Project, Brand, Campaign, Post, ChecklistItem, Product } from '../store/types';

// Repository interfaces (Supabase-ready)
export interface IProjectRepository {
  getAll(): Promise<Project[]>;
  saveAll(projects: Project[]): Promise<void>;
}

export interface IBrandRepository {
  getAll(): Promise<Brand[]>;
  saveAll(brands: Brand[]): Promise<void>;
}

export interface ICampaignRepository {
  getAll(): Promise<Campaign[]>;
  saveAll(campaigns: Campaign[]): Promise<void>;
}

export interface IPostRepository {
  getAll(): Promise<Post[]>;
  saveAll(posts: Post[]): Promise<void>;
}

export interface IProductRepository {
  getAll(): Promise<Product[]>;
  saveAll(products: Product[]): Promise<void>;
}

export interface IChecklistRepository {
  getAll(): Promise<ChecklistItem[]>;
  saveAll(items: ChecklistItem[]): Promise<void>;
}

// Helper to safely parse localStorage keys
function getLocalStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key);
    if (!data) return defaultValue;
    const parsed = JSON.parse(data);
    if (Array.isArray(defaultValue) && !Array.isArray(parsed)) {
      return (parsed && typeof parsed === 'object' ? Object.values(parsed) : defaultValue) as unknown as T;
    }
    return parsed as T;
  } catch {
    return defaultValue;
  }
}

// LocalStorage Mock Adapters implementation
export class LocalStorageRepositoryAdapter implements
  IProjectRepository,
  IBrandRepository,
  ICampaignRepository,
  IPostRepository,
  IProductRepository,
  IChecklistRepository
{
  async getAll(): Promise<any[]> {
    throw new Error('Use individual entities to query the LocalStorage adapter.');
  }
  async saveAll(): Promise<void> {
    throw new Error('Use individual entities to save the LocalStorage adapter.');
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    const key = 'pink_logic_v2_projects';
    const defaults: Project[] = [
      {
        id: 'default-project-1',
        name: 'Pink Logic SaaS',
        description: 'Projeto padrão do Pink Logic',
        brandId: 'default-brand-1',
        socialAccounts: ['Instagram', 'LinkedIn', 'X/Twitter'],
        email: 'contato@pinklogic.com',
        timezone: 'America/Sao_Paulo',
        status: 'active',
        createdAt: new Date(2026, 4, 1).toISOString(),
      }
    ];
    let list = getLocalStorageItem<Project[]>(key, []);
    if (list.length === 0) {
      // Migrate v1 projects if present
      try {
        const v1Key = 'pink_logic_projects';
        const v1Raw = localStorage.getItem(v1Key);
        if (v1Raw) {
          const v1Parsed = JSON.parse(v1Raw);
          const projectsList = v1Parsed && Array.isArray(v1Parsed.projects) ? v1Parsed.projects : [];
          if (projectsList.length > 0) {
            list = projectsList.map((p: any) => ({
              id: p.id || crypto.randomUUID(),
              name: p.name || 'Projeto',
              description: p.settings?.objective || '',
              brandId: `brand-${p.id}`,
              socialAccounts: [p.settings?.platform || 'Instagram'],
              email: '',
              timezone: p.settings?.timezone || 'America/Sao_Paulo',
              status: 'active',
              createdAt: p.createdAt || new Date().toISOString(),
            }));
          }
        }
      } catch (e) {
        console.warn('Failed to migrate v1 projects:', e);
      }
      if (list.length === 0) {
        list = defaults;
      }
      localStorage.setItem(key, JSON.stringify(list));
    }
    return list;
  }

  async saveProjects(projects: Project[]): Promise<void> {
    localStorage.setItem('pink_logic_v2_projects', JSON.stringify(projects));
  }

  // Brands
  async getBrands(): Promise<Brand[]> {
    const key = 'pink_logic_v2_brands';
    const defaults: Brand[] = [
      {
        id: 'default-brand-1',
        projectId: 'default-project-1',
        name: 'Identidade Pink',
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
        hashtags: ['#pinklogic', '#saas', '#marketing'],
        cta: 'Transforme suas redes com o Pink Logic',
        tone: 'Profissional, moderno e acolhedor',
        style: 'Tecnológico neon',
        overlays: [],
      }
    ];
    let list = getLocalStorageItem<Brand[]>(key, []);
    if (list.length === 0) {
      // Migrate v1 brands if present
      try {
        const v1Key = 'pink_logic_branding';
        const v1Raw = localStorage.getItem(v1Key);
        if (v1Raw) {
          const v1Parsed = JSON.parse(v1Raw);
          if (Array.isArray(v1Parsed) && v1Parsed.length > 0) {
            list = v1Parsed.map((b: any) => ({
              id: b.id || `brand-${b.projectId}`,
              projectId: b.projectId,
              name: b.name || 'Branding',
              logo: b.logo,
              colors: {
                primary: b.palette?.primary || '#FF2D8D',
                secondary: b.palette?.secondary || '#7B2D8E',
                accent: b.palette?.accent || '#FFD700',
                background: b.palette?.background || '#0D0D12',
                text: b.palette?.text || '#FFFFFF',
                glow: b.palette?.primary || '#FF2D8D',
              },
              fonts: {
                heading: b.typography?.heading || 'Outfit',
                body: b.typography?.body || 'Inter',
              },
              glow: b.palette?.primary || '#FF2D8D',
              hashtags: b.colors || [],
              cta: '',
              tone: b.tone || '',
              style: b.visualStyle || '',
              overlays: [],
            }));
          }
        }
      } catch (e) {
        console.warn('Failed to migrate v1 brands:', e);
      }
      if (list.length === 0) {
        list = defaults;
      }
      localStorage.setItem(key, JSON.stringify(list));
    }
    return list;
  }

  async saveBrands(brands: Brand[]): Promise<void> {
    localStorage.setItem('pink_logic_v2_brands', JSON.stringify(brands));
  }

  // Campaigns
  async getCampaigns(): Promise<Campaign[]> {
    const key = 'pink_logic_v2_campaigns';
    const defaults: Campaign[] = [
      {
        id: 'default-camp-1',
        projectId: 'default-project-1',
        name: 'Lançamento Ebook Fit',
        mainProduct: 'Ebook Receitas Fit',
        secondaryProduct: 'Guia de Treinos',
        message: 'Emagreça com saúde em 30 dias',
        status: 'active',
        goal: '100 vendas na primeira semana',
        cta: 'Adquira com desconto exclusivo no link',
        startDate: new Date(2026, 2, 26).toISOString(),
        linkedPostIds: [],
      }
    ];
    let list = getLocalStorageItem<Campaign[]>(key, []);
    if (list.length === 0) {
      // Migrate v1 campaigns
      try {
        const v1Key = 'pink_logic_campaigns';
        const v1Raw = localStorage.getItem(v1Key);
        if (v1Raw) {
          const v1Parsed = JSON.parse(v1Raw);
          const campList = Array.isArray(v1Parsed) ? v1Parsed : [];
          if (campList.length > 0) {
            list = campList.map((c: any) => ({
              id: c.id || crypto.randomUUID(),
              projectId: 'default-project-1',
              name: c.name || 'Campanha',
              mainProduct: c.mainProduct || '',
              secondaryProduct: c.secondaryProduct || '',
              message: c.message || '',
              status: c.status === 'active' ? 'active' : 'draft',
              goal: 'Engajamento e Vendas',
              cta: 'Saiba Mais',
              startDate: new Date().toISOString(),
              linkedPostIds: [],
            }));
          }
        }
      } catch {}
      if (list.length === 0) {
        list = defaults;
      }
      localStorage.setItem(key, JSON.stringify(list));
    }
    return list;
  }

  async saveCampaigns(campaigns: Campaign[]): Promise<void> {
    localStorage.setItem('pink_logic_v2_campaigns', JSON.stringify(campaigns));
  }

  // Posts
  async getPosts(): Promise<Post[]> {
    const key = 'pink_logic_v2_posts';
    const defaults: Post[] = [
      {
        id: 'default-post-1',
        projectId: 'default-project-1',
        campaignId: 'default-camp-1',
        title: 'Lançamento Ebook',
        caption: 'Chegou o novo ebook com 50 receitas saudáveis e deliciosas! Link na bio!',
        hashtags: '#marketing #ebookfit #fit',
        cta: 'Link na bio',
        mediaUrl: '',
        scheduled_at: new Date(2026, 2, 26, 9, 0).toISOString(),
        platforms: ['Instagram'],
        status: 'publicado',
        type: 'Post',
        productId: 'default-prod-1',
        reach: '1.2k',
        engagement: '154',
      },
      {
        id: 'default-post-2',
        projectId: 'default-project-1',
        campaignId: 'default-camp-1',
        title: 'Dicas de Stories',
        caption: 'Fique atento às nossas postagens diárias de stories com conteúdo motivacional!',
        hashtags: '#stories #lifestyle',
        cta: 'Acompanhe',
        mediaUrl: '',
        scheduled_at: new Date(2026, 2, 26, 15, 0).toISOString(),
        platforms: ['Instagram'],
        status: 'agendado',
        type: 'Stories',
        productId: 'default-prod-2',
        reach: '-',
        engagement: '-',
      }
    ];
    let list = getLocalStorageItem<Post[]>(key, []);
    if (list.length === 0) {
      // Migrate v1 posts and scheduled posts
      try {
        const v1PostsRaw = localStorage.getItem('pink_logic_posts');
        const v1SchedRaw = localStorage.getItem('pink_logic_scheduled_posts');
        const migrated: Post[] = [];

        if (v1PostsRaw) {
          const parsed = JSON.parse(v1PostsRaw);
          const items = Array.isArray(parsed) ? parsed : [];
          items.forEach((p: any) => {
            migrated.push({
              id: p.id || crypto.randomUUID(),
              projectId: 'default-project-1',
              campaignId: null,
              title: p.title || 'Post',
              caption: '',
              hashtags: '',
              cta: null,
              mediaUrl: '',
              scheduled_at: p.date || new Date().toISOString(),
              platforms: [p.platform || 'Instagram'],
              status: p.status === 'posted' ? 'publicado' : p.status === 'error' ? 'falhou' : 'agendado',
              type: p.type || 'Post',
              productId: null,
              reach: p.reach || '-',
              engagement: p.engagement || '-',
            });
          });
        }

        if (v1SchedRaw) {
          const parsed = JSON.parse(v1SchedRaw);
          const items = Array.isArray(parsed) ? parsed : [];
          items.forEach((sp: any) => {
            if (migrated.some(m => m.id === sp.id)) return;
            migrated.push({
              id: sp.id || crypto.randomUUID(),
              projectId: 'default-project-1',
              campaignId: null,
              title: sp.title || 'Agendamento',
              caption: sp.caption || '',
              hashtags: sp.hashtags || '',
              cta: null,
              mediaUrl: sp.mediaUrl || '',
              scheduled_at: sp.scheduled_at || new Date().toISOString(),
              platforms: sp.platforms || ['Instagram'],
              status: sp.status === 'published' ? 'publicado' : sp.status === 'failed' ? 'falhou' : 'agendado',
              type: 'Post',
              productId: null,
              reach: '-',
              engagement: '-',
            });
          });
        }

        if (migrated.length > 0) {
          list = migrated;
        }
      } catch (e) {
        console.warn('Failed to migrate v1 posts:', e);
      }
      if (list.length === 0) {
        list = defaults;
      }
      localStorage.setItem(key, JSON.stringify(list));
    }
    return list;
  }

  async savePosts(posts: Post[]): Promise<void> {
    localStorage.setItem('pink_logic_v2_posts', JSON.stringify(posts));
  }

  // Products
  async getProducts(): Promise<Product[]> {
    const key = 'pink_logic_v2_products';
    const defaults: Product[] = [
      {
        id: 'default-prod-1',
        projectId: 'default-project-1',
        name: 'Ebook Receitas Fit',
        category: 'Ebook',
        link: 'https://ebookfit.com',
        platform: 'Hotmart',
        price: '49.90',
        type: 'Digital',
        model: 'Direto',
      },
      {
        id: 'default-prod-2',
        projectId: 'default-project-1',
        name: 'Curso Social Media',
        category: 'Curso',
        link: 'https://cursosm.com',
        platform: 'Kiwify',
        price: '197.00',
        type: 'Digital',
        model: 'Assinatura',
      }
    ];
    let list = getLocalStorageItem<Product[]>(key, []);
    if (list.length === 0) {
      // Migrate v1 products
      try {
        const v1Raw = localStorage.getItem('pink_logic_products');
        if (v1Raw) {
          const v1Parsed = JSON.parse(v1Raw);
          const prodList = Array.isArray(v1Parsed) ? v1Parsed : [];
          if (prodList.length > 0) {
            list = prodList.map((p: any) => ({
              id: p.id || crypto.randomUUID(),
              projectId: 'default-project-1',
              name: p.name || 'Produto',
              category: p.category || '',
              link: p.link || '',
              platform: p.platform || '',
              price: p.price || '',
              type: p.type || '',
              model: p.model || '',
            }));
          }
        }
      } catch {}
      if (list.length === 0) {
        list = defaults;
      }
      localStorage.setItem(key, JSON.stringify(list));
    }
    return list;
  }

  async saveProducts(products: Product[]): Promise<void> {
    localStorage.setItem('pink_logic_v2_products', JSON.stringify(products));
  }

  // Checklist
  async getChecklist(): Promise<ChecklistItem[]> {
    const key = 'pink_logic_v2_checklist';
    const defaults: ChecklistItem[] = [
      { id: 'default-item-1', projectId: 'default-project-1', text: 'Criar arte do post de lançamento', completed: true, responsible: 'Design' },
      { id: 'default-item-2', projectId: 'default-project-1', text: 'Revisar legenda estratégica e hashtags', completed: false, responsible: 'Copywriter' },
      { id: 'default-item-3', projectId: 'default-project-1', text: 'Programar horário de pico no publicador', completed: false, responsible: 'Social Media' }
    ];
    let list = getLocalStorageItem<ChecklistItem[]>(key, []);
    if (list.length === 0) {
      // Migrate v1 tasks
      try {
        const v1Raw = localStorage.getItem('pink_logic_tasks');
        if (v1Raw) {
          const v1Parsed = JSON.parse(v1Raw);
          const taskList = Array.isArray(v1Parsed) ? v1Parsed : [];
          if (taskList.length > 0) {
            list = taskList.map((t: any) => ({
              id: t.id || crypto.randomUUID(),
              projectId: 'default-project-1',
              text: t.text || 'Tarefa',
              completed: !!t.completed,
              responsible: t.text.toLowerCase().includes('arte') ? 'Design' : t.text.toLowerCase().includes('legenda') ? 'Copywriter' : 'Social Media'
            }));
          }
        }
      } catch {}
      if (list.length === 0) {
        list = defaults;
      }
      localStorage.setItem(key, JSON.stringify(list));
    }
    return list;
  }

  async saveChecklist(items: ChecklistItem[]): Promise<void> {
    localStorage.setItem('pink_logic_v2_checklist', JSON.stringify(items));
  }
}

// Default export of the active repository service
export const apiService = new LocalStorageRepositoryAdapter();
