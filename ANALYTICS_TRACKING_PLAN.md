# Complete Analytics & Tracking Plan - Amrut Baa E-commerce Funnel

## 🎯 Tracking Objectives

### Primary Goals:
1. **Full Funnel Visibility**: Track every step from landing to purchase
2. **Attribution**: Understand which channels drive conversions
3. **Optimization**: Identify drop-off points and optimize
4. **ROAS Measurement**: Calculate return on ad spend per channel
5. **Audience Insights**: Understand customer behavior and demographics

## 📊 Analytics Stack

### Core Platforms:
- **Google Tag Manager (GTM)**: Central tag management
- **Google Analytics 4 (GA4)**: Web analytics and behavior tracking
- **Facebook Pixel**: Meta ads conversion tracking
- **Google Ads Conversion Tracking**: Search and display ads
- **Razorpay Analytics**: Payment funnel metrics (built-in)

### Optional Advanced Tools:
- **Hotjar/Microsoft Clarity**: Heatmaps and session recordings
- **Google Optimize/VWO**: A/B testing platform
- **Segment/RudderStack**: Customer data platform (for scale)

## 🛤️ E-commerce Funnel Stages

```
1. AWARENESS (Ad Click)
   ↓
2. LANDING (Page View)
   ↓
3. ENGAGEMENT (Scroll, Story Read)
   ↓
4. INTEREST (CTA Click)
   ↓
5. CONSIDERATION (Modal Open)
   ↓
6. INTENT (Form Start)
   ↓
7. COMMITMENT (Phone Submit)
   ↓
8. CHECKOUT (Address & Package Selection)
   ↓
9. PAYMENT (Razorpay Modal)
   ↓
10. CONVERSION (Payment Success)
```

## 📍 Tracking Events Architecture

### 1. Page Events

#### Landing Page View
```javascript
dataLayer.push({
  'event': 'page_view',
  'page_title': 'Amrut Baa - Kathiyawad Chilly Garlic Chutney',
  'page_location': window.location.href,
  'page_path': window.location.pathname,
  'traffic_source': getURLParam('utm_source'),
  'campaign': getURLParam('utm_campaign'),
  'medium': getURLParam('utm_medium')
});
```

#### Scroll Depth Tracking
```javascript
// At 25%, 50%, 75%, 100% scroll
dataLayer.push({
  'event': 'scroll_depth',
  'scroll_percentage': 50,
  'engagement_time': 30 // seconds
});
```

### 2. Engagement Events

#### CTA Button Clicks
```javascript
dataLayer.push({
  'event': 'cta_click',
  'button_text': 'Reserve Your Spot',
  'button_location': 'hero', // or 'footer', 'floating'
  'countdown_time_remaining': '3d 14h 25m'
});
```

#### Story Section View
```javascript
dataLayer.push({
  'event': 'view_story_section',
  'story_cards_visible': 3,
  'time_on_section': 15 // seconds
});
```

### 3. Form Events (Critical for Conversion Funnel)

#### Modal Open
```javascript
dataLayer.push({
  'event': 'begin_checkout',
  'ecommerce': {
    'currency': 'INR',
    'value': 0, // Unknown at this stage
    'items': [{
      'item_name': 'Amrut Baa Chutney',
      'item_category': 'Condiment',
      'item_brand': 'Amrut Baa'
    }]
  }
});
```

#### Form Step 1 Complete (Phone Number)
```javascript
dataLayer.push({
  'event': 'form_step_1_complete',
  'form_name': 'registration_form',
  'step': 'phone_submit',
  'phone_verified': true
});
```

#### Form Step 2 Start
```javascript
dataLayer.push({
  'event': 'form_step_2_start',
  'form_name': 'registration_form',
  'step': 'details_form'
});
```

#### Package Selection
```javascript
dataLayer.push({
  'event': 'add_to_cart',
  'ecommerce': {
    'currency': 'INR',
    'value': 199, // or 449, 398, 849
    'items': [{
      'item_id': 'trial-pack',
      'item_name': 'Trial Pack (1 bottle)',
      'item_category': 'Condiment',
      'item_brand': 'Amrut Baa',
      'price': 199,
      'quantity': 1
    }]
  }
});
```

#### Shipping Info Complete
```javascript
dataLayer.push({
  'event': 'add_shipping_info',
  'ecommerce': {
    'currency': 'INR',
    'value': 258, // Including shipping
    'shipping_tier': 'Standard',
    'items': [{ /* same as above */ }]
  }
});
```

### 4. Payment Events

#### Payment Method Selected
```javascript
dataLayer.push({
  'event': 'add_payment_info',
  'payment_type': 'razorpay',
  'ecommerce': {
    'currency': 'INR',
    'value': 258,
    'items': [{ /* same as above */ }]
  }
});
```

