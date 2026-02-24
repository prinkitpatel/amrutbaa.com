# Analytics Quick Reference - Amrut Baa

## 🎯 What Was Implemented

### Infrastructure Added:
1. **Google Tag Manager** container in index.html
2. **Data Layer** initialization and UTM tracking
3. **Complete funnel tracking** in modal-component.js
4. **Page engagement tracking** (scroll depth, CTA clicks, time on page)
5. **E-commerce tracking** (GA4 standard)

### Files Modified:
- ✅ `/index.html` - GTM scripts, data layer, page tracking
- ✅ `/assets/js/modal-component.js` - Conversion funnel events
- ✅ `/scripts/main.js` - No changes needed (tracking in index.html covers it)

## 📋 Quick Setup Steps

### 1. Get Your IDs (5 min)
```
GA4 Measurement ID: G-XXXXXXXXXX
GTM Container ID: GTM-XXXXXXX
Facebook Pixel ID: XXXXXXXXXXXXXXX (optional)
Google Ads Conversion ID: AW-XXXXXXXXX (optional)
```

### 2. Update index.html (2 min)
Find and replace **2 locations** in [index.html](index.html):
- Line ~4: `GTM-XXXXXXX` → Your actual GTM Container ID
- Line ~2130: `GTM-XXXXXXX` → Your actual GTM Container ID

### 3. Set Up GTM (2 hours)
Follow [GTM_SETUP_GUIDE.md](GTM_SETUP_GUIDE.md):
- Create container
- Add 22 variables
- Add 13 triggers
- Add 10+ tags
- Test in Preview mode
- Publish

### 4. Verify Everything (1 hour)
Use [TRACKING_VERIFICATION_CHECKLIST.md](TRACKING_VERIFICATION_CHECKLIST.md):
- Test all funnel steps
- Check GA4 DebugView
- Verify purchase event
- Test on mobile

## 📊 Events Tracking Overview

### Funnel Flow:
```
1. page_view (Landing)
   ↓
2. scroll_depth (25%, 50%, 75%, 100%)
   ↓
3. cta_click (Button clicked)
   ↓
4. begin_checkout (Modal opens)
   ↓
5. form_step_1_complete (Phone submitted)
   ↓
6. form_step_2_start (Details form)
   ↓
7. add_to_cart (Package selected)
   ↓
8. add_shipping_info (Address entered)
   ↓
9. add_payment_info (Payment gateway opens)
   ↓
10. purchase (Payment successful) 💰
```

### Error Events:
- `checkout_abandoned` - User closes modal
- `payment_cancelled` - User closes payment gateway
- `payment_failed` - Payment error

## 🧪 Testing Locally

### 1. Start Local Server:
```bash
cd /Users/prinkit.patel/Documents/Amrutbaa.com
python3 -m http.server 8000
```

### 2. Access Site:
```
http://localhost:8000
```

### 3. Open Console:
Press `F12` (Chrome DevTools)

### 4. Check Data Layer:
```javascript
console.log(dataLayer);
```

### 5. Use GTM Preview:
- In GTM, click **Preview**
- Enter: `http://localhost:8000`
- Click **Connect**
- See all events in real-time

## 🔍 Debugging Commands

### Check if GTM loaded:
```javascript
console.log(typeof google_tag_manager);
// Should return: "object"
```

### View all dataLayer events:
```javascript
console.table(dataLayer);
```

### Get last event:
```javascript
dataLayer[dataLayer.length - 1];
```

### Check UTM parameters:
```javascript
console.log(JSON.parse(sessionStorage.getItem('utmParams')));
```

### Manually trigger test event:
```javascript
dataLayer.push({
  'event': 'test_event',
  'test_value': 123
});
```

## 📈 Key Metrics to Monitor

### Acquisition:
- Traffic by Source/Medium
- Campaign Performance
- UTM Parameter Attribution

### Engagement:
- Scroll Depth Distribution
- Average Time on Page
- CTA Click Rate
- Story Section Views

### Conversion Funnel:
| Stage | Event | Benchmark |
|-------|-------|-----------|
| Landing → CTA Click | `cta_click` | 20-30% |
| CTA → Modal Open | `begin_checkout` | 80-90% |
| Modal → Phone Submit | `form_step_1_complete` | 60-70% |
| Phone → Details | `form_step_2_start` | 90-95% |
| Details → Payment | `add_payment_info` | 70-80% |
| Payment → Purchase | `purchase` | 85-95% |

**Overall Conversion Rate Target**: 2-5% (landing to purchase)

### Revenue:
- Total Revenue
- Average Order Value (₹349 per jar)
- Revenue per Session
- ROAS (Return on Ad Spend)

## 🎯 Performance Marketing Setup

### Google Ads:
1. Link GA4 to Google Ads
2. Import `purchase` conversion
3. Set value = transaction value
4. Use for Smart Bidding optimization

### Facebook Ads:
1. Install Pixel base code (in GTM)
2. Verify events in Events Manager
3. Create Custom Conversions
4. Build Lookalike Audiences (after 100+ purchases)

### Campaign URL Builder:
```
https://amrutbaa.com/?utm_source=facebook&utm_medium=cpc&utm_campaign=launch&utm_content=video-ad&utm_term=chutney
```

Use: https://ga-dev-tools.google/campaign-url-builder/

## 📱 Mobile Testing

