/**
 * Cloudflare Worker for Amrutbaa.com Payment Gateway
 * Handles Razorpay order creation and payment verification
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // CORS headers for frontend requests
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Create Razorpay Order
    if (url.pathname === '/api/create-order' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { amount, name, email, phone, quantity } = body;

        // Validation
        if (!amount || !name || !email || !phone || !quantity) {
          return new Response(JSON.stringify({ error: 'Missing required fields' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Create order with Razorpay
        const auth = btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`);
        const orderData = {
          amount: Math.round(amount * 100), // Convert to paise
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

        // Generate signature for verification using Web Crypto API
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
        
        // Convert signature to hex
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
          console.warn('Signature mismatch:', { generated_signature, razorpay_signature });
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

    // Health check
    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({ status: 'ok' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  }
};
