import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ScheduledPost, SocialAccount, PublisherPlatform, PublishStatus } from '../types/publisher';
import { useCentralStore } from '../store/CentralStore';
import type { Post as PostStore } from '../store/types';

interface PublisherContextType {
  scheduledPosts: ScheduledPost[];
  socialAccounts: SocialAccount[];
  createScheduledPost: (
    post: Omit<ScheduledPost, 'id' | 'user_id' | 'status' | 'created_at' | 'updated_at'>
  ) => Promise<ScheduledPost>;
  deleteScheduledPost: (id: string) => void;
  updatePostStatus: (id: string, status: PublishStatus, errorMessage?: string | null) => void;
  updateScheduledPostDate: (id: string, date: Date) => void;
  connectAccount: (platform: PublisherPlatform, name: string) => void;
  disconnectAccount: (id: string) => void;
  publishPostNow: (id: string) => Promise<void>;
  isLoading: boolean;
}

const PublisherContext = createContext<PublisherContextType | undefined>(undefined);

const LOCAL_STORAGE_ACCOUNTS = 'pink_logic_social_accounts';

const DEFAULT_ACCOUNTS: SocialAccount[] = [
  { id: 'acc-1', user_id: 'user-default', platform: 'Instagram', account_name: 'pinklogic_ig', status: 'disconnected' },
  { id: 'acc-2', user_id: 'user-default', platform: 'Facebook', account_name: 'PinkLogic Page', status: 'disconnected' },
  { id: 'acc-3', user_id: 'user-default', platform: 'LinkedIn', account_name: 'PinkLogic Corporation', status: 'disconnected' },
  { id: 'acc-4', user_id: 'user-default', platform: 'X/Twitter', account_name: '@pinklogic_ai', status: 'disconnected' },
  { id: 'acc-5', user_id: 'user-default', platform: 'WordPress', account_name: 'PinkLogic Editorial', status: 'disconnected' },
  { id: 'acc-6', user_id: 'user-default', platform: 'Blog', account_name: 'Blog Interno', status: 'disconnected' },
];

function mapToScheduledPost(p: PostStore): ScheduledPost {
  let mappedStatus: PublishStatus = 'scheduled';
  if (p.status === 'publicado') mappedStatus = 'published';
  else if (p.status === 'falhou') mappedStatus = 'failed';
  else if (p.status === 'rascunho') mappedStatus = 'draft';
  else if (p.status === 'editando') mappedStatus = 'draft';

  return {
    id: p.id,
    user_id: 'user-default',
    project_id: p.projectId,
    title: p.title,
    caption: p.caption,
    hashtags: p.hashtags ? p.hashtags.split(' ') : [],
    media_url: p.mediaUrl,
    platforms: p.platforms as PublisherPlatform[],
    scheduled_at: p.scheduled_at,
    timezone: 'America/Sao_Paulo',
    status: mappedStatus,
    error_message: p.error_message,
  };
}

export const PublisherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    posts: centralPosts,
    activeProjectId,
    createPost,
    updatePost,
    deletePost,
  } = useCentralStore();

  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter and map scheduled posts for active project
  const scheduledPosts = useMemo(() => {
    const projectPosts = centralPosts.filter(p => p.projectId === activeProjectId);
    return projectPosts.map(mapToScheduledPost);
  }, [centralPosts, activeProjectId]);

  // OAuth is not wired yet. Never present local demo flags as real connections.
  useEffect(() => { setSocialAccounts(DEFAULT_ACCOUNTS); setIsLoading(false); }, []);

  const saveAccounts = (accounts: SocialAccount[]) => {
    setSocialAccounts(accounts);
    localStorage.setItem(LOCAL_STORAGE_ACCOUNTS, JSON.stringify(accounts));
  };

  const createScheduledPost = async (
    postData: Omit<ScheduledPost, 'id' | 'user_id' | 'status' | 'created_at' | 'updated_at'>
  ): Promise<ScheduledPost> => {
    if (!activeProjectId) throw new Error('Selecione um projeto antes de salvar.');
    
    const saved = await createPost({
      projectId: activeProjectId,
      campaignId: null,
      title: postData.title,
      caption: postData.caption,
      hashtags: postData.hashtags.join(' '),
      cta: null,
      mediaUrl: postData.media_url || '',
      scheduled_at: postData.scheduled_at,
      platforms: postData.platforms,
      status: 'agendado',
      type: 'Post',
      productId: null,
    });

    return {
      ...postData,
      id: saved.id,
      user_id: 'user-default',
      project_id: activeProjectId,
      status: 'scheduled',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  };

  const deleteScheduledPost = async (id: string) => {
    await deletePost(id);
  };

  const updatePostStatus = async (id: string, status: PublishStatus, errorMessage?: string | null) => {
    let mappedStatus: PostStore['status'] = 'agendado';
    if (status === 'published') mappedStatus = 'publicado';
    else if (status === 'failed') mappedStatus = 'falhou';
    else if (status === 'draft') mappedStatus = 'rascunho';

    await updatePost(id, {
      status: mappedStatus,
      error_message: errorMessage || null,
    });
  };

  const updateScheduledPostDate = async (id: string, newDate: Date) => {
    await updatePost(id, {
      scheduled_at: newDate.toISOString(),
    });
  };

  const connectAccount = (_platform: PublisherPlatform, _name: string) => {
    throw new Error('A conexão OAuth com as redes ainda precisa ser configurada. Informar um nome não conecta a conta.');
  };

  const disconnectAccount = (id: string) => {
    const updated = socialAccounts.map((acc) => {
      if (acc.id === id) {
        return { ...acc, status: 'disconnected' as const, updated_at: new Date().toISOString() };
      }
      return acc;
    });
    saveAccounts(updated);
  };

  const publishPostNow = async (_id: string) => {
    throw new Error('Publicação automática ainda não configurada. O conteúdo permanece salvo para revisão e exportação.');
  };

  return (
    <PublisherContext.Provider
      value={{
        scheduledPosts,
        socialAccounts,
        createScheduledPost,
        deleteScheduledPost,
        updatePostStatus,
        updateScheduledPostDate,
        connectAccount,
        disconnectAccount,
        publishPostNow,
        isLoading,
      }}
    >
      {children}
    </PublisherContext.Provider>
  );
};

export const usePublisher = () => {
  const context = useContext(PublisherContext);
  if (context === undefined) {
    throw new Error('usePublisher must be used within a PublisherProvider');
  }
  return context;
};
export type { ScheduledPost, SocialAccount, PublisherPlatform, PublishStatus };
