import { corsHeaders } from './utils/cors.js';
import { handleCreateOrder, handleVerifyPayment } from './api/razorpay.js';
import {
    handleCreateCodOrder,
    handleCheckPincode,
    handleCreateShipment,
    handleTrackShipment,
    handleShiprocketWebhook
} from './api/shiprocket.js';
import {
    handleTrackAddPaymentInfo,
    handleTrackPurchase,
    handleTrackView,
    handleTrackAddToCart,
    handleTrackInitiateCheckout
} from './api/analytics.js';
import { handleOpsAlert, handleHealthCheck } from './api/ops.js';

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        // Razorpay Routes
        if (url.pathname === '/api/create-order' && request.method === 'POST') {
            return handleCreateOrder(request, env);
        }
        if (url.pathname === '/api/verify-payment' && request.method === 'POST') {
            return handleVerifyPayment(request, env);
        }

        // Shiprocket Routes
        if (url.pathname === '/api/create-order-cod' && request.method === 'POST') {
            return handleCreateCodOrder(request, env);
        }
        if (url.pathname === '/api/check-pincode' && request.method === 'POST') {
            return handleCheckPincode(request, env);
        }
        if (url.pathname === '/api/create-shipment' && request.method === 'POST') {
            return handleCreateShipment(request, env);
        }
        if (url.pathname === '/api/track-shipment' && request.method === 'POST') {
            return handleTrackShipment(request, env);
        }
        if (url.pathname === '/api/shiprocket-webhook' && request.method === 'POST') {
            return handleShiprocketWebhook(request, env);
        }

        // Analytics (Meta Conversions API) Routes
        if (url.pathname === '/api/track-addpaymentinfo' && request.method === 'POST') {
            return handleTrackAddPaymentInfo(request, env);
        }
        if (url.pathname === '/api/track-purchase' && request.method === 'POST') {
            return handleTrackPurchase(request, env);
        }
        if (url.pathname === '/api/track-view' && request.method === 'POST') {
            return handleTrackView(request, env);
        }
        if (url.pathname === '/api/track-addtocart' && request.method === 'POST') {
            return handleTrackAddToCart(request, env);
        }
        if (url.pathname === '/api/track-initiate-checkout' && request.method === 'POST') {
            return handleTrackInitiateCheckout(request, env);
        }

        // Ops & Health Routes
        if (url.pathname === '/api/ops-alert' && request.method === 'POST') {
            return handleOpsAlert(request, env);
        }
        if (url.pathname === '/api/health') {
            return handleHealthCheck(request, env);
        }

        // Default 404
        return new Response('Not Found', { status: 404, headers: corsHeaders });
    }
};