#### Purchase Complete (CRITICAL)
```javascript
dataLayer.push({
  'event': 'purchase',
  'ecommerce': {
    'transaction_id': 'ORDER_123456',
    'value': 258,
    'tax': 0,
    'shipping': 59,
    'currency': 'INR',
    'coupon': '', // if applicable
    'items': [{
      'item_id': 'trial-pack',
      'item_name': 'Trial Pack (1 bottle)',
      'item_category': 'Condiment',
      'item_brand': 'Amrut Baa',
      'price': 199,
      'quantity': 1
    }]
  },
  'order_id': 'ORDER_123456',
  'payment_id': 'pay_xxxxx',
  'customer_email': 'customer@email.com',
  'customer_phone': '9876543210'
});
```

### 5. Error/Drop-off Events

#### Form Abandonment
```javascript
dataLayer.push({
  'event': 'form_abandonment',
  'form_name': 'registration_form',
  'abandonment_step': 'step_2',
  'fields_completed': 3,
  'total_fields': 7
});
```

#### Payment Failure
```javascript
dataLayer.push({
  'event': 'payment_failed',
  'error_message': 'Card declined',
  'payment_method': 'card',
  'order_value': 258
});
```

#### Payment Cancelled
```javascript
dataLayer.push({
  'event': 'payment_cancelled',
  'cancellation_step': 'payment_gateway',
  'order_value': 258
});
```

## 🏷️ GTM Container Structure

### Tags to Create:

#### 1. **GA4 Configuration Tag**
- Type: Google Analytics: GA4 Configuration
- Measurement ID: G-XXXXXXXXXX
- Trigger: All Pages
- User Properties: user_type, lifecycle_stage
- Custom Parameters: 
  - debug_mode: true (for testing)
  - send_page_view: true

#### 2. **GA4 Event Tags** (Create separate tags for each):
- `page_view`
- `scroll_depth`
- `cta_click`
- `begin_checkout`
- `add_to_cart`
- `add_shipping_info`
- `add_payment_info`
- `purchase`
- `form_step_1_complete`
- `form_step_2_start`

#### 3. **Facebook Pixel Base Code**
- Type: Custom HTML
- Pixel ID: Your FB Pixel ID
- Trigger: All Pages

#### 4. **Facebook Pixel Events**
- `PageView`
- `ViewContent`
- `InitiateCheckout`
- `AddPaymentInfo`
- `Purchase` (with value and currency)

#### 5. **Google Ads Conversion Tracking**
- Type: Google Ads Conversion Tracking
- Conversion ID: AW-XXXXX
- Conversion Label: [Get from Google Ads]
- Trigger: Purchase Complete

### Triggers to Create:

1. **All Pages** - Pageview
2. **Custom Event Triggers** for each dataLayer event:
   - `scroll_depth`
   - `cta_click`
   - `begin_checkout`
   - `add_to_cart`
   - `add_shipping_info`
   - `add_payment_info`
   - `purchase`
   - Form events

### Variables to Create:

#### Data Layer Variables:
- `dlv - event`
- `dlv - page_title`
- `dlv - transaction_id`
- `dlv - value`
- `dlv - currency`
- `dlv - items` (ecommerce items array)
- `dlv - button_text`
- `dlv - scroll_percentage`
- `dlv - payment_id`
- `dlv - order_id`

