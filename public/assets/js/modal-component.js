/**
 * Modal Registration Component
 * Self-contained, reusable modal form for batch registration
 * 
 * Usage:
 *   <script src="assets/js/modal-component.js"></script>
 *   <script>initOrderModal();</script>
 */

function initOrderModal() {
    // 🔒 CRITICAL: Track processed orders to prevent duplicates (persists across page reloads)
    const processedOrders = new Set(JSON.parse(sessionStorage.getItem('processedOrders') || '[]'));

    // Helper to save processed orders
    const saveProcessedOrders = () => {
        sessionStorage.setItem('processedOrders', JSON.stringify([...processedOrders]));
    };

    // Check if modal already exists - if so, reuse it
    const existingModal = document.getElementById('registrationModal');
    if (existingModal) {
        // Return the modal API even if already initialized
        const openModal = () => {
            existingModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        };
        const closeModal = () => {
            existingModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        };
        return { open: openModal, close: closeModal };
    }



    // Create modal HTML
    const modalHTML = `
        <div class="modal" id="registrationModal">
            <div class="modal-overlay" id="modalOverlay"></div>
            <div class="modal-content">
                <button class="modal-close" id="closeModalBtn">&times;</button>
                
                <div class="modal-header">
                    <h2>Secure My Jar in This Week’s Batch</h2>
                    <p class="modal-tagline">Fresh prep begins Monday • Dispatch Tuesday • Delivered Wed–Fri</p>
                </div>

                <div class="modal-trust">
                    <span class="trust-item">Free Delivery</span>
                    <span class="trust-item">Amrutbaa Family Member Status</span>
                    <span class="trust-item">100% Money-Back Guarantee</span>
                </div>

                <div class="modal-price">
                    <span class="price-mrp">MRP ₹800</span>
                    <span class="price-amount" id="unitPriceDisplay">₹499</span>
                </div>

                <span class="price-caption" id="priceCaption">Per 250g jar • Limited weekly batch</span>

                <div class="modal-total" id="modalTotal">Total today: ₹499</div>
                <div class="modal-savings" id="modalSavings" style="display:none;"></div>

                <div class="modal-urgency">Batch closes in <span id="modalTimer">--:--:--</span></div>
                
                <form id="registrationForm">
                    <div class="stepper" id="formStepper">
                        <div class="step active" data-step="1">
                            <span class="step-number">1</span>
                            <span class="step-title">Reserve</span>
                        </div>
                        <div class="step" data-step="2">
                            <span class="step-number">2</span>
                            <span class="step-title">Delivery</span>
                        </div>
                    </div>

                    <div class="step-pane active" data-step-pane="1">
                        <div class="form-group">
                            <label for="phone">Mobile Number (India) *</label>
                            <input type="tel" id="phone" name="phone" placeholder="10-digit number (no +91)" required inputmode="numeric" autocomplete="tel" maxlength="10">
                            <p class="input-error" data-error-for="phone" style="display:none;"></p>
                            <p class="field-note">+91 will be added automatically. Enter exactly 10 digits. We’ll confirm your batch slot over WhatsApp/SMS.</p>
                        </div>
                        <div class="form-group">
                            <label for="quantity">How many jars? *</label>
                            <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.5rem; margin-top: 0.75rem;">
                                <button type="button" class="qty-button" data-qty="1" style="padding: 0.75rem; border: 2px solid rgba(107, 44, 44, 0.2); border-radius: 8px; background: #fff; color: #6B2C2C; font-weight: 700; cursor: pointer; transition: all 0.2s;">1</button>
                                <button type="button" class="qty-button" data-qty="2" style="padding: 0.75rem; border: 2px solid rgba(107, 44, 44, 0.2); border-radius: 8px; background: #fff; color: #6B2C2C; font-weight: 700; cursor: pointer; transition: all 0.2s;">2</button>
                                <button type="button" class="qty-button" data-qty="3" style="padding: 0.75rem; border: 2px solid rgba(107, 44, 44, 0.2); border-radius: 8px; background: #fff; color: #6B2C2C; font-weight: 700; cursor: pointer; transition: all 0.2s;">3</button>
                                <button type="button" class="qty-button" data-qty="4" style="padding: 0.75rem; border: 2px solid rgba(107, 44, 44, 0.2); border-radius: 8px; background: #fff; color: #6B2C2C; font-weight: 700; cursor: pointer; transition: all 0.2s;">4</button>
                                <button type="button" class="qty-button" data-qty="5" style="padding: 0.75rem; border: 2px solid rgba(107, 44, 44, 0.2); border-radius: 8px; background: #fff; color: #6B2C2C; font-weight: 700; cursor: pointer; transition: all 0.2s;">5</button>
                            </div>
                            <input type="number" id="quantity" name="quantity" class="qty-input" min="1" max="10" value="" required style="display: none;">
                            <p class="input-error" data-error-for="quantity" style="display:none;"></p>
                            <p class="field-note" id="offerNote" style="margin-top: 0.75rem;">Recommended: 2 jars • Offers: 5% off 2+ jars • 10% off 3+ jars</p>
                        </div>
                        <div class="step-actions">
                            <button type="button" class="btn-primary-solid" id="nextStepBtn">Continue →</button>
                        </div>
                    </div>

                    <div class="step-pane" data-step-pane="2">
                        <div class="order-recap">
                            <strong>Reserved:</strong> <span id="orderQuantityText">Select jars to reserve this week's batch</span> • Dispatch starts Monday after prep.
                        </div>

                        <div style="margin: 1.5rem 0;">
                            <label style="font-weight: 700; color: #6B2C2C; margin-bottom: 0.75rem; display: block;">How should we reach you? *</label>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem;">
                                <label style="display: flex; align-items: center; gap: 0.6rem; cursor: pointer; padding: 0.7rem; border: 2px solid #D4AF37; border-radius: 8px; background: rgba(212, 175, 55, 0.1);">
                                    <input type="radio" id="paymentMethodOnline" name="payment_method" value="online" checked style="width: 18px; height: 18px; cursor: pointer;"> 
                                    <span style="font-weight: 600; color: #6B2C2C; font-size: 0.95rem;">Pay Now</span>
                                </label>
                                <label style="display: flex; align-items: center; gap: 0.6rem; cursor: pointer; padding: 0.7rem; border: 2px solid rgba(107, 44, 44, 0.2); border-radius: 8px;">
                                    <input type="radio" id="paymentMethodCod" name="payment_method" value="cod" style="width: 18px; height: 18px; cursor: pointer;"> 
                                    <span style="font-weight: 600; color: #6B2C2C; font-size: 0.95rem;">Pay on Delivery</span>
                                </label>
                            </div>
                            <p style="font-size: 0.85rem; color: #4A4A4A; margin-top: 0.6rem; opacity: 0.85;">Both options ship the same day and arrive Wed–Fri.</p>
                        </div>

                        <div class="form-row" style="margin-top: 1.25rem;">
                            <div class="form-group">
                                <label for="name">Your Name *</label>
                                <input type="text" id="name" name="name" placeholder="Full name" required autocomplete="shipping name">
                                <p class="input-error" data-error-for="name" style="display:none;"></p>
                            </div>
                            <div class="form-group">
                                <label for="email">Email *</label>
                                <input type="email" id="email" name="email" placeholder="your@email.com" required autocomplete="shipping email">
                                <p class="input-error" data-error-for="email" style="display:none;"></p>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="address1">Full Address *</label>
                            <textarea id="address1" name="address1" placeholder="House/flat, street, area" required style="resize: none; min-height: 60px;" autocomplete="shipping street-address"></textarea>
                            <p class="input-error" data-error-for="address1" style="display:none;"></p>
                            <p class="field-note">Include: House/flat number, street, area (landmarks help too)</p>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="pincode">Pincode *</label>
                                <input type="text" id="pincode" name="pincode" placeholder="6-digit" maxlength="6" required inputmode="numeric" autocomplete="shipping postal-code">
                                <p class="input-error" data-error-for="pincode" style="display:none;"></p>
                                <p class="pincode-status" id="pincodeStatus"></p>
                            </div>
                            <div class="form-group">
                                <label for="city">City *</label>
                                <input type="text" id="city" name="city" placeholder="Auto-detected" required autocomplete="shipping address-level2">
                                <p class="input-error" data-error-for="city" style="display:none;"></p>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="state">State *</label>
                            <input type="text" id="state" name="state" placeholder="Auto-detected" required autocomplete="shipping address-level1">
                            <p class="input-error" data-error-for="state" style="display:none;"></p>
                        </div>
                        
                        <input type="text" id="address2" name="address2" style="display: none;" />
                        <div style="display: none;"></div>

                        <div style="display:flex; justify-content:space-evenly; align-items:center; gap:1.5rem; margin:1.5rem auto 1rem; padding:1rem; max-width:520px; background:#f9f9f9; border-radius:12px; flex-wrap:wrap; border:1px solid #e0e0e0;">
                            <img src="assets/images/money-back-seal.png" alt="100% Money Back Guarantee" style="width:80px; height:80px; object-fit:contain;" />
                            <img src="assets/images/fssai-logo-fssai-icon-free-free-vector-removebg-preview Background Removed.png" alt="FSSAI Certified" style="width:90px; height:90px; object-fit:contain;" />
                        </div>

                        <div class="step-actions">
                            <button type="button" class="btn-secondary-outline" id="prevStepBtn">← Back</button>
                            <button type="submit" class="btn-primary-solid" id="submitBtn">Reserve & Pay Securely</button>
                        </div>
                        
                        <div style="text-align: center; font-size: 0.8rem; color: #999; margin-top: 0.75rem;">
                            💬 Questions? Edit before Sunday 9 PM
                        </div>
                    </div>
                </form>

                <div class="success-message" id="successMessage">
                    <div class="success-checkmark">
                        <div class="checkmark-circle">✓</div>
                    </div>
                    <h2 style="font-size: 1.8rem; color: #2E7D32; margin: 1rem 0 0.5rem;">Order Confirmed! 🎉</h2>
                    <p style="font-size: 0.95rem; color: #555; margin-bottom: 1.5rem;">Your fresh chutney is reserved for this week's batch</p>
                    
                    <div id="order-details-box" style="background: #f5f5f5; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem; text-align: left;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                            <div>
                                <div style="font-size: 0.8rem; color: #999; font-weight: 500; margin-bottom: 0.3rem;">ORDER NUMBER</div>
                                <div id="order-number" style="font-size: 1.1rem; font-weight: 700; color: #2B2B2B;">---</div>
                            </div>
                            <div>
                                <div style="font-size: 0.8rem; color: #999; font-weight: 500; margin-bottom: 0.3rem;">AMOUNT PAID</div>
                                <div id="order-amount" style="font-size: 1.1rem; font-weight: 700; color: #2E7D32;">---</div>
                            </div>
                        </div>
                        <div id="tracking-section" style="display: none; border-top: 1px solid #ddd; padding-top: 1rem;">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                <div>
                                    <div style="font-size: 0.8rem; color: #999; font-weight: 500; margin-bottom: 0.3rem;">TRACKING NUMBER</div>
                                    <div id="tracking-display" style="font-size: 1rem; font-weight: 700; color: #1976D2; font-family: monospace;">---</div>
                                </div>
                                <div>
                                    <div style="font-size: 0.8rem; color: #999; font-weight: 500; margin-bottom: 0.3rem;">COURIER</div>
                                    <div id="courier-display" style="font-size: 1rem; font-weight: 700; color: #2B2B2B;">---</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style="background: #fff3e0; border-left: 4px solid #ff9800; padding: 1rem; border-radius: 4px; margin-bottom: 1.5rem; text-align: left;">
                        <div style="font-size: 0.9rem; font-weight: 600; color: #e65100; margin-bottom: 0.5rem;">📅 What Happens Next:</div>
                        <div style="font-size: 0.85rem; color: #e65100; line-height: 1.6;">
                            <strong>Monday:</strong> Fresh prep begins<br>
                            <strong>Tuesday:</strong> Dispatched to you<br>
                            <strong>Wed-Fri:</strong> Delivered fresh to your doorstep
                        </div>
                    </div>

                    <button id="track-order-btn" style="width: 100%; padding: 0.875rem; background: #1976D2; color: white; border: none; border-radius: 6px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: background 0.3s; display: none;">
                        📦 Track Your Order
                    </button>

                    <div style="font-size: 0.8rem; color: #999; margin-top: 1rem;">
                        You'll also receive tracking updates via WhatsApp/Email
                    </div>
                </div>
            </div>
        </div>
    `;

    // Inject modal HTML at end of body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Cache DOM elements
    const modal = document.getElementById('registrationModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalOverlay = document.getElementById('modalOverlay');
    const registrationForm = document.getElementById('registrationForm');
    const successMessage = document.getElementById('successMessage');
    const stepperSteps = document.querySelectorAll('.step');
    const stepPanes = document.querySelectorAll('.step-pane');
    const nextStepBtn = document.getElementById('nextStepBtn');
    const prevStepBtn = document.getElementById('prevStepBtn');
    const quantityInput = document.getElementById('quantity');
    const modalTotal = document.getElementById('modalTotal');
    const priceCaption = document.getElementById('priceCaption');
    const modalSavings = document.getElementById('modalSavings');
    const unitPriceDisplay = document.getElementById('unitPriceDisplay');
    const orderQuantityText = document.getElementById('orderQuantityText');
    const pincodeInput = document.getElementById('pincode');
    const pincodeStatus = document.getElementById('pincodeStatus');
    const paymentMethodOnline = document.getElementById('paymentMethodOnline');
    const paymentMethodCod = document.getElementById('paymentMethodCod');
    const submitBtn = document.getElementById('submitBtn');
    let currentStep = 1;
    let pincodeServiceable = null;
    let codPincodeServiceable = null;
    let pincodeCheckTimer = null;
    let isCodSelected = false;
    let lastFocusedElement = null;
    let isModalOpen = false;

    const pricingConfig = {
        unitPrice: 499,
        offers: [
            { minQty: 2, discountPercent: 5, label: '5% off 2+ jars' },
            { minQty: 3, discountPercent: 10, label: '10% off 3+ jars' }
        ]
    };

    function getOfferForQty(qty) {
        return pricingConfig.offers
            .filter((offer) => qty >= offer.minQty)
            .sort((a, b) => b.minQty - a.minQty)[0] || null;
    }

    function calculatePricing(qty) {
        const safeQty = Number.isFinite(qty) ? qty : 1;
        const baseTotal = safeQty * pricingConfig.unitPrice;

        // No discounts for COD
        if (isCodSelected) {
            return {
                qty: safeQty,
                unitPrice: pricingConfig.unitPrice,
                baseTotal,
                discount: 0,
                total: baseTotal,
                offer: null
            };
        }

        // Apply discounts for online payments
        const offer = getOfferForQty(safeQty);
        const discount = offer ? Math.round((baseTotal * offer.discountPercent) / 100) : 0;
        const total = baseTotal - discount;
        return {
            qty: safeQty,
            unitPrice: pricingConfig.unitPrice,
            baseTotal,
            discount,
            total,
            offer
        };
    }

    function getSelectedQuantity() {
        const parsed = parseInt(quantityInput?.value, 10);
        if (Number.isNaN(parsed)) return null;
        return Math.min(10, Math.max(1, parsed));
    }

    function updatePricingUI() {
        const qty = getSelectedQuantity();

        if (!qty) {
            if (modalTotal) {
                modalTotal.textContent = 'Select jars to see total';
            }
            if (orderQuantityText) {
                orderQuantityText.textContent = "Select jars to reserve this week's batch";
            }
            if (unitPriceDisplay) {
                unitPriceDisplay.textContent = `₹${pricingConfig.unitPrice}`;
            }
            if (priceCaption) {
                priceCaption.textContent = 'Per 250g jar • Limited weekly batch';
            }
            if (modalSavings) {
                modalSavings.textContent = '';
                modalSavings.style.display = 'none';
            }
            return;
        }

        if (quantityInput) quantityInput.value = qty;

        const pricing = calculatePricing(qty);
        if (unitPriceDisplay) {
            unitPriceDisplay.textContent = `₹${pricing.total}`;
        }
        if (priceCaption) {
            priceCaption.textContent = `Total for ${pricing.qty} jar${pricing.qty > 1 ? 's' : ''} • Limited weekly batch`;
        }
        if (modalTotal) {
            modalTotal.textContent = `Total today: ₹${pricing.total}`;
        }
        if (orderQuantityText) {
            orderQuantityText.textContent = `${pricing.qty} fresh jar${pricing.qty > 1 ? 's' : ''}`;
        }
        if (modalSavings) {
            if (pricing.discount > 0 && pricing.offer) {
                modalSavings.textContent = `You save ₹${pricing.discount} (${pricing.offer.label})`;
                modalSavings.style.display = 'block';
            } else {
                modalSavings.textContent = '';
                modalSavings.style.display = 'none';
            }
        }
    }

    // Utility functions
    function clearErrors() {
        document.querySelectorAll('.form-group').forEach(group => group.classList.remove('error'));
        document.querySelectorAll('.input-error').forEach(el => {
            el.style.display = 'none';
            el.textContent = '';
        });
    }

    function setError(fieldId, message) {
        const group = document.getElementById(fieldId)?.closest('.form-group');
        const errorEl = document.querySelector(`[data-error-for="${fieldId}"]`);
        if (group) group.classList.add('error');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        }
    }

    function setPincodeStatus(type, message) {
        if (!pincodeStatus) return;
        pincodeStatus.classList.remove('pending', 'success', 'error');
        if (type) {
            pincodeStatus.classList.add(type);
            pincodeStatus.textContent = message;
            pincodeStatus.style.display = 'block';
        } else {
            pincodeStatus.textContent = '';
            pincodeStatus.style.display = 'none';
        }
    }

    async function checkPincodeServiceability(options = {}) {
        const raw = pincodeInput?.value || '';
        const pincode = raw.replace(/\D/g, '').trim();
        const cod = options.cod === true;
        if (pincode.length !== 6) {
            if (cod) {
                codPincodeServiceable = null;
            } else {
                pincodeServiceable = null;
            }
            setPincodeStatus(null, '');
            return null;
        }

        const qty = getSelectedQuantity() || 1;
        const weight = Number((0.15 * qty).toFixed(2));

        setPincodeStatus('pending', 'Checking availability...');
        try {
            const response = await fetch('/api/check-pincode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pincode,
                    weight,
                    cod
                })
            });

            if (!response.ok) {
                throw new Error('Serviceability check failed');
            }

            const result = await response.json();
            if (cod) {
                codPincodeServiceable = !!result.serviceable;
            } else {
                pincodeServiceable = !!result.serviceable;
            }

            // Auto-fill city and state if available
            if (result.city && result.state) {
                document.getElementById('city').value = result.city;
                document.getElementById('state').value = result.state;
            }

            const activeServiceability = cod ? codPincodeServiceable : pincodeServiceable;
            if (activeServiceability) {
                const courierCount = result.courier_count || 0;
                setPincodeStatus('success', cod
                    ? `COD available${courierCount ? ` (${courierCount} couriers)` : ''}.`
                    : `Delivery available${courierCount ? ` (${courierCount} couriers)` : ''}.`);
            } else {
                setPincodeStatus('error', cod ? 'COD not available for this pincode.' : 'Delivery not available yet.');
            }
            return activeServiceability;
        } catch (error) {
            if (cod) {
                codPincodeServiceable = null;
            } else {
                pincodeServiceable = null;
            }
            setPincodeStatus('error', 'Could not verify pincode.');
            return null;
        }
    }

    function setStep(step) {
        currentStep = step;
        stepperSteps.forEach((el) => {
            const stepNumber = Number(el.getAttribute('data-step'));
            el.classList.toggle('active', stepNumber === step);
            el.classList.toggle('completed', stepNumber < step);
        });
        stepPanes.forEach((pane) => {
            const paneNumber = Number(pane.getAttribute('data-step-pane'));
            pane.classList.toggle('active', paneNumber === step);
            if (paneNumber === step) {
                pane.style.opacity = '0';
                pane.style.transform = 'translateY(10px)';
                requestAnimationFrame(() => {
                    pane.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
                    pane.style.opacity = '1';
                    pane.style.transform = 'translateY(0)';
                });
            } else {
                pane.style.transition = 'none';
            }
        });
        updatePricingUI();
        updateStep1CTA();
    }

    function updateStep1CTA() {
        if (!nextStepBtn) return;
        const phoneDigits = (phoneInput?.value || '').replace(/\D/g, '');
        const qty = getSelectedQuantity();
        const isReady = phoneDigits.length === 10 && !!qty;
        nextStepBtn.disabled = !isReady;
        nextStepBtn.setAttribute('aria-disabled', String(!isReady));
    }

    function validateStep1() {
        const phone = document.getElementById('phone').value.trim();
        const qty = getSelectedQuantity();

        clearErrors();

        const phoneDigits = phone.replace(/\D/g, '');
        if (phoneDigits.length < 10) {
            setError('phone', 'Please add a 10-digit phone number.');
            return false;
        }

        if (!qty) {
            setError('quantity', 'Select the number of jars.');
            return false;
        }

        return true;
    }

    function validateStep2() {
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const address1 = document.getElementById('address1').value.trim();
        const city = document.getElementById('city').value.trim();
        const state = document.getElementById('state').value.trim();
        const pincode = document.getElementById('pincode').value.replace(/\D/g, '').trim();

        let valid = true;
        clearErrors();

        if (name.length < 2) {
            setError('name', 'Please enter your full name.');
            valid = false;
        }

        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!emailValid) {
            setError('email', 'Add a valid email so we can share batch updates.');
            valid = false;
        }

        if (address1.length < 5) {
            setError('address1', 'Please add your street and house details.');
            valid = false;
        }
        if (city.length < 2) {
            setError('city', 'Add your city.');
            valid = false;
        }
        if (state.length < 2) {
            setError('state', 'Add your state.');
            valid = false;
        }
        if (pincode.length !== 6) {
            setError('pincode', 'Enter a 6-digit pincode.');
            valid = false;
        }

        if (pincode.length === 6 && pincodeServiceable === false) {
            setError('pincode', 'This pincode is not serviceable yet.');
            valid = false;
        }
        return valid;
    }

    function openModal() {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (quantityInput) {
            quantityInput.value = '';
        }
        setStep(1);
        isModalOpen = true;
        lastFocusedElement = document.activeElement;
        document.addEventListener('keydown', handleModalKeydown);

        // Track ViewContent event (CTA click / modal open) - non-blocking
        const savedPhone = localStorage.getItem('amrutbaa_phone');
        if (trackMetaViewContent) {
            trackMetaViewContent(savedPhone).catch(err => console.warn('Meta ViewContent tracking failed:', err));
        }

        // Restore phone from localStorage if exists
        if (savedPhone) {
            phoneInput.value = savedPhone;
        }

        updateStep1CTA();
        setTimeout(() => {
            phoneInput?.focus();
        }, 0);

        // Visual update for quantity buttons based on current value
        const currentQty = getSelectedQuantity();
        qtyButtons.forEach(btn => {
            const btnQty = parseInt(btn.getAttribute('data-qty'));
            if (currentQty && btnQty === currentQty) {
                btn.style.background = 'linear-gradient(135deg, #D4AF37 0%, #E0BD4D 100%)';
                btn.style.borderColor = '#D4AF37';
                btn.style.color = '#4A4A4A';
            } else {
                btn.style.background = '#fff';
                btn.style.borderColor = 'rgba(107, 44, 44, 0.2)';
                btn.style.color = '#6B2C2C';
            }
        });

        const pricing = currentQty ? calculatePricing(currentQty) : { total: 0, unitPrice: pricingConfig.unitPrice, qty: 0 };

        // Track modal open (Begin Checkout)
        window.dataLayer = window.dataLayer || [];
        dataLayer.push({
            'event': 'begin_checkout',
            'ecommerce': {
                'currency': 'INR',
                'value': pricing.total,
                'items': [{
                    'item_id': 'amrutbaa-chutney',
                    'item_name': 'Amrutbaa Chilly Garlic Chutney',
                    'item_category': 'Condiment',
                    'item_brand': 'Amrut Baa',
                    'price': pricing.unitPrice,
                    'quantity': pricing.qty
                }]
            }
        });
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        isModalOpen = false;
        document.removeEventListener('keydown', handleModalKeydown);
        if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
            lastFocusedElement.focus();
        }
        lastFocusedElement = null;

        // Track modal close / abandonment
        const currentStep = modal.querySelector('.step-pane.active')?.dataset?.step || '1';
        window.dataLayer = window.dataLayer || [];
        dataLayer.push({
            'event': 'checkout_abandoned',
            'abandonment_step': `step_${currentStep}`,
            'form_name': 'registration_form'
        });
    }

    function handleModalKeydown(e) {
        if (!isModalOpen) return;
        if (e.key === 'Escape') {
            closeModal();
            return;
        }

        if (e.key === 'Tab') {
            const focusableSelectors = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
            const focusableElements = Array.from(modal.querySelectorAll(focusableSelectors))
                .filter((el) => !el.hasAttribute('disabled'));
            if (focusableElements.length === 0) {
                e.preventDefault();
                return;
            }
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }

    // Event listeners
    closeModalBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);

    // Handle quantity buttons (1-5 grid)
    const qtyButtons = document.querySelectorAll('.qty-button');
    qtyButtons.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const qty = parseInt(btn.getAttribute('data-qty'));
            quantityInput.value = qty;

            // Visual feedback
            qtyButtons.forEach(b => {
                b.style.background = '#fff';
                b.style.borderColor = 'rgba(107, 44, 44, 0.2)';
                b.style.color = '#6B2C2C';
            });
            btn.style.background = 'linear-gradient(135deg, #D4AF37 0%, #E0BD4D 100%)';
            btn.style.borderColor = '#D4AF37';
            btn.style.color = '#4A4A4A';

            updatePricingUI();
            pincodeServiceable = null;
            updateStep1CTA();
        });
    });

    // Phone input with auto-advance on valid entry
    const phoneInput = document.getElementById('phone');
    phoneInput?.addEventListener('input', (e) => {
        const phoneValue = e.target.value.replace(/\D/g, '');
        e.target.value = phoneValue;

        // Auto-advance when exactly 10 digits entered
        if (phoneValue.length === 10) {
            clearErrors();
            if (validateStep1()) {
                setTimeout(() => {
                    // Track Step 1 completion
                    window.dataLayer = window.dataLayer || [];
                    dataLayer.push({
                        'event': 'form_step_1_complete',
                        'form_name': 'registration_form',
                        'step': 'phone_submit',
                        'phone_verified': true
                    });

                    // Save phone to localStorage for future visits
                    localStorage.setItem('amrutbaa_phone', phoneValue);

                    setStep(2);

                    // Track Step 2 start
                    dataLayer.push({
                        'event': 'form_step_2_start',
                        'form_name': 'registration_form',
                        'step': 'details_form'
                    });

                    // Focus on first field of Step 2
                    document.getElementById('name')?.focus();
                }, 300);
            }
        }

        updateStep1CTA();
    });

    nextStepBtn?.addEventListener('click', () => {
        if (validateStep1()) {
            window.dataLayer = window.dataLayer || [];
            const phoneValue = document.getElementById('phone').value;
            dataLayer.push({
                'event': 'form_step_1_complete',
                'form_name': 'registration_form',
                'step': 'phone_submit',
                'phone_verified': phoneValue.length === 10
            });

            // Save phone to localStorage
            localStorage.setItem('amrutbaa_phone', phoneValue.replace(/\D/g, ''));

            // Get quantity and calculate value for tracking
            const quantity = getSelectedQuantity();
            const pricing = calculatePricing(quantity);

            // Track AddToCart event (Jar reserved / quantity selected)
            trackMetaAddToCart(null, quantity, pricing.total).catch(err => console.warn('Meta AddToCart tracking failed:', err));

            setStep(2);

            dataLayer.push({
                'event': 'form_step_2_start',
                'form_name': 'registration_form',
                'step': 'details_form'
            });
        }
    });

    prevStepBtn?.addEventListener('click', () => setStep(1));

    quantityInput?.addEventListener('change', () => {
        updatePricingUI();
        updateStep1CTA();
    });
    quantityInput?.addEventListener('input', () => {
        updatePricingUI();
        updateStep1CTA();
    });
    pincodeInput?.addEventListener('input', () => {
        pincodeServiceable = null;
        codPincodeServiceable = null;
        if (pincodeCheckTimer) {
            clearTimeout(pincodeCheckTimer);
        }
        const pincode = pincodeInput.value.replace(/\D/g, '').trim();
        if (pincode.length === 6) {
            pincodeCheckTimer = setTimeout(() => {
                checkPincodeServiceability({ cod: isCodSelected });
            }, 400);
        } else {
            setPincodeStatus(null, '');
        }
    });

    pincodeInput?.addEventListener('blur', () => {
        checkPincodeServiceability({ cod: isCodSelected });
    });

    paymentMethodOnline?.addEventListener('change', () => {
        isCodSelected = false;
        updatePricingUI();
        if ((pincodeInput?.value || '').replace(/\D/g, '').trim().length === 6) {
            checkPincodeServiceability({ cod: false });
        }
        if (submitBtn) submitBtn.textContent = 'Reserve & Pay Securely';
    });

    paymentMethodCod?.addEventListener('change', () => {
        isCodSelected = true;
        updatePricingUI();
        if ((pincodeInput?.value || '').replace(/\D/g, '').trim().length === 6) {
            checkPincodeServiceability({ cod: true });
        }
        if (submitBtn) submitBtn.textContent = 'Reserve & Pay on Delivery';
    });

    // Form submission with Razorpay payment
    registrationForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            quantity: parseInt(document.getElementById('quantity').value),
            address1: document.getElementById('address1').value,
            address2: document.getElementById('address2').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            pincode: document.getElementById('pincode').value,
            payment_method: document.querySelector('input[name="payment_method"]:checked')?.value || 'online'
        };

        if (!validateStep2()) {
            return;
        }

        // Track InitiateCheckout event (Delivery address entered)
        const quantity = formData.quantity || 1;
        const pricing = calculatePricing(quantity);
        trackMetaInitiateCheckout(formData, quantity, pricing.total).catch(err => console.warn('Meta InitiateCheckout tracking failed:', err));

        // Track AddPaymentInfo event to Meta (form submission - ready to pay)
        trackMetaAddPaymentInfo(formData, 0).catch(err => console.warn('Meta addpaymentinfo tracking failed:', err));

        const submitBtn = registrationForm.querySelector('.btn-primary-solid[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Initializing Payment...';
        submitBtn.disabled = true;
        submitBtn.classList.add('is-loading');
        submitBtn.setAttribute('aria-busy', 'true');

        try {
            const pricing = calculatePricing(formData.quantity);
            const pricePerJar = pricing.unitPrice;
            const totalAmount = pricing.total;

            // For COD, skip Razorpay and create order directly
            if (formData.payment_method === 'cod') {
                const codServiceable = await checkPincodeServiceability({ cod: true });
                if (codServiceable !== true) {
                    setError('pincode', 'COD is not serviceable on this pincode. Please choose Pay Now.');
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('is-loading');
                    submitBtn.setAttribute('aria-busy', 'false');
                    return;
                }

                // Create COD order via Worker
                const codClientOrderRef = `COD-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
                const codOrderResponse = await fetch('/api/create-order-cod', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        customer_name: formData.name,
                        customer_email: formData.email,
                        customer_phone: formData.phone,
                        address1: formData.address1,
                        address2: formData.address2,
                        city: formData.city,
                        state: formData.state,
                        pincode: formData.pincode,
                        quantity: formData.quantity,
                        amount: totalAmount,
                        unit_price: pricePerJar,
                        base_total: pricing.baseTotal,
                        discount: 0,
                        client_order_ref: codClientOrderRef
                    })
                });

                if (!codOrderResponse.ok) {
                    let codErrorMessage = 'Failed to create COD order';
                    try {
                        const codErrorResult = await codOrderResponse.json();
                        codErrorMessage = codErrorResult?.error || codErrorResult?.message || codErrorMessage;
                    } catch (_) {
                        // Keep fallback message when response body is not JSON.
                    }
                    throw new Error(codErrorMessage);
                }

                const codResult = await codOrderResponse.json();

                // Track Purchase event to GA4 for COD with payment_method
                window.dataLayer = window.dataLayer || [];
                dataLayer.push({
                    'event': 'purchase',
                    'payment_method': 'cod',
                    'ecommerce': {
                        'transaction_id': codResult.order_id || `COD-${Date.now()}`,
                        'value': totalAmount,
                        'tax': 0,
                        'shipping': 0,
                        'currency': 'INR',
                        'coupon': '',
                        'items': [{
                            'item_id': 'amrutbaa-chutney',
                            'item_name': 'Amrutbaa Chilly Garlic Chutney',
                            'item_category': 'Condiment',
                            'item_brand': 'Amrut Baa',
                            'price': pricePerJar,
                            'quantity': formData.quantity
                        }]
                    },
                    'order_id': codResult.order_id || `COD-${Date.now()}`,
                    'payment_id': codResult.shipment_id || '',
                    'customer_email': formData.email,
                    'customer_phone': formData.phone,
                    'customer_city': formData.city,
                    'customer_state': formData.state,
                    'shipping_pincode': formData.pincode
                });

                // Track Purchase event to Meta for COD with payment_method
                const codOrderId = String(codResult.order_id || `COD-${Date.now()}`);
                const sharedEventId = generateEventId();

                trackMetaPurchase(formData, totalAmount, codOrderId, sharedEventId).catch(() => { });

                // Update success message
                document.getElementById('order-number').textContent = codOrderId.substring(0, 15) + '...';
                document.getElementById('order-amount').textContent = `₹${totalAmount}`;

                // Show success message immediately
                successMessage.classList.add('show');
                registrationForm.style.display = 'none !important';
                registrationForm.hidden = true;

                // 🔒 Prevent duplicate tracking for same order
                if (processedOrders.has(codOrderId)) {
                    console.warn('⚠️ Order already processed:', codOrderId);
                    return;
                }
                processedOrders.add(codOrderId);
                saveProcessedOrders();

                // Submit order to n8n in background
                submitOrderDetails({
                    ...formData,
                    payment_type: 'cod',
                    order_id: codOrderId,
                    amount: totalAmount,
                    event_id: sharedEventId,
                    tracking_number: codResult.awb_code || null,
                    shipment_id: codResult.shipment_id || null,
                    courier_name: codResult.courier_name || null
                }).catch(() => { });

                // Redirect to thank-you page after 2 seconds
                setTimeout(() => {
                    const params = new URLSearchParams({
                        order: codOrderId,
                        amount: totalAmount,
                        method: 'cod',
                        event_id: sharedEventId
                    });
                    window.location.href = `/thank-you.html?${params.toString()}`;
                }, 2000);

                return;
            }

            // RAZORPAY FLOW (existing code)

            // Track Add to Cart / Package Selection
            window.dataLayer = window.dataLayer || [];
            dataLayer.push({
                'event': 'add_to_cart',
                'payment_type': 'razorpay',
                'ecommerce': {
                    'currency': 'INR',
                    'value': totalAmount,
                    'coupon': pricing.offer ? pricing.offer.label : '',
                    'items': [{
                        'item_id': 'amrutbaa-chutney',
                        'item_name': 'Amrutbaa Chilly Garlic Chutney',
                        'item_category': 'Condiment',
                        'item_brand': 'Amrut Baa',
                        'price': pricePerJar,
                        'quantity': formData.quantity
                    }]
                }
            });

            // Track Shipping Info Added
            dataLayer.push({
                'event': 'add_shipping_info',
                'payment_type': 'razorpay',
                'ecommerce': {
                    'currency': 'INR',
                    'value': totalAmount,
                    'shipping_tier': 'Standard',
                    'items': [{
                        'item_id': 'amrutbaa-chutney',
                        'item_name': 'Amrutbaa Chilly Garlic Chutney',
                        'item_category': 'Condiment',
                        'item_brand': 'Amrut Baa',
                        'price': pricePerJar,
                        'quantity': formData.quantity
                    }]
                },
                'shipping_city': formData.city,
                'shipping_state': formData.state,
                'shipping_pincode': formData.pincode
            });

            // Create order via Cloudflare Worker
            const orderResponse = await fetch('/api/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: totalAmount,
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    quantity: formData.quantity
                })
            });

            if (!orderResponse.ok) {
                throw new Error('Failed to create order');
            }

            const order = await orderResponse.json();

            // Track Payment Info Added (Razorpay modal about to open)
            dataLayer.push({
                'event': 'add_payment_info',
                'payment_type': 'razorpay',
                'ecommerce': {
                    'currency': 'INR',
                    'value': totalAmount,
                    'coupon': pricing.offer ? pricing.offer.label : '',
                    'items': [{
                        'item_id': 'amrutbaa-chutney',
                        'item_name': 'Amrutbaa Chilly Garlic Chutney',
                        'item_category': 'Condiment',
                        'item_brand': 'Amrut Baa',
                        'price': pricePerJar,
                        'quantity': formData.quantity
                    }]
                }
            });

            // Configure Razorpay options
            const razorpayOptions = {
                key: 'rzp_live_S9MRd6GMVrZZqY',
                amount: order.amount,
                currency: 'INR',
                name: 'Amrutbaa Ni Chutney',
                description: `Batch Registration - ${formData.quantity} jar${formData.quantity > 1 ? 's' : ''}`,
                order_id: order.id,
                handler: async function (response) {
                    // Payment successful
                    // Verify payment signature via backend
                    try {
                        const verifyResponse = await fetch('/api/verify-payment', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            })
                        });

                        const verifyResult = await verifyResponse.json();

                        if (verifyResult.success) {
                            // 🎯 CRITICAL: Track Purchase (Conversion Event) with payment_method
                            window.dataLayer = window.dataLayer || [];
                            dataLayer.push({
                                'event': 'purchase',
                                'payment_method': 'online',
                                'ecommerce': {
                                    'transaction_id': response.razorpay_order_id,
                                    'value': totalAmount,
                                    'tax': 0,
                                    'shipping': 0,
                                    'currency': 'INR',
                                    'coupon': pricing.offer ? pricing.offer.label : '',
                                    'items': [{
                                        'item_id': 'amrutbaa-chutney',
                                        'item_name': 'Amrutbaa Chilly Garlic Chutney',
                                        'item_category': 'Condiment',
                                        'item_brand': 'Amrut Baa',
                                        'price': pricePerJar,
                                        'quantity': formData.quantity
                                    }]
                                },
                                'order_id': response.razorpay_order_id,
                                'payment_id': response.razorpay_payment_id,
                                'customer_email': formData.email,
                                'customer_phone': formData.phone,
                                'customer_city': formData.city,
                                'customer_state': formData.state,
                                'shipping_pincode': formData.pincode
                            });

                            // Update success message with ALL order details
                            const onlineOrderId = String(response.razorpay_order_id || '');
                            document.getElementById('order-number').textContent = onlineOrderId.substring(0, 15) + '...';
                            document.getElementById('order-amount').textContent = `₹${totalAmount}`;

                            // Show success message IMMEDIATELY
                            successMessage.classList.add('show');
                            registrationForm.style.display = 'none !important';
                            registrationForm.hidden = true;

                            // 🔒 Prevent duplicate tracking for same order
                            if (processedOrders.has(response.razorpay_payment_id)) {
                                console.warn('⚠️ Order already processed:', response.razorpay_payment_id);
                                return;
                            }
                            processedOrders.add(response.razorpay_payment_id);
                            saveProcessedOrders();

                            // Create shipment directly from worker to avoid losing orders if n8n is down.
                            const trackingInfo = await createShiprocketShipment({
                                order_id: response.razorpay_order_id,
                                payment_id: response.razorpay_payment_id,
                                customer_name: formData.name,
                                customer_email: formData.email,
                                customer_phone: formData.phone,
                                address1: formData.address1,
                                address2: formData.address2,
                                city: formData.city,
                                state: formData.state,
                                pincode: formData.pincode,
                                quantity: formData.quantity,
                                amount: totalAmount,
                                unit_price: pricePerJar,
                                base_total: pricing.baseTotal,
                                discount: pricing.discount || 0
                            }, {
                                order_id: response.razorpay_order_id,
                                payment_id: response.razorpay_payment_id,
                                customer_email: formData.email,
                                customer_phone: formData.phone
                            });

                            const sharedEventId = generateEventId();

                            submitOrderDetails({
                                ...formData,
                                payment_id: response.razorpay_payment_id,
                                order_id: response.razorpay_order_id,
                                amount: totalAmount,
                                event_id: sharedEventId,
                                tracking_number: trackingInfo?.awb_code || null,
                                shipment_id: trackingInfo?.shipment_id || null,
                                courier_name: trackingInfo?.courier_name || null
                            }).catch(() => { });

                            // Let n8n handle tracking display after shipment creation
                            setTimeout(() => {
                                // Attempt to fetch tracking info from n8n response
                                // For now, show message that tracking details coming soon
                                const trackBtn = document.getElementById('track-order-btn');
                                if (trackBtn) {
                                    trackBtn.style.display = 'block';
                                    trackBtn.textContent = '📧 Tracking Details Coming Soon';
                                    trackBtn.style.background = '#FF9800';
                                    trackBtn.disabled = true;
                                    trackBtn.title = 'Courier will be assigned within 2-4 hours. Check email for tracking.';
                                }
                                document.getElementById('tracking-section').style.display = 'none';
                            }, 500);

                            // Redirect to thank-you page after 2 seconds
                            setTimeout(() => {
                                const params = new URLSearchParams({
                                    order: response.razorpay_order_id,
                                    amount: totalAmount,
                                    method: 'online',
                                    event_id: sharedEventId
                                });
                                window.location.href = `/thank-you.html?${params.toString()}`;
                            }, 2000);
                        } else {
                            alert('Payment verification failed. Please contact support.');
                            submitBtn.textContent = originalText;
                            submitBtn.disabled = false;
                            submitBtn.classList.remove('is-loading');
                            submitBtn.setAttribute('aria-busy', 'false');

                            // Track payment failure
                            window.dataLayer = window.dataLayer || [];
                            dataLayer.push({
                                'event': 'payment_failed',
                                'error_message': 'Payment verification failed',
                                'payment_method': 'razorpay',
                                'order_value': totalAmount
                            });
                        }
                    } catch (error) {
                        alert('Payment verification error. Please contact support with your payment ID.');
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                        submitBtn.classList.remove('is-loading');
                        submitBtn.setAttribute('aria-busy', 'false');

                        // Track payment error
                        window.dataLayer = window.dataLayer || [];
                        dataLayer.push({
                            'event': 'payment_failed',
                            'error_message': error.message || 'Payment verification error',
                            'payment_method': 'razorpay',
                            'order_value': totalAmount
                        });
                    }
                },
                prefill: {
                    name: formData.name,
                    email: formData.email,
                    contact: formData.phone
                },
                notes: {
                    address: `${formData.address1}, ${formData.address2}, ${formData.city}, ${formData.state} - ${formData.pincode}`
                },
                theme: {
                    color: '#6B1C23'
                },
                modal: {
                    ondismiss: function () {
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                        submitBtn.classList.remove('is-loading');
                        submitBtn.setAttribute('aria-busy', 'false');

                        // Track payment cancellation
                        window.dataLayer = window.dataLayer || [];
                        dataLayer.push({
                            'event': 'payment_cancelled',
                            'cancellation_step': 'payment_gateway',
                            'order_value': totalAmount,
                            'payment_method': 'razorpay'
                        });
                    }
                }
            };

            // Open Razorpay checkout
            const rzp = new Razorpay(razorpayOptions);
            rzp.open();

            // Reset button state immediately after opening
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            submitBtn.classList.remove('is-loading');
            submitBtn.setAttribute('aria-busy', 'false');

        } catch (error) {
            const paymentMethod = document.querySelector('input[name="payment_method"]:checked')?.value || 'online';
            if (paymentMethod === 'cod') {
                alert(error?.message || 'Could not place COD order. Please try again or choose Pay Now.');
            } else {
                alert('Failed to initialize payment. Please try again.');
            }
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            submitBtn.classList.remove('is-loading');
            submitBtn.setAttribute('aria-busy', 'false');
        }
    });

    // Helper function to submit order details in background
    // Generate unique event ID for deduplication between Pixel and Conversions API
    function generateEventId() {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Helper function to get cookie value
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    // Track ViewContent Event to Meta (CTA click / modal open)
    async function trackMetaViewContent(phone) {
        try {
            const eventId = generateEventId();

            // Fire Meta Pixel event
            if (typeof fbq === 'function') {
                fbq('track', 'ViewContent', {
                    content_name: 'Amrut Baa Chilly Garlic Chutney',
                    content_type: 'product',
                    content_ids: ['AMB-CGC-100G'],
                    currency: 'INR',
                    value: 499
                }, { eventID: eventId });
            }

            const response = await fetch('/api/track-view', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: phone || '',
                    fbc: getCookie('_fbc'),
                    fbp: getCookie('_fbp'),
                    event_id: eventId,
                    test_event_code: window.META_TEST_EVENT_CODE
                })
            });

            const result = await response.json();
            console.log('✅ ViewContent tracked to Meta', result);
            return result;
        } catch (error) {
            console.error('ViewContent tracking error:', error);
            throw error;
        }
    }

    // Track AddToCart Event to Meta (Jar quantity selected)
    async function trackMetaAddToCart(formData, quantity, value) {
        try {
            const eventId = generateEventId();

            // Fire Meta Pixel event
            if (typeof fbq === 'function') {
                fbq('track', 'AddToCart', {
                    content_name: 'Amrut Baa Chilly Garlic Chutney',
                    content_type: 'product',
                    content_ids: ['AMB-CGC-100G'],
                    currency: 'INR',
                    value: value || 0,
                    num_items: quantity || 1
                }, { eventID: eventId });
            }

            const response = await fetch('/api/track-addtocart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quantity: quantity || 1,
                    value: value || 0,
                    email: formData?.email || '',
                    phone: formData?.phone || '',
                    postcode: formData?.pincode || '',
                    city: formData?.city || '',
                    fbc: getCookie('_fbc'),
                    fbp: getCookie('_fbp'),
                    event_id: eventId,
                    test_event_code: window.META_TEST_EVENT_CODE
                })
            });

            const result = await response.json();
            console.log('✅ AddToCart tracked to Meta', result);
            return result;
        } catch (error) {
            console.error('AddToCart tracking error:', error);
            throw error;
        }
    }

    // Track InitiateCheckout Event to Meta (Delivery address entry)
    async function trackMetaInitiateCheckout(formData, quantity, value) {
        try {
            const eventId = generateEventId();

            // Fire Meta Pixel event
            if (typeof fbq === 'function') {
                fbq('track', 'InitiateCheckout', {
                    content_name: 'Amrut Baa Chilly Garlic Chutney',
                    content_type: 'product',
                    content_ids: ['AMB-CGC-100G'],
                    currency: 'INR',
                    value: value || 0,
                    num_items: quantity || 1
                }, { eventID: eventId });
            }

            const response = await fetch('/api/track-initiate-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quantity: quantity || 1,
                    value: value || 0,
                    email: formData?.email || '',
                    phone: formData?.phone || '',
                    postcode: formData?.pincode || '',
                    city: formData?.city || '',
                    fbc: getCookie('_fbc'),
                    fbp: getCookie('_fbp'),
                    event_id: eventId,
                    test_event_code: window.META_TEST_EVENT_CODE
                })
            });

            const result = await response.json();
            console.log('✅ InitiateCheckout tracked to Meta', result);
            return result;
        } catch (error) {
            console.error('InitiateCheckout tracking error:', error);
            throw error;
        }
    }

    // Helper function to submit order details in background
    // Track AddPaymentInfo Event to Meta (form submission - ready to pay)
    async function trackMetaAddPaymentInfo(formData, amount) {
        try {
            const eventId = generateEventId();

            // Note: AddPaymentInfo is standard Meta event, but not tracked by default Pixel
            // Only sending via Conversions API for server-side tracking

            const response = await fetch('/api/track-addpaymentinfo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    quantity: formData.quantity || 1,
                    fbc: getCookie('_fbc'),
                    fbp: getCookie('_fbp'),
                    event_id: eventId,
                    test_event_code: window.META_TEST_EVENT_CODE || undefined
                })
            });

            if (response.ok) {
                console.log('✅ AddPaymentInfo tracked to Meta');
                return true;
            } else {
                console.warn('⚠️ Failed to track addpaymentinfo');
                return false;
            }
        } catch (error) {
            console.error('❌ AddPaymentInfo tracking error:', error);
            return false;
        }
    }

    // Track Purchase Event to Meta (successful payment)
    async function trackMetaPurchase(formData, amount, paymentId, eventIdOverride) {
        try {
            const eventId = eventIdOverride || generateEventId();

            // Determine payment method from current form state
            const paymentMethodRadio = document.querySelector('input[name="payment_method"]:checked');
            const paymentMethod = paymentMethodRadio ? paymentMethodRadio.value : 'unknown';

            // ✅ ONLY using Conversions API (server-side) to avoid duplicate tracking
            // Meta will handle deduplication via event_id
            const response = await fetch('/api/track-purchase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    amount: amount,
                    quantity: formData.quantity || 1,
                    payment_id: paymentId,
                    payment_method: paymentMethod,
                    postcode: formData.pincode || '',
                    city: formData.city || '',
                    fbc: getCookie('_fbc'),
                    fbp: getCookie('_fbp'),
                    event_id: eventId,
                    test_event_code: window.META_TEST_EVENT_CODE || undefined
                })
            });

            if (response.ok) {
                console.log('✅ Purchase tracked to Meta');
                return true;
            } else {
                console.warn('⚠️ Failed to track purchase');
                return false;
            }
        } catch (error) {
            console.error('❌ Purchase tracking error:', error);
            return false;
        }
    }

    async function createShiprocketShipmentWithRetry(payload) {
        const maxAttempts = 3;
        for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
            try {
                const response = await fetch('/api/create-shipment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    const data = await response.json();
                    return data.success ? data : null;
                }

                const errorText = await response.text();
                if (attempt === maxAttempts) {
                    console.warn('⚠️ Direct Shiprocket creation failed:', errorText);
                }
            } catch (error) {
                if (attempt === maxAttempts) {
                    console.warn('⚠️ Direct Shiprocket creation error:', error);
                }
            }

            await new Promise((resolve) => setTimeout(resolve, attempt * 700));
        }

        return null;
    }

    async function createShiprocketShipment(payload, alertContext) {
        try {
            const result = await createShiprocketShipmentWithRetry(payload);
            if (result) {
                return result;
            }
            await notifyOpsShipmentFailure({
                reason: 'shiprocket_creation_failed_after_retries',
                ...alertContext
            });
            return null;
        } catch (error) {
            await notifyOpsShipmentFailure({
                reason: 'shiprocket_creation_unhandled_error',
                error: error?.message || 'unknown_error',
                ...alertContext
            });
            return null;
        }
    }

    async function notifyOpsShipmentFailure(payload) {
        try {
            await fetch('/api/ops-alert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    alert_type: 'shipment_creation_failure',
                    source: 'frontend_checkout',
                    created_at: new Date().toISOString(),
                    ...payload
                })
            });
        } catch (error) {
            console.warn('⚠️ Failed to notify ops alert endpoint:', error);
        }
    }

    async function submitOrderDetails(orderData) {
        try {
            // Send as JSON POST - this runs in background, doesn't block UI
            // n8n will handle:
            // 1. Track Purchase to Meta (Conversions API) using event_id for deduplication
            // 2. Send order confirmation email
            const eventId = orderData.event_id || generateEventId();

            const response = await fetch('https://n8n.prinkit.cloud/webhook/order_form', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...orderData,
                    event_id: eventId,
                    source: 'frontend_checkout'
                })
            });

            if (response.ok) {
                return true;
            } else {
                // Don't fail - order is already confirmed to customer
                return false;
            }
        } catch (error) {
            // Don't fail - order is already confirmed to customer
            return false;
        }
    }

    // Public API: Return object with openModal function
    return {
        open: openModal,
        close: closeModal
    };
}

// Export for use
window.OrderModal = initOrderModal();
