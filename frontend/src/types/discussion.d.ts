


interface Discussion extends BaseEntity {
  title: string;
  operations: Operation[];
  user: User;
  startingValue: number;
}

interface DiscussionFilterParams {
  title?: string;
  userId?: number;
}

interface DiscussionFormFields {
  title: string;
  initialValue: number;
}

interface DiscussionCreatePayload {
  title: string;
  startingValue: number;
}

interface DiscussionUpdatePayload extends DiscussionCreatePayload {
  id: number;
}
