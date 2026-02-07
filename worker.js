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
          amount
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
              units: quantity,
              selling_price: amount / quantity, // Price per unit
              discount: 0,
              tax: 0, // Adjust if you have GST
              hsn: 210390 // HSN code for chutneys
            }
          ],
          payment_method: "Prepaid",
          shipping_charges: 0, // Set if applicable
          giftwrap_charges: 0,
          transaction_charges: 0,
          total_discount: 0,
          sub_total: amount,
          length: 10,  // Package dimensions in cm
          breadth: 10,
          height: 8,
          weight: 0.15 * quantity // Weight in kg (150g per jar)
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

    // Health check
    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({ 
        status: 'ok',
        services: {
          razorpay: !!env.RAZORPAY_KEY_ID,
          shiprocket: !!env.SHIPROCKET_EMAIL
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  }
};
