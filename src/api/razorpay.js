import { assertCsrf, corsHeaders } from '../utils/cors.js';
import { getPricing } from '../utils/pricing.js';

export async function handleCreateOrder(request, env) {
    try {
        const csrfError = await assertCsrf(request, env);
        if (csrfError) return csrfError;
        const body = await request.json();
        const { name, email, phone, quantity, address1, address2, city, state, pincode, easterEggCode } = body;

        if (!name || !email || !phone || !quantity) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const pricing = getPricing(quantity, 'Prepaid', easterEggCode);

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
                address1: address1 || '',
                address2: address2 || '',
                city: city || '',
                state: state || '',
                pincode: pincode || '',
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
        const csrfError = await assertCsrf(request, env);
        if (csrfError) return csrfError;
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

export async function handleRazorpayWebhook(request, env) {
    try {
        const signature = request.headers.get('x-razorpay-signature');
        if (!signature || !env.RAZORPAY_WEBHOOK_SECRET) {
            return new Response('Missing signature or config', { status: 400 });
        }

        const rawBody = await request.text();
        const encoder = new TextEncoder();
        const keyData = encoder.encode(env.RAZORPAY_WEBHOOK_SECRET);
        const key = await crypto.subtle.importKey(
            'raw',
            keyData,
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        );

        const expectedSignatureBuffer = await crypto.subtle.sign(
            'HMAC',
            key,
            encoder.encode(rawBody)
        );
        const hashArray = Array.from(new Uint8Array(expectedSignatureBuffer));
        const expectedSignature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        if (expectedSignature !== signature) {
            return new Response('Invalid signature', { status: 400 });
        }

        const payload = JSON.parse(rawBody);

        if (payload.event === 'payment.captured') {
            const paymentEntity = payload.payload.payment.entity;
            const notes = paymentEntity.notes || {};

            if (!notes.customer_phone) return new Response('OK', { status: 200 }); // Not our checkout order

            const order_id = paymentEntity.order_id;
            const payment_id = paymentEntity.id;
            const amount = paymentEntity.amount / 100;
            const quantityVal = parseInt(notes.quantity || "1", 10);

            // 1. Create Shiprocket Shipment (call internal function directly, no CSRF needed)
            const { createShipmentInternal } = await import('./shiprocket.js');
            const shipmentResult = await createShipmentInternal({
                order_id,
                payment_id,
                customer_name: notes.customer_name,
                customer_email: notes.customer_email,
                customer_phone: notes.customer_phone,
                address1: notes.address1,
                address2: notes.address2,
                city: notes.city,
                state: notes.state,
                pincode: notes.pincode,
                quantity: quantityVal
            }, env);
            let shipmentId = null;
            let trackingNumber = null;
            let courierName = null;

            if (shipmentResult.success) {
                shipmentId = shipmentResult.shipment_id;
                trackingNumber = shipmentResult.awb_code;
                courierName = shipmentResult.courier_name;
            } else {
                console.warn('Webhook shipment creation issue:', shipmentResult.error || shipmentResult.message);
            }

            // 2. Trigger n8n Webhook
            const n8nBody = {
                status: 'complete',
                source: 'backend_webhook',
                name: notes.customer_name,
                email: notes.customer_email,
                phone: notes.customer_phone,
                quantity: quantityVal,
                address1: notes.address1,
                address2: notes.address2,
                city: notes.city,
                state: notes.state,
                pincode: notes.pincode,
                payment_method: 'online',
                payment_type: paymentEntity.method || 'online',
                order_id: order_id,
                payment_id: payment_id,
                amount: amount,
                tracking_number: trackingNumber,
                shipment_id: shipmentId,
                courier_name: courierName
            };

            const n8nWebhook = env.N8N_WEBHOOK_URL || 'https://n8n.prinkit.cloud/webhook/checkout_events';

            // Wait for it so worker execution isn't prematurely killed
            await fetch(n8nWebhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(n8nBody)
            });
        }

        return new Response('OK', { status: 200 });
    } catch (error) {
        console.error('Razorpay Webhook Error:', error);
        return new Response('Internal error', { status: 500 });
    }
}
