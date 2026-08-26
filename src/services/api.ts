import type { Project, Brand, Campaign, Post, ChecklistItem, Product } from '../store/types';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

// Repository interfaces (Supabase-ready)
export interface IProjectRepository {
  getProjects(): Promise<Project[]>;
  saveProjects(projects: Project[]): Promise<void>;
}

export interface IBrandRepository {
  getBrands(): Promise<Brand[]>;
  saveBrands(brands: Brand[]): Promise<void>;
}

export interface ICampaignRepository {
  getCampaigns(): Promise<Campaign[]>;
  saveCampaigns(campaigns: Campaign[]): Promise<void>;
}

export interface IPostRepository {
  getPosts(): Promise<Post[]>;
  savePosts(posts: Post[]): Promise<void>;
}

export interface IProductRepository {
  getProducts(): Promise<Product[]>;
  saveProducts(products: Product[]): Promise<void>;
}

export interface IChecklistRepository {
  getChecklist(): Promise<ChecklistItem[]>;
  saveChecklist(items: ChecklistItem[]): Promise<void>;
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

// LocalStorage & Supabase Hybrid Adapter implementation
export class HybridRepositoryAdapter implements
  IProjectRepository,
  IBrandRepository,
  ICampaignRepository,
  IPostRepository,
  IProductRepository,
  IChecklistRepository
{
  // Projects
  async getProjects(): Promise<Project[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          return data.map((p: any) => ({
            id: p.id,
            name: p.name,
            description: p.description || '',
            brandId: `brand-${p.id}`,
            socialAccounts: p.social_accounts || [],
            email: p.email || '',
            timezone: p.timezone || 'America/Sao_Paulo',
            status: p.status || 'active',
            createdAt: p.created_at,
          }));
        }
      } catch (err) {
        console.warn('[Supabase] Falha ao carregar projetos, tentando local:', err);
      }
    }

    const key = 'pink_logic_v2_projects';
    const defaults: Project[] = [
      {
        id: 'default-project-1',
        name: 'PinkLogic SaaS',
        description: 'Projeto padrão do PinkLogic',
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
    if (isSupabaseConfigured && supabase) {
      try {
        const rows = projects.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          social_accounts: p.socialAccounts,
          email: p.email,
          timezone: p.timezone,
          status: p.status,
          created_at: p.createdAt,
        }));
        
        const { error } = await supabase.from('projects').upsert(rows);
        if (error) throw error;
      } catch (err) {
        console.error('[Supabase] Falha ao salvar projetos:', err);
      }
    }
    localStorage.setItem('pink_logic_v2_projects', JSON.stringify(projects));
  }

  // Brands (Brand Kit)
  async getBrands(): Promise<Brand[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('brands')
          .select('*')
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          return data.map((b: any) => ({
            id: b.id,
            projectId: b.project_id,
            name: b.name,
            colors: b.colors,
            fonts: b.fonts,
            glow: b.glow || '',
            hashtags: b.hashtags || [],
            cta: b.cta || '',
            tone: b.tone || '',
            style: b.style || '',
            overlays: b.overlays || [],
            logo: b.logo || undefined,
          }));
        }
      } catch (err) {
        console.warn('[Supabase] Falha ao carregar brand kits, tentando local:', err);
      }
    }

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
        cta: 'Transforme suas redes com o PinkLogic',
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
    if (isSupabaseConfigured && supabase) {
      try {
        const rows = brands.map(b => ({
          id: b.id,
          project_id: b.projectId,
          name: b.name,
          colors: b.colors,
          fonts: b.fonts,
          glow: b.glow,
          hashtags: b.hashtags,
          cta: b.cta,
          tone: b.tone,
          style: b.style,
          overlays: b.overlays,
          logo: b.logo || null,
        }));
        
        const { error } = await supabase.from('brands').upsert(rows);
        if (error) throw error;
      } catch (err) {
        console.error('[Supabase] Falha ao salvar brand kits:', err);
      }
    }
    localStorage.setItem('pink_logic_v2_brands', JSON.stringify(brands));
  }

  // Campaigns
  async getCampaigns(): Promise<Campaign[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('campaigns')
          .select('*')
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          return data.map((c: any) => ({
            id: c.id,
            projectId: c.project_id,
            name: c.name,
            mainProduct: c.main_product || '',
            secondaryProduct: c.secondary_product || '',
            message: c.message || '',
            status: c.status || 'draft',
            goal: c.goal || '',
            cta: c.cta || '',
            startDate: c.start_date || '',
            linkedPostIds: c.linked_post_ids || [],
          }));
        }
      } catch (err) {
        console.warn('[Supabase] Falha ao carregar campanhas, tentando local:', err);
      }
    }

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
    if (isSupabaseConfigured && supabase) {
      try {
        const rows = campaigns.map(c => ({
          id: c.id,
          project_id: c.projectId,
          name: c.name,
          main_product: c.mainProduct,
          secondary_product: c.secondaryProduct,
          message: c.message,
          status: c.status,
          goal: c.goal,
          cta: c.cta,
          start_date: c.startDate || null,
          linked_post_ids: c.linkedPostIds || [],
        }));
        
        const { error } = await supabase.from('campaigns').upsert(rows);
        if (error) throw error;
      } catch (err) {
        console.error('[Supabase] Falha ao salvar campanhas:', err);
      }
    }
    localStorage.setItem('pink_logic_v2_campaigns', JSON.stringify(campaigns));
  }

  // Posts (Scheduled Posts)
  async getPosts(): Promise<Post[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('scheduled_posts')
          .select('*')
          .order('scheduled_at', { ascending: true });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          return data.map((p: any) => ({
            id: p.id,
            projectId: p.project_id,
            campaignId: p.campaign_id,
            productId: p.product_id,
            title: p.title || '',
            caption: p.caption || '',
            hashtags: p.hashtags ? (Array.isArray(p.hashtags) ? p.hashtags.join(' ') : p.hashtags) : '',
            cta: p.cta || '',
            mediaUrl: p.media_url || '',
            scheduled_at: p.scheduled_at,
            platforms: p.platforms || [],
            status: p.status || 'rascunho',
            type: p.type || 'Post',
            reach: p.reach || '-',
            engagement: p.engagement || '-',
          }));
        }
      } catch (err) {
        console.warn('[Supabase] Falha ao carregar posts, tentando local:', err);
      }
    }

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
    if (isSupabaseConfigured && supabase) {
      try {
        const rows = posts.map(p => ({
          id: p.id,
          project_id: p.projectId,
          campaign_id: p.campaignId,
          product_id: p.productId,
          title: p.title,
          caption: p.caption,
          hashtags: p.hashtags ? p.hashtags.split(' ').filter(Boolean) : [],
          cta: p.cta,
          media_url: p.mediaUrl,
          platforms: p.platforms,
          scheduled_at: p.scheduled_at,
          status: p.status,
          type: p.type,
          reach: p.reach,
          engagement: p.engagement,
        }));
        
        const { error } = await supabase.from('scheduled_posts').upsert(rows);
        if (error) throw error;
      } catch (err) {
        console.error('[Supabase] Falha ao salvar posts:', err);
      }
    }
    localStorage.setItem('pink_logic_v2_posts', JSON.stringify(posts));
  }

  // Products
  async getProducts(): Promise<Product[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          return data.map((p: any) => ({
            id: p.id,
            projectId: p.project_id,
            name: p.name,
            category: p.category || '',
            link: p.link || '',
            platform: p.platform || '',
            price: p.price || '',
            type: p.type || '',
            model: p.model || '',
          }));
        }
      } catch (err) {
        console.warn('[Supabase] Falha ao carregar produtos, tentando local:', err);
      }
    }

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
    if (isSupabaseConfigured && supabase) {
      try {
        const rows = products.map(p => ({
          id: p.id,
          project_id: p.projectId,
          name: p.name,
          category: p.category,
          link: p.link,
          platform: p.platform,
          price: p.price,
          type: p.type,
          model: p.model,
        }));
        
        const { error } = await supabase.from('products').upsert(rows);
        if (error) throw error;
      } catch (err) {
        console.error('[Supabase] Falha ao salvar produtos:', err);
      }
    }
    localStorage.setItem('pink_logic_v2_products', JSON.stringify(products));
  }

  // Checklist
  async getChecklist(): Promise<ChecklistItem[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('checklist_items')
          .select('*')
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          return data.map((c: any) => ({
            id: c.id,
            projectId: c.project_id,
            text: c.text,
            completed: c.completed,
            responsible: c.responsible || 'Social Media',
          }));
        }
      } catch (err) {
        console.warn('[Supabase] Falha ao carregar checklist, tentando local:', err);
      }
    }

    const key = 'pink_logic_v2_checklist';
    const defaults: ChecklistItem[] = [
      { id: 'default-item-1', projectId: 'default-project-1', text: 'Criar arte do post de lançamento', completed: true, responsible: 'Design' },
      { id: 'default-item-2', projectId: 'default-project-1', text: 'Revisar legenda estratégica e hashtags', completed: false, responsible: 'Copywriter' },
      { id: 'default-item-3', projectId: 'default-project-1', text: 'Programar horário de pico no publicador', completed: false, responsible: 'Social Media' }
    ];
    let list = getLocalStorageItem<ChecklistItem[]>(key, []);
    if (list.length === 0) {
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
    if (isSupabaseConfigured && supabase) {
      try {
        const rows = items.map(c => ({
          id: c.id,
          project_id: c.projectId,
          text: c.text,
          completed: c.completed,
          responsible: c.responsible || 'Social Media',
        }));
        
        const { error } = await supabase.from('checklist_items').upsert(rows);
        if (error) throw error;
      } catch (err) {
        console.error('[Supabase] Falha ao salvar tarefas:', err);
      }
    }
    localStorage.setItem('pink_logic_v2_checklist', JSON.stringify(items));
  }
}

// Default export of the active repository service
export const apiService = new HybridRepositoryAdapter();
