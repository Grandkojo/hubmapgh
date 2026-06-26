export class RateLimiter {
  private cache = new Map<string, { count: number; timestamp: number }>();
  private limit: number;
  private windowMs: number;

  constructor(limit: number, windowMs: number) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  check(ip: string): boolean {
    const now = Date.now();
    const record = this.cache.get(ip);

    // If no record or window expired, reset
    if (!record || now - record.timestamp > this.windowMs) {
      this.cache.set(ip, { count: 1, timestamp: now });
      return true;
    }

    // Inside window, check limit
    if (record.count >= this.limit) {
      return false; // Rate limit exceeded
    }

    // Increment count
    record.count++;
    return true;
  }
}

// Global instance for the API routes
// 10 requests per 5 minutes
export const apiRateLimiter = new RateLimiter(10, 5 * 60 * 1000);
