/**
 * Modal Registration Component
 * Self-contained, reusable modal form for batch registration
 * 
 * Usage:
 *   <script src="assets/js/modal-component.js"></script>
 *   <script>initOrderModal();</script>
 */

function initOrderModal() {
    // Check if already initialized
    if (document.getElementById('registrationModal')) {
        return;
    }

    // Inject CSS
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1000;
        }

        .modal.active {
            display: flex;
        }

        .modal.active .modal-overlay {
            animation: fadeIn 0.3s ease;
        }

        .modal.active .modal-content {
            animation: slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(40px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            cursor: pointer;
        }

        .modal-content {
            position: relative;
            background: linear-gradient(135deg, #FAF7F2 0%, #F5EFE4 100%);
            border-radius: 16px;
            width: 90%;
            max-width: 550px;
            max-height: 90vh;
            overflow-y: auto;
            margin: auto;
            padding: 2.5rem 2rem;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
        }

        .modal-close {
            position: absolute;
            top: 1.5rem;
            right: 1.5rem;
            background: transparent;
            border: none;
            font-size: 2rem;
            cursor: pointer;
            color: #6B2C2C;
            transition: transform 0.2s;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .modal-close:hover {
            transform: rotate(90deg);
        }

        .modal-header h2 {
            font-family: 'Playfair Display', serif;
            font-size: 2rem;
            color: #6B2C2C;
            margin-bottom: 0.5rem;
        }

        .modal-tagline {
            color: #4A4A4A;
            font-size: 0.95rem;
            margin-bottom: 2rem;
        }

        .modal-trust {
            display: flex;
            flex-wrap: wrap;
            gap: 0.6rem;
            margin-bottom: 1.25rem;
        }

        .trust-item {
            background: rgba(212, 175, 55, 0.12);
            border: 1px solid rgba(212, 175, 55, 0.25);
            color: #6B2C2C;
            padding: 0.35rem 0.75rem;
            border-radius: 999px;
            font-size: 0.78rem;
            font-weight: 600;
            letter-spacing: 0.2px;
        }

        .modal-price {
            display: flex;
            align-items: baseline;
            gap: 0.5rem;
            margin-bottom: 0.5rem;
        }

        .price-amount {
            font-size: 1.6rem;
            font-weight: 800;
            color: #6B2C2C;
        }

        .price-caption {
            font-size: 0.8rem;
            color: #4A4A4A;
            opacity: 0.9;
            font-weight: 600;
        }

        .modal-urgency {
            font-size: 0.85rem;
            color: #6B2C2C;
            background: rgba(212, 175, 55, 0.1);
            border: 1px solid rgba(212, 175, 55, 0.22);
            border-radius: 8px;
            padding: 0.6rem 0.8rem;
            margin-bottom: 1.25rem;
            line-height: 1.4;
        }

        .form-group.error input,
        .form-group.error textarea {
            border-color: #C0392B;
            box-shadow: 0 0 0 3px rgba(192, 57, 43, 0.12);
        }

        .input-error {
            color: #C0392B;
            font-size: 0.85rem;
            margin-top: 0.35rem;
            line-height: 1.3;
        }

        .stepper {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
            margin-bottom: 1.5rem;
        }

        .step {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            padding: 0.85rem 1rem;
            border: 2px solid #D4AF37;
            border-radius: 10px;
            background: rgba(212, 175, 55, 0.15);
            font-weight: 700;
            color: #6B2C2C;
            transition: all 0.3s ease;
        }

        .step-number {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            background: #D4AF37;
            color: #4A4A4A;
            display: grid;
            place-items: center;
            font-weight: 800;
        }

        .step-title {
            font-size: 0.95rem;
        }

        .step.active {
            background: linear-gradient(135deg, #D4AF37 0%, #E0BD4D 100%);
            color: #4A4A4A;
            box-shadow: 0 10px 24px rgba(212, 175, 55, 0.28);
        }

        .step.completed {
            border-color: #4CAF50;
            background: rgba(76, 175, 80, 0.08);
            color: #2E7D32;
        }

        .step-pane {
            display: none;
            animation: fadeInUp 0.3s ease;
        }

        .step-pane.active {
            display: block;
        }

        .step-actions {
            display: flex;
            justify-content: space-between;
            gap: 1rem;
            margin-top: 1rem;
        }

        .btn-secondary-outline {
            flex: 1;
            background: transparent;
            border: 2px solid #6B2C2C;
            color: #6B2C2C;
            padding: 0.95rem 1rem;
            border-radius: 6px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.25s ease;
        }

        .btn-secondary-outline:hover {
            background: #6B2C2C;
            color: #fff;
        }

        .btn-primary-solid {
            flex: 1;
            background: linear-gradient(135deg, #D4AF37 0%, #E0BD4D 100%);
            color: #4A4A4A;
            border: 2px solid #D4AF37;
            padding: 0.95rem 1rem;
            border-radius: 6px;
            font-weight: 800;
            cursor: pointer;
            transition: all 0.25s ease;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            box-shadow: 0 8px 20px rgba(212, 175, 55, 0.3);
        }

        .btn-primary-solid:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 28px rgba(212, 175, 55, 0.4);
        }

        .order-recap {
            background: rgba(212, 175, 55, 0.12);
            border: 1px solid rgba(212, 175, 55, 0.3);
            border-radius: 10px;
            padding: 1rem 1.1rem;
            margin-top: 0.5rem;
            color: #4A4A4A;
        }

        .order-recap strong {
            color: #6B2C2C;
        }

        .confidence-section {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 1rem;
            margin: 1.5rem 0 2rem 0;
        }

        .confidence-item {
            background: linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(212, 175, 55, 0.04) 100%);
            border: 1px solid rgba(212, 175, 55, 0.2);
            border-radius: 10px;
            padding: 1rem 0.9rem;
            text-align: center;
            transition: all 0.3s ease;
        }

        .confidence-item:hover {
            border-color: rgba(212, 175, 55, 0.4);
            background: linear-gradient(135deg, rgba(212, 175, 55, 0.12) 0%, rgba(212, 175, 55, 0.08) 100%);
            transform: translateY(-2px);
        }

        .confidence-icon {
            font-size: 1.8rem;
            margin-bottom: 0.5rem;
            display: block;
        }

        .confidence-title {
            font-size: 0.85rem;
            font-weight: 700;
            color: #6B2C2C;
            margin-bottom: 0.4rem;
            line-height: 1.3;
        }

        .confidence-description {
            font-size: 0.75rem;
            color: #4A4A4A;
            opacity: 0.8;
            line-height: 1.4;
        }

        @media (max-width: 768px) {
            .confidence-section {
                grid-template-columns: 1fr;
                gap: 0.8rem;
                margin: 1.2rem 0 1.5rem 0;
            }

            .confidence-item {
                padding: 0.85rem 0.75rem;
            }

            .confidence-icon {
                font-size: 1.6rem;
                margin-bottom: 0.35rem;
            }

            .confidence-title {
                font-size: 0.8rem;
            }

            .confidence-description {
                font-size: 0.7rem;
            }
        }

        .form-group {
            margin-bottom: 1.5rem;
        }

        .form-group label {
            display: block;
            font-weight: 600;
            color: #6B2C2C;
            margin-bottom: 0.5rem;
            font-size: 0.95rem;
        }

        .field-note {
            font-size: 0.85rem;
            color: #4A4A4A;
            opacity: 0.85;
            margin-top: 0.35rem;
            line-height: 1.4;
        }

        .form-group input,
        .form-group textarea {
            width: 100%;
            padding: 0.9rem 1rem;
            border: 2px solid #D4AF37;
            border-radius: 6px;
            font-family: 'Inter', sans-serif;
            font-size: 1rem;
            transition: all 0.3s;
            box-sizing: border-box;
        }

        .form-group input:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: #6B2C2C;
            box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.2);
        }

        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
        }

        .form-row .form-group {
            margin-bottom: 1.5rem;
        }

        .modal-submit {
            width: 100%;
            background: linear-gradient(135deg, #D4AF37 0%, #E0BD4D 100%);
            color: #4A4A4A;
            border: none;
            padding: 1rem;
            font-size: 1.05rem;
            font-weight: 800;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            box-shadow: 0 8px 20px rgba(212, 175, 55, 0.3);
        }

        .modal-submit:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 30px rgba(212, 175, 55, 0.4);
        }

        .secure-note {
            margin-top: 0.75rem;
            font-size: 0.8rem;
            color: #4A4A4A;
            text-align: center;
            opacity: 0.85;
        }

        .refund-note {
            margin-top: 0.35rem;
            font-size: 0.75rem;
            color: #4A4A4A;
            text-align: center;
            opacity: 0.75;
        }

        .success-message {
            display: none !important;
            text-align: center;
            color: #2B2B2B;
            font-weight: 600;
            margin-top: 1rem;
            padding: 2rem;
            background: linear-gradient(135deg, #f0f7f0 0%, #ffffff 50%, #e8f5e9 100%);
            border-radius: 12px;
            border: 2px solid #4CAF50;
            box-shadow: 0 8px 16px rgba(46, 125, 50, 0.15);
        }

        .success-message.show {
            display: block !important;
            animation: successPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .success-checkmark {
            display: flex;
            justify-content: center;
            margin-bottom: 1.5rem;
        }

        .checkmark-circle {
            width: 60px;
            height: 60px;
            background: #4CAF50;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 2.5rem;
            font-weight: 700;
            animation: checkmarkBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes checkmarkBounce {
            0% {
                transform: scale(0);
            }
            50% {
                transform: scale(1.1);
            }
            100% {
                transform: scale(1);
            }
        }

        #tracking-info {
            margin-top: 1rem;
            padding: 1rem;
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
            border-left: 4px solid #1976D2;
            border-radius: 4px;
            font-size: 0.9rem;
            line-height: 1.8;
            color: #0d47a1;
        }

        #tracking-info a {
            color: #1976D2;
            font-weight: 600;
            text-decoration: none;
            transition: opacity 0.3s;
        }

        #tracking-info a:hover {
            opacity: 0.8;
            text-decoration: underline;
        }

        @media (max-width: 768px) {
            .modal-content {
                padding: 2rem 1.5rem;
                max-height: 88vh;
            }

            .form-row {
                grid-template-columns: 1fr;
            }

            .step-pane {
                padding-bottom: 0.5rem;
            }

            .modal-trust {
                gap: 0.5rem;
            }

            .trust-item {
                font-size: 0.72rem;
            }

            .price-amount {
                font-size: 1.4rem;
            }

            .modal-close {
                top: 0.8rem;
                right: 0.8rem;
                font-size: 1.5rem;
                width: 30px;
                height: 30px;
            }
        }
    `;
    document.head.appendChild(styleSheet);

    // Create modal HTML
    const modalHTML = `
        <div class="modal" id="registrationModal">
            <div class="modal-overlay" id="modalOverlay"></div>
            <div class="modal-content">
                <button class="modal-close" id="closeModalBtn">&times;</button>
                
                <div class="modal-header">
                    <h2>Reserve Your Jar in This Week’s Batch</h2>
                    <p class="modal-tagline">Fresh prep begins Monday • Dispatch Tuesday • Delivered Wed–Fri</p>
                </div>

                <div class="modal-trust">
                    <span class="trust-item">4.9★ from 500+ families</span>
                    <span class="trust-item">No preservatives</span>
                    <span class="trust-item">Weekly fresh batch</span>
                </div>

                <div class="modal-price">
                    <span class="price-amount">₹349</span>
                    <span class="price-caption">per jar • Free shipping on all orders</span>
                </div>

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
                            <label for="phone">Phone Number *</label>
                            <input type="tel" id="phone" name="phone" placeholder="Enter your phone" required>
                            <p class="input-error" data-error-for="phone" style="display:none;"></p>
                            <p class="field-note">We’ll confirm your batch slot over WhatsApp/SMS.</p>
                        </div>
                        <input type="hidden" id="quantity" name="quantity" value="1">
                        <div class="step-actions">
                            <button type="button" class="btn-primary-solid" id="nextStepBtn">Continue →</button>
                        </div>
                    </div>

                    <div class="step-pane" data-step-pane="2">
                        <div class="order-recap">
                            <strong>Reserved:</strong> 1 fresh jar in this week's batch • Dispatch starts Monday after prep.
                        </div>

                        <div class="confidence-section">
                            <div class="confidence-item">
                                <span class="confidence-icon">✨</span>
                                <div class="confidence-title">7-Day Guarantee</div>
                                <div class="confidence-description">Not happy? Full refund, no questions asked.</div>
                            </div>
                            <div class="confidence-item">
                                <span class="confidence-icon">👥</span>
                                <div class="confidence-title">42 Reserved This Batch</div>
                                <div class="confidence-description">Join 500+ families who trust Amrutbaa.</div>
                            </div>
                            <div class="confidence-item">
                                <span class="confidence-icon">🔒</span>
                                <div class="confidence-title">100% Secure Payment</div>
                                <div class="confidence-description">Encrypted by Razorpay, card never stored.</div>
                            </div>
                        </div>

                        <div class="form-row" style="margin-top: 1.25rem;">
                            <div class="form-group">
                                <label for="name">Your Name *</label>
                                <input type="text" id="name" name="name" placeholder="Enter your name" required>
                                <p class="input-error" data-error-for="name" style="display:none;"></p>
                            </div>
                            <div class="form-group">
                                <label for="email">Email Address *</label>
                                <input type="email" id="email" name="email" placeholder="Enter your email" required>
                                <p class="input-error" data-error-for="email" style="display:none;"></p>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="address1">Address Line 1 *</label>
                            <input type="text" id="address1" name="address1" placeholder="House / flat number, street" required>
                            <p class="input-error" data-error-for="address1" style="display:none;"></p>
                        </div>
                        <div class="form-group">
                            <label for="address2">Address Line 2 (Optional)</label>
                            <input type="text" id="address2" name="address2" placeholder="Apartment, building, landmark">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="city">City *</label>
                                <input type="text" id="city" name="city" placeholder="City" required>
                                <p class="input-error" data-error-for="city" style="display:none;"></p>
                            </div>
                            <div class="form-group">
                                <label for="state">State *</label>
                                <input type="text" id="state" name="state" placeholder="State" required>
                                <p class="input-error" data-error-for="state" style="display:none;"></p>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="pincode">Pincode *</label>
                            <input type="text" id="pincode" name="pincode" placeholder="6-digit pincode" maxlength="6" required>
                            <p class="input-error" data-error-for="pincode" style="display:none;"></p>
                            <p class="field-note">We deliver right after the batch is prepared. Add landmarks to help the rider.</p>
                        </div>
                        <div class="step-actions">
                            <button type="button" class="btn-secondary-outline" id="prevStepBtn">← Back</button>
                            <button type="submit" class="btn-primary-solid">Reserve & Pay Securely</button>
                        </div>
                        <div class="refund-note">💬 Need to make a change? Contact us before Sunday 9 PM.</div>
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
    let currentStep = 1;

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
    }

    function validateStep1() {
        const phone = document.getElementById('phone').value.trim();

        clearErrors();

        const phoneDigits = phone.replace(/\D/g, '');
        if (phoneDigits.length < 10) {
            setError('phone', 'Please add a 10-digit phone number.');
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
        return valid;
    }

    function openModal() {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        setStep(1);
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    // Event listeners
    closeModalBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);

    nextStepBtn?.addEventListener('click', () => {
        if (validateStep1()) setStep(2);
    });

    prevStepBtn?.addEventListener('click', () => setStep(1));

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
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
            pincode: document.getElementById('pincode').value
        };

        if (!validateStep2()) {
            return;
        }

        const submitBtn = registrationForm.querySelector('.btn-primary-solid[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Initializing Payment...';
        submitBtn.disabled = true;

        try {
            // Price per jar (in rupees) - adjust this as needed
            const pricePerJar = 349;
            const totalAmount = formData.quantity * pricePerJar;

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
                    console.log('✅ Payment successful:', response);

                    // Verify payment signature via backend
                    try {
                        console.log('Verifying payment signature...');
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
                        console.log('Verification result:', verifyResult);

                        if (verifyResult.success) {
                            console.log('✅ Payment verified! Creating shipment...');
                            
                            // Create Shiprocket shipment
                            let trackingInfo = null;
                            try {
                                const shipmentResponse = await fetch('/api/create-shipment', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
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
                                        amount: totalAmount
                                    })
                                });

                                if (shipmentResponse.ok) {
                                    trackingInfo = await shipmentResponse.json();
                                    console.log('✅ Shipment created:', trackingInfo);
                                } else {
                                    console.warn('⚠️ Shipment creation failed, but payment succeeded');
                                }
                            } catch (shipmentError) {
                                console.error('Shipment error:', shipmentError);
                                // Don't fail the whole flow - payment succeeded
                            }

                            // Update success message with ALL order details
                            document.getElementById('order-number').textContent = response.razorpay_order_id.substring(0, 15) + '...';
                            document.getElementById('order-amount').textContent = `₹${totalAmount}`;
                            
                            if (trackingInfo?.awb_code && trackingInfo.awb_code.trim() !== '') {
                                // Courier assigned - show tracking
                                document.getElementById('tracking-display').textContent = trackingInfo.awb_code;
                                document.getElementById('courier-display').textContent = trackingInfo.courier_name || 'Processing';
                                document.getElementById('tracking-section').style.display = 'block';
                                
                                const trackBtn = document.getElementById('track-order-btn');
                                if (trackBtn) {
                                    trackBtn.style.display = 'block';
                                    trackBtn.onclick = () => {
                                        window.open(`/tracking.html?awb=${trackingInfo.awb_code}`, '_blank');
                                    };
                                }
                            } else {
                                // Courier not yet assigned - show message
                                document.getElementById('tracking-section').style.display = 'none';
                                const trackBtn = document.getElementById('track-order-btn');
                                if (trackBtn) {
                                    trackBtn.style.display = 'block';
                                    trackBtn.textContent = '📧 Tracking Details Coming Soon';
                                    trackBtn.style.background = '#FF9800';
                                    trackBtn.disabled = true;
                                    trackBtn.title = 'Courier will be assigned within 2-4 hours. Check email for tracking.';
                                }
                            }

                            // Show success message IMMEDIATELY
                            console.log('Displaying success message...');
                            successMessage.classList.add('show');
                            registrationForm.style.display = 'none !important';
                            registrationForm.hidden = true;
                            console.log('✅ Success message is now visible');

                            // Submit order details to n8n in background (doesn't block success display)
                            submitOrderDetails({
                                ...formData,
                                payment_id: response.razorpay_payment_id,
                                order_id: response.razorpay_order_id,
                                amount: totalAmount,
                                tracking_number: trackingInfo?.awb_code || null,
                                shipment_id: trackingInfo?.shipment_id || null,
                                courier_name: trackingInfo?.courier_name || null
                            }).catch(err => console.error('Background n8n submission error:', err));

                            // Close modal after delay
                            setTimeout(() => {
                                console.log('Closing modal and resetting form...');
                                closeModal();
                                registrationForm.style.display = 'block';
                                registrationForm.reset();
                                successMessage.classList.remove('show');
                                setStep(1);
                                submitBtn.textContent = originalText;
                                submitBtn.disabled = false;
                                // Clear tracking info
                                const trackingElement = document.getElementById('tracking-info');
                                if (trackingElement) {
                                    trackingElement.innerHTML = '';
                                    trackingElement.style.display = 'none';
                                }
                            }, 5000);
                        } else {
                            console.error('❌ Payment verification failed:', verifyResult);
                            alert('Payment verification failed. Please contact support.');
                            submitBtn.textContent = originalText;
                            submitBtn.disabled = false;
                        }
                    } catch (error) {
                        console.error('❌ Verification error:', error);
                        alert('Payment verification error. Please contact support with your payment ID.');
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
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
                        console.log('Payment cancelled by user');
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                    }
                }
            };

            // Open Razorpay checkout
            const rzp = new Razorpay(razorpayOptions);
            rzp.open();

            // Reset button state immediately after opening
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;

        } catch (error) {
            console.error('Payment initialization error:', error);
            alert('Failed to initialize payment. Please try again.');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });

    // Helper function to submit order details in background
    async function submitOrderDetails(orderData) {
        try {
            console.log('Submitting order to n8n in background:', orderData);

            // Send as JSON POST - this runs in background, doesn't block UI
            const response = await fetch('https://n8n.prinkit.cloud/webhook/order_form', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (response.ok) {
                console.log('✅ Order submitted successfully to n8n');
                return true;
            } else {
                console.warn('⚠️ n8n webhook responded with status:', response.status);
                // Don't fail - order is already confirmed to customer
                return false;
            }
        } catch (error) {
            console.error('⚠️ Error submitting to n8n (non-blocking):', error);
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
