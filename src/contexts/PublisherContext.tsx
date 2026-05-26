import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ScheduledPost, SocialAccount, PublisherPlatform, PublishStatus } from '../types/publisher';
import { publishPost } from '../lib/publishers';

interface PublisherContextType {
  scheduledPosts: ScheduledPost[];
  socialAccounts: SocialAccount[];
  createScheduledPost: (
    post: Omit<ScheduledPost, 'id' | 'user_id' | 'status' | 'created_at' | 'updated_at'>
  ) => ScheduledPost;
  deleteScheduledPost: (id: string) => void;
  updatePostStatus: (id: string, status: PublishStatus, errorMessage?: string | null) => void;
  updateScheduledPostDate: (id: string, date: Date) => void;
  connectAccount: (platform: PublisherPlatform, name: string) => void;
  disconnectAccount: (id: string) => void;
  publishPostNow: (id: string) => Promise<void>;
  isLoading: boolean;
}

const PublisherContext = createContext<PublisherContextType | undefined>(undefined);

const LOCAL_STORAGE_POSTS = 'pink_logic_scheduled_posts';
const LOCAL_STORAGE_ACCOUNTS = 'pink_logic_social_accounts';

const DEFAULT_ACCOUNTS: SocialAccount[] = [
  { id: 'acc-1', user_id: 'user-default', platform: 'Instagram', account_name: 'pinklogic_ig', status: 'disconnected' },
  { id: 'acc-2', user_id: 'user-default', platform: 'Facebook', account_name: 'Pink Logic Page', status: 'disconnected' },
  { id: 'acc-3', user_id: 'user-default', platform: 'LinkedIn', account_name: 'Pink Logic Corporation', status: 'disconnected' },
  { id: 'acc-4', user_id: 'user-default', platform: 'X/Twitter', account_name: '@pinklogic_ai', status: 'disconnected' },
  { id: 'acc-5', user_id: 'user-default', platform: 'WordPress', account_name: 'Pink Logic Editorial', status: 'disconnected' },
  { id: 'acc-6', user_id: 'user-default', platform: 'Blog', account_name: 'Blog Interno', status: 'disconnected' },
];

export const PublisherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage
  const loadData = useCallback(() => {
    try {
      const savedPosts = localStorage.getItem(LOCAL_STORAGE_POSTS);
      const savedAccounts = localStorage.getItem(LOCAL_STORAGE_ACCOUNTS);

      if (savedPosts) {
        try {
          const parsed = JSON.parse(savedPosts);
          if (Array.isArray(parsed)) {
            setScheduledPosts(parsed);
          } else if (parsed && typeof parsed === 'object') {
            setScheduledPosts(Object.values(parsed));
          } else {
            setScheduledPosts([]);
          }
        } catch {
          setScheduledPosts([]);
        }
      } else {
        setScheduledPosts([]);
      }

      if (savedAccounts) {
        try {
          const parsed = JSON.parse(savedAccounts);
          if (Array.isArray(parsed)) {
            setSocialAccounts(parsed);
          } else if (parsed && typeof parsed === 'object') {
            setSocialAccounts(Object.values(parsed));
          } else {
            setSocialAccounts(DEFAULT_ACCOUNTS);
          }
        } catch {
          setSocialAccounts(DEFAULT_ACCOUNTS);
        }
      } else {
        setSocialAccounts(DEFAULT_ACCOUNTS);
        localStorage.setItem(LOCAL_STORAGE_ACCOUNTS, JSON.stringify(DEFAULT_ACCOUNTS));
      }
    } catch (e) {
      console.error('[PublisherContext] Error loading data:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Listen to background updates (e.g. from central publishPost function)
    const handleStorageUpdate = () => {
      loadData();
    };
    window.addEventListener('scheduled_posts_updated', handleStorageUpdate);
    return () => {
      window.removeEventListener('scheduled_posts_updated', handleStorageUpdate);
    };
  }, [loadData]);

  // Save posts to localStorage helper
  const savePosts = (posts: ScheduledPost[]) => {
    setScheduledPosts(posts);
    localStorage.setItem(LOCAL_STORAGE_POSTS, JSON.stringify(posts));
    // Trigger window event so other context/listeners can sync
    window.dispatchEvent(new Event('scheduled_posts_updated'));
  };

  // Save accounts to localStorage helper
  const saveAccounts = (accounts: SocialAccount[]) => {
    setSocialAccounts(accounts);
    localStorage.setItem(LOCAL_STORAGE_ACCOUNTS, JSON.stringify(accounts));
  };

  // Actions
  const createScheduledPost = (
    postData: Omit<ScheduledPost, 'id' | 'user_id' | 'status' | 'created_at' | 'updated_at'>
  ): ScheduledPost => {
    const newPost: ScheduledPost = {
      ...postData,
      id: crypto.randomUUID(),
      user_id: 'user-default',
      status: 'scheduled', // Starts in scheduled status
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updated = [newPost, ...scheduledPosts];
    savePosts(updated);
    return newPost;
  };

  const deleteScheduledPost = (id: string) => {
    const updated = scheduledPosts.filter((p) => p.id !== id);
    savePosts(updated);
  };

  const updatePostStatus = (id: string, status: PublishStatus, errorMessage?: string | null) => {
    const updated = scheduledPosts.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          status,
          error_message: errorMessage || null,
          published_at: status === 'published' ? new Date().toISOString() : p.published_at,
          updated_at: new Date().toISOString(),
        };
      }
      return p;
    });
    savePosts(updated);
  };

  const updateScheduledPostDate = (id: string, newDate: Date) => {
    const updated = scheduledPosts.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          scheduled_at: newDate.toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
      return p;
    });
    savePosts(updated);
  };

  const connectAccount = (platform: PublisherPlatform, name: string) => {
    const updated = socialAccounts.map((acc) => {
      if (acc.platform === platform) {
        return { ...acc, account_name: name || acc.account_name, status: 'connected' as const, updated_at: new Date().toISOString() };
      }
      return acc;
    });
    saveAccounts(updated);
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

  const publishPostNow = async (id: string) => {
    try {
      await publishPost(id);
    } catch (e) {
      console.error('[PublisherContext] Error publishing post now:', e);
    }
  };

  // Background Scheduler Simulation: Checks every 8 seconds for posts that should be published
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      scheduledPosts.forEach((post) => {
        if (post.status === 'scheduled') {
          const scheduledTime = new Date(post.scheduled_at);
          if (scheduledTime <= now) {
            console.log(`[Scheduler] Auto-publishing scheduled post: "${post.title}"`);
            publishPostNow(post.id);
          }
        }
      });
    }, 8000);

    return () => clearInterval(interval);
  }, [scheduledPosts]);

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
