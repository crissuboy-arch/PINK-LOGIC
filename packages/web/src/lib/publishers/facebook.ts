import type { ScheduledPost } from '../../types/publisher';
import type { PublishResult } from './instagram';

export async function publishToFacebook(post: ScheduledPost): Promise<PublishResult> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (post.title.toLowerCase().includes('fail-facebook') || post.caption.toLowerCase().includes('fail-facebook')) {
    return {
      success: false,
      error: 'Facebook Page API Error: Oauth exception while publishing post feed.',
    };
  }

  return {
    success: true,
    publishedAt: new Date(),
  };
}
