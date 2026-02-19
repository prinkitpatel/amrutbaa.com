# GA4 Funnel Exploration - Amrutbaa.com

## 📊 Customer Journey Overview

Your e-commerce funnel has **5 critical stages** where drop-off analysis is essential:

```
┌─────────────────────────────────────────────────────────────┐
│ AWARENESS → CONSIDERATION → DECISION → PURCHASE → RETENTION │
└─────────────────────────────────────────────────────────────┘
     Page View      Modal Click   Form Fill   Payment     Email
```

---

## 🎯 Current GA4 Events (Already Tracked)

### Funnel Events (In Sequence)
| Step | Event | Location | Purpose |
|------|-------|----------|---------|
| 1 | `view_item` | Page load | Landing on site |
| 2 | `begin_checkout` | Modal opens | CTA clicked |
| 3 | `add_to_cart` | Quantity selected | Product configured |
| 4 | `add_shipping_info` | Address entered | Delivery details |
| 5 | `add_payment_info` | Payment form ready | Ready to pay |
| 6 | `purchase` | Payment successful | Conversion! ✅ |

### Drop-off Events
| Event | Trigger | Use Case |
|-------|---------|----------|
| `checkout_abandoned` | Modal closed | Why did users leave? |
| `payment_failed` | Payment error | Which issues block payment? |
| `payment_cancelled` | User cancels | Razorpay modal closed |
| `form_step_1_complete` | Phone submitted | Phone-only form step |
| `form_step_2_start` | Address form shown | Transition between steps |

---

## 🔧 Setting Up GA4 Funnel Exploration

### Step 1: Go to GA4 Dashboard
```
Google Analytics 4 → Reports → Exploration → Funnel Exploration
```

### Step 2: Create Your Funnel
1. Click **"+ Create New"**
2. Select **"Funnel Exploration"**
3. Give it a name: `"Order Checkout Funnel"`

### Step 3: Add Funnel Steps (In Order)

**Step 1: View Item** (Awareness)
- Event: `view_item`
- Filter: None (everyone who views the page)
- Expected: All sessions

**Step 2: Begin Checkout** (Interest)
- Event: `begin_checkout`
- Filter: None
- Expected: ~15-25% of viewers

**Step 3: Add to Cart** (Consideration)
- Event: `add_to_cart`
- Filter: None
- Expected: ~8-15% of viewers

**Step 4: Add Payment Info** (Decision)
- Event: `add_payment_info`
- Filter: None
- Expected: ~5-10% of viewers

**Step 5: Purchase** (Conversion)
- Event: `purchase`
- Filter: None
- Expected: ~2-5% of viewers

### Step 4: Review Funnel

**Visualization:**
```
All Sessions (100%)
    ↓ 70% drop-off
Begin Checkout (30%)
    ↓ 50% drop-off
Add to Cart (15%)
    ↓ 40% drop-off
Add Payment Info (9%)
    ↓ 80% drop-off
Purchase (1.8%)
```

---

## 📈 Advanced Funnel Analysis

### Alternative Funnel #2: Mobile vs Desktop
```
Dimensions: Device Category
Funnel Steps: Same as above
Purpose: Identify if mobile has higher drop-off
```

### Alternative Funnel #3: Traffic Source Attribution
```
Dimensions: Session Source
Events: Same sequence
Purpose: Which traffic source converts best?
```

### Alternative Funnel #4: Geographic Conversion
```
Dimensions: Country
Funnel Steps: Same
Purpose: Which regions convert highest?
```

---

## 🔍 Key Metrics to Analyze

### Drop-off Analysis

**Question: Why do 50% users drop at "Begin Checkout"?**
- Check `checkout_abandoned` event count
- Compare with `begin_checkout` count
- Difference = users who didn't click through

**Question: Why do 80% drop at "Add Payment Info"?**
- Check `payment_failed` count
- Check `payment_cancelled` count
- These show the reasons for drop-off

### Conversion Rate Metrics

| Metric | Formula | Target |
|--------|---------|--------|
| **CTR (Click-through)** | begin_checkout / view_item | >20% |
| **Add to Cart Rate** | add_to_cart / begin_checkout | >50% |
| **Payment Completion** | purchase / add_payment_info | >10% |
| **Overall CVR** | purchase / view_item | >2% |

---

## 🎯 Custom Events to Add (Recommended)

### Add These Events for Better Insight

**1. Form Step Completion Metrics**
Currently tracking: `form_step_1_complete`, `form_step_2_start`
- ✅ Already implemented

**2. Coupon Applied** (Future)
```javascript
dataLayer.push({
    'event': 'apply_coupon',
    'coupon_code': 'WELCOME10',
    'discount_value': 50
});
```

**3. Payment Method Selected** (Already tracking)
```javascript
// In modal-component.js Payment info
// Already done! ✅
'payment_method': paymentMethod
```

**4. Error Events**
```javascript
dataLayer.push({
    'event': 'payment_error',
    'error_type': 'declined_card',
    'error_code': 'card_declined'
});
```

