import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const auditRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '60 s'),
  analytics: true,
  prefix: 'whc:audit',
});

export const reportRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, '60 s'),
  analytics: true,
  prefix: 'whc:report',
});
