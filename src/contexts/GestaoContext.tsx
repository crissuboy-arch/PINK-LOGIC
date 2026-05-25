import React, { createContext, useContext, useState, useEffect } from 'react';
import { useContent } from '../providers/ContentProvider';
import { usePublisher } from './PublisherContext';

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

export const GestaoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Bridge to ContentProvider — posts are synced with the new content system
  const { createContent, removeContent, updateContent } = useContent();
  const { scheduledPosts, deleteScheduledPost, updatePostStatus: updatePostStatusInPublisher, updateScheduledPostDate } = usePublisher();

  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('pink_logic_posts');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        title: 'Lançamento Ebook',
        date: new Date(2026, 2, 26, 9, 0).toISOString(),
        type: 'Post',
        product: 'Ebook Fit',
        platform: 'Instagram',
        status: 'posted',
        reach: '1.2k',
        engagement: '154'
      },
      {
        id: '2',
        title: 'Dicas de Stories',
        date: new Date(2026, 2, 26, 15, 0).toISOString(),
        type: 'Stories',
        product: 'Curso SM',
        platform: 'Instagram',
        status: 'pending',
        reach: '-',
        engagement: '-'
      }
    ];
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('pink_logic_tasks');
    return saved ? JSON.parse(saved) : [
      { id: '1', text: 'Criar arte do post', completed: true },
      { id: '2', text: 'Revisar legenda estratégica', completed: false },
      { id: '3', text: 'Programar horário de pico', completed: false },
    ];
  });

  useEffect(() => {
    localStorage.setItem('pink_logic_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('pink_logic_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addPost = (post: Omit<Post, 'id' | 'reach' | 'engagement'>) => {
    const newPost: Post = {
      ...post,
      id: Math.random().toString(36).substr(2, 9),
      reach: '-',
      engagement: '-'
    };
    setPosts(prev => [newPost, ...prev]);
    // Sync with ContentProvider for calendar and content modules
    createContent({
      projectId: '',
      title: newPost.title,
      format: mapPostTypeToContentFormat(newPost.type),
      content: '',
      platform: newPost.platform,
    });
  };

  const deletePost = (id: string) => {
    if ((scheduledPosts || []).some(p => p.id === id)) {
      deleteScheduledPost(id);
      return;
    }
    setPosts(prev => prev.filter(p => p.id !== id));
    removeContent(id);
  };

  const updatePostStatus = (id: string, status: Post['status']) => {
    if ((scheduledPosts || []).some(p => p.id === id)) {
      const spStatus = status === 'posted' ? 'published' : status === 'error' ? 'failed' : 'scheduled';
      updatePostStatusInPublisher(id, spStatus);
      return;
    }
    setPosts(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    updateContent(id, { status: mapPostStatusToContentStatus(status) });
  };

  const updatePostDate = (id: string, newDate: Date) => {
    if ((scheduledPosts || []).some(p => p.id === id)) {
      updateScheduledPostDate(id, newDate);
      return;
    }
    setPosts(prev => prev.map(p => p.id === id ? { ...p, date: newDate.toISOString() } : p));
  };

  const addTask = (text: string) => {
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      completed: false
    };
    setTasks(prev => [...prev, newTask]);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // Convert ScheduledPosts to Gestao Post schema
  const adaptedScheduledPosts = (scheduledPosts || []).map((sp): Post => {
    let pType: Post['type'] = 'Post';
    if (sp.media_type === 'video') pType = 'Video';

    let platformMapped: Post['platform'] = 'Instagram';
    const mainPlat = sp.platforms[0];
    if (mainPlat === 'Instagram') platformMapped = 'Instagram';
    else if (mainPlat === 'Facebook') platformMapped = 'Facebook';
    // X, LinkedIn, etc., map to Instagram/Facebook or let it cast if it satisfies visual checks
    else platformMapped = 'Instagram';

    let statusMapped: Post['status'] = 'pending';
    if (sp.status === 'published') statusMapped = 'posted';
    else if (sp.status === 'failed') statusMapped = 'error';

    return {
      id: sp.id,
      title: `${sp.title} (Agendado)`,
      date: sp.scheduled_at,
      type: pType,
      product: 'Publicador',
      status: statusMapped,
      platform: platformMapped,
      reach: '-',
      engagement: '-'
    };
  });

  const combinedPosts = [...posts, ...adaptedScheduledPosts];

  const metrics = {
    totalPosts: combinedPosts.length,
    pendingPosts: combinedPosts.filter(p => p.status === 'pending').length,
    completedTasks: tasks.filter(t => t.completed).length,
    totalTasks: tasks.length,
    activeCampaigns: 5,
    totalProducts: 8
  };

  return (
    <GestaoContext.Provider value={{
      posts: combinedPosts,
      tasks,
      addPost,
      deletePost,
      updatePostStatus,
      updatePostDate,
      addTask,
      toggleTask,
      deleteTask,
      metrics
    }}>
      {children}
    </GestaoContext.Provider>
  );
};

function mapPostTypeToContentFormat(type: Post['type']): 'post' | 'story' | 'reel' | 'carousel' | 'copy' {
  switch (type) {
    case 'Post': return 'post';
    case 'Stories': return 'story';
    case 'Reels': return 'reel';
    case 'Video': return 'reel';
    case 'Copy': return 'copy';
  }
}

function mapPostStatusToContentStatus(status: Post['status']): 'draft' | 'review' | 'approved' | 'published' {
  switch (status) {
    case 'posted': return 'published';
    case 'pending': return 'draft';
    case 'error': return 'draft';
  }
}

export const useGestao = () => {
  const context = useContext(GestaoContext);
  if (context === undefined) {
    throw new Error('useGestao must be used within a GestaoProvider');
  }
  return context;
};
