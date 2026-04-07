/**
 * Easter Egg Checkout Modal
 * Completely self-contained — zero dependency on modal-component.js
 * Fixed: 1 jar, ₹299, Prepaid only via Razorpay
 * 
 * To remove: delete this file + easter-egg.js + easter-egg.css,
 * then remove 2 import lines from main.js and 1 stylesheet link from index.html.
 */

export function openEasterEggModal() {
    // Prevent duplicate modals
    const existing = document.getElementById('easterEggModal');
    if (existing) {
        existing.classList.add('ee-active');
        document.body.style.overflow = 'hidden';
        return;
    }

    // Lazy-load Razorpay
    if (!window.Razorpay && !document.getElementById('razorpay-checkout-script')) {
        const s = document.createElement('script');
        s.id = 'razorpay-checkout-script';
        s.src = 'https://checkout.razorpay.com/v1/checkout.js';
        s.async = true;
        document.head.appendChild(s);
    }

    // --- Build Modal HTML ---
    const wrapper = document.createElement('div');
    wrapper.id = 'easterEggModal';
    wrapper.className = 'ee-modal ee-active';
    wrapper.innerHTML = `
        <div class="ee-overlay"></div>
        <div class="ee-content">
            <button class="ee-close" aria-label="Close">&times;</button>

            <div class="ee-banner">
                <div class="ee-banner-title">🎟️ YOU FOUND THE SECRET!</div>
                <div class="ee-banner-text">Jadooi Chutney is yours for just ₹299 today.</div>
            </div>

            <div class="ee-price-row">
                <span class="ee-price-mrp">MRP ₹499</span>
                <span class="ee-price-now">₹299</span>
            </div>
            <p class="ee-price-caption">1 × 250g jar • Prepaid only • Limited secret deal</p>

            <form id="eeForm" novalidate>
                <div class="ee-field">
                    <label for="eePhone">Mobile Number *</label>
                    <input type="tel" id="eePhone" placeholder="10-digit number" required inputmode="numeric" maxlength="10" autocomplete="tel">
                    <p class="ee-error" data-for="eePhone"></p>
                </div>

                <div class="ee-field">
                    <label for="eeName">Your Name *</label>
                    <input type="text" id="eeName" placeholder="Full name" required autocomplete="name">
                    <p class="ee-error" data-for="eeName"></p>
                </div>

                <div class="ee-field">
                    <label for="eeEmail">Email *</label>
                    <input type="email" id="eeEmail" placeholder="your@email.com" required autocomplete="email">
                    <p class="ee-error" data-for="eeEmail"></p>
                </div>

                <div class="ee-field">
                    <label for="eeAddress">Full Address *</label>
                    <textarea id="eeAddress" placeholder="House/flat, street, area" required rows="2"></textarea>
                    <p class="ee-error" data-for="eeAddress"></p>
                </div>

                <div class="ee-row">
                    <div class="ee-field">
                        <label for="eePincode">Pincode *</label>
                        <input type="text" id="eePincode" placeholder="6-digit" required inputmode="numeric" maxlength="6">
                        <p class="ee-error" data-for="eePincode"></p>
                        <p class="ee-pincode-status" id="eePincodeStatus"></p>
                    </div>
                    <div class="ee-field">
                        <label for="eeCity">City *</label>
                        <input type="text" id="eeCity" required autocomplete="address-level2">
                        <p class="ee-error" data-for="eeCity"></p>
                    </div>
                </div>

                <div class="ee-field">
                    <label for="eeState">State *</label>
                    <input type="text" id="eeState" required autocomplete="address-level1">
                    <p class="ee-error" data-for="eeState"></p>
                </div>

                <div class="ee-total">Total: ₹299</div>

                <button type="submit" class="ee-submit" id="eeSubmitBtn">
                    Pay ₹299 Securely →
                </button>
            </form>

            <div class="ee-success" id="eeSuccess" style="display:none;">
                <div class="ee-success-icon">✅</div>
                <h3>Order Confirmed!</h3>
                <p>Your secret deal jar is on its way. Redirecting…</p>
            </div>
        </div>
    `;

    document.body.appendChild(wrapper);
    document.body.style.overflow = 'hidden';

    // --- DOM refs ---
    const overlay = wrapper.querySelector('.ee-overlay');
    const closeBtn = wrapper.querySelector('.ee-close');
    const form = document.getElementById('eeForm');
    const submitBtn = document.getElementById('eeSubmitBtn');
    const pincodeInput = document.getElementById('eePincode');
    const pincodeStatus = document.getElementById('eePincodeStatus');
    const successDiv = document.getElementById('eeSuccess');

    let pincodeServiceable = null;
    let pincodeTimer = null;

    // --- Close ---
    function closeModal() {
        wrapper.classList.remove('ee-active');
        document.body.style.overflow = 'auto';
    }
    overlay.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && wrapper.classList.contains('ee-active')) closeModal();
    });

    // --- Validation helpers ---
    function showError(id, msg) {
        const el = wrapper.querySelector(`.ee-error[data-for="${id}"]`);
        if (el) { el.textContent = msg; el.style.display = 'block'; }
    }
    function clearError(id) {
        const el = wrapper.querySelector(`.ee-error[data-for="${id}"]`);
        if (el) { el.textContent = ''; el.style.display = 'none'; }
    }
    function clearAllErrors() {
        wrapper.querySelectorAll('.ee-error').forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });
    }

    // --- Pincode check ---
    pincodeInput.addEventListener('input', () => {
        const pin = pincodeInput.value.replace(/\D/g, '');
        pincodeInput.value = pin;
        clearError('eePincode');
        pincodeServiceable = null;
        pincodeStatus.textContent = '';
        pincodeStatus.className = 'ee-pincode-status';

        if (pin.length === 6) {
            clearTimeout(pincodeTimer);
            pincodeTimer = setTimeout(() => checkPincode(pin), 400);
        }
    });

    async function checkPincode(pin) {
        pincodeStatus.textContent = 'Checking…';
        pincodeStatus.className = 'ee-pincode-status checking';
        try {
            const res = await fetch('/api/check-pincode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pincode: pin })
            });
            const data = await res.json();
            if (data.serviceable) {
                pincodeServiceable = true;
                pincodeStatus.textContent = '✓ Delivery available';
                pincodeStatus.className = 'ee-pincode-status success';
                clearError('eePincode');
            } else {
                pincodeServiceable = false;
                pincodeStatus.textContent = '✗ Not serviceable';
                pincodeStatus.className = 'ee-pincode-status error';
                showError('eePincode', 'This pincode is not serviceable yet.');
            }
        } catch {
            pincodeServiceable = null;
            pincodeStatus.textContent = '⚠ Check failed — try again';
            pincodeStatus.className = 'ee-pincode-status error';
        }
    }

    // --- Form submit ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearAllErrors();

        const phone = document.getElementById('eePhone').value.replace(/\D/g, '');
        const name = document.getElementById('eeName').value.trim();
        const email = document.getElementById('eeEmail').value.trim();
        const address = document.getElementById('eeAddress').value.trim();
        const pincode = document.getElementById('eePincode').value.replace(/\D/g, '');
        const city = document.getElementById('eeCity').value.trim();
        const state = document.getElementById('eeState').value.trim();

        // Validate
        let valid = true;
        if (phone.length !== 10) { showError('eePhone', 'Enter a valid 10-digit number'); valid = false; }
        if (!name) { showError('eeName', 'Name is required'); valid = false; }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError('eeEmail', 'Enter a valid email'); valid = false; }
        if (!address) { showError('eeAddress', 'Address is required'); valid = false; }
        if (pincode.length !== 6) { showError('eePincode', 'Enter a valid 6-digit pincode'); valid = false; }
        if (pincodeServiceable === false) { showError('eePincode', 'This pincode is not serviceable'); valid = false; }
        if (!city) { showError('eeCity', 'City is required'); valid = false; }
        if (!state) { showError('eeState', 'State is required'); valid = false; }
        if (!valid) return;

        // If pincode not yet checked, run check now
        if (pincodeServiceable === null && pincode.length === 6) {
            await checkPincode(pincode);
            if (pincodeServiceable !== true) {
                showError('eePincode', 'Please wait for pincode check to complete');
                return;
            }
        }

        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Initializing Payment…';
        submitBtn.disabled = true;

        try {
            // Create Razorpay order
            const orderRes = await fetch('/api/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: 299,
                    name, email, phone,
                    quantity: 1,
                    address1: address,
                    address2: '',
                    city, state, pincode,
                    easterEggCode: 'JADOOI_7'
                })
            });

            if (!orderRes.ok) throw new Error('Failed to create order');
            const order = await orderRes.json();

            // Open Razorpay checkout
            const rzp = new window.Razorpay({
                key: 'rzp_live_S9MRd6GMVrZZqY',
                amount: order.amount,
                currency: order.currency || 'INR',
                name: 'Amrutbaa',
                description: 'Secret Deal — Jadooi Chutney',
                order_id: order.id,
                prefill: {
                    name: name,
                    email: email,
                    contact: '+91' + phone
                },
                theme: { color: '#D4AF37' },
                handler: async function (response) {
                    // Verify payment
                    submitBtn.textContent = 'Verifying Payment…';
                    try {
                        const verifyRes = await fetch('/api/verify-payment', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            })
                        });
                        const verifyData = await verifyRes.json();
                        if (verifyData.success) {
                            form.style.display = 'none';
                            successDiv.style.display = 'block';

                            // Send to n8n
                            try {
                                await fetch('https://n8n.prinkit.cloud/webhook/checkout_events', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        status: 'complete',
                                        source: 'easter_egg_checkout',
                                        name, email, phone,
                                        quantity: 1,
                                        address1: address,
                                        city, state, pincode,
                                        payment_method: 'online',
                                        order_id: order.id,
                                        payment_id: response.razorpay_payment_id,
                                        amount: 299
                                    })
                                });
                            } catch (err) {
                                console.warn('n8n webhook failed:', err);
                            }

                            setTimeout(() => {
                                const params = new URLSearchParams({
                                    order: order.id,
                                    amount: 299,
                                    method: 'online',
                                    source: 'easter_egg'
                                });
                                window.location.href = `/thank-you.html?${params.toString()}`;
                            }, 2000);
                        } else {
                            throw new Error('Payment verification failed');
                        }
                    } catch (err) {
                        console.error('Verification error:', err);
                        alert('Payment verification failed. Please contact support.');
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                    }
                },
                modal: {
                    ondismiss: function () {
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                    }
                }
            });

            rzp.on('payment.failed', function (resp) {
                console.error('Payment failed:', resp.error);
                alert('Payment failed: ' + (resp.error.description || 'Unknown error'));
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            });

            rzp.open();

        } catch (err) {
            console.error('Easter egg checkout error:', err);
            alert('Something went wrong. Please try again.');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}
