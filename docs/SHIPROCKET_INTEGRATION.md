# 🚚 Shiprocket Integration Guide - Amrutbaa.com

## Overview
This guide covers the **complete end-to-end Shiprocket integration** for automatic shipping management after successful payment.

## 🎯 What This Integration Does

1. **After successful Razorpay payment** → Automatically creates a Shiprocket order
2. **Generates tracking number** → Customers receive AWB code immediately
3. **Provides tracking page** → Customers can track their order in real-time
4. **Webhook updates** → Real-time status updates from Shiprocket

## 📋 Prerequisites

### 1. Shiprocket Account Setup

1. **Sign up**: https://www.shiprocket.in/
2. **Complete KYC**: Upload business documents
3. **Add pickup location**: Settings → Pickup Address
   - This is where Shiprocket will pick up orders (your home/warehouse)
   - Get approval (takes 1-2 days)
4. **Add bank details**: For COD remittance (if applicable)
5. **Get API credentials**: Settings → API

### 2. Required Credentials

You'll need these from Shiprocket dashboard:

```
SHIPROCKET_EMAIL: Your login email
SHIPROCKET_PASSWORD: Your login password
SHIPROCKET_PICKUP_LOCATION: Name of your pickup address (default: "Primary")
```

### 3. Product Details for API

Update in `worker-shiprocket.js` if needed:

```javascript
name: "Amrut Baa Chilly Garlic Chutney"
sku: "AMB-CGC-100G"
hsn: 210390 // HSN code for chutneys
weight: 0.15 kg per jar (150g)
dimensions: 10cm x 10cm x 8cm (package)
```

## 🔧 Installation Steps

### Step 1: Replace Worker File

**Option A: Replace existing worker (recommended)**
```bash
# Backup current worker
cp worker.js worker-old.js

# Use new worker with Shiprocket
cp worker-shiprocket.js worker.js
```

**Option B: Use new file (testing)**
```bash
# Deploy as separate worker first for testing
# Update wrangler.toml name temporarily
```

### Step 2: Set Environment Variables in Cloudflare

**Via Wrangler CLI:**
```bash
npx wrangler secret put SHIPROCKET_EMAIL
# Enter: your-email@example.com

npx wrangler secret put SHIPROCKET_PASSWORD
# Enter: your-shiprocket-password

npx wrangler secret put SHIPROCKET_PICKUP_LOCATION
# Enter: Primary (or your pickup location name)
```

**Via Cloudflare Dashboard:**
1. Go to Workers & Pages → Your Project
2. Settings → Variables → Environment Variables
3. Add these variables:
   - `SHIPROCKET_EMAIL` → Your email
   - `SHIPROCKET_PASSWORD` → Your password (mark as encrypted)
   - `SHIPROCKET_PICKUP_LOCATION` → "Primary" (or your location name)

**Existing Razorpay variables (keep these):**
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

### Step 3: Update Modal Component

This is **already done** in the provided files:
- [assets/js/modal-component.js](assets/js/modal-component.js) now calls `/api/create-shipment`
- Displays tracking info in success modal
- Passes tracking to n8n webhook

### Step 4: Deploy

```bash
# Deploy worker + static files
npx wrangler pages deploy . --project-name=amrutbaa-com

# Or if using Git deployment
git add .
git commit -m "🚚 Add Shiprocket integration"
git push
```

### Step 5: Test Integration

1. **Health Check**: Visit `https://your-site.com/api/health`
   - Should show: `{ status: "ok", services: { razorpay: true, shiprocket: true } }`

2. **Test Payment Flow**:
   - Place a test order
   - Complete Razorpay payment (use test card)
   - Check console logs for shipment creation
   - Should see tracking number in success modal

3. **Test Tracking Page**: Visit `https://your-site.com/tracking.html`
   - Enter the AWB code shown after order
   - Should display tracking details

## 📦 API Endpoints

### Create Shipment
**POST** `/api/create-shipment`

**Request Body:**
```json
{
  "order_id": "order_123",
  "payment_id": "pay_123",
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "9876543210",
  "address1": "123 Main St",
  "address2": "Apt 4B",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "quantity": 2,
  "amount": 698
}
```

**Response (Success):**
```json
{
  "success": true,
  "shipment_id": 12345678,
  "order_id": 87654321,
  "awb_code": "1234567890123",
  "courier_name": "Delhivery",
  "message": "Shipment created successfully"
}
```

### Track Shipment
**POST** `/api/track-shipment`

**Request Body:**
```json
{
  "awb_code": "1234567890123"
}
```
Or:
```json
{
  "shipment_id": 12345678
}
```

**Response:**
```json
{
  "success": true,
  "tracking": {
    "tracking_data": {
      "awb_code": "1234567890123",
      "courier_name": "Delhivery",
      "shipment_status": "SHIPPED",
      "edd": "2026-02-10",
      "current_status_body": "In transit",
      "shipment_track": [
        {
          "date": "2026-02-07T10:30:00",
          "status": "Picked up",
          "activity": "Shipment picked up from sender",
          "location": "Mumbai"
        }
      ]
    }
  }
}
```

