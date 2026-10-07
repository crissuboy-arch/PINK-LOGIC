import type { ScheduledPost } from '../../types/publisher';
import type { PublishResult } from './instagram';

export async function publishToWordPress(post: ScheduledPost): Promise<PublishResult> {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  if (post.title.toLowerCase().includes('fail-wordpress') || post.caption.toLowerCase().includes('fail-wordpress')) {
    return {
      success: false,
      error: 'WordPress REST API Error: 401 Unauthorized. Application passwords invalid.',
    };
  }

  if (!post.title) {
    return {
      success: false,
      error: 'WordPress requires a post title.',
    };
  }

  return {
    success: true,
    publishedAt: new Date(),
  };
}
