import type { ScheduledPost } from '../../types/publisher';
import type { PublishResult } from './instagram';

export async function publishToTwitter(post: ScheduledPost): Promise<PublishResult> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  if (post.title.toLowerCase().includes('fail-twitter') || post.caption.toLowerCase().includes('fail-twitter') || post.title.toLowerCase().includes('fail-x')) {
    return {
      success: false,
      error: 'X/Twitter API v2 Error: Tweet length exceeds character limits or rate limit exceeded.',
    };
  }

  // Check character limits for X
  const totalLength = (post.caption || '').length + (post.hashtags || []).join(' ').length;
  if (totalLength > 280) {
    return {
      success: false,
      error: 'X/Twitter Error: Caption exceeds 280 characters limit.',
    };
  }

  return {
    success: true,
    publishedAt: new Date(),
  };
}
