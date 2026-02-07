d# Google Tag Manager Setup Guide - Amrut Baa

## 📋 Prerequisites
- Google Account
- Google Analytics 4 property created
- Google Ads account (optional)
- Facebook Business Manager account (optional)

## 🚀 Step 1: Create GTM Container

### 1.1 Create Account
1. Go to https://tagmanager.google.com
2. Click **Create Account**
3. Account Name: `Amrut Baa`
4. Container Name: `Amrutbaa.com`
5. Target Platform: **Web**
6. Click **Create**

### 1.2 Get Container ID
- You'll receive a Container ID like `GTM-XXXXXXX`
- **IMPORTANT**: Replace `GTM-XXXXXXX` in index.html with your actual ID (2 places)

## 🏷️ Step 2: Create Variables

### 2.1 Data Layer Variables

Go to **Variables** → **New** and create these Data Layer Variables:

| Variable Name | Type | Data Layer Variable Name |
|--------------|------|-------------------------|
| `DLV - Event` | Data Layer Variable | `event` |
| `DLV - Page Title` | Data Layer Variable | `page_title` |
| `DLV - Page Path` | Data Layer Variable | `page_path` |
| `DLV - Traffic Source` | Data Layer Variable | `traffic_source` |
| `DLV - Campaign` | Data Layer Variable | `campaign` |
| `DLV - Medium` | Data Layer Variable | `medium` |
| `DLV - Transaction ID` | Data Layer Variable | `ecommerce.transaction_id` |
| `DLV - Value` | Data Layer Variable | `ecommerce.value` |
| `DLV - Currency` | Data Layer Variable | `ecommerce.currency` |
| `DLV - Items` | Data Layer Variable | `ecommerce.items` |
| `DLV - Order ID` | Data Layer Variable | `order_id` |
| `DLV - Payment ID` | Data Layer Variable | `payment_id` |
| `DLV - Button Text` | Data Layer Variable | `button_text` |
| `DLV - Button Location` | Data Layer Variable | `button_location` |
| `DLV - Scroll Percentage` | Data Layer Variable | `scroll_percentage` |
| `DLV - Engagement Time` | Data Layer Variable | `engagement_time_seconds` |
| `DLV - Form Name` | Data Layer Variable | `form_name` |
| `DLV - Form Step` | Data Layer Variable | `step` |
| `DLV - Customer Email` | Data Layer Variable | `customer_email` |
| `DLV - Customer Phone` | Data Layer Variable | `customer_phone` |
| `DLV - Error Message` | Data Layer Variable | `error_message` |
| `DLV - Payment Method` | Data Layer Variable | `payment_method` |

### 2.2 Built-in Variables

Enable these built-in variables (click **Configure**):
- ✅ Page URL
- ✅ Page Hostname
- ✅ Page Path
- ✅ Referrer
- ✅ Click Element
- ✅ Click Text
- ✅ Click URL

### 2.3 Custom JavaScript Variables

**Variable Name**: `GA4 Measurement ID`
- Type: Constant
- Value: `G-XXXXXXXXXX` (Your GA4 Measurement ID)

**Variable Name**: `Session ID`
```javascript
function() {
  var sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
}
```

**Variable Name**: `User ID Hash` (Privacy-compliant)
```javascript
function() {
  // Simple hash function for user identification
  var phone = {{DLV - Customer Phone}};
  if (!phone) return null;
  
  var hash = 0;
  for (var i = 0; i < phone.length; i++) {
    hash = ((hash << 5) - hash) + phone.charCodeAt(i);
    hash = hash & hash;
  }
  return 'user_' + Math.abs(hash);
}
```

## 🎯 Step 3: Create Triggers

### 3.1 Page View Trigger
- **Name**: `Page View - All Pages`
- **Type**: Page View
- **Fires on**: All Pages

### 3.2 Custom Event Triggers

Create these Custom Event triggers (Type: **Custom Event**):

