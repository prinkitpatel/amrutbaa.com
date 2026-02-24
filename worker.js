/**
 * Enhanced Cloudflare Worker for Amrutbaa.com
 * Handles: Razorpay payments + Shiprocket shipping integration
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // ========================
    // RAZORPAY ENDPOINTS
    // ========================

    // Create Razorpay Order
    if (url.pathname === '/api/create-order' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { amount, name, email, phone, quantity } = body;

        if (!amount || !name || !email || !phone || !quantity) {
          return new Response(JSON.stringify({ error: 'Missing required fields' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const auth = btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`);
        const orderData = {
          amount: Math.round(amount * 100),
          currency: 'INR',
          receipt: `order_${Date.now()}`,
          notes: {
            customer_name: name,
            customer_email: email,
            customer_phone: phone,
            quantity: quantity,
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

    // Verify payment signature
    if (url.pathname === '/api/verify-payment' && request.method === 'POST') {
      try {
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

    // ========================
    // SHIPROCKET ENDPOINTS
    // ========================

    // Get Shiprocket Auth Token (cached for 24 hours)
    async function getShiprocketToken(env) {
      try {
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
        return data.token;
      } catch (error) {
        console.error('Shiprocket auth error:', error);
        throw error;
      }
    }

    async function checkShiprocketServiceability(env, { pincode, weight = 0.15, cod = false }) {
      if (!env.SHIPROCKET_PICKUP_PINCODE) {
        return { success: false, error: 'Pickup pincode not configured' };
      }

      const token = await getShiprocketToken(env);
      const queryParams = new URLSearchParams({
        pickup_postcode: env.SHIPROCKET_PICKUP_PINCODE,
        delivery_postcode: String(pincode),
        cod: cod ? 1 : 0,
        weight: Number(weight) || 0.15
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

    // Create COD Order in Shiprocket
    if (url.pathname === '/api/create-order-cod' && request.method === 'POST') {
      try {
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
          amount,
          unit_price,
          base_total,
          discount
        } = orderData;

        // Validate required fields
        if (!customer_name || !customer_phone || !address1 || !city || !state || !pincode) {
          return new Response(JSON.stringify({ 
            success: false,
            error: 'Missing required shipping details' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const safeQuantity = Number.isFinite(Number(quantity)) && Number(quantity) > 0 ? Number(quantity) : 1;
        const safeUnitPrice = Number.isFinite(Number(unit_price)) && Number(unit_price) > 0
          ? Number(unit_price)
          : (Number.isFinite(Number(base_total)) && Number(base_total) > 0 ? Number(base_total) / safeQuantity : Number(amount) / safeQuantity);
        const safeDiscount = Number.isFinite(Number(discount)) && Number(discount) > 0 ? Number(discount) : 0;
        const safeAmount = Number.isFinite(Number(amount)) && Number(amount) > 0 ? Number(amount) : safeUnitPrice * safeQuantity;
        const safeWeight = Number((0.15 * safeQuantity).toFixed(2));

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
          weight: 0.15 * safeQuantity
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

    // Check pincode serviceability
    if (url.pathname === '/api/check-pincode' && request.method === 'POST') {
      try {
        const { pincode, weight = 0.15, cod = false } = await request.json();

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
          return new Response(JSON.stringify({
            success: false,
            error: serviceability.error,
            details: serviceability.details
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({
          success: true,
          serviceable: serviceability.serviceable,
          courier_count: serviceability.courier_count || 0,
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

    // Create Shiprocket Order
    if (url.pathname === '/api/create-shipment' && request.method === 'POST') {
      try {
        const orderData = await request.json();
        const {
          order_id,          // Your internal order ID (e.g., Razorpay order ID)
          payment_id,        // Razorpay payment ID
          customer_name,
          customer_email,
          customer_phone,
          address1,
          address2,
          city,
          state,
          pincode,
          quantity,
          amount,
          unit_price,
          base_total,
          discount
        } = orderData;

        // Validate required fields
        if (!customer_name || !customer_phone || !address1 || !city || !state || !pincode) {
          return new Response(JSON.stringify({ 
            success: false,
            error: 'Missing required shipping details' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Get Shiprocket auth token
        const token = await getShiprocketToken(env);

        // Prepare shipment data
        const safeQuantity = Number.isFinite(Number(quantity)) && Number(quantity) > 0 ? Number(quantity) : 1;
        const safeUnitPrice = Number.isFinite(Number(unit_price)) && Number(unit_price) > 0
          ? Number(unit_price)
          : (Number.isFinite(Number(base_total)) && Number(base_total) > 0 ? Number(base_total) / safeQuantity : Number(amount) / safeQuantity);
        const safeDiscount = Number.isFinite(Number(discount)) && Number(discount) > 0 ? Number(discount) : 0;
        const safeAmount = Number.isFinite(Number(amount)) && Number(amount) > 0 ? Number(amount) : safeUnitPrice * safeQuantity;

        const shipmentData = {
          order_id: order_id || `AMB${Date.now()}`,
          order_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
          pickup_location: env.SHIPROCKET_PICKUP_LOCATION || "Primary", // Set in Cloudflare
          channel_id: "", // Leave empty for manual orders
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
          shipping_is_billing: true, // Same as billing
          order_items: [
            {
              name: "Amrut Baa Chilly Garlic Chutney",
              sku: "AMB-CGC-100G",
              units: safeQuantity,
              selling_price: safeUnitPrice, // Price per unit (pre-discount)
              discount: safeDiscount,
              tax: 0, // Adjust if you have GST
              hsn: 210390 // HSN code for chutneys
            }
          ],
          payment_method: "Prepaid",
          shipping_charges: 0, // Set if applicable
          giftwrap_charges: 0,
          transaction_charges: 0,
          total_discount: safeDiscount,
          sub_total: safeAmount,
          length: 10,  // Package dimensions in cm
          breadth: 10,
          height: 8,
          weight: 0.15 * safeQuantity // Weight in kg (150g per jar)
        };

        // Create order on Shiprocket
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
          awb_code: shipmentResult.awb_code, // Tracking number
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

    // Track Shipment by AWB/Order ID
    if (url.pathname === '/api/track-shipment' && request.method === 'POST') {
      try {
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

        // Track by shipment ID or AWB
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

    // Shiprocket Webhook Handler (for status updates)
    if (url.pathname === '/api/shiprocket-webhook' && request.method === 'POST') {
      try {
        const webhookData = await request.json();

        // Forward to your n8n workflow or database
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

        // You can add logic here to:
        // - Send email notifications to customers
        // - Update order status in database
        // - Trigger SMS alerts

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

    // Ops alert forwarding (communication only, no order creation)
    if (url.pathname === '/api/ops-alert' && request.method === 'POST') {
      try {
        const alertData = await request.json();

        if (!env.N8N_WEBHOOK_URL) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Ops webhook not configured'
          }), {
            status: 503,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        await fetch(env.N8N_WEBHOOK_URL, {
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

    // ========================
    // META CONVERSIONS API ENDPOINTS
    // ========================

    // Hash helper function for PII (Personally Identifiable Information)
    async function hashPII(value) {
      if (!value) return null;
      const normalized = String(value).toLowerCase().trim();
      const data = new TextEncoder().encode(normalized);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    }

    function getEventSourceUrl(request) {
      return request.headers.get('referer') || request.headers.get('origin') || 'https://amrutbaa.com';
    }

    function getClientIP(request) {
      return request.headers.get('cf-connecting-ip') || 
             request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             '';
    }

    function getUserAgent(request) {
      return request.headers.get('user-agent') || '';
    }

    // Track AddPaymentInfo Event (form submitted - ready to pay)
    if (url.pathname === '/api/track-addpaymentinfo' && request.method === 'POST') {
      try {
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

        // Prepare Meta Conversions API payload
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

        // Send to Meta Conversions API
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

    // Track Purchase Event (successful payment)
    if (url.pathname === '/api/track-purchase' && request.method === 'POST') {
      try {
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

        // Prepare Meta Conversions API payload
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

        // Send to Meta Conversions API
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

    // Track ViewContent (CTA click / modal open)
    if (url.pathname === '/api/track-view' && request.method === 'POST') {
      try {
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

        // Hash PII if provided
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

    // Track AddToCart (Jar quantity selected)
    if (url.pathname === '/api/track-addtocart' && request.method === 'POST') {
      try {
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

        // Hash PII if provided
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

    // Track InitiateCheckout (Delivery address entry)
    if (url.pathname === '/api/track-initiate-checkout' && request.method === 'POST') {
      try {
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

        // Hash PII if provided
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

    // Health check
    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({ 
        status: 'ok',
        services: {
          razorpay: !!env.RAZORPAY_KEY_ID,
          shiprocket: !!env.SHIPROCKET_EMAIL,
          meta: !!env.META_DATASET_ID && !!env.META_ACCESS_TOKEN
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  }
};
