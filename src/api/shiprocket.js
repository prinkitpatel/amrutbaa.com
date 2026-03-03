import { assertTrustedOrigin, corsHeaders } from '../utils/cors.js';
import { getPricing } from '../utils/pricing.js';
import { acquireIdempotencyLock } from '../utils/idempotency.js';

let shiprocketTokenCache = {
    token: null,
    expiresAt: 0
};

// Get Shiprocket Auth Token (cached for 24 hours)
async function getShiprocketToken(env) {
    try {
        const now = Date.now();
        if (shiprocketTokenCache.token && shiprocketTokenCache.expiresAt > now) {
            return shiprocketTokenCache.token;
        }

        const response = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: env.SHIPROCKET_EMAIL,
                password: env.SHIPROCKET_PASSWORD
            })
        });

        if (!response.ok) {
            throw new Error('Failed to authenticate with Shiprocket');
        }

        const data = await response.json();
        shiprocketTokenCache = {
            token: data.token,
            expiresAt: now + (23 * 60 * 60 * 1000)
        };
        return data.token;
    } catch (error) {
        console.error('Shiprocket auth error:', error);
        throw error;
    }
}

async function checkShiprocketServiceability(env, { pincode, weight = 0.23, cod = false }) {
    if (!env.SHIPROCKET_PICKUP_PINCODE) {
        return { success: false, error: 'Pickup pincode not configured' };
    }

    const token = await getShiprocketToken(env);
    const queryParams = new URLSearchParams({
        pickup_postcode: env.SHIPROCKET_PICKUP_PINCODE,
        delivery_postcode: String(pincode),
        cod: cod ? 1 : 0,
        weight: Number(weight) || 0.23
    });

    const response = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/serviceability/?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        return {
            success: false,
            error: 'Failed to check pincode serviceability',
            details: errorText
        };
    }

    const serviceabilityData = await response.json();
    const couriers = serviceabilityData?.data?.available_courier_companies || [];
    const serviceable = Array.isArray(couriers) && couriers.length > 0;

    return {
        success: true,
        serviceable,
        courier_count: couriers.length,
        data: serviceabilityData?.data || null
    };
}