| Trigger Name | Event Name | Description |
|-------------|-----------|-------------|
| `CE - Page View` | `page_view` | Initial page load |
| `CE - Scroll Depth` | `scroll_depth` | User scrolls 25/50/75/100% |
| `CE - CTA Click` | `cta_click` | Register button clicks |
| `CE - Begin Checkout` | `begin_checkout` | Modal opens |
| `CE - Form Step 1 Complete` | `form_step_1_complete` | Phone submitted |
| `CE - Form Step 2 Start` | `form_step_2_start` | Details form shown |
| `CE - Add to Cart` | `add_to_cart` | Package selected |
| `CE - Add Shipping Info` | `add_shipping_info` | Address entered |
| `CE - Add Payment Info` | `add_payment_info` | Payment gateway opens |
| `CE - Purchase` | `purchase` | Payment successful |
| `CE - Payment Failed` | `payment_failed` | Payment error |
| `CE - Payment Cancelled` | `payment_cancelled` | User closes payment |
| `CE - Checkout Abandoned` | `checkout_abandoned` | User closes modal |

### 3.3 Timer Trigger (Optional)
- **Name**: `Timer - 30 Seconds`
- **Type**: Timer
- **Interval**: 30000 milliseconds
- **Limit**: No limit
- **Fires on**: All Pages

## 📊 Step 4: Create Tags

### 4.1 Google Analytics 4 Configuration Tag

