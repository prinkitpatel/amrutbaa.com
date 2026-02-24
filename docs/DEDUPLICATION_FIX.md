# Deduplication Fix - Double Conversions Issue

## Problem Identified

You were seeing **2 conversions in Meta** and **2 entries in Shiprocket** due to:

### 1. **Duplicate Meta Purchase Tracking**
- **fbq() Pixel call**: Sent conversion via browser Pixel
- **fetch('/api/track-purchase')**: Sent SAME conversion via Conversions API (server-side)
- **Result**: Meta counted both as separate conversions ❌

### 2. **Duplicate Shiprocket Shipments**
- **Frontend (`modal-component.js`)**: Called `/api/create-shipment` directly after payment
- **n8n webhook**: Also called `/api/create-shipment` when receiving order details
- **Result**: Same order created twice in Shiprocket ❌

### 3. **Duplicate n8n Submissions**
- Order was submitted once to n8n
- But was being tracked separately via `trackMetaPurchase()` 
- Not clean separation of concerns

---

## Solution Applied

### ✅ Fix #1: Single Meta Conversion Event (Conversions API Only)

**Removed**: fbq() Pixel call for Purchase event
```javascript
// REMOVED - This was causing duplicate:
fbq('track', 'Purchase', { ... })
```

**Kept**: Server-side Conversions API via `/api/track-purchase`
- **Why**: Server-side events are more reliable and deduplicated by Meta using `event_id`
- **Deduplication**: Meta uses the same `event_id` to link Pixel + Conversions API events

### ✅ Fix #2: All Backend Operations in Single n8n Call

**Before** (Two separate calls):
```javascript
// Call 1: Create Shiprocket shipment directly
fetch('/api/create-shipment', {...})

// Call 2: Submit to n8n (which also called create-shipment)
submitOrderDetails(orderData)
```

**After** (Single call to n8n):
```javascript
// Single call - n8n handles ALL backend operations:
// 1. Track Purchase to Meta (Conversions API)
// 2. Create Shiprocket shipment
// 3. Send order confirmation email
submitOrderDetails(orderData, paymentId, totalAmount)
```

### ✅ Fix #3: Event ID Passed to n8n

```javascript
const eventId = generateEventId();

const response = await fetch('https://n8n.prinkit.cloud/webhook/order_form', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        ...orderData,
        event_id: eventId,  // ← Pass for Meta deduplication
        source: 'frontend_checkout'
    })
});
```

---

## What Happens Now

### When Customer Completes Purchase:

1. ✅ **GTM**: dataLayer.push('purchase') event fires (for GA4)
2. ✅ **n8n Webhook**: Single POST with order + event_id
3. ✅ **n8n Workflow**:
   - Tracks Purchase to Meta **once** with event_id
   - Creates **one** Shiprocket shipment
   - Sends order confirmation email
4. ✅ **Meta**: Receives single Purchase event (deduplicated with Pixel if fired)
5. ✅ **Shiprocket**: Receives single shipment creation request

### Result:
- ✅ **1 conversion** in Meta (deduplicated)
- ✅ **1 entry** in Shiprocket
- ✅ **1 order** in database
- ✅ **1 confirmation email** sent

---

## Files Modified

### `/assets/js/modal-component.js`

**Changes**:
1. **Lines ~2107-2125**: Removed fbq() Pixel call for Purchase event
   - Now only uses Conversions API (server-side)
   - Event deduplication handled by Meta via event_id

2. **Lines ~1715-1780**: 
   - Removed direct `/api/create-shipment` call from frontend
   - Removed separate `trackMetaPurchase()` call
   - Now single `submitOrderDetails()` call passes all data to n8n

3. **Lines ~2155-2185**: Updated `submitOrderDetails()` function
   - Generates `event_id` locally
   - Passes to n8n for Meta tracking
   - Passes `source: 'frontend_checkout'` for tracking origin

---

## n8n Configuration (To Apply)

Your n8n workflow should:

```javascript
// When receiving order_form webhook:
{
  // 1. Extract event_id from payload
  const eventId = data.event_id;
  
  // 2. Track Purchase to Meta (once) with event_id
  await fetch('/api/track-purchase', {
    event_id: eventId,  // This deduplicates with Pixel
    // ... other fields
  });
  
  // 3. Create Shiprocket shipment (once)
  await fetch('/api/create-shipment', {
    // ... shipment data
  });
  
  // 4. Send email (once)
  await sendEmail(...);
}
```

---

## Testing

### Test Scenario: Complete one order
1. Go to https://amrutbaa.com
2. Click "Order Now"
3. Fill form and complete payment
4. Check:
   - ✅ Meta Conversions: Should show **1 conversion** (not 2)
   - ✅ Shiprocket Dashboard: Should show **1 shipment** (not 2)
   - ✅ Email: Should receive **1 confirmation** (not 2)

---

## Monitoring

### Check Deduplication:
```bash
# In Meta Events Manager:
# Events > Conversions > Purchase
# Should show: 1 event (not 2)

# In Shiprocket Dashboard:
# Orders > Latest Orders
# Should show: 1 order per checkout (not 2)
```

### Check Event IDs:
```javascript
// In browser console after purchase:
// Should see generated event_id sent to n8n
console.log('Event ID sent:', eventId);
```

---

## Summary

| Issue | Before | After |
|-------|--------|-------|
| **Meta Conversions** | 2 (fbq + API) | 1 (API only, deduplicated) |
| **Shiprocket Entries** | 2 (frontend + n8n) | 1 (n8n only) |
| **Backend Calls** | Scattered across frontend + n8n | Centralized in n8n |
| **Event ID Usage** | Not passed to n8n | Passed for deduplication |
| **Code Clarity** | Multiple tracking paths | Single unified path |

---

## Next Steps

1. ✅ **Deploy** these changes to production
2. 🔄 **Test** one complete purchase flow
3. 📊 **Monitor** Meta and Shiprocket for correct counts (should be 1)
4. ✅ **Verify** n8n workflow has event_id handling
5. 📧 **Confirm** single email sent