### Test URLs:
```
Local: http://localhost:8000
Staging: https://staging.amrutbaa.com (if available)
Production: https://amrutbaa.com
```

### iOS Safari Specific:
- Check ITP (Intelligent Tracking Prevention) impact
- Verify 7-day cookie limit doesn't break tracking
- Test in Private Browsing mode

### Android Chrome:
- Test on various screen sizes
- Verify touch events tracked
- Check modal responsiveness

## 🚨 Common Issues & Fixes

### Issue: GTM Not Loading
**Fix**: Check Container ID is correct in index.html (2 places)

### Issue: Events Not Showing in GA4
**Fix**: 
1. Wait 24-48 hours for processing
2. Use DebugView for real-time
3. Check GTM Preview to see if events fire

### Issue: Purchase Event Missing Revenue
**Fix**: Check `ecommerce.value` in dataLayer includes total amount

### Issue: Duplicate Events
**Fix**: Check no tags firing multiple times in GTM Preview

### Issue: Mobile Tracking Issues
**Fix**: 
1. Test without ad blockers
2. Check console for errors
3. Verify GTM loads on mobile network

## 📚 Key Documents

| Document | Purpose | Time |
|----------|---------|------|
| [ANALYTICS_TRACKING_PLAN.md](ANALYTICS_TRACKING_PLAN.md) | Full strategy & event definitions | 30 min read |
| [GTM_SETUP_GUIDE.md](GTM_SETUP_GUIDE.md) | Step-by-step GTM configuration | 2-3 hours |
| [TRACKING_VERIFICATION_CHECKLIST.md](TRACKING_VERIFICATION_CHECKLIST.md) | Testing & verification | 3-4 hours |
| This file | Quick reference | 5 min |

## 🎓 Learning Resources

### Google Analytics 4:
- [GA4 Beginner's Guide](https://support.google.com/analytics/answer/9304153)
- [E-commerce Events](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce)
- [DebugView Guide](https://support.google.com/analytics/answer/7201382)

### Google Tag Manager:
- [GTM Fundamentals](https://analytics.google.com/analytics/academy/course/5)
- [Data Layer Guide](https://developers.google.com/tag-platform/tag-manager/datalayer)
- [E-commerce Tracking](https://developers.google.com/tag-platform/tag-manager/ecommerce)

### Facebook Pixel:
- [Pixel Setup Guide](https://www.facebook.com/business/help/952192354843755)
- [Standard Events](https://developers.facebook.com/docs/meta-pixel/reference)
- [Conversion API](https://developers.facebook.com/docs/marketing-api/conversions-api)

## 🎯 Success Checklist

Before launching ads, ensure:
- [ ] GTM container ID updated in HTML
- [ ] GA4 Measurement ID added to GTM
- [ ] All events tested in GTM Preview
- [ ] Purchase event verified with test transaction
- [ ] DebugView shows all events correctly
- [ ] Cross-device testing complete
- [ ] Facebook Pixel verified (if using)
- [ ] Google Ads conversion imported (if using)
- [ ] Team trained on GA4 reports
- [ ] Weekly reporting schedule set

## 💡 Pro Tips

### Tip 1: Use GTM Workspaces
Create separate workspaces for testing new tags without affecting live site.

### Tip 2: Export GTM Container
**Settings** → **Export Container** (backup before major changes)

### Tip 3: Set Up Alerts
In GA4, create custom alerts for:
- Conversion rate drops
- Traffic spikes
- Purchase event errors

### Tip 4: Create Custom Reports
Build GA4 Explorations for:
- Funnel visualization
- Cohort analysis
- Path exploration
- User lifetime value

### Tip 5: Server-Side Tracking (Advanced)
For higher accuracy bypassing ad blockers:
1. Set up GTM Server Container
2. Route through your domain
3. Improve data quality by 20-40%

## 📞 Support

### Issues with Implementation:
- Check browser console for JavaScript errors
- Use GTM Preview mode for debugging
- Verify data layer structure: `console.log(dataLayer)`

### GA4 Data Questions:
- GA4 Help Center: https://support.google.com/analytics
- Analytics Help Community: https://support.google.com/analytics/community

### GTM Questions:
- GTM Help Center: https://support.google.com/tagmanager
- GTM Community: https://support.google.com/tagmanager/community

## 🚀 Launch Timeline

### Day 0 (Today):
- ✅ Code implemented
- ✅ Documentation created

### Day 1-2:
- [ ] Set up GTM container
- [ ] Configure all tags/triggers
- [ ] Test in Preview mode

### Day 3:
- [ ] Publish GTM container
- [ ] Verify on live site
- [ ] Complete verification checklist

### Day 4-7:
- [ ] Monitor data collection
- [ ] Fix any issues found
- [ ] Create first custom reports

### Week 2:
- [ ] Launch first ad campaigns
- [ ] Monitor attribution
- [ ] Optimize based on data

---

## 🎉 You're All Set!

Your e-commerce funnel now has **enterprise-grade analytics tracking**. You can:
- ✅ Track every customer interaction
- ✅ Measure exact ROAS per channel
- ✅ Identify and fix drop-off points
- ✅ Build high-converting remarketing audiences
- ✅ Scale profitable campaigns with confidence

**Questions?** Review the full documentation or open an issue.

**Good luck with your launch!** 🌶️🚀

---

**Last Updated**: February 7, 2026  
**Version**: 1.0  
**Status**: Ready for GTM Setup
