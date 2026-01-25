# Amrut Baa - Traditional Chilly Garlic Chutney

A premium, high-performance static website for a 90+ year old traditional chutney recipe from Kathiyawad.

## 🌶️ Project Overview

This is a modern, single-page website built with pure HTML, CSS, and JavaScript. It features:

- **Premium Design**: Heritage-inspired UI with modern animations
- **Batch-Based Ordering**: Unique registration system for fresh preparation
- **High Performance**: Optimized for speed and SEO
- **Mobile-First**: Responsive design for all devices
- **Accessibility**: WCAG compliant with keyboard navigation and screen reader support

## 🚀 Quick Start

### Local Development

```bash
# Navigate to project directory
cd Amrutbaa.com

# Start Python HTTP server
python3 -m http.server 8000

# Open in browser
open http://localhost:8000
```

## 📁 Project Structure

```
Amrutbaa.com/
├── index.html          # Main page with all sections
├── styles/
│   └── main.css       # All styles with animations
├── scripts/
│   └── main.js        # Enhanced interactivity
├── assets/
│   └── images/        # Product photos & assets
└── README.md          # This file
```

## 🎨 Features

### Design
- **Color Palette**: Inspired by grandmother's traditional saree colors
- **Typography**: Playfair Display (headings), Inter (body), Noto Sans Gujarati
- **Animations**: Scroll reveals, hover effects, micro-interactions
- **Loading Screen**: Smooth entry experience

### Functionality
- **Form Validation**: Real-time validation with visual feedback
- **Toast Notifications**: Non-intrusive error/success messages
- **Success Popup**: Beautiful modal for registration confirmation
- **Smooth Scrolling**: Anchor-based navigation
- **Parallax Effects**: Subtle depth on scroll
- **Character Counter**: Address field helper

### Performance
- **Lazy Loading**: Images load on demand
- **Preloading**: Critical resources loaded first
- **Optimized Fonts**: Google Fonts with preconnect
- **Minimal Dependencies**: Pure vanilla JavaScript, no frameworks
- **SEO Optimized**: Meta tags, Open Graph, semantic HTML

## 🌐 Deployment to Cloudflare Pages

### Method 1: Git Integration (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Amrut Baa website"
   git branch -M main
   git remote add origin https://github.com/yourusername/amrutbaa.git
   git push -u origin main
   ```

2. **Connect to Cloudflare Pages**
   - Login to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Go to **Pages** → **Create a project**
   - Select **Connect to Git**
   - Choose your repository
   - Build settings:
     - **Build command**: (leave empty)
     - **Build output directory**: `/`
     - **Root directory**: `/`
   - Click **Save and Deploy**

3. **Custom Domain** (Optional)
   - Go to **Custom domains** in your project
   - Add `amrutbaa.com` and `www.amrutbaa.com`
   - Update DNS records as instructed

### Method 2: Direct Upload

1. **Prepare Files**
   ```bash
   # Ensure all files are ready
   ls -la
   ```

2. **Upload to Cloudflare**
   - Go to **Pages** → **Create a project**
   - Select **Upload assets**
   - Drag and drop your entire project folder
   - Give it a project name
   - Click **Deploy**

### Method 3: Wrangler CLI

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
wrangler pages project create amrutbaa
wrangler pages publish . --project-name=amrutbaa
```

## 🔧 Configuration

### Batch Registration Form

Currently uses client-side validation. For production, integrate with:

**Option 1: Formspree**
```html
<form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
```

**Option 2: Cloudflare Workers**
Create a worker endpoint for form submission:
```javascript
// workers/form-handler.js
export default {
  async fetch(request) {
    const formData = await request.json();
    // Send email via SendGrid, save to database, etc.
    return new Response(JSON.stringify({ success: true }));
  }
}
```

**Option 3: Airtable**
Use Airtable as a simple database with their API.

### Environment Variables (if needed)

Create `.env` file (don't commit this):
```
FORM_ENDPOINT=https://your-endpoint.com
API_KEY=your-api-key
```

## 📧 Email Integration

For sending confirmation emails, use:

1. **SendGrid** (Free tier: 100 emails/day)
2. **Resend** (Free tier: 3,000 emails/month)
3. **Mailgun** (Free tier: 5,000 emails/month)
4. **Cloudflare Email Workers**

## 🎯 SEO Checklist

- [x] Meta descriptions
- [x] Open Graph tags
- [x] Semantic HTML
- [x] Image alt texts
- [x] Mobile-responsive
- [x] Fast loading (<3s)
- [ ] Add sitemap.xml
- [ ] Add robots.txt
- [ ] Submit to Google Search Console
- [ ] Add Google Analytics (optional)

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔒 Security

- No backend = No server vulnerabilities
- Static hosting = Automatic DDoS protection
- HTTPS by default on Cloudflare
- Content Security Policy (add if needed)

## 🛠️ Future Enhancements

- [ ] Add blog section for recipes
- [ ] Implement real-time batch slots counter
- [ ] Add customer testimonials carousel
- [ ] Create admin dashboard for order management
- [ ] Integrate payment gateway (when ready)
- [ ] Add multiple product SKUs
- [ ] Implement referral system

## 📊 Analytics (Optional)

Add Google Analytics:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

Or use Cloudflare Web Analytics (privacy-focused, no cookies):
```html
<script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "YOUR_TOKEN"}'></script>
```

## 🐛 Troubleshooting

### Images not loading
- Check file paths (case-sensitive)
- Ensure images are in `assets/images/`
- Verify image formats (PNG, JPG, WebP)

### Form not submitting
- Check browser console for errors
- Verify form IDs match JavaScript selectors
- Test in different browsers

### Animations not working
- Clear browser cache
- Check if user has "reduced motion" enabled
- Verify CSS animations are not disabled

## 📝 License

© 2026 Amrut Baa. All rights reserved.

## 🤝 Contact

For support or inquiries:
- Email: info@amrutbaa.com
- Phone: +91 6354 306783

---

**Made with ❤️ preserving 90+ years of Kathiyawad tradition**
