# Analytics Tracking Verification Checklist

## 🎯 Pre-Launch Checklist

### Google Tag Manager Setup
- [ ] GTM container created
- [ ] Container ID replaced in index.html (2 locations)
- [ ] All 22 Data Layer Variables created
- [ ] All 13 Custom Event triggers created
- [ ] GA4 Configuration tag created with Measurement ID
- [ ] All 8+ GA4 Event tags created
- [ ] E-commerce tracking enabled on relevant tags
- [ ] Container published to live

### Google Analytics 4 Setup
- [ ] GA4 property created
- [ ] Data stream configured for website
- [ ] Measurement ID added to GTM
- [ ] Enhanced measurement enabled
- [ ] `purchase` marked as conversion event
- [ ] `begin_checkout` marked as conversion event
- [ ] Custom dimensions created (optional)

### Facebook Pixel Setup (Optional)
- [ ] Facebook Business Manager account created
- [ ] Pixel created and ID obtained
- [ ] Pixel base code tag created in GTM
- [ ] Standard events configured (PageView, InitiateCheckout, Purchase)
- [ ] Test events verified in Events Manager

### Google Ads Setup (Optional)
- [ ] Google Ads account linked to GA4
- [ ] Conversion action created
- [ ] Conversion tracking tag added to GTM
- [ ] Enhanced conversions enabled (optional)

## 🧪 Testing Checklist (GTM Preview Mode)

### Page Load Events
- [ ] `page_view` fires on landing
- [ ] UTM parameters captured (test with `?utm_source=test`)
- [ ] Session ID generated and persists
- [ ] No JavaScript errors in console

### Engagement Tracking
- [ ] `scroll_depth` fires at 25% scroll
- [ ] `scroll_depth` fires at 50% scroll
- [ ] `scroll_depth` fires at 75% scroll
- [ ] `scroll_depth` fires at 100% scroll
- [ ] Engagement time calculated correctly
- [ ] `cta_click` fires on button clicks
- [ ] Button text and location captured

### Form Funnel (Critical Path)

#### Step 1: Modal Open
- [ ] Click "Reserve Your Spot" button
- [ ] `begin_checkout` event fires
- [ ] E-commerce items array populated
- [ ] Currency set to INR
- [ ] Modal displays correctly

#### Step 2: Phone Submission
- [ ] Enter phone number (10 digits)
- [ ] Click "Next" button
- [ ] `form_step_1_complete` fires
- [ ] Phone verification status tracked
- [ ] Step 2 form displays

#### Step 3: Details Form
- [ ] `form_step_2_start` fires automatically
- [ ] Form name captured correctly

#### Step 4: Address & Package Selection
- [ ] Fill all required fields (name, email, address, city, state, pincode)
- [ ] Select quantity
- [ ] Click "Proceed to Payment"
- [ ] `add_to_cart` fires with correct:
  - [ ] Item details
  - [ ] Price per unit
  - [ ] Quantity
  - [ ] Total value
- [ ] `add_shipping_info` fires with:
  - [ ] Shipping address details
  - [ ] City, state, pincode

#### Step 5: Payment Gateway
- [ ] Razorpay modal opens
- [ ] `add_payment_info` fires
- [ ] Payment method = "razorpay"
- [ ] Order value correct

#### Step 6: Payment Completion
##### Test Successful Payment:
- [ ] Use test card: 4111 1111 1111 1111
- [ ] Complete payment
- [ ] `purchase` event fires with:
  - [ ] Unique `transaction_id`
  - [ ] Correct `value` (total amount)
  - [ ] Currency = "INR"
  - [ ] `order_id` and `payment_id` captured
  - [ ] Customer email and phone captured
  - [ ] Items array with correct details
- [ ] Facebook Pixel Purchase fires (if configured)
- [ ] Google Ads conversion fires (if configured)
- [ ] Success message displays

