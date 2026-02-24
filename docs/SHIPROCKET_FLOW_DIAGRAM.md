# 🔄 Shiprocket Integration Flow Diagram

## Complete End-to-End Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         CUSTOMER JOURNEY                         │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   Customer   │
│  Visits Site │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│  Clicks "Order"  │
│   Opens Modal    │
└──────┬───────────┘
       │
       ▼
┌──────────────────────┐
│   Fills Form         │
│  Step 1: Phone       │
│  Step 2: Details     │
│  - Name, Email       │
│  - Address, City     │
│  - State, Pincode    │
│  - Quantity          │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────────────────┐
│   Clicks "Complete Registration" │
└──────┬───────────────────────────┘
       │
       │
┌──────▼──────────────────────────────────────────────────────────┐
│                    PAYMENT PROCESSING                            │
└──────────────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────┐
│  Frontend → Worker       │
│  POST /api/create-order  │
│  {amount, name, email}   │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  Worker → Razorpay API   │
│  Create order            │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  Razorpay Checkout Opens │
│  Customer enters card    │
│  4111 1111 1111 1111     │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  Payment Successful ✅   │
│  Returns:                │
│  - order_id              │
│  - payment_id            │
│  - signature             │
└──────┬───────────────────┘
       │
       │
┌──────▼──────────────────────────────────────────────────────────┐
│                    PAYMENT VERIFICATION                          │
└──────────────────────────────────────────────────────────────────┘
       │
       ▼
┌────────────────────────────┐
│  Frontend → Worker         │
│  POST /api/verify-payment  │
│  {order_id, payment_id,    │
│   signature}               │
└──────┬─────────────────────┘
       │
       ▼
┌────────────────────────────┐
│  Worker Verifies Signature │
│  HMAC SHA-256 validation   │
└──────┬─────────────────────┘
       │
       ▼
┌────────────────────────────┐
│  ✅ Payment Verified       │
└──────┬─────────────────────┘
       │
       │
┌──────▼──────────────────────────────────────────────────────────┐
│                    SHIPMENT CREATION (NEW!)                      │
└──────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Frontend → Worker          │
│  POST /api/create-shipment  │
│  {                          │
│    order_id,                │
│    payment_id,              │
│    customer_name,           │
│    customer_email,          │
│    customer_phone,          │
│    address1, address2,      │
│    city, state, pincode,    │
│    quantity, amount         │
│  }                          │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Worker Gets Shiprocket     │
│  Auth Token                 │
│  POST /auth/login           │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Worker → Shiprocket API    │
│  POST /orders/create/adhoc  │
│  {                          │
│    order_id,                │
│    billing details,         │
│    shipping details,        │
│    order_items: [{          │
│      name: "Chutney",       │
│      units: quantity,       │
│      price: amount          │
│    }],                      │
│    weight, dimensions       │
│  }                          │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Shiprocket Processes       │
│  - Validates address        │
│  - Checks serviceability    │
│  - Assigns best courier     │
│  - Generates AWB            │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Shiprocket Returns:        │
│  {                          │
│    shipment_id: 12345,      │
│    order_id: 87654,         │
│    awb_code: "1234567890",  │
│    courier_name: "Delhivery"│
│  }                          │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Worker Returns to Frontend │
│  {                          │
│    success: true,           │
│    tracking details         │
│  }                          │
└──────┬──────────────────────┘
       │
       │
┌──────▼──────────────────────────────────────────────────────────┐
│                    ORDER LOGGING                                 │
└──────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Frontend → n8n Webhook     │
│  POST /webhook/order_form   │
│  {                          │
│    ...order_details,        │
│    payment_id,              │
│    tracking_number,         │
│    shipment_id,             │
│    courier_name             │
│  }                          │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  n8n Processes:             │
│  - Stores in database       │
│  - Sends email              │
│  - Triggers notifications   │
└──────┬──────────────────────┘
       │
       │
