/**
 * Modal Registration Component
 * Self-contained, reusable modal form for batch registration
 * 
 * Usage:
 *   <script src="assets/js/modal-component.js"></script>
 *   <script>initOrderModal();</script>
 */

function initOrderModal() {
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

        .price-mrp {
            font-size: 0.95rem;
            color: #8A6B6B;
            text-decoration: line-through;
            font-weight: 600;
        }

        .price-amount {
            font-size: 1.6rem;
            font-weight: 800;
            color: #6B2C2C;
        }

        .price-caption {
            display: block;
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

        .modal-total {
            font-size: 0.95rem;
            font-weight: 700;
            color: #4A4A4A;
            margin-bottom: 1rem;
        }

        .modal-savings {
            font-size: 0.85rem;
            font-weight: 700;
            color: #2E7D32;
            margin-top: -0.5rem;
            margin-bottom: 1rem;
        }

        .quantity-row {
            display: grid;
            grid-template-columns: 44px 1fr 44px;
            align-items: center;
            gap: 0.5rem;
        }

        .qty-btn {
            border: 1px solid rgba(107, 44, 44, 0.25);
            background: #fff;
            color: #6B2C2C;
            font-size: 1.1rem;
            font-weight: 700;
            border-radius: 10px;
            height: 42px;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .qty-btn:hover {
            background: rgba(212, 175, 55, 0.15);
        }

        .qty-input {
            width: 100%;
            text-align: center;
            height: 42px;
            border-radius: 10px;
            border: 1px solid rgba(107, 44, 44, 0.25);
            font-weight: 700;
            color: #4A4A4A;
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

        .pincode-status {
            font-size: 0.8rem;
            margin-top: 0.35rem;
            line-height: 1.3;
            display: none;
        }

        .pincode-status.pending {
            color: #6B2C2C;
        }

        .pincode-status.success {
            color: #2E7D32;
        }

        .pincode-status.error {
            color: #C0392B;
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
            animation: fadeInUp 0.4s ease-out;
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

                <span class="price-caption">Per 250g jar • Limited weekly batch</span>

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
                            <label for="phone">Phone Number *</label>
                            <input type="tel" id="phone" name="phone" placeholder="Enter your phone" required>
                            <p class="input-error" data-error-for="phone" style="display:none;"></p>
                            <p class="field-note">We’ll confirm your batch slot over WhatsApp/SMS.</p>
                        </div>
                        <div class="form-group">
                            <label for="quantity">Quantity *</label>
                            <div class="quantity-row">
                                <button type="button" class="qty-btn" data-qty-action="decrease">−</button>
                                <input type="number" id="quantity" name="quantity" class="qty-input" min="1" max="10" value="1" required>
                                <button type="button" class="qty-btn" data-qty-action="increase">+</button>
                            </div>
                            <p class="input-error" data-error-for="quantity" style="display:none;"></p>
                            <p class="field-note" id="offerNote">Offers: 5% off 2+ jars • 10% off 3+ jars</p>
                        </div>
                        <div class="step-actions">
                            <button type="button" class="btn-primary-solid" id="nextStepBtn">Continue →</button>
                        </div>
                    </div>

                    <div class="step-pane" data-step-pane="2">
                        <div class="order-recap">
                            <strong>Reserved:</strong> <span id="orderQuantityText">1 fresh jar</span> in this week's batch • Dispatch starts Monday after prep.
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
                            <p class="pincode-status" id="pincodeStatus"></p>
                            <p class="field-note">We deliver right after the batch is prepared. Add landmarks to help the rider.</p>
                        </div>
                        <div class="form-group">
                            <label>Payment Method *</label>
                            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                    <input type="radio" id="paymentMethodOnline" name="payment_method" value="online" checked> 
                                    <span>Pay Now (Razorpay)</span>
                                </label>
                                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                    <input type="radio" id="paymentMethodCod" name="payment_method" value="cod"> 
                                    <span>Pay on Delivery (COD)</span>
                                </label>
                            </div>
                        </div>
                        <div style="display:flex; justify-content:space-evenly; align-items:center; gap:2rem; margin:1.5rem auto 1rem; padding:1.25rem 2rem; max-width:520px; background:#f9f9f9; border-radius:12px; flex-wrap:wrap; border:1px solid #e0e0e0;">
                            <img src="assets/images/money-back-seal.png" alt="100% Money Back Guarantee" style="width:96px; height:96px; object-fit:contain; filter:drop-shadow(0 2px 6px rgba(0,0,0,0.1));" />
                            <img src="assets/images/fssai-logo-fssai-icon-free-free-vector-removebg-preview Background Removed.png" alt="FSSAI Certified" style="width:111px; height:111px; object-fit:contain; filter:drop-shadow(0 2px 6px rgba(0,0,0,0.1));" />
                            <span style="width:44px; height:44px; border-radius:6px; border:3px solid #2E7D32; background:#fff; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(0,0,0,0.1);">
                                <span style="width:22px; height:22px; border-radius:50%; background:#2E7D32;"></span>
                            </span>
                        </div>
                        <div class="step-actions">
                            <button type="button" class="btn-secondary-outline" id="prevStepBtn">← Back</button>
                            <button type="submit" class="btn-primary-solid" id="submitBtn">Reserve & Pay Securely</button>
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
    const quantityInput = document.getElementById('quantity');
    const qtyButtons = document.querySelectorAll('[data-qty-action]');
    const modalTotal = document.getElementById('modalTotal');
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
    let pincodeCheckTimer = null;
    let isCodSelected = false;

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

    function normalizeQuantity(value) {
        const parsed = parseInt(value, 10);
        if (Number.isNaN(parsed)) return 1;
        return Math.min(10, Math.max(1, parsed));
    }

    function updatePricingUI() {
        const qty = normalizeQuantity(quantityInput?.value || 1);
        if (quantityInput) quantityInput.value = qty;

        const pricing = calculatePricing(qty);
        if (unitPriceDisplay) {
            unitPriceDisplay.textContent = `₹${pricing.unitPrice}`;
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

    async function checkPincodeServiceability() {
        const raw = pincodeInput?.value || '';
        const pincode = raw.replace(/\D/g, '').trim();
        if (pincode.length !== 6) {
            pincodeServiceable = null;
            setPincodeStatus(null, '');
            return;
        }

        const qty = normalizeQuantity(quantityInput?.value || 1);
        const weight = Number((0.15 * qty).toFixed(2));

        setPincodeStatus('pending', 'Checking delivery availability...');
        try {
            const response = await fetch('/api/check-pincode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pincode,
                    weight,
                    cod: false
                })
            });

            if (!response.ok) {
                throw new Error('Serviceability check failed');
            }

            const result = await response.json();
            pincodeServiceable = !!result.serviceable;
            if (pincodeServiceable) {
                const courierCount = result.courier_count || 0;
                setPincodeStatus('success', `Delivery available${courierCount ? ` (${courierCount} couriers)` : ''}.`);
            } else {
                setPincodeStatus('error', 'Sorry, this pincode is not serviceable yet.');
            }
        } catch (error) {
            pincodeServiceable = null;
            setPincodeStatus('error', 'Could not verify pincode. Please try again.');
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
    }

    function validateStep1() {
        const phone = document.getElementById('phone').value.trim();
        const qty = normalizeQuantity(quantityInput?.value || 1);

        clearErrors();

        const phoneDigits = phone.replace(/\D/g, '');
        if (phoneDigits.length < 10) {
            setError('phone', 'Please add a 10-digit phone number.');
            return false;
        }

        if (qty < 1) {
            setError('quantity', 'Select at least 1 jar.');
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
        setStep(1);

        const pricing = calculatePricing(normalizeQuantity(quantityInput?.value || 1));
        
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
        
        // Track modal close / abandonment
        const currentStep = modal.querySelector('.step-pane.active')?.dataset?.step || '1';
        window.dataLayer = window.dataLayer || [];
        dataLayer.push({
            'event': 'checkout_abandoned',
            'abandonment_step': `step_${currentStep}`,
            'form_name': 'registration_form'
        });
    }

    // Event listeners
    closeModalBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);

    nextStepBtn?.addEventListener('click', () => {
        if (validateStep1()) {
            // Track Step 1 completion (Phone submitted)
            window.dataLayer = window.dataLayer || [];
            const phoneValue = document.getElementById('phone').value;
            dataLayer.push({
                'event': 'form_step_1_complete',
                'form_name': 'registration_form',
                'step': 'phone_submit',
                'phone_verified': phoneValue.length === 10
            });
            
            setStep(2);
            
            // Track Step 2 start
            dataLayer.push({
                'event': 'form_step_2_start',
                'form_name': 'registration_form',
                'step': 'details_form'
            });
        }
    });

    prevStepBtn?.addEventListener('click', () => setStep(1));

    quantityInput?.addEventListener('change', () => updatePricingUI());
    quantityInput?.addEventListener('input', () => updatePricingUI());
    qtyButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const currentQty = normalizeQuantity(quantityInput?.value || 1);
            const action = btn.getAttribute('data-qty-action');
            const nextQty = action === 'increase' ? currentQty + 1 : currentQty - 1;
            if (quantityInput) quantityInput.value = normalizeQuantity(nextQty);
            updatePricingUI();
            pincodeServiceable = null;
            if (pincodeInput?.value?.replace(/\D/g, '').length === 6) {
                checkPincodeServiceability();
            }
        });
    });

    pincodeInput?.addEventListener('input', () => {
        pincodeServiceable = null;
        if (pincodeCheckTimer) {
            clearTimeout(pincodeCheckTimer);
        }
        const pincode = pincodeInput.value.replace(/\D/g, '').trim();
        if (pincode.length === 6) {
            pincodeCheckTimer = setTimeout(() => {
                checkPincodeServiceability();
            }, 400);
        } else {
            setPincodeStatus(null, '');
        }
    });

    pincodeInput?.addEventListener('blur', () => {
        checkPincodeServiceability();
    });

    paymentMethodOnline?.addEventListener('change', () => {
        isCodSelected = false;
        updatePricingUI();
        if (submitBtn) submitBtn.textContent = 'Reserve & Pay Securely';
    });

    paymentMethodCod?.addEventListener('change', () => {
        isCodSelected = true;
        updatePricingUI();
        if (submitBtn) submitBtn.textContent = 'Reserve & Pay on Delivery';
    });

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
            pincode: document.getElementById('pincode').value,
            payment_method: document.querySelector('input[name="payment_method"]:checked')?.value || 'online'
        };

        if (!validateStep2()) {
            return;
        }

        const submitBtn = registrationForm.querySelector('.btn-primary-solid[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Initializing Payment...';
        submitBtn.disabled = true;

        try {
            const pricing = calculatePricing(formData.quantity);
            const pricePerJar = pricing.unitPrice;
            const totalAmount = pricing.total;
            
            // For COD, skip Razorpay and create order directly
            if (formData.payment_method === 'cod') {
                // Track COD Purchase (no payment gateway)
                window.dataLayer = window.dataLayer || [];
                dataLayer.push({
                    'event': 'purchase',
                    'payment_type': 'cod',
                    'ecommerce': {
                        'transaction_id': `COD-${Date.now()}`,
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
                    'order_id': `COD-${Date.now()}`,
                    'payment_type': 'cod',
                    'customer_email': formData.email,
                    'customer_phone': formData.phone,
                    'customer_city': formData.city,
                    'customer_state': formData.state
                });

                // Create COD order via Worker
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
                        discount: 0
                    })
                });

                if (!codOrderResponse.ok) {
                    throw new Error('Failed to create COD order');
                }

                const codResult = await codOrderResponse.json();

                // Update success message
                document.getElementById('order-number').textContent = `COD-${Date.now()}`.substring(0, 15) + '...';
                document.getElementById('order-amount').textContent = `₹${totalAmount}`;
                
                // Show success message immediately
                successMessage.classList.add('show');
                registrationForm.style.display = 'none !important';
                registrationForm.hidden = true;

                // Submit order to n8n in background
                submitOrderDetails({
                    ...formData,
                    payment_type: 'cod',
                    order_id: `COD-${Date.now()}`,
                    amount: totalAmount,
                    tracking_number: null,
                    shipment_id: null,
                    courier_name: null
                }).catch(() => {});

                // Close modal after delay
                setTimeout(() => {
                    closeModal();
                    registrationForm.style.display = 'block';
                    registrationForm.hidden = false;
                    successMessage.classList.remove('show');
                    registrationForm.reset();
                }, 4000);

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
                            // 🎯 CRITICAL: Track Purchase (Conversion Event)
                            window.dataLayer = window.dataLayer || [];
                            dataLayer.push({
                                'event': 'purchase',
                                'payment_type': 'razorpay',
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
                                'customer_state': formData.state
                            });
                            
                            // Track for Facebook Pixel (if implemented)
                            if (typeof fbq !== 'undefined') {
                                fbq('track', 'Purchase', {
                                    value: totalAmount,
                                    currency: 'INR',
                                    content_ids: ['amrutbaa-chutney'],
                                    content_type: 'product',
                                    num_items: formData.quantity
                                });
                            }
                            
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
                                        amount: totalAmount,
                                        unit_price: pricePerJar,
                                        base_total: pricing.baseTotal,
                                        discount: pricing.discount,
                                        offer_label: pricing.offer ? pricing.offer.label : ''
                                    })
                                });

                                if (shipmentResponse.ok) {
                                    trackingInfo = await shipmentResponse.json();
                                }
                            } catch (shipmentError) {
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
                            successMessage.classList.add('show');
                            registrationForm.style.display = 'none !important';
                            registrationForm.hidden = true;

                            // Submit order details to n8n in background (doesn't block success display)
                            submitOrderDetails({
                                ...formData,
                                payment_id: response.razorpay_payment_id,
                                order_id: response.razorpay_order_id,
                                amount: totalAmount,
                                tracking_number: trackingInfo?.awb_code || null,
                                shipment_id: trackingInfo?.shipment_id || null,
                                courier_name: trackingInfo?.courier_name || null
                            }).catch(() => {});

                            // Close modal after delay
                            setTimeout(() => {
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
                            alert('Payment verification failed. Please contact support.');
                            submitBtn.textContent = originalText;
                            submitBtn.disabled = false;
                            
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

        } catch (error) {
            alert('Failed to initialize payment. Please try again.');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });

    // Helper function to submit order details in background
    async function submitOrderDetails(orderData) {
        try {
            // Send as JSON POST - this runs in background, doesn't block UI
            const response = await fetch('https://n8n.prinkit.cloud/webhook/order_form', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
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
