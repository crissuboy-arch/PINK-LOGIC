import type { Project, Brand, Campaign, Post, ChecklistItem, Product } from '../store/types';
import { supabase } from '../lib/supabaseClient';

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

// Authenticated persistence. Database errors must never be reported as a successful local save.
export function requireSupabase() {
  if (!supabase) throw new Error('Supabase não configurado. Configure a conexão antes de salvar.');
  return supabase;
}

export class SupabaseRepositoryAdapter implements IProjectRepository, IBrandRepository, ICampaignRepository, IPostRepository, IProductRepository, IChecklistRepository {
  async getProjects(): Promise<Project[]> {
    const { data, error } = await requireSupabase().from('projects').select('*').order('created_at', { ascending: true });
    if (error) throw new Error('Não foi possível carregar projects: ' + error.message);
    return (data || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            description: p.description || '',
            brandId: '',
            socialAccounts: p.social_accounts || [],
            email: p.email || '',
            timezone: p.timezone || 'America/Sao_Paulo',
            status: p.status || 'active',
            createdAt: p.created_at,
    }));
  }
  async saveProjects(items: Project[]): Promise<void> {
    if (!items.length) return;
    const rows = items.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          social_accounts: p.socialAccounts,
          email: p.email,
          timezone: p.timezone,
          status: p.status,
          created_at: p.createdAt,
    }));
    const { error } = await requireSupabase().from('projects').upsert(rows);
    if (error) throw new Error('Não foi possível salvar projects: ' + error.message);
  }
  async getBrands(): Promise<Brand[]> {
    const { data, error } = await requireSupabase().from('brands').select('*').order('created_at', { ascending: true });
    if (error) throw new Error('Não foi possível carregar brands: ' + error.message);
    return (data || []).map((b: any) => ({
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
            logo: b.logo || undefined, avatar: b.avatar || undefined, secondaryColors: b.secondary_colors || [], socialLinks: b.social_links || {}, brandDNA: b.brand_dna || undefined,
    }));
  }
  async saveBrands(items: Brand[]): Promise<void> {
    if (!items.length) return;
    const rows = items.map(b => ({
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
          logo: b.logo || null, avatar: b.avatar || null, secondary_colors: b.secondaryColors || [], social_links: b.socialLinks || {}, brand_dna: b.brandDNA || null,
    }));
    const { error } = await requireSupabase().from('brands').upsert(rows);
    if (error) throw new Error('Não foi possível salvar brands: ' + error.message);
  }
  async getCampaigns(): Promise<Campaign[]> {
    const { data, error } = await requireSupabase().from('campaigns').select('*').order('created_at', { ascending: true });
    if (error) throw new Error('Não foi possível carregar campaigns: ' + error.message);
    return (data || []).map((c: any) => ({
            id: c.id,
            projectId: c.project_id,
            name: c.name,
            mainProduct: c.main_product || '',
            secondaryProduct: c.secondary_product || '',
            message: c.message || '',
            status: c.status || 'draft',
            goal: c.goal || '',
            cta: c.cta || '',
            endDate: c.end_date || undefined, startDate: c.start_date || '',
            linkedPostIds: c.linked_post_ids || [],
    }));
  }
  async saveCampaigns(items: Campaign[]): Promise<void> {
    if (!items.length) return;
    const rows = items.map(c => ({
          id: c.id,
          project_id: c.projectId,
          name: c.name,
          main_product: c.mainProduct,
          secondary_product: c.secondaryProduct,
          message: c.message,
          status: c.status,
          goal: c.goal,
          cta: c.cta,
          end_date: c.endDate || null, start_date: c.startDate || null,
          linked_post_ids: c.linkedPostIds || [],
    }));
    const { error } = await requireSupabase().from('campaigns').upsert(rows);
    if (error) throw new Error('Não foi possível salvar campaigns: ' + error.message);
  }
  async getPosts(): Promise<Post[]> {
    const { data, error } = await requireSupabase().from('scheduled_posts').select('*').order('created_at', { ascending: true });
    if (error) throw new Error('Não foi possível carregar scheduled_posts: ' + error.message);
    return (data || []).map((p: any) => ({
            id: p.id,
            projectId: p.project_id,
            campaignId: p.campaign_id,
            productId: p.product_id,
            error_message: p.error_message, title: p.title || '',
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
            // Aprovação humana: só leitura aqui. O savePosts abaixo NÃO
            // inclui estes campos de propósito — a UI nunca escreve
            // approved_at/decision por upsert; só o endpoint de aprovar.
            approvedAt: p.approved_at ?? null,
            approvedBy: p.approved_by ?? null,
            decision: p.decision ?? null,
    }));
  }
  async savePosts(items: Post[]): Promise<void> {
    if (!items.length) return;
    const rows = items.map(p => ({
          id: p.id,
          project_id: p.projectId,
          campaign_id: p.campaignId,
          product_id: p.productId,
          error_message: p.error_message || null, title: p.title,
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
    const { error } = await requireSupabase().from('scheduled_posts').upsert(rows);
    if (error) throw new Error('Não foi possível salvar scheduled_posts: ' + error.message);
  }
  async getProducts(): Promise<Product[]> {
    const { data, error } = await requireSupabase().from('products').select('*').order('created_at', { ascending: true });
    if (error) throw new Error('Não foi possível carregar products: ' + error.message);
    return (data || []).map((p: any) => ({
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
  async saveProducts(items: Product[]): Promise<void> {
    if (!items.length) return;
    const rows = items.map(p => ({
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
    const { error } = await requireSupabase().from('products').upsert(rows);
    if (error) throw new Error('Não foi possível salvar products: ' + error.message);
  }
  async getChecklist(): Promise<ChecklistItem[]> {
    const { data, error } = await requireSupabase().from('checklist_items').select('*').order('created_at', { ascending: true });
    if (error) throw new Error('Não foi possível carregar checklist_items: ' + error.message);
    return (data || []).map((c: any) => ({
            id: c.id,
            projectId: c.project_id,
            text: c.text, dueDate: c.due_date,
            completed: c.completed,
            responsible: c.responsible || 'Social Media',
    }));
  }
  async saveChecklist(items: ChecklistItem[]): Promise<void> {
    if (!items.length) return;
    const rows = items.map(c => ({
          id: c.id,
          project_id: c.projectId,
          text: c.text, due_date: c.dueDate || null,
          completed: c.completed,
          responsible: c.responsible || 'Social Media',
    }));
    const { error } = await requireSupabase().from('checklist_items').upsert(rows);
    if (error) throw new Error('Não foi possível salvar checklist_items: ' + error.message);
  }
  async deleteRecord(table: 'projects' | 'brands' | 'campaigns' | 'scheduled_posts' | 'products' | 'checklist_items', id: string): Promise<void> {
    const { data, error } = await requireSupabase().from(table).delete().eq('id', id).select('id');
    if (error) throw new Error('Não foi possível excluir: ' + error.message);
    if (!data?.length) throw new Error('Registro não encontrado ou sem permissão para excluir.');
  }
}
export const apiService = new SupabaseRepositoryAdapter();
