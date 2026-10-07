import type { ScheduledPost } from '../../types/publisher';
import { publishToInstagram } from './instagram';
import { publishToFacebook } from './facebook';
import { publishToLinkedIn } from './linkedin';
import { publishToTwitter } from './twitter';
import { publishToWordPress } from './wordpress';
import { publishToBlog } from './blog';

/**
 * Centrally publishes a scheduled post by ID, coordinating individual platform providers.
 * Updates the post status in localStorage and emits events for real-time UI synchronization.
 */
export async function publishPost(postId: string): Promise<ScheduledPost> {
  let posts: ScheduledPost[] = [];
  try {
    const raw = localStorage.getItem('pink_logic_scheduled_posts');
    const parsed = raw ? JSON.parse(raw) : [];
    posts = Array.isArray(parsed) ? parsed : (parsed && typeof parsed === 'object' ? Object.values(parsed) : []);
  } catch {
    posts = [];
  }
  const postIndex = posts.findIndex((p) => p.id === postId);

  if (postIndex === -1) {
    throw new Error('Post not found in database.');
  }

  const post = posts[postIndex];

  // 1. Transition status to 'publishing'
  post.status = 'publishing';
  post.updated_at = new Date().toISOString();
  posts[postIndex] = post;
  localStorage.setItem('pink_logic_scheduled_posts', JSON.stringify(posts));

  // Dispatch custom event to notify components/contexts of changes
  window.dispatchEvent(new Event('scheduled_posts_updated'));

  const errors: string[] = [];

  // 2. Publish to all selected platforms in parallel
  const publishPromises = post.platforms.map(async (platform) => {
    try {
      let result;
      switch (platform) {
        case 'Instagram':
          result = await publishToInstagram(post);
          break;
        case 'Facebook':
          result = await publishToFacebook(post);
          break;
        case 'LinkedIn':
          result = await publishToLinkedIn(post);
          break;
        case 'X/Twitter':
          result = await publishToTwitter(post);
          break;
        case 'WordPress':
          result = await publishToWordPress(post);
          break;
        case 'Blog':
          result = await publishToBlog(post);
          break;
        default:
          result = { success: false, error: `Platform ${platform} is not supported.` };
      }

      if (!result.success) {
        errors.push(`${platform}: ${result.error}`);
      }
    } catch (err: any) {
      errors.push(`${platform}: ${err.message || 'Unknown provider error'}`);
    }
  });

  await Promise.all(publishPromises);

  // 3. Reload current posts (to prevent overwriting concurrent updates) and finalize status
  let currentPosts: ScheduledPost[] = [];
  try {
    const currentRaw = localStorage.getItem('pink_logic_scheduled_posts');
    const parsed = currentRaw ? JSON.parse(currentRaw) : [];
    currentPosts = Array.isArray(parsed) ? parsed : (parsed && typeof parsed === 'object' ? Object.values(parsed) : []);
  } catch {
    currentPosts = [];
  }
  const currentIdx = currentPosts.findIndex((p) => p.id === postId);

  if (currentIdx !== -1) {
    const updatedPost = currentPosts[currentIdx];
    if (errors.length > 0) {
      updatedPost.status = 'failed';
      updatedPost.error_message = errors.join(' | ');
    } else {
      updatedPost.status = 'published';
      updatedPost.published_at = new Date().toISOString();
      updatedPost.error_message = null;
    }
    updatedPost.updated_at = new Date().toISOString();
    currentPosts[currentIdx] = updatedPost;
    localStorage.setItem('pink_logic_scheduled_posts', JSON.stringify(currentPosts));

    // Dispatch custom event to notify UI
    window.dispatchEvent(new Event('scheduled_posts_updated'));
    return updatedPost;
  }

  return post;
}