┌──────▼──────────────────────────────────────────────────────────┐
│                    CUSTOMER NOTIFICATION                         │
└──────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Success Modal Shows:       │
│  🎉 Your Jar is Reserved!   │
│                             │
│  📦 Tracking: 1234567890    │
│  🚚 Courier: Delhivery      │
│                             │
│  [Track Your Order →]       │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Customer Clicks Tracking   │
│  Opens: tracking.html       │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Tracking Page:             │
│  POST /api/track-shipment   │
│  {awb_code: "1234567890"}   │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Worker → Shiprocket API    │
│  GET /courier/track/awb/... │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Shiprocket Returns:        │
│  {                          │
│    shipment_status: "SHIPPED"│
│    edd: "2026-02-10",       │
│    current_location: "Mumbai"│
│    shipment_track: [...]    │
│  }                          │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Beautiful Tracking Display:│
│  🚚 In Transit              │
│  On the way to you          │
│                             │
│  📦 Tracking: 1234567890    │
│  🚚 Courier: Delhivery      │
│  📅 Expected: Feb 10        │
│  📍 Current: Mumbai         │
│                             │
│  Timeline:                  │
│  ✓ Feb 7, 10:30 - Picked up │
│  ✓ Feb 7, 15:00 - In transit│
│  • Feb 8, 09:00 - Out for...│
└──────┬──────────────────────┘
       │
       │
┌──────▼──────────────────────────────────────────────────────────┐
│                    AUTOMATIC UPDATES                             │
└──────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Shiprocket Webhook         │
│  (Status changes)           │
│  POST /api/shiprocket-webhook│
│  {                          │
│    awb: "1234567890",       │
│    status: "OUT FOR DELIVERY"│
│    current_timestamp: ...   │
│  }                          │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Worker Forwards to n8n     │
│  Triggers notifications     │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  n8n Sends Notifications:   │
│  📧 Email: "Out for delivery"│
│  📱 SMS: "Arriving today"   │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  🎉 DELIVERED               │
│  Customer receives package  │
│  Fresh chutney enjoyed!     │
└─────────────────────────────┘


═══════════════════════════════════════════════════════════════════

                         KEY IMPROVEMENTS

Before Integration:
❌ Manual order entry in Shiprocket
❌ No tracking for customers  
❌ Manual status updates
❌ Customer has to ask "where is my order?"
❌ Support burden is high

After Integration:
✅ Automatic shipment creation
✅ Instant tracking number
✅ Self-service tracking page
✅ Automatic status updates
✅ Happy customers!

═══════════════════════════════════════════════════════════════════

                         DATA FLOW SUMMARY

┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│             │    │             │    │             │
│  Frontend   │───▶│   Worker    │───▶│  Razorpay   │
│             │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
      │                  │
      │                  │
      ▼                  ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│             │    │             │    │             │
│  Customer   │    │   Worker    │───▶│ Shiprocket  │
│             │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
      │                  │
      │                  │
      ▼                  ▼
┌─────────────┐    ┌─────────────┐
│             │    │             │
│  Tracking   │◀───│     n8n     │
│    Page     │    │  (Logging)  │
│             │    │             │
└─────────────┘    └─────────────┘

═══════════════════════════════════════════════════════════════════
```

## Benefits at a Glance

### For Customers 🎉
- ✅ Instant tracking after payment
- ✅ Know exactly when order will arrive
- ✅ No need to call/email for updates
- ✅ Professional experience
- ✅ Peace of mind

### For Business 📈
- ✅ Zero manual work
- ✅ Automatic courier assignment
- ✅ Better delivery rates
- ✅ Professional operations
- ✅ Scale easily
- ✅ Focus on product, not logistics

### For Support 💪
- ✅ Fewer "where's my order" calls
- ✅ Self-service tracking
- ✅ Automatic updates
- ✅ Less workload
- ✅ Happier team

## Technical Stack

```
Frontend:      Vanilla JS (modal-component.js)
Backend:       Cloudflare Workers (serverless)
Payment:       Razorpay API
Shipping:      Shiprocket API
Logging:       n8n webhook
Database:      Your choice (via n8n)
Hosting:       Cloudflare Pages (free)
```

## API Calls Timeline

```
0s    → Customer submits form
1s    → /api/create-order (Razorpay)
2s    → Razorpay checkout opens
30s   → Customer completes payment
31s   → /api/verify-payment
32s   → ✅ Payment verified
33s   → /api/create-shipment (NEW!)
35s   → Shiprocket creates order
36s   → Tracking number returned
37s   → n8n webhook called
38s   → Success modal with tracking shown
```

Total time: **~38 seconds** from form submit to tracking number!

