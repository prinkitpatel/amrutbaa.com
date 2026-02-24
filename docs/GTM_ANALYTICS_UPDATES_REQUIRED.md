# GTM & Google Analytics Updates Required - COD & Other Changes

**Current Setup**: GTM (GTM-53CBVFF7) with GA4 tracking + Razorpay payment integration
**Date**: February 18, 2026
**Changes Made**: Added COD (Cash on Delivery) payment option + Shiprocket integration

---

## 📋 Summary of What Changed

### Backend Changes (worker.js):
- ✅ Added `/api/create-order-cod` endpoint for COD orders (no Razorpay)
- ✅ Added `/api/check-pincode` endpoint for Shiprocket serviceability
- ✅ Added `/api/create-shipment` endpoint for shipping creation
- ✅ Shiprocket integration with COD support
- ✅ Shipment tracking endpoint

### Frontend Changes (modal-component.js):
- ✅ Added payment method selection (Online vs COD radio buttons)
- ✅ Added pincode input validation
- ✅ Added Shiprocket serviceability checking
- ✅ Conditional Razorpay modal (only for Online payments)
- ✅ Different success flow for COD vs Online

---

## 🎯 What Needs to Update in GTM & GA4

### CRITICAL: New Data Layer Variables to Add

Add these **Data Layer Variables** in GTM (Variables → New → Data Layer Variable):

| Variable Name | Data Layer Key | Purpose |
|---------------|-----------------|---------|
| `DLV - Payment Method` | `payment_method` | Track "online" or "cod" |
| `DLV - Pincode` | `pincode` | Track delivery location |
| `DLV - City` | `city` | Delivery city |
| `DLV - State` | `state` | Delivery state |
| `DLV - Shipping Status` | `shipping_status` | "serviceable" or "not_serviceable" |
| `DLV - Shipment ID` | `shipment_id` | Shiprocket shipment tracking |
| `DLV - AWB Code` | `awb_code` | Tracking/waybill number |
| `DLV - Order ID COD` | `order_id_cod` | COD order reference ID |

---

## 🔥 New Events to Track in GTM

### 1. **Add Payment Info (UPDATED)**

**Current Event**: Only tracks when payment gateway opens (Razorpay)
**Now Needs**: Track BOTH payment methods

#### Create New Trigger: `CE - Payment Method Selected`
- **Type**: Custom Event
- **Event Name**: `add_payment_info`

#### Update Tag: `GA4 - Event - Add Payment Info`
**New Event Parameters**:
```
- payment_type: {{DLV - Payment Method}}     // "online" or "cod"
- payment_method_details: {{DLV - Payment Method}}
```

---

### 2. **NEW: Pincode Validation Event**

**Purpose**: Track how many users check serviceability

#### Create Trigger: `CE - Pincode Checked`
- **Type**: Custom Event
- **Event Name**: `pincode_checked`

#### Create Tag: `GA4 - Event - Pincode Check`
- **Event Name**: `pincode_check`
- **Event Parameters**:
  - `pincode`: `{{DLV - Pincode}}`
  - `shipping_status`: `{{DLV - Shipping Status}}`
  - `delivery_available`: `true` or `false`
- **Triggering**: `CE - Pincode Checked`

---

### 3. **NEW: COD Order Created Event**

**Purpose**: Track COD-specific conversions separately from Online payments

#### Create Trigger: `CE - COD Order Success`
- **Type**: Custom Event
- **Event Name**: `cod_order_created`

#### Create Tag: `GA4 - Event - COD Order Success`
- **Event Name**: `purchase` (use standard purchase event)
- **E-commerce Data**: ✅ Enable
- **Event Parameters**:
  - `transaction_id`: `{{DLV - Order ID COD}}`
  - `value`: `{{DLV - Value}}`
  - `currency`: `INR`
  - `payment_type`: `cod`
  - `shipping_tier`: `Standard`
  - `items`: Use from Data Layer
- **Triggering**: `CE - COD Order Success`

---

### 4. **NEW: Shipment Created Event**

**Purpose**: Track shipping handoff to Shiprocket

#### Create Trigger: `CE - Shipment Created`
- **Type**: Custom Event
- **Event Name**: `shipment_created`

#### Create Tag: `GA4 - Event - Shipment Created`
- **Event Name**: `shipment_dispatch`
- **Event Parameters**:
  - `shipment_id`: `{{DLV - Shipment ID}}`
  - `awb_code`: `{{DLV - AWB Code}}`
  - `order_id`: `{{DLV - Order ID COD}}`
  - `delivery_city`: `{{DLV - City}}`
  - `delivery_state`: `{{DLV - State}}`
- **Triggering**: `CE - Shipment Created`

