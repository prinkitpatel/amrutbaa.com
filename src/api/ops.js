import { assertTrustedOrigin, corsHeaders } from '../utils/cors.js';

export async function handleOpsAlert(request, env) {
    try {
        const originError = assertTrustedOrigin(request, env);
        if (originError) return originError;

        const alertData = await request.json();
        const opsWebhookUrl = env.OPS_ALERT_WEBHOOK_URL || env.N8N_WEBHOOK_URL;

        if (!opsWebhookUrl) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Ops webhook not configured'
            }), {
                status: 503,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        await fetch(opsWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                source: 'ops_alert',
                ...alertData
            })
        });

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}

export function handleHealthCheck(request, env) {
    return new Response(JSON.stringify({
        status: 'ok',
        services: {
            razorpay: !!env.RAZORPAY_KEY_ID,
            shiprocket: !!env.SHIPROCKET_EMAIL,
            meta: !!env.META_DATASET_ID && !!env.META_ACCESS_TOKEN,
            ops_alert: !!(env.OPS_ALERT_WEBHOOK_URL || env.N8N_WEBHOOK_URL)
        }
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}