**Tag Name**: `GA4 - Config`
- **Type**: Google Analytics: GA4 Configuration
- **Measurement ID**: `{{GA4 Measurement ID}}`
- **Configuration Parameters**:
  - `send_page_view`: `false` (we'll send manually)
  - `session_id`: `{{Session ID}}`
  - `user_id`: `{{User ID Hash}}`
- **Triggering**: `Page View - All Pages`

### 4.2 GA4 Event Tags

Create these GA4 Event tags (Type: **Google Analytics: GA4 Event**):

#### Tag: `GA4 - Event - Page View`
- **Event Name**: `page_view`
- **Event Parameters**:
  - `page_title`: `{{DLV - Page Title}}`
  - `page_location`: `{{Page URL}}`
  - `traffic_source`: `{{DLV - Traffic Source}}`
  - `campaign`: `{{DLV - Campaign}}`
  - `medium`: `{{DLV - Medium}}`
- **Triggering**: `CE - Page View`

#### Tag: `GA4 - Event - Scroll Depth`
- **Event Name**: `scroll`
- **Event Parameters**:
  - `percent_scrolled`: `{{DLV - Scroll Percentage}}`
  - `engagement_time_msec`: `{{DLV - Engagement Time}}`
- **Triggering**: `CE - Scroll Depth`

#### Tag: `GA4 - Event - CTA Click`
- **Event Name**: `cta_click`
- **Event Parameters**:
  - `button_text`: `{{DLV - Button Text}}`
  - `button_location`: `{{DLV - Button Location}}`
- **Triggering**: `CE - CTA Click`

#### Tag: `GA4 - Event - Begin Checkout`
- **Event Name**: `begin_checkout`
- **E-commerce Data**: ✅ Enable
- **Event Parameters**: Use Data Layer (automatic)
- **Triggering**: `CE - Begin Checkout`

#### Tag: `GA4 - Event - Add to Cart`
- **Event Name**: `add_to_cart`
- **E-commerce Data**: ✅ Enable
- **Triggering**: `CE - Add to Cart`

#### Tag: `GA4 - Event - Add Shipping Info`
- **Event Name**: `add_shipping_info`
- **E-commerce Data**: ✅ Enable
- **Triggering**: `CE - Add Shipping Info`

#### Tag: `GA4 - Event - Add Payment Info`
- **Event Name**: `add_payment_info`
- **E-commerce Data**: ✅ Enable
- **Triggering**: `CE - Add Payment Info`

#### Tag: `GA4 - Event - Purchase` (MOST IMPORTANT)
- **Event Name**: `purchase`
- **E-commerce Data**: ✅ Enable
- **Event Parameters**:
  - `transaction_id`: `{{DLV - Transaction ID}}`
  - `value`: `{{DLV - Value}}`
  - `currency`: `{{DLV - Currency}}`
  - `payment_type`: `{{DLV - Payment Method}}`
- **Triggering**: `CE - Purchase`

#### Tag: `GA4 - Event - Form Step Complete`
- **Event Name**: `form_step_complete`
- **Event Parameters**:
  - `form_name`: `{{DLV - Form Name}}`
  - `step`: `{{DLV - Form Step}}`
- **Triggering**: `CE - Form Step 1 Complete`, `CE - Form Step 2 Start`

### 4.3 Facebook Pixel Tags (Optional)

#### Tag: `FB Pixel - Base Code`
**Type**: Custom HTML
```html
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', 'YOUR_PIXEL_ID');
fbq('track', 'PageView');
</script>
```
- **Triggering**: `Page View - All Pages`

#### Tag: `FB Pixel - InitiateCheckout`
**Type**: Custom HTML
```html
<script>
  fbq('track', 'InitiateCheckout', {
    content_ids: ['amrutbaa-chutney'],
    content_type: 'product',
    currency: 'INR'
  });
</script>
```
- **Triggering**: `CE - Begin Checkout`

#### Tag: `FB Pixel - Purchase`
**Type**: Custom HTML
```html
<script>
  fbq('track', 'Purchase', {
    value: {{DLV - Value}},
    currency: 'INR',
    content_ids: ['amrutbaa-chutney'],
    content_type: 'product'
  });
</script>
```
- **Triggering**: `CE - Purchase`

### 4.4 Google Ads Conversion Tracking (Optional)

#### Tag: `Google Ads - Purchase Conversion`
- **Type**: Google Ads Conversion Tracking
- **Conversion ID**: `AW-XXXXXXXXX` (from Google Ads)
- **Conversion Label**: `XXXXX` (from Google Ads)
- **Conversion Value**: `{{DLV - Value}}`
- **Transaction ID**: `{{DLV - Transaction ID}}`
- **Currency Code**: `INR`
- **Triggering**: `CE - Purchase`

## 🧪 Step 5: Testing

### 5.1 Preview Mode
1. Click **Preview** button in GTM
2. Enter your website URL: `https://amrutbaa.com`
3. Click **Connect**

### 5.2 Test All Events
Go through the complete funnel:
1. ✅ Land on homepage → Check `page_view` fires
2. ✅ Scroll down → Check `scroll_depth` fires at 25%, 50%, 75%, 100%
3. ✅ Click "Reserve Your Spot" → Check `cta_click` fires
4. ✅ Modal opens → Check `begin_checkout` fires
5. ✅ Enter phone, click Next → Check `form_step_1_complete` fires
6. ✅ Fill details → Check `add_to_cart`, `add_shipping_info` fire
7. ✅ Click Pay → Check `add_payment_info` fires
8. ✅ Complete payment → Check `purchase` fires with all data
9. ✅ Close modal → Check `checkout_abandoned` fires

### 5.3 Check GA4 DebugView
1. Go to GA4 → **Configure** → **DebugView**
2. Perform actions on site
3. Verify events appear in real-time
4. Check parameters are correct

### 5.4 Facebook Pixel Helper
1. Install Chrome extension: **Meta Pixel Helper**
2. Visit your site
3. Click extension icon
4. Verify pixel fires correctly

## 📦 Step 6: Publish Container

### 6.1 Submit Changes
1. Click **Submit** in GTM
2. **Version Name**: `Initial Analytics Setup`
3. **Version Description**: 
   ```
   - Added GA4 configuration and all e-commerce events
   - Implemented full funnel tracking
   - Added Facebook Pixel (optional)
   - Added Google Ads conversion tracking (optional)
   ```
4. Click **Publish**

### 6.2 Verify Live Site
1. Wait 5 minutes for changes to propagate
2. Visit your live site
3. Open browser console
4. Check for GTM container: `google_tag_manager[GTM-XXXXXXX]`
5. Perform a test purchase (use test payment if available)

## 🔍 Step 7: Verify Data Flow

### 7.1 Google Analytics 4
- Go to **Reports** → **Realtime**
- Perform actions on site
- See events appear within 30 seconds
- Check **Monetization** → **E-commerce purchases** (after first purchase)

### 7.2 Create Custom Exploration
1. Go to **Explore** → **Blank**
2. Create funnel:
   - Step 1: `page_view`
   - Step 2: `cta_click`
   - Step 3: `begin_checkout`
   - Step 4: `add_to_cart`
   - Step 5: `add_payment_info`
   - Step 6: `purchase`
3. Save as "Checkout Funnel"

### 7.3 Set Conversions
1. Go to **Configure** → **Events**
2. Mark as conversions:
   - ✅ `purchase` (Primary)
   - ✅ `begin_checkout` (Secondary)
3. These will appear in Google Ads for optimization

## 📊 Step 8: Advanced Configuration (Optional)

### 8.1 Enhanced Conversions (Google Ads)
Enable to improve attribution accuracy by sending hashed customer data.

### 8.2 Google Optimize Integration
For A/B testing landing page variations.

### 8.3 Server-Side GTM
For advanced tracking bypassing ad blockers:
1. Set up Google Cloud Run container
2. Configure server-side GTM
3. Route events through your domain

### 8.4 Custom Dimensions in GA4
1. Go to **Configure** → **Custom definitions**
2. Create custom dimensions:
   - `package_type`
   - `customer_city`
   - `customer_state`
   - `payment_method`

## 🚨 Troubleshooting

### Events Not Firing
- Check browser console for errors
- Verify GTM container ID is correct
- Use GTM Preview mode
- Check `dataLayer` in console: `console.log(dataLayer)`

### E-commerce Data Missing
- Verify `ecommerce` object structure in dataLayer
- Check GA4 tag has "Enable E-commerce" checked
- Look for JavaScript errors in console

### Facebook Pixel Not Loading
- Check Pixel ID is correct
- Verify no ad blockers enabled
- Use Facebook Pixel Helper extension

### Purchase Event Not Tracked
- Verify payment success triggers the event
- Check `transaction_id` is unique
- Look in GA4 DebugView immediately after purchase
- Check network tab for `/collect` requests to GA4

## 📈 Success Metrics

After setup, you should see:
- ✅ 100% of page views tracked
- ✅ Scroll depth events at 25%, 50%, 75%, 100%
- ✅ Complete funnel visibility in GA4
- ✅ Purchase events with revenue data
- ✅ Conversion rate calculation possible
- ✅ Attribution data for all traffic sources

## 📚 Resources

- **GTM Documentation**: https://support.google.com/tagmanager
- **GA4 Events Reference**: https://developers.google.com/analytics/devguides/collection/ga4/reference/events
- **E-commerce Implementation**: https://developers.google.com/analytics/devguides/collection/ga4/ecommerce
- **Facebook Pixel Events**: https://developers.facebook.com/docs/meta-pixel/reference
- **Google Ads Conversion Tracking**: https://support.google.com/google-ads/answer/6331304

## 🎯 Next Steps

1. **Week 1**: Monitor data collection, fix any issues
2. **Week 2**: Set up custom reports and dashboards
3. **Week 3**: Create remarketing audiences
4. **Week 4**: Launch first performance marketing campaigns
5. **Month 2**: Analyze funnel drop-offs and optimize

---

**Setup Time**: 2-3 hours  
**Difficulty**: Intermediate  
**Maintenance**: Review monthly

Good luck with your analytics setup! 🚀
