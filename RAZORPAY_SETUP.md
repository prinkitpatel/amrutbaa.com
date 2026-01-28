# Razorpay Payment Integration Setup

## Overview
This project now includes Razorpay payment gateway integration using Cloudflare Workers as the backend.

## Files Added/Modified

1. **worker.js** - Cloudflare Worker handling Razorpay API calls
2. **wrangler.toml** - Updated with worker configuration
3. **index.html** - Added Razorpay checkout script
4. **assets/js/modal-component.js** - Updated form submission to handle payments

## Setup Instructions

### Step 1: Get Razorpay API Keys

1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/signup)
2. Complete KYC verification (required for live mode)
3. Navigate to **Settings** → **API Keys**
4. Generate API Keys:
   - **Test Mode**: For development/testing
   - **Live Mode**: For production (after KYC approval)
5. Copy both:
   - Key ID (starts with `rzp_test_` or `rzp_live_`)
   - Key Secret

### Step 2: Configure Cloudflare Worker Secrets

Set up environment variables in Cloudflare:

```bash
# Using Wrangler CLI
npx wrangler secret put RAZORPAY_KEY_ID
# Paste your key ID when prompted

npx wrangler secret put RAZORPAY_KEY_SECRET
# Paste your key secret when prompted
```

**Or via Cloudflare Dashboard:**
1. Go to Workers & Pages → Your Project
2. Settings → Variables
3. Add Environment Variables:
   - `RAZORPAY_KEY_ID`: Your Razorpay Key ID
   - `RAZORPAY_KEY_SECRET`: Your Razorpay Key Secret (mark as encrypted)

### Step 3: Update Frontend Configuration

In `assets/js/modal-component.js`, line ~638:

```javascript
key: 'YOUR_RAZORPAY_KEY_ID', // Replace with actual key
```

Replace with your actual Razorpay Key ID (not the secret):
```javascript
key: 'rzp_test_xxxxxxxxxxxxx', // For test mode
// or
key: 'rzp_live_xxxxxxxxxxxxx', // For live mode
```

### Step 4: Set Pricing

In `assets/js/modal-component.js`, line ~627:

```javascript
const pricePerJar = 299; // Adjust this as needed
```

Update to your actual price per jar.

### Step 5: Deploy to Cloudflare

```bash
# Deploy the worker and static site
npx wrangler pages deploy . --project-name=amrutbaa-com

# Or if using Cloudflare Pages GitHub integration
git add -A
git commit -m "Add Razorpay payment integration"
git push
```

### Step 6: Test the Integration

#### Test Mode (Recommended First)
1. Use test API keys
2. Use Razorpay test cards:
   - **Success**: 4111 1111 1111 1111
   - **Failure**: 4000 0000 0000 0002
   - CVV: Any 3 digits
   - Expiry: Any future date

#### Test Checklist
- [ ] Modal opens correctly
- [ ] Form validation works
- [ ] Payment gateway opens with correct amount
- [ ] Test successful payment flow
- [ ] Test cancelled payment flow
- [ ] Order details submitted to webhook
- [ ] Success message displays

### Step 7: Go Live

1. Complete Razorpay KYC verification
2. Switch to live API keys in Cloudflare Worker secrets
3. Update frontend with live Key ID
4. Test with real payment (small amount)
5. Monitor Razorpay dashboard for transactions

## API Endpoints

The Cloudflare Worker exposes these endpoints:

### POST /api/create-order
Creates a new Razorpay order.

**Request:**
```json
{
  "amount": 299,
  "name": "Customer Name",
  "email": "customer@email.com",
  "phone": "9876543210",
  "quantity": 2
}
```

**Response:**
```json
{
  "id": "order_xxxxxxxxxxxxx",
  "amount": 59800,
  "currency": "INR",
  "receipt": "order_1706400000000",
  "status": "created"
}
```

### POST /api/verify-payment
Verifies payment signature after successful payment.

**Request:**
```json
{
  "razorpay_order_id": "order_xxxxxxxxxxxxx",
  "razorpay_payment_id": "pay_xxxxxxxxxxxxx",
  "razorpay_signature": "signature_string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully"
}
```

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "ok"
}
```

## Payment Flow

1. User fills registration form (2 steps)
2. User clicks "Complete Registration"
3. Frontend calls `/api/create-order` with order details
4. Worker creates Razorpay order and returns order ID
5. Razorpay checkout modal opens with payment options
6. User completes payment
7. Razorpay returns payment details to frontend
8. Frontend calls `/api/verify-payment` to verify signature
9. Worker verifies signature using HMAC
10. On success, order details submitted to n8n webhook
11. Success message shown to user

## Security Notes

- ✅ API secrets stored in Cloudflare Worker environment
- ✅ Payment signature verified on backend
- ✅ CORS headers configured
- ✅ Amount calculated on backend (prevents tampering)
- ⚠️ Keep Key Secret confidential (never expose in frontend)
- ⚠️ Use HTTPS only (enforced by Cloudflare)

## Testing URLs

- **Local**: http://localhost:8000 (API calls will fail - need deployed worker)
- **Production**: Your Cloudflare Pages URL

## Troubleshooting

### Payment Gateway Not Opening
- Check browser console for errors
- Verify Razorpay script loaded: `https://checkout.razorpay.com/v1/checkout.js`
- Ensure Key ID is correct in modal-component.js

### Order Creation Failed
- Check Cloudflare Worker logs
- Verify environment variables are set correctly
- Test with `/api/health` endpoint

### Payment Verification Failed
- Check signature generation in worker
- Verify Key Secret matches the Key ID used
- Check Cloudflare Worker logs for errors

### Amount Mismatch
- Ensure amount is in paise (multiply by 100)
- Check `pricePerJar` setting in modal-component.js

## Next Steps

1. ✅ Set up Razorpay account
2. ✅ Add API keys to Cloudflare
3. ✅ Update Key ID in frontend
4. ✅ Set pricing
5. ✅ Deploy and test
6. 🔲 Set up order tracking database
7. 🔲 Add email notifications
8. 🔲 Create admin dashboard
9. 🔲 Add refund handling

## Support

- Razorpay Docs: https://razorpay.com/docs/
- Cloudflare Workers: https://developers.cloudflare.com/workers/
- Issues: Contact development team
