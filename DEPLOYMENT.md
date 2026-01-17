# Cloudflare Pages Deployment Guide

## Prerequisites
- GitHub account
- Cloudflare account (free tier is fine)
- Domain name (optional, Cloudflare provides free subdomain)

## Step 1: Push Code to GitHub

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "🌶️ Initial commit - Amrut Baa premium website"

# Create main branch
git branch -M main

# Add remote repository (replace with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/amrutbaa.git

# Push to GitHub
git push -u origin main
```

## Step 2: Connect to Cloudflare Pages

### Via Dashboard (Easiest)

1. **Login to Cloudflare**
   - Go to https://dash.cloudflare.com
   - Select your account

2. **Create Pages Project**
   - Click **Workers & Pages** in sidebar
   - Click **Create application**
   - Select **Pages** tab
   - Click **Connect to Git**

3. **Select Repository**
   - Authorize Cloudflare to access GitHub
   - Select `amrutbaa` repository
   - Click **Begin setup**

4. **Configure Build Settings**
   ```
   Project name: amrutbaa
   Production branch: main
   Build command: (leave empty)
   Build output directory: /
   Root directory: /
   Environment variables: (none needed)
   ```

5. **Deploy**
   - Click **Save and Deploy**
   - Wait 1-2 minutes for deployment
   - Your site will be live at: `amrutbaa.pages.dev`

## Step 3: Add Custom Domain (Optional)

### If you own amrutbaa.com:

1. **Add Domain in Cloudflare Pages**
   - Go to your Pages project
   - Click **Custom domains**
   - Click **Set up a custom domain**
   - Enter `amrutbaa.com`

2. **Update DNS Records**
   
   If domain is on Cloudflare DNS (recommended):
   - Records will be added automatically
   - Wait 5-10 minutes for propagation

   If domain is elsewhere:
   - Add CNAME record: `www` → `amrutbaa.pages.dev`
   - Add CNAME record: `@` → `amrutbaa.pages.dev`
   - Or follow Cloudflare's instructions

3. **Add www subdomain**
   - Click **Set up a custom domain** again
   - Enter `www.amrutbaa.com`
   - Repeat DNS steps

4. **Enable HTTPS**
   - Automatically enabled by Cloudflare
   - Universal SSL certificate issued within 24 hours

## Step 4: Configure Form Submission

Choose one of these options:

### Option A: Formspree (Easiest)

1. Sign up at https://formspree.io
2. Create new form, get form ID
3. Update `index.html`:
   ```html
   <form id="registration-form" 
         action="https://formspree.io/f/YOUR_FORM_ID" 
         method="POST">
   ```

### Option B: Cloudflare Workers (Free, Unlimited)

1. Create `functions/submit-form.js`:
   ```javascript
   export async function onRequestPost(context) {
     const formData = await context.request.formData();
     const data = Object.fromEntries(formData);
     
     // Send email via SendGrid, Resend, etc.
     // Or save to Airtable, Google Sheets, etc.
     
     return new Response(JSON.stringify({ success: true }), {
       headers: { 'Content-Type': 'application/json' }
     });
   }
   ```

2. Update form action:
   ```html
   <form action="/submit-form" method="POST">
   ```

### Option C: Airtable (Simple Database)

1. Create Airtable base
2. Get API key and base ID
3. Update JavaScript to POST to Airtable API

## Step 5: Enable Analytics (Optional)

### Cloudflare Web Analytics (Privacy-focused, Free)

1. Go to **Analytics** → **Web Analytics**
2. Click **Add a site**
3. Enter site name: Amrut Baa
4. Copy tracking code
5. Add before `</body>` in `index.html`:
   ```html
   <script defer src='https://static.cloudflareinsights.com/beacon.min.js' 
           data-cf-beacon='{"token": "YOUR_TOKEN"}'></script>
   ```

### Google Analytics (Full Features)

1. Create GA4 property
2. Get Measurement ID
3. Add tracking code in `<head>`

## Step 6: Performance Optimization

### Enable Cloudflare Features

1. **Auto Minify**
   - Speed → Optimization → Auto Minify
   - Enable HTML, CSS, JavaScript

2. **Brotli Compression**
   - Speed → Optimization → Brotli
   - Enable

3. **Image Optimization**
   - Speed → Optimization → Polish
   - Enable (requires paid plan)

4. **Caching Rules**
   - Rules → Page Rules
   - Add rule: `amrutbaa.com/*`
   - Cache Level: Standard
   - Browser Cache TTL: 4 hours

### Convert Images to WebP

```bash
# Install cwebp (macOS)
brew install webp

# Convert images
cd assets/images
cwebp -q 85 product-jar.png -o product-jar.webp
cwebp -q 85 product-pouch.png -o product-pouch.webp
```

Update HTML:
```html
<picture>
  <source srcset="assets/images/product-jar.webp" type="image/webp">
  <img src="assets/images/product-jar.png" alt="...">
</picture>
```

## Step 7: SEO Setup

### Submit to Google

1. **Google Search Console**
   - Add property: https://amrutbaa.com
   - Verify ownership via DNS or HTML file
   - Submit sitemap: https://amrutbaa.com/sitemap.xml

2. **Google My Business** (if local)
   - Create business listing
   - Link to website
   - Add photos

### Local SEO (Important for Food Business)

Add structured data in `<head>`:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Amrut Baa",
  "description": "90+ year old traditional Chilly Garlic Chutney from Kathiyawad",
  "url": "https://amrutbaa.com",
  "telephone": "+91-XXXXX-XXXXX",
  "address": {
    "@type": "PostalAddress",
    "addressRegion": "Gujarat",
    "addressCountry": "IN"
  },
  "openingHours": "Mo-Su",
  "priceRange": "₹₹"
}
</script>
```

## Step 8: Email Notifications

### Using SendGrid (Free: 100/day)

1. Sign up at https://sendgrid.com
2. Create API key
3. Add to Cloudflare Worker:
   ```javascript
   const SENDGRID_API_KEY = 'your-api-key';
   
   async function sendEmail(data) {
     await fetch('https://api.sendgrid.com/v3/mail/send', {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${SENDGRID_API_KEY}`,
         'Content-Type': 'application/json'
       },
       body: JSON.stringify({
         personalizations: [{
           to: [{ email: 'info@amrutbaa.com' }],
           subject: 'New Batch Registration'
         }],
         from: { email: 'noreply@amrutbaa.com' },
         content: [{
           type: 'text/plain',
           value: `New registration from ${data.name}`
         }]
       })
     });
   }
   ```

## Continuous Deployment

Once connected to GitHub, every push to `main` branch automatically deploys:

```bash
# Make changes
git add .
git commit -m "Update content"
git push

# Cloudflare automatically builds and deploys!
```

## Monitoring

### Check Deployment Status
- Dashboard → Workers & Pages → amrutbaa
- View deployment logs
- Check build time (~30 seconds)

### Performance Monitoring
- Use Lighthouse in Chrome DevTools
- Target: 95+ performance score
- Check mobile and desktop

### Uptime Monitoring
- Use UptimeRobot (free)
- Monitor https://amrutbaa.com
- Get alerts if site goes down

## Troubleshooting

### Build Fails
- Check build logs in Cloudflare dashboard
- Verify all files are committed to GitHub
- Ensure no syntax errors in HTML/CSS/JS

### Images Not Loading
- Check case sensitivity in file paths
- Verify images are in repository
- Check browser console for 404 errors

### Form Not Working
- Test form endpoint separately
- Check browser console for errors
- Verify CORS settings if using external API

### Custom Domain Not Working
- Wait 24-48 hours for DNS propagation
- Check DNS records are correct
- Clear browser cache
- Test in incognito mode

## Cost Breakdown

| Service | Free Tier | Cost After |
|---------|-----------|------------|
| Cloudflare Pages | Unlimited bandwidth | Always free |
| Custom Domain | N/A | $10-15/year |
| Formspree | 50 submissions/month | $10/month |
| SendGrid | 100 emails/day | $15/month |
| Airtable | 1,200 records | $10/month |

**Total for basic setup: $10-15/year (domain only)**

## Next Steps

1. ✅ Deploy to Cloudflare Pages
2. ⏸️ Set up form submission backend
3. ⏸️ Configure email notifications
4. ⏸️ Add Google Analytics
5. ⏸️ Submit to Google Search Console
6. ⏸️ Create social media accounts
7. ⏸️ Start marketing campaigns

## Support

If you encounter issues:
- Check [Cloudflare Docs](https://developers.cloudflare.com/pages/)
- Visit [Cloudflare Community](https://community.cloudflare.com)
- Email: support@cloudflare.com

---

**🎉 Congratulations! Your premium website is now live!**
