import redis from '@/apps/redis';

const ROOT_NODES_CACHE_KEY = (discussionId: number) => `discussion:${discussionId}:root_nodes`;

const cacheService = {
  /**
   * Get cached afterValues for all root nodes in a discussion.
   * Gracefully returns null on Redis failure to allow app to continue.
   */
  async getRootNodesCache(discussionId: number): Promise<Record<number, number> | null> {
    try {
      const cached = await redis.get(ROOT_NODES_CACHE_KEY(discussionId));
      if (!cached) return null;
      return JSON.parse(cached);
    } catch (error) {
      console.warn('Cache Read Failed (Redis Down?):', (error as Error).message);
      return null;
    }
  },

  /**
   * Set cached afterValues for root nodes in a discussion.
   * Fails silently if Redis is unavailable.
   */
  async setRootNodesCache(discussionId: number, data: Record<number, number>): Promise<void> {
    try {
      await redis.set(ROOT_NODES_CACHE_KEY(discussionId), JSON.stringify(data), 'EX', 3600);
    } catch (error) {
      console.warn('Cache Write Failed (Redis Down?):', (error as Error).message);
    }
  },

  /**
   * Invalidate the root nodes cache for a specific discussion.
   * Fails silently if Redis is unavailable.
   */
  async invalidateRootNodesCache(discussionId: number): Promise<void> {
    try {
      await redis.del(ROOT_NODES_CACHE_KEY(discussionId));
    } catch (error) {
      console.warn('Cache Invalidation Failed (Redis Down?):', (error as Error).message);
    }
  },
};

export default cacheService;
