# Testing Checklist - Amrutbaa.com

## Quick Visual Test

### ✅ Hero Section
- [ ] "Monday-Only Chutney" headline visible
- [ ] 4.9/5 star rating badge visible
- [ ] Social proof: "1,200+ Families"
- [ ] Two CTAs: Primary + Secondary
- [ ] Trust line with guarantee + free delivery

### ✅ Story Section
- [ ] Comparison grid visible
- [ ] Two columns: Bad (gray) vs Good (maroon/golden)
- [ ] "Most Popular Choice" badge on good column
- [ ] 6 points each with checkmarks/crosses

### ✅ Testimonials Section
- [ ] 3 testimonial cards visible
- [ ] 5-star ratings on each
- [ ] Customer names + locations
- [ ] CTA: "Join 1,200+ Families..."

### ✅ Pricing Section
- [ ] 3 pricing cards visible
- [ ] Middle card (Family Pack) is featured:
  - Scaled up (larger)
  - Dark maroon background
  - Golden border
  - "Most Popular" ribbon
- [ ] Savings shown on Family + Bulk
- [ ] Guarantee badge below pricing

### ✅ FAQ Section
- [ ] 6 questions visible
- [ ] 2-column grid (desktop)
- [ ] Golden left border on cards
- [ ] Hover effect works (slides right)

### ✅ Order Form
- [ ] Shows phone-first form by default (Step 1)
- [ ] Large centered phone input
- [ ] "Reserve My Batch Now →" button
- [ ] Trust indicators below (3 items)
- [ ] Full form hidden initially (Step 2)

---

## Functional Test

### Form Flow Test:
1. **Go to order section**
2. **Enter phone number:** `9876543210`
3. **Click "Reserve My Batch Now"**
   - [ ] Toast message appears: "Great! Now complete your order details"
   - [ ] Form switches to Step 2
   - [ ] Phone number is pre-filled
   - [ ] Page auto-scrolls to form
4. **Fill out remaining fields:**
   - Name: Test User
   - Address: Test Address 123
   - Package: Family Pack (should be pre-selected)
   - Check terms box
5. **Click "Confirm My Order"**
   - [ ] Success modal appears
   - [ ] Modal shows batch timeline
   - [ ] Click "Got it!" closes modal
   - [ ] Form resets to Step 1

### Countdown Timer Test:
1. **Check order section**
   - [ ] Countdown timer is visible
   - [ ] Numbers are updating (check seconds)
   - [ ] Shows: Days, Hours, Minutes, Seconds
2. **Check urgency states:**
   - If <24 hours to Sunday: Timer should pulse (golden)
   - If <3 hours: Timer should be critical (red)
   - Otherwise: Normal state

### Navigation Test:
1. **Click navbar links:**
   - [ ] "Our Story" → Scrolls to story section
   - [ ] "The Chutney" → Scrolls to product section
   - [ ] "Reserve Your Batch" → Scrolls to order form

2. **Scroll behavior:**
   - [ ] Navbar gets enhanced shadow after scrolling
   - [ ] Smooth scroll animations work
   - [ ] Golden section separators visible

---

## Mobile Test (< 768px)

### Layout:
- [ ] All grids collapse to single column
- [ ] Comparison grid: Good column shows first
- [ ] Testimonials: Stack vertically
- [ ] Pricing: Family Pack (featured) shows first
- [ ] FAQ: Stack vertically

### Form:
- [ ] Phone input: Touch-friendly size
- [ ] CTA button: Minimum 48px height
- [ ] Trust indicators: Stack or wrap nicely
- [ ] Form is easy to fill on mobile

### Performance:
- [ ] Page loads in <3 seconds
- [ ] Images load (product photos)
- [ ] No horizontal scroll
- [ ] Text is readable (16px minimum)

---

## Browser Test

Test in:
- [ ] Chrome (Desktop)
- [ ] Safari (Desktop + iPhone)
- [ ] Firefox
- [ ] Chrome (Android)

Look for:
- [ ] No layout breaks
- [ ] Fonts load correctly
- [ ] Colors match (maroon + golden)
- [ ] Animations smooth
- [ ] Form works

---

## Content Validation

### Check Copy:
- [ ] No typos in hero headline
- [ ] All testimonial names correct
- [ ] Pricing math is correct:
  - Starter: ₹150 × 1 = ₹150
  - Family: ₹420 for 3 (₹140 each, save ₹30)
  - Bulk: ₹650 for 5 (₹130 each, save ₹100)
- [ ] Free delivery threshold: ₹300+ (2+ jars)

