var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/utils/cors.js
var corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};
function extractRequestOrigin(req) {
  const origin = req.headers.get("origin");
  if (origin) return origin.toLowerCase();
  const referer = req.headers.get("referer");
  if (!referer) return null;
  try {
    return new URL(referer).origin.toLowerCase();
  } catch (_) {
    return null;
  }
}
__name(extractRequestOrigin, "extractRequestOrigin");
function isTrustedOrigin(req, env) {
  const defaultAllowedOrigins = [
    "https://amrutbaa.com",
    "https://www.amrutbaa.com",
    "https://amrutbaa-com.prinkit-patel.workers.dev",
    "http://localhost:8787",
    "http://127.0.0.1:8787"
  ];
  const configuredOrigins = (env.ALLOWED_ORIGINS || "").split(",").map((origin) => origin.trim().toLowerCase()).filter(Boolean);
  const allowedOrigins = /* @__PURE__ */ new Set([
    ...defaultAllowedOrigins.map((origin) => origin.toLowerCase()),
    ...configuredOrigins
  ]);
  const requestOrigin = extractRequestOrigin(req);
  return requestOrigin ? allowedOrigins.has(requestOrigin) : false;
}
__name(isTrustedOrigin, "isTrustedOrigin");
function assertTrustedOrigin(req, env) {
  return isTrustedOrigin(req, env) ? null : new Response(JSON.stringify({ error: "Forbidden origin" }), {
    status: 403,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}
__name(assertTrustedOrigin, "assertTrustedOrigin");

// src/utils/pricing.js
function getPricing(quantity, paymentMethod) {
  const safeQty = Math.min(10, Math.max(1, Number(quantity) || 1));
  const unitPrice = 499;
  const baseTotal = safeQty * unitPrice;
  let discountPercent = 0;
  if (paymentMethod === "Prepaid") {
    if (safeQty >= 3) discountPercent = 10;
    else if (safeQty >= 2) discountPercent = 5;
  }
  const discount = Math.round(baseTotal * discountPercent / 100);
  const total = baseTotal - discount;
  return { qty: safeQty, unitPrice, baseTotal, discount, total };
}
__name(getPricing, "getPricing");

// src/api/razorpay.js
async function handleCreateOrder(request, env) {
  try {
    const originError = assertTrustedOrigin(request, env);
    if (originError) return originError;
    const body = await request.json();
    const { name, email, phone, quantity } = body;
    if (!name || !email || !phone || !quantity) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const pricing = getPricing(quantity, "Prepaid");
    const auth = btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`);
    const orderData = {
      amount: Math.round(pricing.total * 100),
      currency: "INR",
      receipt: `order_${Date.now()}`,
      notes: {
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        quantity: pricing.qty,
        batch_date: (/* @__PURE__ */ new Date()).toISOString()
      }
    };
    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${auth}`
      },
      body: JSON.stringify(orderData)
    });
    if (!razorpayResponse.ok) {
      const error = await razorpayResponse.text();
      console.error("Razorpay error:", error);
      return new Response(JSON.stringify({ error: "Failed to create order" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const order = await razorpayResponse.json();
    return new Response(JSON.stringify(order), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
__name(handleCreateOrder, "handleCreateOrder");
async function handleVerifyPayment(request, env) {
  try {
    const originError = assertTrustedOrigin(request, env);
    if (originError) return originError;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();
    const message = `${razorpay_order_id}|${razorpay_payment_id}`;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(env.RAZORPAY_KEY_SECRET);
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signature = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(message)
    );
    const hashArray = Array.from(new Uint8Array(signature));
    const generated_signature = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    const isValid = generated_signature === razorpay_signature;
    if (isValid) {
      return new Response(JSON.stringify({
        success: true,
        message: "Payment verified successfully"
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    } else {
      console.warn("Signature mismatch");
      return new Response(JSON.stringify({
        success: false,
        error: "Invalid signature"
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
__name(handleVerifyPayment, "handleVerifyPayment");

// src/utils/idempotency.js
async function acquireIdempotencyLock(lockId, ttlSeconds = 86400) {
  const cache = caches.default;
  const lockKey = new Request(`https://idempotency.amrutbaa.internal/${encodeURIComponent(lockId)}`, { method: "GET" });
  const existing = await cache.match(lockKey);
  if (existing) return false;
  await cache.put(
    lockKey,
    new Response("locked", {
      headers: {
        "Cache-Control": `max-age=${ttlSeconds}`
      }
    })
  );
  return true;
}
__name(acquireIdempotencyLock, "acquireIdempotencyLock");

// src/api/shiprocket.js
var shiprocketTokenCache = {
  token: null,
  expiresAt: 0
};
async function getShiprocketToken(env) {
  try {
    const now = Date.now();
    if (shiprocketTokenCache.token && shiprocketTokenCache.expiresAt > now) {
      return shiprocketTokenCache.token;
    }
    const response = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: env.SHIPROCKET_EMAIL,
        password: env.SHIPROCKET_PASSWORD
      })
    });
    if (!response.ok) {
      throw new Error("Failed to authenticate with Shiprocket");
    }
    const data = await response.json();
    shiprocketTokenCache = {
      token: data.token,
      expiresAt: now + 23 * 60 * 60 * 1e3
    };
    return data.token;
  } catch (error) {
    console.error("Shiprocket auth error:", error);
    throw error;
  }
}
__name(getShiprocketToken, "getShiprocketToken");
async function checkShiprocketServiceability(env, { pincode, weight = 0.15, cod = false }) {
  if (!env.SHIPROCKET_PICKUP_PINCODE) {
    return { success: false, error: "Pickup pincode not configured" };
  }
  const token = await getShiprocketToken(env);
  const queryParams = new URLSearchParams({
    pickup_postcode: env.SHIPROCKET_PICKUP_PINCODE,
    delivery_postcode: String(pincode),
    cod: cod ? 1 : 0,
    weight: Number(weight) || 0.15
  });
  const response = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/serviceability/?${queryParams.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });
  if (!response.ok) {
    const errorText = await response.text();
    return {
      success: false,
      error: "Failed to check pincode serviceability",
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
__name(checkShiprocketServiceability, "checkShiprocketServiceability");
async function handleCreateCodOrder(request, env) {
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
        error: "Missing required shipping details"
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const pricing = getPricing(quantity, "COD");
    const safeQuantity = pricing.qty;
    const safeUnitPrice = pricing.unitPrice;
    const safeDiscount = pricing.discount;
    const safeAmount = pricing.total;
    const safeWeight = Number((0.15 * safeQuantity).toFixed(2));
    const lockSeed = client_order_ref || `${customer_phone}|${pincode}|${safeAmount}|${safeQuantity}`;
    const lockId = `cod:${lockSeed}`;
    const codLockAcquired = await acquireIdempotencyLock(lockId, 6 * 60 * 60);
    if (!codLockAcquired) {
      return new Response(JSON.stringify({
        success: true,
        duplicate: true,
        order_id: client_order_ref || null,
        message: "Duplicate COD request ignored"
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
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
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    if (!codServiceability.serviceable) {
      return new Response(JSON.stringify({
        success: false,
        error: "COD is not serviceable for this pincode"
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const token = await getShiprocketToken(env);
    const shipmentData = {
      order_id: `COD-${Date.now()}-${Math.random().toString(36).slice(2, 11).toUpperCase()}`,
      order_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
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
    const shiprocketResponse = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(shipmentData)
    });
    if (!shiprocketResponse.ok) {
      const errorText = await shiprocketResponse.text();
      console.error("Shiprocket COD API error:", errorText);
      return new Response(JSON.stringify({
        success: false,
        error: "Failed to create COD shipment",
        details: errorText
      }), {
        status: shiprocketResponse.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const shipmentResult = await shiprocketResponse.json();
    return new Response(JSON.stringify({
      success: true,
      shipment_id: shipmentResult.shipment_id,
      order_id: shipmentResult.order_id,
      awb_code: shipmentResult.awb_code,
      courier_name: shipmentResult.courier_name,
      message: "COD order created successfully"
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Create COD order error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
__name(handleCreateCodOrder, "handleCreateCodOrder");
async function handleCheckPincode(request, env) {
  try {
    const originError = assertTrustedOrigin(request, env);
    if (originError) return originError;
    const { pincode, weight = 0.15, cod = false } = await request.json();
    if (!pincode || String(pincode).length !== 6) {
      return new Response(JSON.stringify({
        success: false,
        error: "Invalid pincode"
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
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
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({
      success: true,
      serviceable: serviceability.serviceable,
      courier_count: serviceability.courier_count || 0,
      data: serviceability.data || null
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
__name(handleCheckPincode, "handleCheckPincode");
async function handleCreateShipment(request, env) {
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
        error: "Missing required shipping details"
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const pricing = getPricing(quantity, "Prepaid");
    const idempotencyRef = payment_id || order_id;
    if (!idempotencyRef) {
      return new Response(JSON.stringify({
        success: false,
        error: "Missing order_id or payment_id for idempotency"
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const prepaidLockAcquired = await acquireIdempotencyLock(`prepaid:${idempotencyRef}`, 24 * 60 * 60);
    if (!prepaidLockAcquired) {
      return new Response(JSON.stringify({
        success: true,
        duplicate: true,
        order_id: order_id || null,
        message: "Duplicate prepaid request ignored"
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const token = await getShiprocketToken(env);
    const safeQuantity = pricing.qty;
    const safeUnitPrice = pricing.unitPrice;
    const safeDiscount = pricing.discount;
    const safeAmount = pricing.total;
    const shipmentData = {
      order_id: order_id || `AMB${Date.now()}`,
      order_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
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
      weight: 0.15 * safeQuantity
    };
    const shiprocketResponse = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(shipmentData)
    });
    if (!shiprocketResponse.ok) {
      const errorText = await shiprocketResponse.text();
      console.error("Shiprocket API error:", errorText);
      return new Response(JSON.stringify({
        success: false,
        error: "Failed to create shipment",
        details: errorText
      }), {
        status: shiprocketResponse.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const shipmentResult = await shiprocketResponse.json();
    return new Response(JSON.stringify({
      success: true,
      shipment_id: shipmentResult.shipment_id,
      order_id: shipmentResult.order_id,
      awb_code: shipmentResult.awb_code,
      courier_name: shipmentResult.courier_name,
      message: "Shipment created successfully"
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Create shipment error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
__name(handleCreateShipment, "handleCreateShipment");
async function handleTrackShipment(request, env) {
  try {
    const originError = assertTrustedOrigin(request, env);
    if (originError) return originError;
    const { shipment_id, awb_code } = await request.json();
    if (!shipment_id && !awb_code) {
      return new Response(JSON.stringify({
        error: "Provide either shipment_id or awb_code"
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const token = await getShiprocketToken(env);
    const trackingUrl = shipment_id ? `https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${shipment_id}` : `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awb_code}`;
    const trackingResponse = await fetch(trackingUrl, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    if (!trackingResponse.ok) {
      throw new Error("Failed to fetch tracking info");
    }
    const trackingData = await trackingResponse.json();
    return new Response(JSON.stringify({
      success: true,
      tracking: trackingData
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Tracking error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
__name(handleTrackShipment, "handleTrackShipment");
async function handleShiprocketWebhook(request, env) {
  try {
    const webhookData = await request.json();
    if (env.N8N_WEBHOOK_URL) {
      await fetch(env.N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "shiprocket",
          ...webhookData
        })
      });
    }
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
__name(handleShiprocketWebhook, "handleShiprocketWebhook");

// src/utils/crypto.js
async function hashPII(value) {
  if (!value) return null;
  const normalized = String(value).toLowerCase().trim();
  const data = new TextEncoder().encode(normalized);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(hashPII, "hashPII");

// src/utils/request.js
function getEventSourceUrl(request) {
  return request.headers.get("referer") || request.headers.get("origin") || "https://amrutbaa.com";
}
__name(getEventSourceUrl, "getEventSourceUrl");
function getClientIP(request) {
  return request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "";
}
__name(getClientIP, "getClientIP");
function getUserAgent(request) {
  return request.headers.get("user-agent") || "";
}
__name(getUserAgent, "getUserAgent");

// src/api/analytics.js
async function handleTrackAddPaymentInfo(request, env) {
  try {
    if (!env.META_DATASET_ID || !env.META_ACCESS_TOKEN) {
      return new Response(JSON.stringify({
        success: false,
        error: "Meta credentials not configured"
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const { name, email, phone, quantity, postcode, city, fbc, fbp, event_id, test_event_code } = await request.json();
    if (!email && !phone) {
      return new Response(JSON.stringify({ error: "Email or phone required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const clientIP = getClientIP(request);
    const userAgent = getUserAgent(request);
    const safeName = name ? String(name).trim() : "";
    const nameParts = safeName.split(/\s+/).filter(Boolean);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
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
          event_name: "AddPaymentInfo",
          event_time: Math.floor(Date.now() / 1e3),
          event_id: event_id || `addpaymentinfo_${Date.now()}`,
          event_source_url: getEventSourceUrl(request),
          action_source: "website",
          user_data: {
            em: em || void 0,
            ph: ph || void 0,
            fn: fn || void 0,
            ln: ln || void 0,
            zp: zp || void 0,
            ct: ct || void 0,
            client_ip_address: clientIP || void 0,
            client_user_agent: userAgent || void 0,
            fbc: fbc || void 0,
            fbp: fbp || void 0,
            external_id: em || ph || void 0
          },
          custom_data: {
            currency: "INR",
            value: quantity || 1,
            content_name: "Amrut Baa Chutney",
            content_type: "product"
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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metaPayload)
      }
    );
    if (!metaResponse.ok) {
      const error = await metaResponse.text();
      console.error("Meta API error:", error);
      return new Response(JSON.stringify({
        success: false,
        error: "Failed to track lead",
        details: error
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const metaResult = await metaResponse.json();
    console.log("AddPaymentInfo tracked successfully:", metaResult);
    return new Response(JSON.stringify({
      success: true,
      message: "AddPaymentInfo tracked successfully",
      event_id: `addpaymentinfo_${Date.now()}`
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Track addpaymentinfo error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
__name(handleTrackAddPaymentInfo, "handleTrackAddPaymentInfo");
async function handleTrackPurchase(request, env) {
  try {
    if (!env.META_DATASET_ID || !env.META_ACCESS_TOKEN) {
      return new Response(JSON.stringify({
        success: false,
        error: "Meta credentials not configured"
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const { name, email, phone, amount, quantity, payment_id, postcode, city, fbc, fbp, event_id, test_event_code } = await request.json();
    if (!email && !phone) {
      return new Response(JSON.stringify({ error: "Email or phone required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const clientIP = getClientIP(request);
    const userAgent = getUserAgent(request);
    const safeName = name ? String(name).trim() : "";
    const nameParts = safeName.split(/\s+/).filter(Boolean);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
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
          event_name: "Purchase",
          event_time: Math.floor(Date.now() / 1e3),
          event_id: event_id || `purchase_${payment_id || Date.now()}`,
          event_source_url: getEventSourceUrl(request),
          action_source: "website",
          user_data: {
            em: em || void 0,
            ph: ph || void 0,
            fn: fn || void 0,
            ln: ln || void 0,
            zp: zp || void 0,
            ct: ct || void 0,
            client_ip_address: clientIP || void 0,
            client_user_agent: userAgent || void 0,
            fbc: fbc || void 0,
            fbp: fbp || void 0,
            external_id: em || ph || void 0
          },
          custom_data: {
            currency: "INR",
            value: Number(amount) || 0,
            content_name: "Amrut Baa Chutney",
            content_type: "product",
            content_id: "AMB-CGC-100G",
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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metaPayload)
      }
    );
    if (!metaResponse.ok) {
      const error = await metaResponse.text();
      console.error("Meta API error:", error);
      return new Response(JSON.stringify({
        success: false,
        error: "Failed to track purchase",
        details: error
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const metaResult = await metaResponse.json();
    console.log("Purchase tracked successfully:", metaResult);
    return new Response(JSON.stringify({
      success: true,
      message: "Purchase tracked successfully",
      event_id: `purchase_${payment_id || Date.now()}`
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Track purchase error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
__name(handleTrackPurchase, "handleTrackPurchase");
async function handleTrackView(request, env) {
  try {
    if (!env.META_DATASET_ID || !env.META_ACCESS_TOKEN) {
      return new Response(JSON.stringify({
        success: false,
        error: "Meta credentials not configured"
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
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
          event_name: "ViewContent",
          event_time: Math.floor(Date.now() / 1e3),
          event_id: event_id || `view_${Date.now()}`,
          event_source_url: getEventSourceUrl(request),
          action_source: "website",
          user_data: {
            em: em || void 0,
            ph: ph || void 0,
            zp: zp || void 0,
            ct: ct || void 0,
            client_ip_address: clientIP || void 0,
            client_user_agent: userAgent || void 0,
            fbc: fbc || void 0,
            fbp: fbp || void 0,
            external_id: em || ph || void 0
          },
          custom_data: {
            currency: "INR",
            value: 299,
            content_name: "Amrut Baa Chilly Garlic Chutney",
            content_type: "product",
            content_id: "AMB-CGC-100G"
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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metaPayload)
      }
    );
    const metaResult = await metaResponse.json();
    console.log("ViewContent tracked:", metaResult);
    return new Response(JSON.stringify({
      success: true,
      message: "ViewContent tracked successfully",
      event_id: `view_${Date.now()}`
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Track view error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
__name(handleTrackView, "handleTrackView");
async function handleTrackAddToCart(request, env) {
  try {
    if (!env.META_DATASET_ID || !env.META_ACCESS_TOKEN) {
      return new Response(JSON.stringify({
        success: false,
        error: "Meta credentials not configured"
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
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
          event_name: "AddToCart",
          event_time: Math.floor(Date.now() / 1e3),
          event_id: event_id || `addtocart_${Date.now()}`,
          event_source_url: getEventSourceUrl(request),
          action_source: "website",
          user_data: {
            em: em || void 0,
            ph: ph || void 0,
            zp: zp || void 0,
            ct: ct || void 0,
            client_ip_address: clientIP || void 0,
            client_user_agent: userAgent || void 0,
            fbc: fbc || void 0,
            fbp: fbp || void 0,
            external_id: em || ph || void 0
          },
          custom_data: {
            currency: "INR",
            value: Number(value) || 0,
            content_name: "Amrut Baa Chilly Garlic Chutney",
            content_type: "product",
            content_id: "AMB-CGC-100G",
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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metaPayload)
      }
    );
    const metaResult = await metaResponse.json();
    console.log("AddToCart tracked:", metaResult);
    return new Response(JSON.stringify({
      success: true,
      message: "AddToCart tracked successfully",
      event_id: `addtocart_${Date.now()}`
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Track addtocart error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
__name(handleTrackAddToCart, "handleTrackAddToCart");
async function handleTrackInitiateCheckout(request, env) {
  try {
    if (!env.META_DATASET_ID || !env.META_ACCESS_TOKEN) {
      return new Response(JSON.stringify({
        success: false,
        error: "Meta credentials not configured"
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
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
          event_name: "InitiateCheckout",
          event_time: Math.floor(Date.now() / 1e3),
          event_id: event_id || `checkout_${Date.now()}`,
          event_source_url: getEventSourceUrl(request),
          action_source: "website",
          user_data: {
            em: em || void 0,
            ph: ph || void 0,
            zp: zp || void 0,
            ct: ct || void 0,
            client_ip_address: clientIP || void 0,
            client_user_agent: userAgent || void 0,
            fbc: fbc || void 0,
            fbp: fbp || void 0,
            external_id: em || ph || void 0
          },
          custom_data: {
            currency: "INR",
            value: Number(value) || 0,
            content_name: "Amrut Baa Chilly Garlic Chutney",
            content_type: "product",
            content_id: "AMB-CGC-100G",
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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metaPayload)
      }
    );
    const metaResult = await metaResponse.json();
    console.log("InitiateCheckout tracked:", metaResult);
    return new Response(JSON.stringify({
      success: true,
      message: "InitiateCheckout tracked successfully",
      event_id: `checkout_${Date.now()}`
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Track initiate checkout error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
__name(handleTrackInitiateCheckout, "handleTrackInitiateCheckout");

// src/api/ops.js
async function handleOpsAlert(request, env) {
  try {
    const originError = assertTrustedOrigin(request, env);
    if (originError) return originError;
    const alertData = await request.json();
    const opsWebhookUrl = env.OPS_ALERT_WEBHOOK_URL || env.N8N_WEBHOOK_URL;
    if (!opsWebhookUrl) {
      return new Response(JSON.stringify({
        success: false,
        error: "Ops webhook not configured"
      }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    await fetch(opsWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "ops_alert",
        ...alertData
      })
    });
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
__name(handleOpsAlert, "handleOpsAlert");
function handleHealthCheck(request, env) {
  return new Response(JSON.stringify({
    status: "ok",
    services: {
      razorpay: !!env.RAZORPAY_KEY_ID,
      shiprocket: !!env.SHIPROCKET_EMAIL,
      meta: !!env.META_DATASET_ID && !!env.META_ACCESS_TOKEN,
      ops_alert: !!(env.OPS_ALERT_WEBHOOK_URL || env.N8N_WEBHOOK_URL)
    }
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}
__name(handleHealthCheck, "handleHealthCheck");

// src/index.js
var index_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    if (url.pathname === "/api/create-order" && request.method === "POST") {
      return handleCreateOrder(request, env);
    }
    if (url.pathname === "/api/verify-payment" && request.method === "POST") {
      return handleVerifyPayment(request, env);
    }
    if (url.pathname === "/api/create-order-cod" && request.method === "POST") {
      return handleCreateCodOrder(request, env);
    }
    if (url.pathname === "/api/check-pincode" && request.method === "POST") {
      return handleCheckPincode(request, env);
    }
    if (url.pathname === "/api/create-shipment" && request.method === "POST") {
      return handleCreateShipment(request, env);
    }
    if (url.pathname === "/api/track-shipment" && request.method === "POST") {
      return handleTrackShipment(request, env);
    }
    if (url.pathname === "/api/shiprocket-webhook" && request.method === "POST") {
      return handleShiprocketWebhook(request, env);
    }
    if (url.pathname === "/api/track-addpaymentinfo" && request.method === "POST") {
      return handleTrackAddPaymentInfo(request, env);
    }
    if (url.pathname === "/api/track-purchase" && request.method === "POST") {
      return handleTrackPurchase(request, env);
    }
    if (url.pathname === "/api/track-view" && request.method === "POST") {
      return handleTrackView(request, env);
    }
    if (url.pathname === "/api/track-addtocart" && request.method === "POST") {
      return handleTrackAddToCart(request, env);
    }
    if (url.pathname === "/api/track-initiate-checkout" && request.method === "POST") {
      return handleTrackInitiateCheckout(request, env);
    }
    if (url.pathname === "/api/ops-alert" && request.method === "POST") {
      return handleOpsAlert(request, env);
    }
    if (url.pathname === "/api/health") {
      return handleHealthCheck(request, env);
    }
    return new Response("Not Found", { status: 404, headers: corsHeaders });
  }
};
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
