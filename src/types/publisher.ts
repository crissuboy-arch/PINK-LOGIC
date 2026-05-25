export type PublisherPlatform = 'Instagram' | 'Facebook' | 'LinkedIn' | 'X/Twitter' | 'WordPress' | 'Blog';

export type PublishStatus = 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed' | 'cancelled';

export interface ScheduledPost {
  id: string;
  user_id: string;
  project_id?: string | null;
  brand_id?: string | null;
  title: string;
  caption: string;
  hashtags: string[];
  media_url?: string;
  media_type?: string;
  platforms: PublisherPlatform[];
  scheduled_at: string; // ISO String
  timezone: string;
  status: PublishStatus;
  error_message?: string | null;
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SocialAccount {
  id: string;
  user_id: string;
  platform: PublisherPlatform;
  account_name: string;
  access_token?: string | null;
  refresh_token?: string | null;
  expires_at?: string | null;
  status: 'connected' | 'disconnected';
  created_at?: string;
  updated_at?: string;
}
