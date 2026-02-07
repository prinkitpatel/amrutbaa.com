# 📊 Analytics Event Flow Diagram

## Complete Customer Journey with Tracking Events

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CUSTOMER LANDS ON SITE                          │
│                                                                           │
│  Event: page_view                                                        │
│  Data: page_title, page_location, utm_source, utm_campaign              │
│  Platform: GA4, Facebook Pixel (PageView)                               │
└───────────────────────────────┬───────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        USER SCROLLS & READS                              │
│                                                                           │
│  Event: scroll_depth (25%, 50%, 75%, 100%)                              │
│  Data: scroll_percentage, engagement_time_seconds                        │
│  Insight: Measures content engagement                                    │
└───────────────────────────────┬───────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   CLICKS "RESERVE YOUR SPOT" CTA                         │
│                                                                           │
│  Event: cta_click                                                        │
│  Data: button_text, button_location (hero/sticky/footer)                │
│  Insight: Which CTA placement converts best                             │
└───────────────────────────────┬───────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         MODAL OPENS (STEP 1)                             │
│                                                                           │
│  Event: begin_checkout ← GA4 E-commerce Standard Event                   │
│  Data: currency (INR), items (chutney details)                          │
│  Platform: GA4, Facebook Pixel (InitiateCheckout)                       │
│  Insight: Start of checkout funnel                                      │
└───────────────────────────────┬───────────────────────────────────────┘
                                │
                 ┌──────────────┴──────────────┐
                 │                             │
                 ▼                             ▼
    ┌─────────────────────┐        ┌─────────────────────┐
    │   USER CLOSES       │        │   USER CONTINUES    │
    │      MODAL          │        │                     │
    │                     │        │  Enters Phone #     │
    │ Event:              │        │                     │
    │ checkout_abandoned  │        └──────────┬──────────┘
    │                     │                   │
    │ Data:               │                   ▼
    │ abandonment_step    │    ┌─────────────────────────────────┐
    │                     │    │   CLICKS "NEXT" (PHONE SUBMIT)  │
    └─────────────────────┘    │                                 │
                               │  Event: form_step_1_complete    │
         ⚠️ LOST SALE          │  Data: phone_verified = true    │
                               │  Insight: Phone collection rate │
                               └──────────────┬──────────────────┘
                                              │
                                              ▼
                               ┌─────────────────────────────────┐
                               │      STEP 2 FORM DISPLAYS       │
                               │                                 │
                               │  Event: form_step_2_start       │
                               │  Data: form_name, step          │
                               │  Insight: Step advancement rate │
                               └──────────────┬──────────────────┘
                                              │
                                              ▼
                               ┌─────────────────────────────────┐
                               │  USER FILLS DETAILS & ADDRESS   │
                               │                                 │
                               │  - Name, Email                  │
                               │  - Address, City, State         │
                               │  - Pincode                      │
                               │  - Quantity Selection           │
                               └──────────────┬──────────────────┘
                                              │
                                              ▼
                               ┌─────────────────────────────────┐
                               │  CLICKS "PROCEED TO PAYMENT"    │
                               │                                 │
                               │  Event 1: add_to_cart           │
                               │  Data: item_id, price,          │
                               │        quantity, value          │
                               │                                 │
                               │  Event 2: add_shipping_info     │
                               │  Data: shipping_city,           │
                               │        shipping_state           │
                               │                                 │
                               │  Insight: Package selection     │
                               └──────────────┬──────────────────┘
                                              │
                                              ▼
                               ┌─────────────────────────────────┐
                               │   RAZORPAY GATEWAY OPENS        │
                               │                                 │
                               │  Event: add_payment_info        │
                               │  Data: payment_type (razorpay)  │
                               │        order value              │
                               │  Insight: Payment initiation    │
                               └──────────────┬──────────────────┘
                                              │
                               ┌──────────────┴──────────────┐
                               │                             │
                               ▼                             ▼
                  ┌──────────────────────┐      ┌──────────────────────┐
                  │  USER CLOSES         │      │  USER COMPLETES      │
                  │  PAYMENT MODAL       │      │  PAYMENT             │
                  │                      │      │                      │
                  │  Event:              │      │  ✅ PAYMENT SUCCESS  │
                  │  payment_cancelled   │      │                      │
                  │                      │      └──────────┬───────────┘
                  │  Data:               │                 │
                  │  cancellation_step,  │                 ▼
                  │  order_value         │      ┌─────────────────────────────┐
                  └──────────────────────┘      │  PAYMENT VERIFIED           │
                                                │                             │
                  ⚠️ LOST SALE                  │  Event: purchase            │
                                                │  💰 REVENUE EVENT           │
                                                │                             │
                                                │  Data:                      │
                                                │  - transaction_id           │
                                                │  - value (₹)                │
                                                │  - currency (INR)           │
                                                │  - order_id                 │
                                                │  - payment_id               │
                                                │  - customer_email           │
                                                │  - customer_phone           │
                                                │  - items array              │
                                                │                             │
                                                │  Platform:                  │
                                                │  ✅ GA4 (purchase)          │
                                                │  ✅ FB Pixel (Purchase)     │
                                                │  ✅ Google Ads (Conversion) │
                                                │                             │
                                                │  💡 Insight: ROAS, AOV      │
                                                └──────────┬──────────────────┘
                                                           │
                                                           ▼
                                                ┌─────────────────────────────┐
                                                │  SUCCESS MESSAGE SHOWN      │
                                                │                             │
                                                │  - Order confirmation       │
                                                │  - Batch timeline           │
                                                │  - Tracking info (if ready) │
                                                │                             │
                                                │  🎉 CONVERSION COMPLETE     │
                                                └─────────────────────────────┘
