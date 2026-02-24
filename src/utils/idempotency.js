export async function acquireIdempotencyLock(lockId, ttlSeconds = 86400) {
    const cache = caches.default;
    const lockKey = new Request(`https://idempotency.amrutbaa.internal/${encodeURIComponent(lockId)}`, { method: 'GET' });
    const existing = await cache.match(lockKey);
    if (existing) return false;
    await cache.put(
        lockKey,
        new Response('locked', {
            headers: {
                'Cache-Control': `max-age=${ttlSeconds}`
            }
        })
    );
    return true;
}