##### Test Payment Cancellation:
- [ ] Open payment gateway
- [ ] Close Razorpay modal without paying
- [ ] `payment_cancelled` event fires
- [ ] Order value captured
- [ ] Cancellation step = "payment_gateway"

##### Test Payment Failure (if test mode):
- [ ] Use test fail card if available
- [ ] `payment_failed` event fires
- [ ] Error message captured

#### Step 7: Abandonment Tracking
- [ ] Open modal → Close immediately
- [ ] `checkout_abandoned` fires
- [ ] Abandonment step = "step_1"
- [ ] Open modal → Complete step 1 → Close
- [ ] `checkout_abandoned` fires with step = "step_2"

## 🔍 GA4 Verification (Real-Time & DebugView)

### Real-Time Report
- [ ] Navigate to GA4 → Reports → Realtime
- [ ] Perform actions on site
- [ ] See events appear within 30 seconds
- [ ] Event count increases correctly

### DebugView
- [ ] Navigate to GA4 → Configure → DebugView
- [ ] Events appear with correct names
- [ ] All parameters visible for each event
- [ ] E-commerce data properly structured
- [ ] No errors or warnings

### Event Parameters Check
For each event, verify parameters:

**page_view**
- [ ] page_title
- [ ] page_location
- [ ] traffic_source
- [ ] campaign
- [ ] medium

**begin_checkout**
- [ ] currency = "INR"
- [ ] items array populated
- [ ] item_name, item_id, price present

**add_to_cart**
- [ ] value = total amount
- [ ] quantity correct
- [ ] price per item correct

**purchase** (CRITICAL)
- [ ] transaction_id (unique)
- [ ] value (total revenue)
- [ ] currency = "INR"
- [ ] items array complete
- [ ] order_id
- [ ] payment_id
- [ ] customer_email
- [ ] customer_phone

## 📱 Cross-Device Testing

### Desktop Chrome
- [ ] All events fire correctly
- [ ] No console errors
- [ ] Payment flow works

### Desktop Safari
- [ ] All events fire correctly
- [ ] ITP doesn't block tracking
- [ ] Payment flow works

### Desktop Firefox
- [ ] All events fire correctly
- [ ] No tracking prevention issues
- [ ] Payment flow works

### Mobile Safari (iOS)
- [ ] All events fire correctly
- [ ] Touch interactions tracked
- [ ] Payment flow works
- [ ] Modal responsive

### Mobile Chrome (Android)
- [ ] All events fire correctly
- [ ] Touch interactions tracked
- [ ] Payment flow works
- [ ] Modal responsive

## 🔗 Attribution Testing

### UTM Parameter Tracking
Test these URLs and verify parameters captured:

- [ ] `?utm_source=facebook&utm_medium=cpc&utm_campaign=launch`
- [ ] `?utm_source=google&utm_medium=cpc&utm_campaign=brand`
- [ ] `?utm_source=instagram&utm_medium=social&utm_campaign=story`
- [ ] `?utm_source=email&utm_medium=email&utm_campaign=newsletter`

For each:
- [ ] Parameters stored in sessionStorage
- [ ] Parameters sent with all events
- [ ] Attribution visible in GA4

### Referrer Tracking
- [ ] Test link from external site
- [ ] Referrer captured correctly
- [ ] Direct traffic shows as "(direct)"

## 🚨 Error Scenarios

### Network Failures
- [ ] Simulate offline → Come back online
- [ ] Events queue and send when reconnected (GA4 feature)

### Ad Blocker Testing
- [ ] Enable ad blocker (uBlock Origin)
- [ ] Check what gets blocked
- [ ] Consider server-side GTM if high block rate

### Missing Data Scenarios
- [ ] User closes browser before event sent
- [ ] User navigates away quickly
- [ ] Verify critical events (purchase) use beacon API

## 📊 Data Quality Checks (24 Hours After Launch)