---

### 5. **NEW: Pincode Not Serviceable Event**

**Purpose**: Track areas you don't deliver to

#### Create Trigger: `CE - Pincode Not Serviceable`
- **Type**: Custom Event
- **Event Name**: `pincode_not_serviceable`

#### Create Tag: `GA4 - Event - Pincode Not Serviceable`
- **Event Name**: `checkout_error`
- **Event Parameters**:
  - `error_type`: `pincode_not_serviceable`
  - `pincode`: `{{DLV - Pincode}}`
  - `error_message`: "This pincode is not serviceable"
- **Triggering**: `CE - Pincode Not Serviceable`

---

## 📊 Updated E-commerce Events Flow

### BEFORE (Online Only):
```
1. begin_checkout
2. add_to_cart
3. add_shipping_info (address)
4. add_payment_info (Razorpay modal opens)
5. purchase (payment success)
```

### AFTER (Online + COD):
```
1. begin_checkout (Modal opens)
2. add_to_cart (Package selected)
3. pincode_check (User validates delivery)
   ├─ If Not Serviceable → checkout_error
   └─ If Serviceable → Continue
4. add_shipping_info (Full address entered)
5. add_payment_info (Payment method selected)
   ├─ If "online" → Razorpay modal → purchase
   └─ If "cod" → Direct order → purchase (purchase event with payment_type: "cod")
6. shipment_dispatch (Order handed to Shiprocket)
7. shipment_tracking (Optional: Track delivery status)
```

---

## 🔄 Required Data Layer Pushes in Frontend Code

Your **modal-component.js** needs these `dataLayer.push()` calls:

### 1. When Payment Method is Selected
```javascript
// Add this when user selects COD or Online
const paymentMethod = document.querySelector('input[name="payment_method"]:checked').value;
window.dataLayer.push({
  'event': 'add_payment_info',
  'payment_method': paymentMethod,  // "online" or "cod"
  'ecommerce': {
    'currency': 'INR',
    'value': totalPrice,
    'items': [{
      'item_id': selectedPackage,
      'item_name': packageName,
      'price': packagePrice,
      'quantity': quantity
    }]
  }
});
```

### 2. When Pincode is Checked
```javascript
// In checkPincodeServiceability() function
window.dataLayer.push({
  'event': 'pincode_checked',
  'pincode': pincode,
  'shipping_status': isServiceable ? 'serviceable' : 'not_serviceable'
});

// If not serviceable
if (!isServiceable) {
  window.dataLayer.push({
    'event': 'pincode_not_serviceable',
    'pincode': pincode,
    'error_message': 'This pincode is not serviceable'
  });
}
```

### 3. When COD Order is Created
```javascript
// After successful COD order creation from worker.js response
window.dataLayer.push({
  'event': 'cod_order_created',
  'order_id_cod': orderData.order_id,
  'shipment_id': orderData.shipment_id,
  'awb_code': orderData.awb_code,
  'ecommerce': {
    'transaction_id': orderData.order_id,
    'value': totalPrice,
    'currency': 'INR',
    'payment_type': 'cod',
    'items': [{
      'item_id': packageId,
      'item_name': packageName,
      'price': packagePrice,
      'quantity': quantity
    }]
  }
});
```

### 4. When Shipment is Created (Optional)
```javascript
// After shipment API response
window.dataLayer.push({
  'event': 'shipment_created',
  'shipment_id': shipmentId,
  'awb_code': awbCode,
  'city': deliveryCity,
  'state': deliveryState
});
```

---

## 🎯 Key Metrics to Monitor Now

### Payment Method Segmentation:
- **Users choosing COD** vs **Online**
- **Conversion rate by payment method**
- **Average order value by payment method**

### Delivery Insights:
- **Pincode checks vs. completions** (drop-off rate)
- **Top 10 serviceable pincodes**
- **Top 5 non-serviceable pincodes**
- **Cities with highest orders**

### Funnel Analysis:
```
100% → Land on page
  ↓ (X%) → Open modal (begin_checkout)
  ↓ (Y%) → Select package (add_to_cart)
  ↓ (Z%) → Check pincode serviceable (pincode_check)
  ↓ (A%) → Enter full address (add_shipping_info)
  ↓ (B%) → Choose payment method (add_payment_info)
  ↓ (C%) → Complete payment (purchase)
    ├─ Online: Razorpay success
    └─ COD: Order confirmed
```

---

## 🚨 IMPORTANT: Test Events First

### Before Publishing:
1. **Enable Debug Mode** in GTM
   - Go to GTM → Preview & Debug
   - Open your website
   - Check Real-Time events in GA4

