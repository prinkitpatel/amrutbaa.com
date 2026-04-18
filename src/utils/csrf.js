const DEFAULT_CSRF_SECRET = 'amrutbaa-default-csrf-secret-12345';

async function getCryptoKey(env) {
    const secret = env.CSRF_SECRET || DEFAULT_CSRF_SECRET;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    
    return crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign', 'verify']
    );
}

export async function generateCsrfToken(env) {
    const timestamp = Date.now().toString();
    const random = crypto.randomUUID();
    const message = `${timestamp}:${random}`;
    
    const key = await getCryptoKey(env);
    const signatureBuffer = await crypto.subtle.sign(
        'HMAC',
        key,
        new TextEncoder().encode(message)
    );
    
    const hashArray = Array.from(new Uint8Array(signatureBuffer));
    const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Return base64 encoded token: message.signature
    return btoa(`${message}.${signature}`);
}

export async function verifyCsrfToken(token, env) {
    if (!token) return false;
    
    try {
        const decoded = atob(token);
        const [message, signature] = decoded.split('.');
        if (!message || !signature) return false;
        
        // Check for expiry (e.g., 2 hours)
        const [timestamp] = message.split(':');
        const tokenTime = parseInt(timestamp, 10);
        if (isNaN(tokenTime) || Date.now() - tokenTime > 2 * 60 * 60 * 1000) {
            return false;
        }

        const key = await getCryptoKey(env);
        const expectedBuffer = await crypto.subtle.sign(
            'HMAC',
            key,
            new TextEncoder().encode(message)
        );
        
        const hashArray = Array.from(new Uint8Array(expectedBuffer));
        const expectedSignature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        return expectedSignature === signature;
    } catch (e) {
        return false;
    }
}