export async function handleCreateCodOrder(request, env) {
    try {
        const originError = assertTrustedOrigin(request, env);
        if (originError) return originError;

        const orderData = await request.json();
        const {
            customer_name,
            customer_email,
            customer_phone,
            address1,
            address2,
            city,
            state,
            pincode,
            quantity,
            client_order_ref
        } = orderData;

        if (!customer_name || !customer_phone || !address1 || !city || !state || !pincode) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Missing required shipping details'
            }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const pricing = getPricing(quantity, 'COD');
        const safeQuantity = pricing.qty;
        const safeUnitPrice = pricing.unitPrice;
        const safeDiscount = pricing.discount;
        const safeAmount = pricing.total;
        const safeWeight = Number((0.23 * safeQuantity).toFixed(2));

        const lockSeed = client_order_ref || `${customer_phone}|${pincode}|${safeAmount}|${safeQuantity}`;
        const lockId = `cod:${lockSeed}`;
        const codLockAcquired = await acquireIdempotencyLock(lockId, 6 * 60 * 60);
        if (!codLockAcquired) {
            return new Response(JSON.stringify({
                success: true,
                duplicate: true,
                order_id: client_order_ref || null,
                message: 'Duplicate COD request ignored'
            }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const codServiceability = await checkShiprocketServiceability(env, {
            pincode,
            weight: safeWeight,
            cod: true
        });

        if (!codServiceability.success) {
            return new Response(JSON.stringify({
                success: false,
                error: codServiceability.error,
                details: codServiceability.details
            }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (!codServiceability.serviceable) {
            return new Response(JSON.stringify({
                success: false,
                error: 'COD is not serviceable for this pincode'
            }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const token = await getShiprocketToken(env);

        const shipmentData = {
            order_id: `COD-${Date.now()}-${Math.random().toString(36).slice(2, 11).toUpperCase()}`,
            order_date: new Date().toISOString().split('T')[0],
            pickup_location: env.SHIPROCKET_PICKUP_LOCATION || "Primary",
            channel_id: "",
            comment: "Weekly batch order - Amrutbaa Traditional Chutney (COD)",
            billing_customer_name: customer_name,
            billing_last_name: "",
            billing_address: address1,
            billing_address_2: address2 || "",
            billing_city: city,
            billing_pincode: pincode,
            billing_state: state,
            billing_country: "India",
            billing_email: customer_email,
            billing_phone: customer_phone,
            shipping_is_billing: true,
            order_items: [
                {
                    name: "Amrut Baa Chilly Garlic Chutney",
                    sku: "AMB-CGC-100G",
                    units: safeQuantity,
                    selling_price: safeUnitPrice,
                    discount: safeDiscount,
                    tax: 0,
                    hsn: 210390
                }
            ],
            payment_method: "COD",
            shipping_charges: 0,
            giftwrap_charges: 0,
            transaction_charges: 0,
            total_discount: safeDiscount,
            sub_total: safeAmount,
            length: 10,
            breadth: 10,
            height: 8,
            weight: Number((0.23 * safeQuantity).toFixed(2))
        };

        const shiprocketResponse = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(shipmentData)
        });

        if (!shiprocketResponse.ok) {
            const errorText = await shiprocketResponse.text();
            console.error('Shiprocket COD API error:', errorText);
            return new Response(JSON.stringify({
                success: false,
                error: 'Failed to create COD shipment',
                details: errorText
            }), {
                status: shiprocketResponse.status,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const shipmentResult = await shiprocketResponse.json();

        return new Response(JSON.stringify({
            success: true,
            shipment_id: shipmentResult.shipment_id,
            order_id: shipmentResult.order_id,
            awb_code: shipmentResult.awb_code,
            courier_name: shipmentResult.courier_name,
            message: 'COD order created successfully'
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Create COD order error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}

export async function handleCheckPincode(request, env) {
    try {
        const originError = assertTrustedOrigin(request, env);
        if (originError) return originError;

        const { pincode, weight = 0.23, cod = false } = await request.json();

        if (!pincode || String(pincode).length !== 6) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Invalid pincode'
            }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const serviceability = await checkShiprocketServiceability(env, { pincode, weight, cod });
        if (!serviceability.success) {
            // Fix for Feedback 3: Return a safe API response format rather than crashing
            return new Response(JSON.stringify({
                success: true,
                serviceable: false,
                error: serviceability.error,
                details: serviceability.details
            }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Fix for Feedback 2: Extract nested city/state and apply to wrapper payload
        const firstCourier = serviceability.data?.available_courier_companies?.[0];

        return new Response(JSON.stringify({
            success: true,
            serviceable: serviceability.serviceable,
            courier_count: serviceability.courier_count || 0,
            city: firstCourier?.city || '',
            state: firstCourier?.state || '',
            data: serviceability.data || null
        }), {
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

export async function handleCreateShipment(request, env) {
    try {
        const originError = assertTrustedOrigin(request, env);
        if (originError) return originError;

        const orderData = await request.json();
        const {
            order_id,
            payment_id,
            customer_name,
            customer_email,
            customer_phone,
            address1,
            address2,
            city,
            state,
            pincode,
            quantity
        } = orderData;

        if (!customer_name || !customer_phone || !address1 || !city || !state || !pincode) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Missing required shipping details'
            }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const pricing = getPricing(quantity, 'Prepaid');
        const idempotencyRef = payment_id || order_id;
        if (!idempotencyRef) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Missing order_id or payment_id for idempotency'
            }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
        const prepaidLockAcquired = await acquireIdempotencyLock(`prepaid:${idempotencyRef}`, 24 * 60 * 60);
        if (!prepaidLockAcquired) {
            return new Response(JSON.stringify({
                success: true,
                duplicate: true,
                order_id: order_id || null,
                message: 'Duplicate prepaid request ignored'
            }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const token = await getShiprocketToken(env);

        const safeQuantity = pricing.qty;
        const safeUnitPrice = pricing.unitPrice;
        const safeDiscount = pricing.discount;
        const safeAmount = pricing.total;

        const shipmentData = {
            order_id: order_id || `AMB${Date.now()}`,
            order_date: new Date().toISOString().split('T')[0],
            pickup_location: env.SHIPROCKET_PICKUP_LOCATION || "Primary",
            channel_id: "",
            comment: "Weekly batch order - Amrutbaa Traditional Chutney",
            billing_customer_name: customer_name,
            billing_last_name: "",
            billing_address: address1,
            billing_address_2: address2 || "",
            billing_city: city,
            billing_pincode: pincode,
            billing_state: state,
            billing_country: "India",
            billing_email: customer_email,
            billing_phone: customer_phone,
            shipping_is_billing: true,
            order_items: [
                {
                    name: "Amrut Baa Chilly Garlic Chutney",
                    sku: "AMB-CGC-100G",
                    units: safeQuantity,
                    selling_price: safeUnitPrice,
                    discount: safeDiscount,
                    tax: 0,
                    hsn: 210390
                }
            ],
            payment_method: "Prepaid",
            shipping_charges: 0,
            giftwrap_charges: 0,
            transaction_charges: 0,
            total_discount: safeDiscount,
            sub_total: safeAmount,
            length: 10,
            breadth: 10,
            height: 8,
            weight: Number((0.23 * safeQuantity).toFixed(2))
        };

        const shiprocketResponse = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(shipmentData)
        });

        if (!shiprocketResponse.ok) {
            const errorText = await shiprocketResponse.text();
            console.error('Shiprocket API error:', errorText);
            return new Response(JSON.stringify({
                success: false,
                error: 'Failed to create shipment',
                details: errorText
            }), {
                status: shiprocketResponse.status,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const shipmentResult = await shiprocketResponse.json();

        return new Response(JSON.stringify({
            success: true,
            shipment_id: shipmentResult.shipment_id,
            order_id: shipmentResult.order_id,
            awb_code: shipmentResult.awb_code,
            courier_name: shipmentResult.courier_name,
            message: 'Shipment created successfully'
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Create shipment error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}

export async function handleTrackShipment(request, env) {
    try {
        const originError = assertTrustedOrigin(request, env);
        if (originError) return originError;

        const { shipment_id, awb_code } = await request.json();

        if (!shipment_id && !awb_code) {
            return new Response(JSON.stringify({
                error: 'Provide either shipment_id or awb_code'
            }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const token = await getShiprocketToken(env);

        const trackingUrl = shipment_id
            ? `https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${shipment_id}`
            : `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awb_code}`;

        const trackingResponse = await fetch(trackingUrl, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!trackingResponse.ok) {
            throw new Error('Failed to fetch tracking info');
        }

        const trackingData = await trackingResponse.json();

        return new Response(JSON.stringify({
            success: true,
            tracking: trackingData
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Tracking error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}

export async function handleShiprocketWebhook(request, env) {
    try {
        const webhookData = await request.json();

        if (env.N8N_WEBHOOK_URL) {
            await fetch(env.N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    source: 'shiprocket',
                    ...webhookData
                })
            });
        }

        return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Webhook error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}