2. **Verify Each Event**:
   - [ ] `pincode_checked` fires
   - [ ] `add_payment_info` fires with payment_method
   - [ ] `cod_order_created` fires (or `purchase` with payment_type=cod)
   - [ ] `purchase` event has all required fields

3. **Test Both Flows**:
   - [ ] Complete Online payment → Check purchase event
   - [ ] Complete COD order → Check purchase event with payment_type

---

## ✅ Checklist: What to Do in GTM

### Step 1: Add Data Layer Variables (5 min)
- [ ] DLV - Payment Method
- [ ] DLV - Pincode
- [ ] DLV - City
- [ ] DLV - State
- [ ] DLV - Shipping Status
- [ ] DLV - Shipment ID
- [ ] DLV - AWB Code
- [ ] DLV - Order ID COD

### Step 2: Create New Triggers (10 min)
- [ ] CE - Payment Method Selected (custom event: add_payment_info)
- [ ] CE - Pincode Checked (custom event: pincode_checked)
- [ ] CE - COD Order Success (custom event: cod_order_created)
- [ ] CE - Shipment Created (custom event: shipment_created)
- [ ] CE - Pincode Not Serviceable (custom event: pincode_not_serviceable)

### Step 3: Update/Create Tags (15 min)
- [ ] Update `GA4 - Event - Add Payment Info` → Add payment_method parameter
- [ ] Create `GA4 - Event - Pincode Check`
- [ ] Create `GA4 - Event - COD Order Success`
- [ ] Create `GA4 - Event - Shipment Created`
- [ ] Create `GA4 - Event - Pincode Not Serviceable`

### Step 4: Update Frontend (20 min)
- [ ] Add dataLayer.push() for payment method selection
- [ ] Add dataLayer.push() for pincode check
- [ ] Add dataLayer.push() for COD order success
- [ ] Test in Debug mode

### Step 5: Publish & Verify (5 min)
- [ ] Enable Debug mode in GTM
- [ ] Test complete COD flow
- [ ] Test complete Online flow
- [ ] Verify events in GA4 Real-Time
- [ ] Publish GTM container

### Step 6: Monitor GA4 (Ongoing)
- [ ] Create custom report for payment method breakdown
- [ ] Set up alerts for COD conversion rate
- [ ] Monitor pincode serviceability drop-offs

---

## 📈 New Reports to Create in GA4

### 1. Payment Method Performance
- **Metric**: Conversion Rate by Payment Method
- **Dimensions**: Payment Method (online/cod)
- **View**: Sessions → Conversions

### 2. Delivery Serviceability
- **Metric**: Pincode Checks → Orders Completed
- **Dimensions**: Shipping Status
- **View**: Conversion funnel

### 3. Geographic Breakdown
- **Metric**: Orders by City/State
- **Dimensions**: Delivery City, Delivery State
- **View**: Geo distribution

### 4. Delivery Performance
- **Metric**: Orders by State
- **Dimensions**: Delivery State
- **View**: Heatmap

---

## 🔗 Current GTM Container: GTM-53CBVFF7

**Already Implemented**:
- ✅ GA4 Configuration Tag
- ✅ Page View tracking
- ✅ Scroll Depth tracking
- ✅ CTA Click tracking
- ✅ Form events (Step 1 & 2)
- ✅ Add to Cart tracking
- ✅ Payment Info (Razorpay only)
- ✅ Purchase event (Online only)

**Needs to Add**:
- ❌ Payment Method segmentation
- ❌ Pincode validation tracking
- ❌ COD order tracking
- ❌ Shipment dispatch tracking
- ❌ Delivery location tracking

---

## 📞 Questions to Clarify

1. **Are you tracking COD orders in n8n?** (Check if n8n webhook is called)
2. **Do you want to track shipment status updates?** (Optional: add shipment_tracking event)
3. **Are you using Google Ads?** (If yes, need to add Google Ads conversion tags)
4. **Are you using Facebook Ads?** (If yes, need to add Facebook Pixel events for COD)
5. **Do you need real-time COD alerts?** (GA4 + Slack webhook integration)

---

## 🎯 Priority Order

1. **HIGH** → Add payment method tracking (differentiates revenue)
2. **HIGH** → Add COD purchase event (separate conversion attribution)
3. **MEDIUM** → Add pincode tracking (understand delivery gaps)
4. **MEDIUM** → Add shipment tracking (optimize delivery)
5. **LOW** → Add geographic breakdown (future expansion)

---

**Next Steps**: 
1. Review this document with your team
2. Update GTM variables & triggers (follow the checklist)
3. Add dataLayer.push() calls in modal-component.js
4. Test in Preview & Debug mode
5. Publish and monitor for 24 hours