### Webhook Handler
**POST** `/api/shiprocket-webhook`

This receives automatic updates from Shiprocket when shipment status changes.

**Setup in Shiprocket Dashboard:**
1. Settings → Webhooks
2. Add webhook URL: `https://your-site.com/api/shiprocket-webhook`
3. Select events: All shipment events

## 🔄 Complete Payment → Shipment Flow

```
1. Customer fills form
   ↓
2. Clicks "Complete Registration"
   ↓
3. Frontend → /api/create-order (Razorpay)
   ↓
4. Razorpay checkout opens
   ↓
5. Customer pays
   ↓
6. Frontend → /api/verify-payment
   ↓
7. ✅ Payment verified
   ↓
8. Frontend → /api/create-shipment (NEW)
   ↓
9. Worker → Shiprocket API (creates order)
   ↓
10. Shiprocket assigns courier & AWB
   ↓
11. Worker returns tracking info to frontend
   ↓
12. Frontend shows tracking in success modal
   ↓
13. Frontend → n8n webhook (with tracking)
   ↓
14. Customer sees: "📦 Tracking: 123456789012"
```

## 📧 n8n Webhook Update

Your n8n workflow now receives **additional fields**:

```json
{
  // Existing fields
  "name": "...",
  "email": "...",
  "phone": "...",
  "address": "...",
  "quantity": 2,
  "payment_id": "pay_xxx",
  "order_id": "order_xxx",
  "amount": 698,
  
  // NEW Shiprocket fields
  "tracking_number": "1234567890123",
  "shipment_id": 12345678,
  "courier_name": "Delhivery"
}
```

**Update your n8n workflow to:**
1. Store tracking info in database/Airtable
2. Send email with tracking link
3. Set up tracking status updates

## 🎨 Customer Experience

### Success Modal (After Payment)
```
🎉 Your Jar is Reserved!

Your fresh chutney will be prepared Monday and dispatched Tuesday.
Expected delivery: Wednesday-Friday

📦 Tracking Number: 1234567890123
🚚 Courier: Delhivery
Track Your Order → [Link to tracking page]
```

### Tracking Page
- Beautiful branded tracking interface
- Live status updates
- Timeline of shipment history
- Courier details & expected delivery
- Auto-loads if AWB in URL

### Email Template (Recommended)
```
Subject: 🎉 Order Confirmed - Tracking Inside!

Hi [Name],

Your order for [Quantity] jar(s) has been confirmed and paid!

📦 Tracking Number: [AWB_CODE]
🚚 Courier: [COURIER_NAME]
📅 Expected Delivery: [EDD]

Track your order: https://amrutbaa.com/tracking.html?awb=[AWB_CODE]

What happens next:
• Monday: Fresh ingredients sourced & prepared
• Tuesday: Dispatched to you
• Wed-Fri: Delivered fresh to your doorstep

Thank you for honoring tradition with us!

- Team Amrut Baa
```

## ⚙️ Configuration Options

### Pickup Location
If you have multiple pickup addresses in Shiprocket:

```bash
# Set specific location
npx wrangler secret put SHIPROCKET_PICKUP_LOCATION
# Enter: "Warehouse - Ahmedabad" (exact name from Shiprocket)
```

### Package Dimensions
Edit in `worker-shiprocket.js` (line ~195):

```javascript
length: 10,  // cm
breadth: 10, // cm
height: 8,   // cm
weight: 0.15 * quantity // kg
```

### HSN Code (for GST compliance)
Current: `210390` (Chutneys)

Verify at: https://www.gst.gov.in/

### Payment Method
Current: `Prepaid` (since using Razorpay)

For COD orders, change to: `COD`

## 🐛 Troubleshooting

### Shipment Creation Fails

**Error: "Invalid pickup location"**
- Solution: Check exact name in Shiprocket dashboard
- Update `SHIPROCKET_PICKUP_LOCATION` to match exactly

**Error: "Authentication failed"**
- Solution: Verify email/password in environment variables
- Check if Shiprocket account is active

**Error: "Invalid pincode"**
- Solution: Check if customer pincode is serviceable
- Use Shiprocket pincode checker API

### Tracking Not Working

**"Unable to find tracking information"**
- Wait 2-4 hours after shipment creation
- Shiprocket needs time to assign courier and generate tracking
- Check Shiprocket dashboard manually

**Tracking page shows error**
- Verify `/api/track-shipment` endpoint is working
- Check environment variables are set
- Test with known working AWB from dashboard

### Payment Succeeds but No Shipment

**Scenario**: Payment goes through but shipment creation fails

**What happens**:
- Payment is successful (customer charged)
- Shipment creation fails silently
- Customer still sees success message
- Order is logged in n8n (without tracking)

**Solution**:
- Check Cloudflare Worker logs
- Manually create shipment in Shiprocket dashboard
- Send tracking to customer via email

**Prevention**:
- Monitor shipment creation success rate
- Set up alerts for failed shipments
- Have fallback process for manual shipment creation

