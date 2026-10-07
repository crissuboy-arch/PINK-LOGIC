import type { ScheduledPost } from '../../types/publisher';
import type { PublishResult } from './instagram';

export async function publishToLinkedIn(post: ScheduledPost): Promise<PublishResult> {
  await new Promise((resolve) => setTimeout(resolve, 1400));

  if (post.title.toLowerCase().includes('fail-linkedin') || post.caption.toLowerCase().includes('fail-linkedin')) {
    return {
      success: false,
      error: 'LinkedIn UGC Post API Error: Resource not found or partner access restricted.',
    };
  }

  return {
    success: true,
    publishedAt: new Date(),
  };
}
