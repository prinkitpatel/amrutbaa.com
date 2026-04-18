import { verifyCsrfToken } from './csrf.js';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-CSRF-Token',
};

export async function assertCsrf(req, env) {
  const token = req.headers.get('X-CSRF-Token');
  const isValid = await verifyCsrfToken(token, env);
  
  if (!isValid) {
    return new Response(JSON.stringify({ error: 'Invalid security token' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  return null;
}