### Check Links:
- [ ] All navbar links work
- [ ] All CTA buttons scroll to order form
- [ ] No broken links
- [ ] No 404 errors in console

---

## Performance Check

### Load Time:
- [ ] Open DevTools → Network tab
- [ ] Hard refresh (Cmd+Shift+R)
- [ ] Check total load time: Target <3 seconds
- [ ] Check CSS file loads: main.css
- [ ] Check JS file loads: main.js

### Console Errors:
- [ ] Open DevTools → Console
- [ ] Look for any red errors
- [ ] Should see: "Made with ❤️ preserving 90+ years of tradition"
- [ ] No 404s, no script errors

### Images:
- [ ] Product image loads (product-jar.png)
- [ ] Product pouch loads (product-pouch.png)
- [ ] Logo loads (if added)
- [ ] No broken image icons

---

## User Experience Test

### First-Time Visitor Journey:
1. **Land on hero**
   - [ ] Understand what this is (chutney)
   - [ ] Understand unique value (Monday-only)
   - [ ] Feel urgency (countdown timer)
   
2. **Scroll to comparison**
   - [ ] See difference between store vs Amrut Baa
   - [ ] Understand why weekly batches matter
   
3. **Read testimonials**
   - [ ] See real people love it
   - [ ] See recurring customers (6 months, 1 year+)
   
4. **Check pricing**
   - [ ] Family Pack clearly best value
   - [ ] Free delivery above ₹300 clear
   - [ ] Savings highlighted
   
5. **Review FAQ**
   - [ ] Main objections answered
   - [ ] Feel confident about purchase
   
6. **Order form**
   - [ ] Phone-only feels easy
   - [ ] Trust badges reduce risk
   - [ ] "Call within 2 hours" promise clear

---

## Critical Issues to Watch

### High Priority:
- [ ] Form submits without errors
- [ ] Success modal displays correctly
- [ ] Countdown timer updates in real-time
- [ ] Featured pricing card stands out visually
- [ ] Mobile layout doesn't break

### Medium Priority:
- [ ] Testimonials look authentic
- [ ] FAQ answers are helpful
- [ ] Trust badges inspire confidence
- [ ] Hover animations work smoothly

### Low Priority (Nice-to-Have):
- [ ] Parallax effects on hero
- [ ] Smooth scroll animations
- [ ] Loading screen animation
- [ ] Toast notifications styled well

---

## Pre-Launch Double-Check

Before going live:
- [ ] Replace placeholder testimonials with real ones
- [ ] Verify phone number connects to you
- [ ] Set up actual form submission (not demo)
- [ ] Add real product photos
- [ ] Verify pricing is final
- [ ] Add payment integration
- [ ] Set up analytics tracking
- [ ] Add privacy policy link
- [ ] Display FSSAI license

---

## Quick Fixes Reference

### If form doesn't submit:
1. Open Console → Check for JavaScript errors
2. Verify main.js is loaded
3. Check form IDs match: `quick-form`, `registration-form`

### If countdown doesn't work:
1. Check Console for errors
2. Verify `initCountdownTimer()` is called
3. Check system date/time is correct

### If styling looks wrong:
1. Hard refresh: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)
2. Check main.css is loaded
3. Check browser cache

### If mobile looks broken:
1. Check viewport meta tag in HTML
2. Test actual device, not just browser resize
3. Check responsive CSS media queries

---

## Success Criteria

After testing, you should:
- ✅ See all 7 sections rendering correctly
- ✅ Phone-first form working smoothly
- ✅ Featured pricing tier visually prominent
- ✅ Countdown timer ticking
- ✅ No console errors
- ✅ Mobile layout perfect
- ✅ Form submission shows success modal

**If all checks pass:** Ready for production! 🚀
**If any fail:** Check CONVERSION_OPTIMIZATIONS_IMPLEMENTED.md for troubleshooting

---

## Test on Actual Devices

### Desktop (1920x1080):
- [ ] All content fits well
- [ ] Featured pricing card scaled appropriately
- [ ] Comparison grid: 2 columns side-by-side
- [ ] Testimonials: 3 columns
- [ ] FAQ: 2 columns

### Tablet (768px - 1024px):
- [ ] 2-column layouts work
- [ ] Images sized appropriately
- [ ] Touch targets big enough

### Mobile (375px - 767px):
- [ ] Everything stacks properly
- [ ] Text readable without zoom
- [ ] Buttons easy to tap
- [ ] Form inputs large enough
- [ ] No horizontal scroll

---

**Last Updated:** After conversion optimizations
**Test Date:** _____________
**Tester:** _____________
**Result:** ☐ Pass ☐ Fail ☐ Needs Work