## 📊 Monitoring & Alerts

### Cloudflare Worker Logs

View real-time logs:
```bash
npx wrangler tail
```

Look for:
- ✅ `Shipment created: { shipment_id: xxx }`
- ⚠️ `Shipment creation failed`
- ❌ `Shiprocket auth error`

### Shiprocket Dashboard

Check daily:
1. **Orders** → New orders synced from website
2. **Shipments** → Pickup scheduled
3. **Issues** → Failed deliveries, RTO
4. **Reports** → Performance metrics

### Recommended Alerts

Set up notifications for:
- Payment success but shipment failure
- RTO (Return to Origin) - delivery failed
- Shipments pending pickup > 24 hours
- Customer complaints about tracking

## 💰 Costs

### Shiprocket Pricing (Approximate)

| Weight | Zone | Cost |
|--------|------|------|
| 500g | Within state | ₹40-50 |
| 500g | Metro-Metro | ₹50-60 |
| 500g | North-South | ₹70-90 |

**For 150g jar × 2 = 300g package**:
- Estimated: ₹35-75 per order
- Use Shiprocket calculator: https://www.shiprocket.in/shipping-rate-calculator/

### Free Shipping Strategy

**Option 1: Include in product price**
```javascript
const pricePerJar = 349 + 25; // ₹374 (includes shipping)
```

**Option 2: Free above threshold**
```javascript
const shippingCost = (amount >= 399) ? 0 : 59;
```

**Option 3: Pass to customer**
- Calculate shipping via Shiprocket API
- Add to total before payment
- Show breakdown in modal

## 🚀 Advanced Features

### 1. Shipping Calculator (Future)

Add before payment to show exact shipping cost:

**New API endpoint:** `/api/calculate-shipping`

```javascript
// In modal-component.js
const shipping = await fetch('/api/calculate-shipping', {
  method: 'POST',
  body: JSON.stringify({ pincode, weight })
});
```

### 2. COD Option (Future)

Enable Cash on Delivery:

```javascript
payment_method: formData.payment_type === 'cod' ? 'COD' : 'Prepaid'
```

### 3. Multiple Couriers

Shiprocket auto-assigns best courier, but you can prefer specific ones:

```javascript
courier_id: 25 // Delhivery
```

### 4. International Shipping

Shiprocket supports international. Update:

```javascript
billing_country: formData.country || "India"
```

### 5. Bulk Orders

For B2B or wholesale, use Shiprocket bulk upload API

## 📱 SMS Notifications (Optional)

Send SMS with tracking via Shiprocket:

**In worker after shipment creation:**
```javascript
await fetch('https://apiv2.shiprocket.in/v1/external/courier/servicability/', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({
    pickup_postcode: "380001",
    delivery_postcode: pincode,
    cod: 0,
    weight: weight
  })
});
```

## ✅ Launch Checklist

Before going live:

- [ ] Shiprocket account verified and KYC approved
- [ ] Pickup location added and approved
- [ ] Environment variables set in Cloudflare
- [ ] Test order placed successfully
- [ ] Shipment created in test
- [ ] Tracking page works
- [ ] n8n webhook receives tracking data
- [ ] Email template includes tracking link
- [ ] Monitor logs for 1 week
- [ ] Set up failure alerts
- [ ] Document manual fallback process

## 🎯 Best Practices

1. **Always verify payment first** before creating shipment
2. **Handle shipment failures gracefully** - don't fail the whole order
3. **Log everything** - you'll need it for debugging
4. **Monitor daily** - check Shiprocket dashboard regularly
5. **Communicate proactively** - send tracking ASAP
6. **Plan for RTO** - have process for failed deliveries
7. **Update inventory** - sync with your n8n workflow
8. **Customer support** - respond quickly to delivery issues

## 📞 Support

### Shiprocket Support
- Email: care@shiprocket.in
- Phone: 0124-6366-366
- Dashboard: Chat support (bottom right)

### Integration Issues
- Check Cloudflare Worker logs first
- Test API endpoints individually
- Review this documentation
- Contact developer if needed

## 🔗 Useful Links

- Shiprocket API Docs: https://apidocs.shiprocket.in/
- Cloudflare Workers: https://developers.cloudflare.com/workers/
- Razorpay Docs: https://razorpay.com/docs/
- HSN Code Lookup: https://www.gst.gov.in/

---

## 📋 Quick Commands Reference

```bash
# Set secrets
npx wrangler secret put SHIPROCKET_EMAIL
npx wrangler secret put SHIPROCKET_PASSWORD
npx wrangler secret put SHIPROCKET_PICKUP_LOCATION

# Deploy
npx wrangler pages deploy . --project-name=amrutbaa-com

# View logs
npx wrangler tail

# Test health
curl https://your-site.com/api/health

# Test tracking
curl -X POST https://your-site.com/api/track-shipment \
  -H "Content-Type: application/json" \
  -d '{"awb_code":"123456789012"}'
```

---

**🎉 You're all set! Customers will now get automatic tracking after every order.**

