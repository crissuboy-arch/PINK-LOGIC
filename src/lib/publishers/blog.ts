import type { ScheduledPost } from '../../types/publisher';
import type { PublishResult } from './instagram';

export async function publishToBlog(post: ScheduledPost): Promise<PublishResult> {
  await new Promise((resolve) => setTimeout(resolve, 900));

  if (post.title.toLowerCase().includes('fail-blog') || post.caption.toLowerCase().includes('fail-blog')) {
    return {
      success: false,
      error: 'Internal Blog API Error: Database write timeout. Content could not be parsed.',
    };
  }

  if (!post.title) {
    return {
      success: false,
      error: 'Internal blog requires a title.',
    };
  }

  return {
    success: true,
    publishedAt: new Date(),
  };
}
