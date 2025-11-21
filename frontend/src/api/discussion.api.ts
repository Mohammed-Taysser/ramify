import EntityService from '@/apps/entity-service';

class DiscussionService extends EntityService<
  Discussion,
  DiscussionCreatePayload,
  DiscussionUpdatePayload,
  DiscussionFilterParams
> {
  constructor() {
    super('discussion');
  }
}

export default new DiscussionService();
