import React, { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useCentralStore } from '../store/CentralStore';
import type { Post as PostStore } from '../store/types';

export interface Post {
  id: string;
  title: string;
  date: string;
  type: 'Post' | 'Reels' | 'Stories' | 'Video' | 'Copy';
  product: string;
  status: 'posted' | 'pending' | 'error';
  platform: 'Instagram' | 'TikTok' | 'Youtube' | 'Facebook';
  reach: string;
  engagement: string;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface GestaoContextType {
  posts: Post[];
  tasks: Task[];
  addPost: (post: Omit<Post, 'id' | 'reach' | 'engagement'>) => void;
  deletePost: (id: string) => void;
  updatePostStatus: (id: string, status: Post['status']) => void;
  updatePostDate: (id: string, newDate: Date) => void;
  addTask: (text: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  metrics: {
    totalPosts: number;
    pendingPosts: number;
    completedTasks: number;
    totalTasks: number;
    activeCampaigns: number;
    totalProducts: number;
  };
}

const GestaoContext = createContext<GestaoContextType | undefined>(undefined);

function mapToOldPost(p: PostStore): Post {
  let mappedStatus: 'posted' | 'pending' | 'error' = 'pending';
  if (p.status === 'publicado') mappedStatus = 'posted';
  else if (p.status === 'falhou') mappedStatus = 'error';

  return {
    id: p.id,
    title: p.title,
    date: p.scheduled_at,
    type: p.type,
    product: p.productId || 'Produto',
    status: mappedStatus,
    platform: (p.platforms && p.platforms.length > 0 ? p.platforms[0] : 'Instagram') as any,
    reach: p.reach || '-',
    engagement: p.engagement || '-',
  };
}

export const GestaoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    posts: centralPosts,
    checklist: centralChecklist,
    campaigns: centralCampaigns,
    products: centralProducts,
    activeProjectId,
    createPost,
    updatePost,
    deletePost: centralDeletePost,
    addChecklistItem,
    toggleChecklistItem,
    deleteChecklistItem,
  } = useCentralStore();

  // Filter posts and tasks by the active project
  const projectPosts = useMemo(() => {
    const filtered = centralPosts.filter(p => p.projectId === activeProjectId);
    return filtered.map(mapToOldPost);
  }, [centralPosts, activeProjectId]);

  const projectTasks = useMemo(() => {
    const filtered = centralChecklist.filter(t => t.projectId === activeProjectId);
    return filtered.map(t => ({
      id: t.id,
      text: t.text,
      completed: t.completed,
    }));
  }, [centralChecklist, activeProjectId]);

  const addPost = async (post: Omit<Post, 'id' | 'reach' | 'engagement'>) => {
    let mappedStatus: PostStore['status'] = 'agendado';
    if (post.status === 'posted') mappedStatus = 'publicado';
    else if (post.status === 'error') mappedStatus = 'falhou';

    await createPost({
      projectId: activeProjectId || 'default-project-1',
      campaignId: null,
      title: post.title,
      caption: '',
      hashtags: '',
      cta: null,
      mediaUrl: '',
      scheduled_at: post.date,
      platforms: [post.platform],
      status: mappedStatus,
      type: post.type,
      productId: post.product,
    });
  };

  const deletePost = async (id: string) => {
    await centralDeletePost(id);
  };

  const updatePostStatus = async (id: string, status: Post['status']) => {
    let mappedStatus: PostStore['status'] = 'agendado';
    if (status === 'posted') mappedStatus = 'publicado';
    else if (status === 'error') mappedStatus = 'falhou';
    await updatePost(id, { status: mappedStatus });
  };

  const updatePostDate = async (id: string, newDate: Date) => {
    await updatePost(id, { scheduled_at: newDate.toISOString() });
  };

  const addTask = async (text: string) => {
    await addChecklistItem(text);
  };

  const toggleTask = async (id: string) => {
    await toggleChecklistItem(id);
  };

  const deleteTask = async (id: string) => {
    await deleteChecklistItem(id);
  };

  // Compute metrics in real-time for active project
  const metrics = useMemo(() => {
    const totalP = projectPosts.length;
    const pendingP = projectPosts.filter(p => p.status === 'pending').length;
    const totalT = projectTasks.length;
    const completedT = projectTasks.filter(t => t.completed).length;
    const activeC = centralCampaigns.filter(c => c.projectId === activeProjectId && c.status === 'active').length;
    const totalPr = centralProducts.filter(p => p.projectId === activeProjectId).length;

    return {
      totalPosts: totalP,
      pendingPosts: pendingP,
      completedTasks: completedT,
      totalTasks: totalT,
      activeCampaigns: activeC,
      totalProducts: totalPr,
    };
  }, [projectPosts, projectTasks, centralCampaigns, centralProducts, activeProjectId]);

  return (
    <GestaoContext.Provider value={{
      posts: projectPosts,
      tasks: projectTasks,
      addPost,
      deletePost,
      updatePostStatus,
      updatePostDate,
      addTask,
      toggleTask,
      deleteTask,
      metrics,
    }}>
      {children}
    </GestaoContext.Provider>
  );
};

export const useGestao = () => {
  const context = useContext(GestaoContext);
  if (!context) throw new Error('useGestao must be used within GestaoProvider');
  return context;
};
