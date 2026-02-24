# Quick Cleanup Checklist

## What Needs Removing

### 1. Dead Form Code from `main.js` (Lines ~180-265)

**What to DELETE:**
- `initFormHandling()` function (entire ~150 lines)
- `validateField()` function
- `validateForm()` function  
- `isValidEmail()` function
- `showSuccessMessage()` function (120+ lines)
- `closeSuccessPopup()` function
- `showToast()` function
- Character counter logic
- Enter key handling
- Form submission simulation

**Keep in main.js:**
- `initCountdownTimer()` ✅
- `updateCountdown()` ✅
- `getNextSundayDeadline()` ✅
- `displayCountdown()` ✅
- `initScrollAnimations()` ✅
- `initNavbarEffects()` ✅
- `initSmoothScrolling()` ✅
- `initParallaxEffects()` ✅
- `isInViewport()` ✅

**Result:** main.js shrinks from 689 → ~280 lines

---

## Animations to Clean Up

### Unused Animations to REMOVE from main.css:

Search for and delete these @keyframes (if they don't appear used):
- `slideInLeft` - NEVER USED
- Duplicate `fadeIn` definitions
- Duplicate `slideUp` definitions
- Any `@keyframes` starting with `pulse-`, `shimmer-`, `glow-` that aren't referenced

### Fix Required:

**In modal-component.js line 469:**
```javascript
// BEFORE:
animation: successPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);

// AFTER (remove if not needed):
animation: fadeIn 0.3s ease;

// OR define missing animation:
@keyframes successPop {
    0% { transform: scale(0.8) translateY(20px); opacity: 0; }
    50% { transform: scale(1.05); }
    100% { transform: scale(1) translateY(0); opacity: 1; }
}
```

---

## Console Logs to Remove

**In main.js:**
- Line ~15: `console.log('🌶️ Amrut Baa website loaded...')`

**In modal-component.js:**
- Line ~937: `console.log('✅ Payment successful:', response);`
- Line ~944: `console.log('Verifying payment signature...');`
- Line ~948: `console.log('Verification result:', verifyResult);`
- Line ~955: `console.log('✅ Payment verified! Creating shipment...');`
- Line ~968: `console.log('✅ Shipment created:', trackingInfo);`
- Line ~971: `console.warn('⚠️ Shipment creation failed...');`
- Line ~974: `console.error('Shipment error:', shipmentError);`

---

## What NOT to Delete

✅ **KEEP in main.js:**
- Countdown timer functions
- Scroll animations
- Navbar effects
- Smooth scrolling
- Parallax effects
- Initialization code

✅ **KEEP in modal-component.js:**
- All form/validation code
- All payment integration
- All Razorpay handling
- All Shiprocket shipment code
- Success message display

✅ **KEEP in main.css:**
- All form styling
- All modal styling
- All countdown styling
- All button/link styling
- Essential animations (fadeIn, slideUp, checkmarkBounce, etc.)

---

## Order of Operations

1. **First**: Remove console.log statements (safe, no dependencies)
2. **Second**: Remove form code from main.js (verify nothing else uses it)
3. **Third**: Clean up animation definitions
4. **Fourth**: Test everything still works
5. **Fifth**: Commit with message: "🧹 Remove dead code and unused animations"

---

## Testing After Cleanup

After making changes, test:

- [ ] Homepage loads without errors (check console)
- [ ] Countdown timer works
- [ ] Scroll animations work
- [ ] Navbar hides on mobile scroll
- [ ] Order modal opens
- [ ] Form validation works
- [ ] Payment flow works
- [ ] Success message shows
- [ ] Animations are smooth
- [ ] No console errors/warnings

---

## Estimated Impact

| Change | Lines Removed | Impact |
|--------|---------------|--------|
| Remove form code from main.js | ~350 lines | ~10 KB |
| Remove unused animations | ~150 lines | ~5 KB |
| Remove console logs | ~30 lines | ~1 KB |
| **TOTAL** | **~530 lines** | **~16 KB gzipped** |

**Result:** Site is 5-10% faster to load, easier to maintain, no features lost.

---

## Files Modified

- `scripts/main.js` ← MAJOR CLEANUP
- `assets/js/modal-component.js` ← Minor cleanup (console logs)
- `styles/main.css` ← Remove unused animations
- `index.html` ← No changes needed

---

**Ready to proceed? Let me know and I'll do the cleanup!**
