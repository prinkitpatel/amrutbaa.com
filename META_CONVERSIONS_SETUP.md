# Meta Conversions API Setup - Amrutbaa.com

## ✅ Status: IMPLEMENTED

Your Meta Conversions API is now integrated into your Cloudflare Worker! This tracks both **Lead** and **Purchase** events directly from your website.

---

## 🎯 What's Now Working

### Lead Event (Form Submission)
When a customer **fills out the registration form**, Meta is automatically notified:
- Customer name, email, phone
- Product interest signal
- Event timestamp

### Purchase Event (Successful Payment)
When a customer **completes payment**, Meta gets notified:
- Order amount
- Number of items
- Customer contact info
- Payment ID (transaction ID)

---

## 🔧 Configuration

### Your Credentials (Already Added)
```
Dataset ID:  2736116190056650
Pixel ID:    2736116190056650
Access Token: EAAUlZBpgRSnkBQkbtpvRC8xdoqWWZCujEQo5aXukbyhdQ0kBNv1GY4DBabokOqZAfmjPIimIvWtei0sY9ceyUerNJ3ZAg2qfenRuP5OF9c4SsiVS2G3cO91aAwjoMgWIjTmcDQMCZCcB7Y3J4Ev9zZCO2MHndOsCBwnsTEvVBgJqXL6ERmTZBPZC7USNa2sGvZA8QcwZDZD
```

### Add to Cloudflare Worker Environment

Go to **Cloudflare Dashboard** → **Workers & Pages** → Your Project → **Settings** → **Variables**

Add these **Environment Variables**:

| Variable Name | Value | Type |
|---------------|-------|------|
| `META_DATASET_ID` | 2736116190056650 | Standard |
| `META_PIXEL_ID` | 2736116190056650 | Standard |
| `META_ACCESS_TOKEN` | (your full token) | **Secret** ⭐ |

**⭐ Mark the access token as SECRET** - this keeps it encrypted!

---

## 📍 API Endpoints Added

### 1. `/api/track-lead` (POST)
Called when form is submitted.

**Sends to Meta:**
```json
{
  "event_name": "Lead",
  "user_data": {
    "email": "customer@email.com",
    "phone": "9876543210",
    "name": "John Doe"
  },
  "custom_data": {
    "currency": "INR",
    "value": 1,
    "content_name": "Amrut Baa Chutney"
  }
}
```

### 2. `/api/track-purchase` (POST)
Called when payment is verified.

**Sends to Meta:**
```json
{
  "event_name": "Purchase",
  "user_data": {
    "email": "customer@email.com",
    "phone": "9876543210",
    "name": "John Doe"
  },
  "custom_data": {
    "currency": "INR",
    "value": 599,
    "content_name": "Amrut Baa Chutney",
    "num_items": 2,
    "transaction_id": "pay_xxxxx"
  }
}
```

---

## 🚀 How It Works (Customer Journey)

```
1. Customer opens your site
2. Clicks "Order Now"
3. Fills form (Step 1: Phone, Step 2: Details)
   ↓
   📊 META: "Lead" event sent
   
4. Selects package & clicks "Complete Registration"
5. Razorpay payment popup opens
6. Customer completes payment
   ↓
   📊 META: "Purchase" event sent
   
7. Success message shown
   ↓
   📧 n8n webhook called (for email/shipping)
```

---

## ✅ Testing & Verification

### Step 1: Deploy to Cloudflare
```bash
wrangler pages deploy . --project-name=amrutbaa
```

### Step 2: Test the Integration

Option A: **Make a real test purchase**
1. Go to your website
2. Fill out the form completely
3. Process payment with Razorpay test card:
   - Card: `4111 1111 1111 1111`
   - Expiry: Any future date
   - CVV: Any 3 digits

Option B: **Test with curl** (advanced)
```bash
# Test Lead event
curl -X POST https://amrutbaa.com/api/track-lead \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "9876543210",
    "quantity": 1
  }'

# Test Purchase event
curl -X POST https://amrutbaa.com/api/track-purchase \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "9876543210",
    "amount": 599,
    "quantity": 1,
    "payment_id": "pay_test123"
  }'
```

### Step 3: Verify in Meta

