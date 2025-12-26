import redis from '@/apps/redis';

const ROOT_NODES_CACHE_KEY = (discussionId: number) => `discussion:${discussionId}:root_nodes`;

const cacheService = {
  /**
   * Get cached afterValues for all root nodes in a discussion
   */
  async getRootNodesCache(discussionId: number): Promise<Record<number, number> | null> {
    const cached = await redis.get(ROOT_NODES_CACHE_KEY(discussionId));
    if (!cached) return null;
    return JSON.parse(cached);
  },

  /**
   * Set cached afterValues for root nodes in a discussion
   */
  async setRootNodesCache(discussionId: number, data: Record<number, number>): Promise<void> {
    await redis.set(ROOT_NODES_CACHE_KEY(discussionId), JSON.stringify(data), 'EX', 3600); // 1 hour TTL
  },

  /**
   * Invalidate the root nodes cache for a specific discussion
   */
  async invalidateRootNodesCache(discussionId: number): Promise<void> {
    await redis.del(ROOT_NODES_CACHE_KEY(discussionId));
  },
};

export default cacheService;
