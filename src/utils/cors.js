export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export function extractRequestOrigin(req) {
  const origin = req.headers.get('origin');
  if (origin) return origin.toLowerCase();
  const referer = req.headers.get('referer');
  if (!referer) return null;
  try {
    return new URL(referer).origin.toLowerCase();
  } catch (_) {
    return null;
  }
}

export function isTrustedOrigin(req, env) {
  const defaultAllowedOrigins = [
    'https://amrutbaa.com',
    'https://www.amrutbaa.com',
    'https://amrutbaa-com.prinkit-patel.workers.dev',
    'http://localhost:8787',
    'http://127.0.0.1:8787',
    'null',
    'https://l.instagram.com',
    'https://l.facebook.com',
    'android-app://com.instagram.android',
    'android-app://com.facebook.katana'
  ];
  const configuredOrigins = (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim().toLowerCase())
    .filter(Boolean);
  const allowedOrigins = new Set([
    ...defaultAllowedOrigins.map((origin) => origin.toLowerCase()),
    ...configuredOrigins
  ]);

  const requestOrigin = extractRequestOrigin(req);
  
  // In-app browsers (like Instagram) often strip Origin and Referer headers for privacy.
  // If they are missing, check if the request comes from a known social media user agent.
  if (!requestOrigin) {
    const ua = (req.headers.get('user-agent') || '').toLowerCase();
    if (ua.includes('instagram') || ua.includes('fbav') || ua.includes('fban') || ua.includes('facebook')) {
      return true;
    }
    return false;
  }

  if (allowedOrigins.has(requestOrigin)) return true;

  // Allow staging/preview environments dynamically
  if (requestOrigin.endsWith('.pages.dev')) return true;
  if (requestOrigin.endsWith('.workers.dev')) return true;

  return false;
}

export function assertTrustedOrigin(req, env) {
  return isTrustedOrigin(req, env)
    ? null
    : new Response(JSON.stringify({ error: 'Forbidden origin' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}