```

## Error Path: Payment Failure

```
┌─────────────────────────────────────────┐
│    PAYMENT PROCESSING ERROR             │
│                                         │
│  Event: payment_failed                  │
│  Data: error_message, payment_method,   │
│        order_value                      │
│                                         │
│  Triggers: Card declined, timeout,      │
│            gateway error                │
│                                         │
│  ⚠️ Requires follow-up                  │
└─────────────────────────────────────────┘
```

## Attribution Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                      TRAFFIC SOURCE                               │
│                                                                   │
│  Facebook Ad → utm_source=facebook, utm_campaign=launch          │
│  Google Search → utm_source=google, utm_medium=cpc               │
│  Instagram → utm_source=instagram, utm_medium=social             │
│  Email → utm_source=email, utm_campaign=newsletter               │
│  Direct → (direct) / (none)                                      │
└───────────────────────────────┬──────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  UTM Parameters       │
                    │  Stored in Session    │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  Sent with Every      │
                    │  Event to GA4         │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────────────────┐
                    │  Attribution in GA4:              │
                    │                                   │
                    │  Facebook → 5 purchases → ₹1,745 │
                    │  Google → 12 purchases → ₹4,188   │
                    │  Instagram → 2 purchases → ₹698   │
                    │                                   │
                    │  Calculate ROAS per channel       │
                    └───────────────────────────────────┘
```

## Data Layer Structure Examples

### Page View
```javascript
dataLayer.push({
  'event': 'page_view',
  'page_title': 'Amrutbaa Ni Cutney',
  'page_location': 'https://amrutbaa.com/',
  'page_path': '/',
  'traffic_source': 'facebook',
  'campaign': 'launch',
  'medium': 'cpc'
});
```

### Purchase (Most Important)
```javascript
dataLayer.push({
  'event': 'purchase',
  'ecommerce': {
    'transaction_id': 'order_abc123',
    'value': 698,              // Total in rupees
    'tax': 0,
    'shipping': 0,
    'currency': 'INR',
    'coupon': '',
    'items': [{
      'item_id': 'amrutbaa-chutney',
      'item_name': 'Amrutbaa Chilly Garlic Chutney',
      'item_category': 'Condiment',
      'item_brand': 'Amrut Baa',
      'price': 349,
      'quantity': 2
    }]
  },
  'order_id': 'order_abc123',
  'payment_id': 'pay_xyz789',
  'customer_email': 'customer@example.com',
  'customer_phone': '9876543210'
});
```

## Conversion Funnel Visualization

