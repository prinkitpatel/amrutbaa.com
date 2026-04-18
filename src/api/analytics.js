import { assertCsrf, corsHeaders } from '../utils/cors.js';
import { hashPII } from '../utils/crypto.js';
import { getEventSourceUrl, getClientIP, getUserAgent } from '../utils/request.js';

export async function handleTrackAddPaymentInfo(request, env) {
    try {
        const csrfError = await assertCsrf(request, env);
        if (csrfError) return csrfError;
        if (!env.META_DATASET_ID || !env.META_ACCESS_TOKEN) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Meta credentials not configured'
            }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const { name, email, phone, quantity, postcode, city, fbc, fbp, event_id, test_event_code } = await request.json();

        if (!email && !phone) {
            return new Response(JSON.stringify({ error: 'Email or phone required' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const clientIP = getClientIP(request);
        const userAgent = getUserAgent(request);

        const safeName = name ? String(name).trim() : '';
        const nameParts = safeName.split(/\s+/).filter(Boolean);
        const firstName = nameParts[0] || '';
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

        const [em, ph, fn, ln, zp, ct] = await Promise.all([
            email ? hashPII(email) : Promise.resolve(null),
            phone ? hashPII(phone) : Promise.resolve(null),
            firstName ? hashPII(firstName) : Promise.resolve(null),
            lastName ? hashPII(lastName) : Promise.resolve(null),
            postcode ? hashPII(postcode) : Promise.resolve(null),
            city ? hashPII(city) : Promise.resolve(null)
        ]);

        const metaPayload = {
            data: [
                {
                    event_name: 'AddPaymentInfo',
                    event_time: Math.floor(Date.now() / 1000),
                    event_id: event_id || `addpaymentinfo_${Date.now()}`,
                    event_source_url: getEventSourceUrl(request),
                    action_source: 'website',
                    user_data: {
                        em: em || undefined,
                        ph: ph || undefined,
                        fn: fn || undefined,
                        ln: ln || undefined,
                        zp: zp || undefined,
                        ct: ct || undefined,
                        client_ip_address: clientIP || undefined,
                        client_user_agent: userAgent || undefined,
                        fbc: fbc || undefined,
                        fbp: fbp || undefined,
                        external_id: em || ph || undefined
                    },
                    custom_data: {
                        currency: 'INR',
                        value: quantity || 1,
                        content_name: 'Amrut Baa Chutney',
                        content_type: 'product'
                    }
                }
            ]
        };

        if (test_event_code) {
            metaPayload.test_event_code = test_event_code;
        }

        const metaResponse = await fetch(
            `https://graph.facebook.com/v19.0/${env.META_DATASET_ID}/events?access_token=${env.META_ACCESS_TOKEN}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(metaPayload)
            }
        );

        if (!metaResponse.ok) {
            const error = await metaResponse.text();
            console.error('Meta API error:', error);
            return new Response(JSON.stringify({
                success: false,
                error: 'Failed to track lead',
                details: error
            }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const metaResult = await metaResponse.json();
        console.log('AddPaymentInfo tracked successfully:', metaResult);

        return new Response(JSON.stringify({
            success: true,
            message: 'AddPaymentInfo tracked successfully',
            event_id: `addpaymentinfo_${Date.now()}`
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Track addpaymentinfo error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}

export async function handleTrackPurchase(request, env) {
    try {
        const csrfError = await assertCsrf(request, env);
        if (csrfError) return csrfError;
        if (!env.META_DATASET_ID || !env.META_ACCESS_TOKEN) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Meta credentials not configured'
            }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const { name, email, phone, amount, quantity, payment_id, postcode, city, fbc, fbp, event_id, test_event_code } = await request.json();

        if (!email && !phone) {
            return new Response(JSON.stringify({ error: 'Email or phone required' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const clientIP = getClientIP(request);
        const userAgent = getUserAgent(request);

        const safeName = name ? String(name).trim() : '';
        const nameParts = safeName.split(/\s+/).filter(Boolean);
        const firstName = nameParts[0] || '';
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

        const [em, ph, fn, ln, zp, ct] = await Promise.all([
            email ? hashPII(email) : Promise.resolve(null),
            phone ? hashPII(phone) : Promise.resolve(null),
            firstName ? hashPII(firstName) : Promise.resolve(null),
            lastName ? hashPII(lastName) : Promise.resolve(null),
            postcode ? hashPII(postcode) : Promise.resolve(null),
            city ? hashPII(city) : Promise.resolve(null)
        ]);

        const metaPayload = {
            data: [
                {
                    event_name: 'Purchase',
                    event_time: Math.floor(Date.now() / 1000),
                    event_id: event_id || `purchase_${payment_id || Date.now()}`,
                    event_source_url: getEventSourceUrl(request),
                    action_source: 'website',
                    user_data: {
                        em: em || undefined,
                        ph: ph || undefined,
                        fn: fn || undefined,
                        ln: ln || undefined,
                        zp: zp || undefined,
                        ct: ct || undefined,
                        client_ip_address: clientIP || undefined,
                        client_user_agent: userAgent || undefined,
                        fbc: fbc || undefined,
                        fbp: fbp || undefined,
                        external_id: em || ph || undefined
                    },
                    custom_data: {
                        currency: 'INR',
                        value: Number(amount) || 0,
                        content_name: 'Amrut Baa Chutney',
                        content_type: 'product',
                        content_id: 'AMB-CGC-100G',
                        num_items: quantity || 1,
                        transaction_id: payment_id
                    }
                }
            ]
        };

        if (test_event_code) {
            metaPayload.test_event_code = test_event_code;
        }

        const metaResponse = await fetch(
            `https://graph.facebook.com/v19.0/${env.META_DATASET_ID}/events?access_token=${env.META_ACCESS_TOKEN}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(metaPayload)
            }
        );

        if (!metaResponse.ok) {
            const error = await metaResponse.text();
            console.error('Meta API error:', error);
            return new Response(JSON.stringify({
                success: false,
                error: 'Failed to track purchase',
                details: error
            }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const metaResult = await metaResponse.json();
        console.log('Purchase tracked successfully:', metaResult);

        return new Response(JSON.stringify({
            success: true,
            message: 'Purchase tracked successfully',
            event_id: `purchase_${payment_id || Date.now()}`
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Track purchase error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}

export async function handleTrackView(request, env) {
    try {
        const csrfError = await assertCsrf(request, env);
        if (csrfError) return csrfError;
        if (!env.META_DATASET_ID || !env.META_ACCESS_TOKEN) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Meta credentials not configured'
            }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const data = await request.json();
        const { email, phone, postcode, city, fbc, fbp, event_id, test_event_code } = data;

        const clientIP = getClientIP(request);
        const userAgent = getUserAgent(request);

        const [em, ph, zp, ct] = await Promise.all([
            email ? hashPII(email) : Promise.resolve(null),
            phone ? hashPII(phone) : Promise.resolve(null),
            postcode ? hashPII(postcode) : Promise.resolve(null),
            city ? hashPII(city) : Promise.resolve(null)
        ]);

        const metaPayload = {
            data: [
                {
                    event_name: 'ViewContent',
                    event_time: Math.floor(Date.now() / 1000),
                    event_id: event_id || `view_${Date.now()}`,
                    event_source_url: getEventSourceUrl(request),
                    action_source: 'website',
                    user_data: {
                        em: em || undefined,
                        ph: ph || undefined,
                        zp: zp || undefined,
                        ct: ct || undefined,
                        client_ip_address: clientIP || undefined,
                        client_user_agent: userAgent || undefined,
                        fbc: fbc || undefined,
                        fbp: fbp || undefined,
                        external_id: em || ph || undefined
                    },
                    custom_data: {
                        currency: 'INR',
                        value: 299,
                        content_name: 'Amrut Baa Chilly Garlic Chutney',
                        content_type: 'product',
                        content_id: 'AMB-CGC-100G'
                    }
                }
            ]
        };

        if (test_event_code) {
            metaPayload.test_event_code = test_event_code;
        }

        const metaResponse = await fetch(
            `https://graph.facebook.com/v19.0/${env.META_DATASET_ID}/events?access_token=${env.META_ACCESS_TOKEN}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(metaPayload)
            }
        );

        const metaResult = await metaResponse.json();
        console.log('ViewContent tracked:', metaResult);

        return new Response(JSON.stringify({
            success: true,
            message: 'ViewContent tracked successfully',
            event_id: `view_${Date.now()}`
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Track view error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}

export async function handleTrackAddToCart(request, env) {
    try {
        const csrfError = await assertCsrf(request, env);
        if (csrfError) return csrfError;
        if (!env.META_DATASET_ID || !env.META_ACCESS_TOKEN) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Meta credentials not configured'
            }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const data = await request.json();
        const { quantity, value, email, phone, postcode, city, fbc, fbp, event_id, test_event_code } = data;

        const clientIP = getClientIP(request);
        const userAgent = getUserAgent(request);

        const [em, ph, zp, ct] = await Promise.all([
            email ? hashPII(email) : Promise.resolve(null),
            phone ? hashPII(phone) : Promise.resolve(null),
            postcode ? hashPII(postcode) : Promise.resolve(null),
            city ? hashPII(city) : Promise.resolve(null)
        ]);

        const metaPayload = {
            data: [
                {
                    event_name: 'AddToCart',
                    event_time: Math.floor(Date.now() / 1000),
                    event_id: event_id || `addtocart_${Date.now()}`,
                    event_source_url: getEventSourceUrl(request),
                    action_source: 'website',
                    user_data: {
                        em: em || undefined,
                        ph: ph || undefined,
                        zp: zp || undefined,
                        ct: ct || undefined,
                        client_ip_address: clientIP || undefined,
                        client_user_agent: userAgent || undefined,
                        fbc: fbc || undefined,
                        fbp: fbp || undefined,
                        external_id: em || ph || undefined
                    },
                    custom_data: {
                        currency: 'INR',
                        value: Number(value) || 0,
                        content_name: 'Amrut Baa Chilly Garlic Chutney',
                        content_type: 'product',
                        content_id: 'AMB-CGC-100G',
                        num_items: Number(quantity) || 1
                    }
                }
            ]
        };

        if (test_event_code) {
            metaPayload.test_event_code = test_event_code;
        }

        const metaResponse = await fetch(
            `https://graph.facebook.com/v19.0/${env.META_DATASET_ID}/events?access_token=${env.META_ACCESS_TOKEN}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(metaPayload)
            }
        );

        const metaResult = await metaResponse.json();
        console.log('AddToCart tracked:', metaResult);

        return new Response(JSON.stringify({
            success: true,
            message: 'AddToCart tracked successfully',
            event_id: `addtocart_${Date.now()}`
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Track addtocart error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}

export async function handleTrackInitiateCheckout(request, env) {
    try {
        const csrfError = await assertCsrf(request, env);
        if (csrfError) return csrfError;
        if (!env.META_DATASET_ID || !env.META_ACCESS_TOKEN) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Meta credentials not configured'
            }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const data = await request.json();
        const { quantity, value, email, phone, postcode, city, fbc, fbp, event_id, test_event_code } = data;

        const clientIP = getClientIP(request);
        const userAgent = getUserAgent(request);

        const [em, ph, zp, ct] = await Promise.all([
            email ? hashPII(email) : Promise.resolve(null),
            phone ? hashPII(phone) : Promise.resolve(null),
            postcode ? hashPII(postcode) : Promise.resolve(null),
            city ? hashPII(city) : Promise.resolve(null)
        ]);

        const metaPayload = {
            data: [
                {
                    event_name: 'InitiateCheckout',
                    event_time: Math.floor(Date.now() / 1000),
                    event_id: event_id || `checkout_${Date.now()}`,
                    event_source_url: getEventSourceUrl(request),
                    action_source: 'website',
                    user_data: {
                        em: em || undefined,
                        ph: ph || undefined,
                        zp: zp || undefined,
                        ct: ct || undefined,
                        client_ip_address: clientIP || undefined,
                        client_user_agent: userAgent || undefined,
                        fbc: fbc || undefined,
                        fbp: fbp || undefined,
                        external_id: em || ph || undefined
                    },
                    custom_data: {
                        currency: 'INR',
                        value: Number(value) || 0,
                        content_name: 'Amrut Baa Chilly Garlic Chutney',
                        content_type: 'product',
                        content_id: 'AMB-CGC-100G',
                        num_items: Number(quantity) || 1
                    }
                }
            ]
        };

        if (test_event_code) {
            metaPayload.test_event_code = test_event_code;
        }

        const metaResponse = await fetch(
            `https://graph.facebook.com/v19.0/${env.META_DATASET_ID}/events?access_token=${env.META_ACCESS_TOKEN}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(metaPayload)
            }
        );

        const metaResult = await metaResponse.json();
        console.log('InitiateCheckout tracked:', metaResult);

        return new Response(JSON.stringify({
            success: true,
            message: 'InitiateCheckout tracked successfully',
            event_id: `checkout_${Date.now()}`
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Track initiate checkout error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}
