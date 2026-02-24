import { assertTrustedOrigin, corsHeaders } from '../utils/cors.js';
import { getPricing } from '../utils/pricing.js';

export async function handleCreateOrder(request, env) {
    try {
        const originError = assertTrustedOrigin(request, env);
        if (originError) return originError;

        const body = await request.json();
        const { name, email, phone, quantity } = body;

        if (!name || !email || !phone || !quantity) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const pricing = getPricing(quantity, 'Prepaid');

        const auth = btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`);
        const orderData = {
            amount: Math.round(pricing.total * 100),
            currency: 'INR',
            receipt: `order_${Date.now()}`,
            notes: {
                customer_name: name,
                customer_email: email,
                customer_phone: phone,
                quantity: pricing.qty,
                batch_date: new Date().toISOString()
            }
        };

        const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${auth}`
            },
            body: JSON.stringify(orderData)
        });

        if (!razorpayResponse.ok) {
            const error = await razorpayResponse.text();
            console.error('Razorpay error:', error);
            return new Response(JSON.stringify({ error: 'Failed to create order' }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const order = await razorpayResponse.json();

        return new Response(JSON.stringify(order), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error creating order:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}

export async function handleVerifyPayment(request, env) {
    try {
        const originError = assertTrustedOrigin(request, env);
        if (originError) return originError;

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

        const message = `${razorpay_order_id}|${razorpay_payment_id}`;
        const encoder = new TextEncoder();
        const keyData = encoder.encode(env.RAZORPAY_KEY_SECRET);

        const key = await crypto.subtle.importKey(
            'raw',
            keyData,
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        );

        const signature = await crypto.subtle.sign(
            'HMAC',
            key,
            encoder.encode(message)
        );

        const hashArray = Array.from(new Uint8Array(signature));
        const generated_signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        const isValid = generated_signature === razorpay_signature;

        if (isValid) {
            return new Response(JSON.stringify({
                success: true,
                message: 'Payment verified successfully'
            }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        } else {
            console.warn('Signature mismatch');
            return new Response(JSON.stringify({
                success: false,
                error: 'Invalid signature'
            }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

    } catch (error) {
        console.error('Error verifying payment:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}