```
Landing Page View          10,000 users   (100%)   ─────┐
         │                                               │
         │ (25% click CTA)                               │
         ▼                                               │
CTA Click                   2,500 users   (25%)    ─────┤
         │                                               │
         │ (80% open modal)                              │
         ▼                                               │
Modal Open                  2,000 users   (20%)    ─────┤ 
         │                                               │
         │ (65% submit phone)                            │ Drop-off
         ▼                                               │ Analysis
Phone Submit                1,300 users   (13%)    ─────┤
         │                                               │
         │ (75% complete form)                           │
         ▼                                               │
Payment Start                 975 users   (9.75%)  ─────┤
         │                                               │
         │ (85% complete payment)                        │
         ▼                                               │
Purchase Complete             829 users   (8.29%)  ─────┘
                              ₹289,121 revenue
                              ₹348.65 avg order value
```

**Overall Conversion Rate: 8.29%** (excellent for e-commerce)

## Remarketing Audiences

```
┌───────────────────────────────────────────────────────────────┐
│                    AUDIENCE BUILDER                            │
└───────────────────────────────────────────────────────────────┘

Cart Abandoners (High Priority)
├── begin_checkout = YES
├── purchase = NO
├── Days since: 1-3
└── Est. Recovery: 20-30%

Payment Abandoners (Highest Priority)  
├── add_payment_info = YES
├── purchase = NO
├── Days since: 1-2
└── Est. Recovery: 30-40%

Form Starters (Medium Priority)
├── form_step_1_complete = YES
├── purchase = NO
├── Days since: 1-7
└── Est. Recovery: 10-15%

Story Engaged (Warm Audience)
├── scroll_depth >= 75%
├── time_on_page >= 60 seconds
├── cta_click = NO
└── Use for: Lookalike audiences

Past Purchasers (Repeat Campaign)
├── purchase = YES
├── Days since: 30+
└── Use for: New product launches
```

## Platform Coverage

```
Event                    | GA4 | FB Pixel | Google Ads
─────────────────────────┼─────┼──────────┼───────────
page_view                │  ✅  │    ✅    │     -
scroll_depth             │  ✅  │    -     │     -
cta_click                │  ✅  │    -     │     -
begin_checkout           │  ✅  │    ✅    │    ✅
add_to_cart              │  ✅  │    -     │     -
add_shipping_info        │  ✅  │    -     │     -
add_payment_info         │  ✅  │    ✅    │     -
purchase                 │  ✅  │    ✅    │    ✅
payment_cancelled        │  ✅  │    -     │     -
payment_failed           │  ✅  │    -     │     -
checkout_abandoned       │  ✅  │    -     │     -
```

## Key Performance Indicators (KPIs)

```
┌─────────────────────────────────────────────────────────────┐
│                      DASHBOARD METRICS                       │
└─────────────────────────────────────────────────────────────┘

Acquisition
├── Traffic by Source/Medium
├── Cost per Click (CPC)
├── Click-through Rate (CTR)
└── Cost per Acquisition (CPA)

Engagement
├── Avg. Scroll Depth
├── Time on Page
├── CTA Click Rate (target: 25%)
└── Story View Rate

Conversion
├── Landing → Purchase (target: 2-5%)
├── Modal → Purchase (target: 40-50%)
├── Payment → Purchase (target: 85%+)
└── Form Completion Rate

Revenue
├── Total Revenue
├── Average Order Value (AOV)
├── Revenue per Session
└── Return on Ad Spend (ROAS) (target: 3x+)
```

---

## Implementation Checklist

- [x] Add GTM container to HTML
- [x] Initialize data layer
- [x] Implement page view tracking
- [x] Add scroll depth tracking
- [x] Track CTA button clicks
- [x] Track modal open (begin_checkout)
- [x] Track form step completions
- [x] Track add to cart
- [x] Track shipping info
- [x] Track payment initiation
- [x] **Track purchase (REVENUE)**
- [x] Track error events
- [x] Add Facebook Pixel support
- [ ] Set up GTM container (YOUR TURN)
- [ ] Configure GA4 tags
- [ ] Test all events
- [ ] Publish and verify

**Status**: Code complete ✅ | GTM setup pending ⏳

---

**This diagram shows the complete customer journey with every tracking touchpoint.**  
**Use this as a reference when setting up GTM tags and triggers.**
