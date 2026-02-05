# 🚀 Shiprocket Integration - Quick Start

## What You Get

✅ **Automatic shipment creation** after successful payment  
✅ **Real-time tracking numbers** shown to customers immediately  
✅ **Beautiful tracking page** for customers to check delivery status  
✅ **Webhook integration** for automatic status updates  
✅ **End-to-end delivery management** without manual work  

## 5-Minute Setup

### Step 1: Get Shiprocket Account
1. Sign up: https://www.shiprocket.in/
2. Complete KYC (business documents)
3. Add pickup location (where you pack orders)
4. Wait for approval (1-2 days)

### Step 2: Get API Credentials
1. Shiprocket Dashboard → Settings → API
2. Note your login email and password
3. Note your pickup location name (usually "Primary")

### Step 3: Set Environment Variables in Cloudflare

```bash
npx wrangler secret put SHIPROCKET_EMAIL
# Enter your Shiprocket email

npx wrangler secret put SHIPROCKET_PASSWORD
# Enter your Shiprocket password

npx wrangler secret put SHIPROCKET_PICKUP_LOCATION
# Enter: Primary (or your pickup location name)
```

### Step 4: Replace Worker File

```bash
# Backup current worker
cp worker.js worker-backup.js

# Use new Shiprocket-enabled worker
cp worker-shiprocket.js worker.js
```

### Step 5: Deploy

```bash
npx wrangler pages deploy . --project-name=amrutbaa-com
```

### Step 6: Test

1. Place a test order with Razorpay test card: `4111 1111 1111 1111`
2. After payment, you should see tracking number in success modal
3. Visit tracking page: `https://your-site.com/tracking.html`
4. Enter AWB code to see tracking details

## What Happens Now

### For Customers:
1. **Complete payment** → Get instant confirmation
2. **See tracking number** → Right in the success popup
3. **Track order** → Click link to tracking page
4. **Real-time updates** → See shipment progress

### For You:
1. **Payment succeeds** → Shipment auto-created in Shiprocket
2. **Courier assigned** → Shiprocket picks best courier
3. **Pickup scheduled** → Courier collects from your location
4. **Status updates** → Webhook sends updates automatically
5. **Customer happy** → No manual work needed!

## Files Modified

- ✅ `worker-shiprocket.js` - New worker with Shiprocket API integration
- ✅ `assets/js/modal-component.js` - Updated to call shipment API
- ✅ `tracking.html` - Beautiful tracking page for customers
- ✅ `SHIPROCKET_INTEGRATION.md` - Complete documentation

## Cost

**Shiprocket Charges** (per shipment):
- Within state: ₹40-50 (for 300g package)
- Metro to Metro: ₹50-60
- Long distance: ₹70-90

**Your Options**:
1. Include in product price
2. Free shipping above ₹399
3. Charge customer (add to total)

## Quick Tips

🔸 **Test thoroughly** with test orders before going live  
🔸 **Monitor Shiprocket dashboard** daily for first week  
🔸 **Set up email notifications** with tracking link  
🔸 **Have backup plan** for manual shipment creation if API fails  
🔸 **Check serviceability** - Not all pincodes are serviceable  

## Troubleshooting

### "Invalid pickup location"
→ Check exact spelling in Shiprocket dashboard, update environment variable

### "Authentication failed"
→ Verify email/password are correct in Cloudflare secrets

### No tracking info after payment
→ Check Cloudflare Worker logs: `npx wrangler tail`

### Shipment not showing in Shiprocket
→ Check API logs, create manually as backup

## Next Steps

1. ✅ Complete setup above
2. 📧 Update email template with tracking link
3. 🔔 Set up Shiprocket webhooks for status updates
4. 📊 Monitor for first 10 orders
5. 🎨 Customize tracking page colors/branding
6. 📱 Add SMS notifications (optional)

## Support

**Detailed Guide**: [SHIPROCKET_INTEGRATION.md](SHIPROCKET_INTEGRATION.md)  
**Shiprocket Support**: care@shiprocket.in | 0124-6366-366  
**API Docs**: https://apidocs.shiprocket.in/

---

**🎉 That's it! Your customers now get automatic tracking after every order!**

