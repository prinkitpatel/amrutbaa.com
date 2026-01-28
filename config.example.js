// Razorpay Configuration
// Copy this file to config.js and update with your actual keys

const RAZORPAY_CONFIG = {
  // Test mode keys (for development)
  test: {
    keyId: 'rzp_test_xxxxxxxxxxxxx',
    // Key secret is stored in Cloudflare Worker environment
  },
  
  // Live mode keys (for production)
  live: {
    keyId: 'rzp_live_S9MRd6GMVrZZqY',
    // Key secret is stored in Cloudflare Worker environment
  },
  
  // Pricing
  pricing: {
    pricePerJar: 299,
    currency: 'INR'
  },
  
  // Use 'test' or 'live'
  mode: 'live'
};

// Export for use in modal-component.js
window.RAZORPAY_CONFIG = RAZORPAY_CONFIG;