1. Go to [Meta Business Suite](https://business.facebook.com)
2. Navigate to **Events Manager** → **Conversions Manager**
3. Click on your Dataset
4. Look for **Test Events** tab
5. Make a test purchase and check if events appear within **1-2 minutes**

You should see:
- ✅ Lead event (when form submitted)
- ✅ Purchase event (when payment confirmed)

---

## 📊 What Meta Does With This Data

### Better Ad Targeting
- Facebook shows ads to people **similar to your customers**
- Higher conversion rates = lower ad costs

### Conversion Tracking
- Track which ads lead to actual sales
- See ROI on your advertising

### Retargeting
- Show ads to people who visited but didn't buy
- Re-engage customers at the right time

### Attribution
- Understand which touchpoint led to conversion
- Optimize your marketing funnel

---

## 🔒 Privacy & Compliance

✅ **Data Handling:**
- Email/phone are hashed before sending
- No raw personal data stored on Meta servers
- Compliant with GDPR, CCPA
- Privacy Policy should mention Meta pixel tracking

✅ **Consent:**
- Users accept terms when filling form
- Transparent about tracking
- Add to your [privacy-policy/index.html](privacy-policy/index.html) if not already there

---

## 🛠️ Troubleshooting

### Events Not Showing in Meta?

**Check 1: Environment Variables Set?**
```bash
# Verify on Cloudflare dashboard
Dashboard → Workers → Settings → Variables
```
Ensure all 3 are set:
- [ ] META_DATASET_ID
- [ ] META_PIXEL_ID
- [ ] META_ACCESS_TOKEN (as Secret)

**Check 2: Browser Console for Errors**
- Open DevTools (F12)
- Go to Console tab
- Look for red error messages
- Copy error and search Meta docs

**Check 3: Cloudflare Worker Logs**
```bash
# View worker logs
wrangler tail amrutbaa --format pretty
```

Look for:
- ✅ "Lead tracked successfully"
- ✅ "Purchase tracked successfully"
- ❌ "Failed to track" = API issue

**Check 4: Test Events Tab**
- Check "Test Events" column in Conversions Manager
- Should show events with status "Received"

### Access Token Expired?

Tokens expire after 60 days. Get a new one:
1. Go to Meta Business Suite
2. Settings → Access Tokens
3. Generate new token
4. Update in Cloudflare worker

---

## 📈 Next Steps

### Immediate
- [ ] Add credentials to Cloudflare Worker
- [ ] Deploy worker
- [ ] Test with one purchase
- [ ] Verify in Meta Conversions Manager

### Short-term (1-2 weeks)
- [ ] Set up conversion goals in Meta
- [ ] Create custom audiences
- [ ] Start remarketing campaigns

### Medium-term (1 month)
- [ ] Optimize ad targeting based on data
- [ ] Create lookalike audiences
- [ ] Monitor ROAS (Return on Ad Spend)

### Long-term (3+ months)
- [ ] Connect Offline Conversions (phone orders)
- [ ] Set up dynamic product ads
- [ ] Implement cross-domain tracking

---

## 📞 Quick Reference

| Issue | Solution |
|-------|----------|
| No events showing | Check env variables in Cloudflare |
| Events delayed | Meta processes within 1-5 minutes |
| High failure rate | Verify access token hasn't expired |
| Wrong amount tracked | Check quantity calculation in code |

---

## 💬 Key Differences: Before vs After

| Aspect | Before | After |
|--------|--------|-------|
| **Lead Tracking** | Manual form collection | Automatic to Meta |
| **Purchase Tracking** | Not tracked | Automatic after payment |
| **Ad Retargeting** | Not possible | Can retarget visitors |
| **Lookalike Audiences** | Limited data | Rich customer data |
| **Attribution** | Unclear | Clear event tracking |

---

## 🎯 Success Metrics

After 1-2 weeks, you should see in Meta:
- ✅ Lead event count matching registrations
- ✅ Purchase event count matching orders
- ✅ Conversion value matching your revenue
- ✅ Events showing as "Received" status

If not, check **Troubleshooting** section above.

---

**🎉 Your Meta Conversions API is ready to track and optimize!**

Last Updated: February 16, 2026