### GA4 Reports
- [ ] Check **Reports** → **Engagement** → **Events**
- [ ] All custom events appearing
- [ ] Event counts reasonable
- [ ] No spam/bot traffic patterns

### E-commerce Report
- [ ] Navigate to **Monetization** → **E-commerce purchases**
- [ ] Purchase events visible
- [ ] Revenue amounts correct
- [ ] Average order value calculated
- [ ] Items per purchase tracked

### Funnel Analysis
- [ ] Create funnel exploration:
  - Step 1: page_view
  - Step 2: cta_click
  - Step 3: begin_checkout
  - Step 4: add_to_cart
  - Step 5: add_payment_info
  - Step 6: purchase
- [ ] Conversion rates visible
- [ ] Drop-off points identified

### User Acquisition
- [ ] Check **Reports** → **Acquisition** → **Traffic acquisition**
- [ ] UTM parameters working
- [ ] Source/medium attribution visible
- [ ] Campaign data captured

## 🎯 Performance Marketing Readiness

### Facebook Ads
- [ ] Pixel verified in Events Manager
- [ ] Purchase event shows value
- [ ] Create Custom Conversion for "Checkout Started"
- [ ] Create Lookalike Audience from purchasers (after 100+ conversions)

### Google Ads
- [ ] Conversion import from GA4 verified
- [ ] Purchase conversion shows in Conversions column
- [ ] Enhanced conversions enabled (optional)
- [ ] Conversion value tracked

### Remarketing Audiences
In GA4, create these audiences:
- [ ] **Cart Abandoners**: begin_checkout but no purchase (24-48h)
- [ ] **Form Abandoners**: cta_click but no begin_checkout (1-7 days)
- [ ] **High Intent**: add_to_cart but no purchase (1-3 days)
- [ ] **Past Purchasers**: purchase event (30+ days ago)
- [ ] **High Engagers**: scroll_depth 75%+ and time_on_page 60s+

### Attribution Settings
- [ ] Set attribution model (GA4 default: data-driven)
- [ ] Lookback window configured (default: 30 days click, 1 day view)
- [ ] Cross-domain tracking configured (if needed)

## 📝 Documentation

- [ ] Document GTM container ID for team
- [ ] Document GA4 Measurement ID for team
- [ ] Save GTM container export (backup)
- [ ] Create GA4 custom reports guide
- [ ] Train team on GA4 interface
- [ ] Set up weekly/monthly reporting schedule

## 🔐 Privacy & Compliance

- [ ] Cookie consent implemented (if targeting EU)
- [ ] Privacy policy updated with tracking disclosure
- [ ] Data retention set in GA4 (14 months recommended)
- [ ] IP anonymization considered (GA4 does this by default)
- [ ] User data deletion process documented

## 🎉 Launch Approval

### Final Sign-Off
- [ ] All critical events tested and verified
- [ ] Purchase tracking confirmed working
- [ ] No console errors or warnings
- [ ] Cross-device testing complete
- [ ] GA4 receiving data correctly
- [ ] Facebook Pixel verified (if applicable)
- [ ] Google Ads conversion tracking verified (if applicable)
- [ ] Attribution working correctly
- [ ] Team trained on reporting
- [ ] Documentation complete

### Post-Launch Monitoring (Week 1)
- [ ] Day 1: Check all events firing
- [ ] Day 2: Verify purchase events accurate
- [ ] Day 3: Review funnel conversion rates
- [ ] Day 7: Analyze first week's data
- [ ] Day 7: Fix any issues found
- [ ] Day 7: Optimize based on insights

---

## 🚀 Launch!

Once all items checked, you're ready to:
1. ✅ Launch performance marketing campaigns
2. ✅ Track full funnel metrics
3. ✅ Optimize based on data
4. ✅ Calculate true ROAS
5. ✅ Scale profitable channels

**Estimated Verification Time**: 3-4 hours  
**Recommended**: Do full verification before spending ad budget

---

**Last Updated**: February 7, 2026  
**Version**: 1.0
