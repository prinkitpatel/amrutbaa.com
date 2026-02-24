export async function hashPII(value) {
    if (!value) return null;
    const normalized = String(value).toLowerCase().trim();
    const data = new TextEncoder().encode(normalized);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}