#### URL Variables:
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`

#### Custom JavaScript Variables:
- `sessionId` - Generate unique session ID
- `userId` - Hash of phone/email (privacy-compliant)
- `timestamp` - Current Unix timestamp

## 📈 Key Metrics to Track

### Acquisition Metrics:
- Traffic by source/medium
- Cost per click (CPC)
- Cost per thousand impressions (CPM)
- Click-through rate (CTR)
- Landing page bounce rate

### Engagement Metrics:
- Average scroll depth
- Time on page
- Story section view rate
- CTA click rate
- Countdown visibility rate

### Conversion Funnel Metrics:
1. **Landing → Modal Open**: Conversion rate
2. **Modal Open → Form Start**: Form engagement rate
3. **Form Start → Step 1 Complete**: Phone submission rate
4. **Step 1 → Step 2 Start**: Step advancement rate
5. **Step 2 → Package Selection**: Selection rate
6. **Package Selection → Payment Initiate**: Payment click rate
7. **Payment Initiate → Purchase**: Payment success rate

### Revenue Metrics:
- Total revenue
- Revenue by package type
- Average order value (AOV)
- Revenue per session
- Customer lifetime value (CLTV - future)

### Drop-off Analysis:
- Form abandonment rate by step
- Payment failure rate
- Cart abandonment rate
- Exit pages

## 🎨 Custom Dimensions & Metrics (GA4)

### User-Scoped Custom Dimensions:
- `first_traffic_source`
- `first_campaign`
- `customer_type` (new/returning)
- `signup_date`

### Event-Scoped Custom Dimensions:
- `package_type` (trial/family/duo/quarterly)
- `shipping_cost`
- `form_step`
- `error_type`
- `countdown_remaining`
- `batch_week`

### Custom Metrics:
- `bottle_quantity`
- `order_value_inr`
- `shipping_cost_inr`
- `time_to_purchase` (seconds from landing to conversion)

## 🔍 Audience Segments to Create

### In GA4:
1. **High-Intent Users**: Opened modal + viewed pricing
2. **Form Starters**: Started form but didn't complete
3. **Payment Abandoners**: Initiated payment but didn't complete
4. **Package Browsers**: Viewed multiple packages
5. **Story Engaged**: Scrolled 75%+ and spent 60+ seconds
6. **Mobile Users**: Device category = mobile
7. **Returning Visitors**: User count > 1
8. **Converters**: Completed purchase

### For Remarketing:
1. **Cart Abandoners** (24-48 hours)
2. **Form Abandoners** (1-7 days)
3. **Past Purchasers** (30+ days) - For repeat purchases
4. **High Engagers** (no purchase) - Premium audience

## 🎯 Conversion Goals Setup

### GA4 Conversions (Mark as Conversions):
- ✅ `purchase` - Primary goal
- ✅ `begin_checkout` - Micro-conversion
- ✅ `add_to_cart` - Micro-conversion
- ✅ `form_step_1_complete` - Micro-conversion

### Facebook Pixel Standard Events:
- `Purchase` (value + currency)
- `InitiateCheckout`
- `AddPaymentInfo`
- `ViewContent`

### Google Ads Conversions:
- **Primary**: Purchase (with value)
- **Secondary**: Begin Checkout (for optimization)

## 📱 Enhanced Measurement (GA4)

Enable these automatic events:
- ✅ Page views
- ✅ Scrolls (90% threshold)
- ✅ Outbound clicks
- ✅ Site search (if added later)
- ✅ Video engagement (if videos added)
- ✅ File downloads (PDF policies)

## 🔐 Privacy & Compliance

### GDPR/Cookie Consent:
- Add cookie consent banner (if targeting EU)
- Only fire marketing tags after consent
- GA4 consent mode implementation

### Data Retention:
- Set to 14 months in GA4
- Enable Google signals (if consent given)

### PII Protection:
- ❌ Never send raw email/phone to GA4
- ✅ Hash user identifiers with SHA-256
- ✅ Redact sensitive data from URLs

## 🧪 Testing Checklist

### GTM Preview Mode:
- [ ] All tags fire correctly
- [ ] Data layer variables populate
- [ ] No JavaScript errors
- [ ] E-commerce data structure correct

### GA4 DebugView:
- [ ] Events appear in real-time
- [ ] Parameters captured correctly
- [ ] User properties set
- [ ] E-commerce events validated

### Facebook Pixel Helper:
- [ ] Pixel loads on all pages
- [ ] Events fire with correct parameters
- [ ] Value and currency captured

### Cross-Device Testing:
- [ ] Desktop Chrome
- [ ] Desktop Safari
- [ ] Mobile iOS Safari
- [ ] Mobile Android Chrome
- [ ] Tablet

## 📊 Dashboard & Reporting

### GA4 Custom Reports:
1. **Acquisition Report**: Traffic sources → conversions
2. **Funnel Report**: Full checkout funnel visualization
3. **Revenue Report**: By package, source, device
4. **Form Analytics**: Step-by-step completion rates

### Data Studio Dashboards:
1. **Executive Dashboard**: Revenue, conversions, ROAS
2. **Marketing Dashboard**: Channel performance, attribution
3. **Product Dashboard**: Package popularity, AOV
4. **UX Dashboard**: Funnel drop-offs, engagement

## 🚀 Advanced Implementation (Phase 2)

### Server-Side Tracking:
- Implement GTM Server-Side container
- Reduce client-side tracking load
- Improve data accuracy (ad blockers)
- Better privacy compliance

### Enhanced Attribution:
- Data-driven attribution model (GA4)
- Multi-touch attribution analysis
- Cross-device tracking
- Offline conversion imports

### Predictive Analytics:
- Purchase probability scoring
- Churn prediction
- Lifetime value prediction
- Audience forecasting

## 📚 Documentation Links

- **GTM Documentation**: https://tagmanager.google.com/
- **GA4 Events Reference**: https://developers.google.com/analytics/devguides/collection/ga4/reference/events
- **Facebook Pixel Guide**: https://developers.facebook.com/docs/meta-pixel
- **E-commerce Tracking**: https://developers.google.com/analytics/devguides/collection/ga4/ecommerce

## 🎯 Success Metrics (90 Days)

### Tracking Implementation:
- [ ] 100% event tracking coverage
- [ ] <5% tracking errors
- [ ] <2% data discrepancies

### Business KPIs:
- [ ] Landing → Purchase: >2% conversion rate
- [ ] Modal Open → Purchase: >15% conversion rate
- [ ] Payment Success Rate: >95%
- [ ] ROAS: >3x across all channels

---

**Version**: 1.0  
**Last Updated**: February 7, 2026  
**Owner**: Analytics Team
