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

        .success-message {
            display: none;
            text-align: center;
            color: #4CAF50;
            font-weight: 600;
            margin-top: 1rem;
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
                    <h2>Secure Your Jar Now</h2>
                    <p class="modal-tagline">First batch slots are limited. Register today to guarantee your delivery.</p>
                </div>
                
                <form id="registrationForm">
                    <div class="stepper" id="formStepper">
                        <div class="step active" data-step="1">
                            <span class="step-number">1</span>
                            <span class="step-title">Contact</span>
                        </div>
                        <div class="step" data-step="2">
                            <span class="step-number">2</span>
                            <span class="step-title">Delivery</span>
                        </div>
                    </div>

                    <div class="step-pane active" data-step-pane="1">
                        <div class="form-row">
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
                        <div class="form-row">
                            <div class="form-group">
                                <label for="phone">Phone Number *</label>
                                <input type="tel" id="phone" name="phone" placeholder="Enter your phone" required>
                                <p class="input-error" data-error-for="phone" style="display:none;"></p>
                            </div>
                            <div class="form-group">
                                <label for="quantity">Quantity *</label>
                                <input type="number" id="quantity" name="quantity" value="1" max="1" readonly>
                                <p class="field-note">High early orders this week, so it's 1 jar per person for now. We'll open more slots in the next batch.</p>
                            </div>
                        </div>
                        <div class="step-actions">
                            <button type="button" class="btn-primary-solid" id="nextStepBtn">Continue to Delivery →</button>
                        </div>
                    </div>

                    <div class="step-pane" data-step-pane="2">
                        <div class="order-recap">
                            <strong>Reserved:</strong> 1 fresh jar in this week's batch • Dispatch starts Monday after prep.
                        </div>
                        <div class="form-group" style="margin-top: 1.25rem;">
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
                            <button type="submit" class="btn-primary-solid">Confirm & Reserve</button>
                        </div>
                    </div>

                    <div class="success-message" id="successMessage">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">🎉</div>
                        <div style="font-size: 1.1rem; font-weight: 700; color: #2E7D32; margin-bottom: 0.5rem;">Your Jar is Reserved!</div>
                        <div style="font-size: 0.9rem; line-height: 1.6;">
                            We'll call you within 24 hours to confirm.<br>
                            Your fresh chutney will be prepared Monday and delivered by week's end.
                        </div>
                    </div>
                </form>
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
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();

        clearErrors();

        if (name.length < 2) {
            setError('name', 'Please enter your full name.');
            return false;
        }

        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!emailValid) {
            setError('email', 'Add a valid email so we can share batch updates.');
            return false;
        }

        const phoneDigits = phone.replace(/\D/g, '');
        if (phoneDigits.length < 10) {
            setError('phone', 'Please add a 10-digit phone number.');
            return false;
        }

        return true;
    }

    function validateStep2() {
        const address1 = document.getElementById('address1').value.trim();
        const city = document.getElementById('city').value.trim();
        const state = document.getElementById('state').value.trim();
        const pincode = document.getElementById('pincode').value.replace(/\D/g, '').trim();

        let valid = true;
        clearErrors();

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
                handler: async function(response) {
                    // Payment successful
                    console.log('Payment successful:', response);
                    
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
                            // Submit order details to your backend
                            await submitOrderDetails({
                                ...formData,
                                payment_id: response.razorpay_payment_id,
                                order_id: response.razorpay_order_id,
                                amount: totalAmount
                            });

                            // Show success message
                            successMessage.style.display = 'block';
                            registrationForm.style.display = 'none';
                            
                            setTimeout(() => {
                                closeModal();
                                registrationForm.style.display = 'block';
                                registrationForm.reset();
                                successMessage.style.display = 'none';
                                setStep(1);
                                submitBtn.textContent = originalText;
                                submitBtn.disabled = false;
                            }, 3000);
                        } else {
                            alert('Payment verification failed. Please contact support.');
                            submitBtn.textContent = originalText;
                            submitBtn.disabled = false;
                        }
                    } catch (error) {
                        console.error('Verification error:', error);
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
                    ondismiss: function() {
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

    // Helper function to submit order details
    async function submitOrderDetails(orderData) {
        const hiddenForm = document.createElement('form');
        hiddenForm.method = 'POST';
        hiddenForm.action = 'https://n8n.prinkit.cloud/webhook/order_form';
        hiddenForm.style.display = 'none';

        for (const [key, value] of Object.entries(orderData)) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value;
            hiddenForm.appendChild(input);
        }

        document.body.appendChild(hiddenForm);
        
        const iframe = document.createElement('iframe');
        iframe.name = 'hidden-form-iframe';
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        
        hiddenForm.target = 'hidden-form-iframe';
        hiddenForm.submit();
        
        setTimeout(() => {
            document.body.removeChild(hiddenForm);
            document.body.removeChild(iframe);
        }, 1000);
    }

    // Public API: Return object with openModal function
    return {
        open: openModal,
        close: closeModal
    };
}

// Export for use
window.OrderModal = initOrderModal();
