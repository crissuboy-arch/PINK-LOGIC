import type { ScheduledPost } from '../../types/publisher';

export interface PublishResult {
  success: boolean;
  error?: string;
  publishedAt?: Date;
}

export async function publishToInstagram(post: ScheduledPost): Promise<PublishResult> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1200));

  // Visual/Mock conditions:
  // If user types 'fail-instagram' or similar in title, trigger a simulated error
  if (post.title.toLowerCase().includes('fail-instagram') || post.caption.toLowerCase().includes('fail-instagram')) {
    return {
      success: false,
      error: 'Instagram Graph API Error: Media upload failed. User token expired or invalid permissions.',
    };
  }

  // Require media for Instagram
  if (!post.media_url && !post.caption) {
    return {
      success: false,
      error: 'Instagram requires either an image/video or a non-empty caption.',
    };
  }

  return {
    success: true,
    publishedAt: new Date(),
  };
}