---

## 📊 Pre-built Funnel Queries

### Funnel 1: Full Purchase Journey
**Name**: "Complete Order Funnel"
```
Step 1: begin_checkout (Entry point)
Step 2: add_to_cart
Step 3: add_shipping_info
Step 4: add_payment_info
Step 5: purchase
```

### Funnel 2: Payment Processing
**Name**: "Payment Conversion"
```
Step 1: add_payment_info (Ready to pay)
Step 2: purchase (Completed)
```
**Use**: Find payment failure rate

### Funnel 3: Abandonment Analysis
**Name**: "Checkout Abandonment"
```
Step 1: begin_checkout
Step 2: checkout_abandoned OR purchase
```
**Use**: Measure abandonment rate

### Funnel 4: Mobile Optimization
**Name**: "Mobile Conversion Funnel"
```
Dimensions: Device Category = mobile
Steps: Same as Funnel 1
```
**Use**: Identify mobile-specific issues

---

## 🔄 Real-time Monitoring

### Daily Check-in (Live Funnel)
1. Go to Reports → Real-time
2. Check active users on the funnel
3. Watch for errors in payment processing

### Weekly Analysis
1. Review funnel drop-off rates
2. Compare with previous week
3. Identify trends or issues

---

## 💡 Optimization Insights

### If `begin_checkout` → `add_to_cart` has high drop-off:
- **Issue**: Users don't want to select quantity
- **Fix**: Add pre-selected quantity or clearer UI
- **Test**: A/B test default quantities

### If `add_payment_info` → `purchase` has high drop-off:
- **Issue**: Payment processing failures
- **Fix**: Check Razorpay logs, add error handling
- **Test**: Monitor payment success rate in Razorpay

### If `add_shipping_info` → `add_payment_info` has high drop-off:
- **Issue**: Address form is too complex
- **Fix**: Simplify form, add auto-fill
- **Test**: Reduce form fields

### If `view_item` → `begin_checkout` has high drop-off:
- **Issue**: CTA isn't compelling
- **Fix**: Improve button copy, placement, design
- **Test**: Change button text, colors

---

## 📲 Segment Analysis

### High-Value Segments (Traffic Sources)
```
Segments to Create:
1. Organic Search Traffic
2. Social Media Traffic
3. Direct Traffic
4. Email Campaign Traffic

Compare conversion rates across segments
```

### Device-Based Segments
```
1. Mobile Visitors
2. Desktop Visitors
3. Tablet Visitors

Find which device converts best
```

---

## 🚨 Common Issues & Fixes

### Issue: No Data in Funnel
- ✅ GTM is installed (you have it)
- ✅ GA4 is connected to GTM
- ⏰ Wait 24-48 hours for data collection

### Issue: Very Low Conversion Rate
- Check if `purchase` event is firing
- Verify event parameters are correct
- Check if transactions are being counted

### Issue: Funnel Shows 100% Drop-off
- Event name typo (check exact event name)
- Events are firing in wrong order
- Events have different session IDs

---

## 🔐 GA4 Event Name Reference

**Standard Events (E-commerce):**
```
view_item              ✅ Page/product view
add_to_cart           ✅ Item added
begin_checkout        ✅ Checkout initiated
add_shipping_info     ✅ Shipping address
add_payment_info      ✅ Payment method
purchase              ✅ Order completed
```

**Custom Events:**
```
checkout_abandoned    ✅ Cart abandoned
payment_failed        ✅ Payment declined
payment_cancelled     ✅ User cancelled
form_step_1_complete  ✅ Step 1 done
form_step_2_start     ✅ Step 2 started
```

---

## 📋 Checklist Before Analysis

- [ ] GA4 property is created
- [ ] GTM container connected to GA4
- [ ] All events are firing (check Real-time)
- [ ] At least 24 hours of data collected
- [ ] Test purchase completed
- [ ] Event parameters are correct
- [ ] UTM parameters captured
- [ ] Conversion goals set

---

## 🎓 Next Steps

### Immediate (This Week)
1. Set up the 5-step funnel
2. Review initial drop-off rates
3. Identify worst-performing step

### Short-term (This Month)
1. Create alternate funnels (mobile, source)
2. Implement custom segments
3. Set up automatic alerts

### Long-term (Ongoing)
1. Monthly funnel analysis
2. A/B test high-drop-off steps
3. Optimize based on insights
4. Track improvement over time

---

## 📞 Troubleshooting

### Events not showing in GA4?
1. Check GTM → Preview mode
2. Verify event names match exactly
3. Allow 24-48 hours for processing
4. Check Real-time report first

### Funnel shows wrong numbers?
1. Verify each step's event name
2. Check if parameters are filtering incorrectly
3. Ensure session IDs are consistent

### Need to modify events?
1. Go to Events → Create Event
2. Add custom event mapping if needed
3. Changes take 24-48 hours to apply

---

**Last Updated**: February 19, 2026
**Status**: Ready for Analysis

