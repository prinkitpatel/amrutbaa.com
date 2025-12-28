# Amrutbaa.com - AI Agent Instructions

## Project Overview
E-commerce site for **Chilly Garlic Chutney** - a 90+ year old traditional recipe from Kathiyawad, prepared by grandmother. This is a heritage food product with a unique batch-based ordering system.

## Business Model (Critical Context)
- **NOT on-demand**: Chutney is prepared in scheduled batches only
- **Pre-registration required**: Customers register 1 day before batch preparation date
- **Fresh preparation**: Each batch is made fresh and delivered to doorsteps
- **Limited availability**: Batch-based model means limited slots per preparation cycle

## Architecture
- **Static single-page website** (HTML/CSS/JavaScript)
- **One homepage** with multiple sections (hero, story, product, batch registration, etc.)
- Served via Python HTTP server for local development: `python3 -m http.server 8000`

## Page Structure Requirements
When building the homepage, include these sections:
1. **Hero**: Brand introduction, heritage story hook
2. **Story**: 90-year recipe history, Kathiyawad pride, grandmother's legacy
3. **Product**: Chutney details, ingredients, authenticity
4. **Batch System**: Clear explanation of batch ordering (not on-demand)
5. **Registration**: Form/CTA to register for next batch (1-day advance notice)
6. **Delivery**: Fresh preparation and doorstep delivery promise

## Development Workflow
```bash
# Start local server
python3 -m http.server 8000

# Access site
http://localhost:8000
```

## File Organization
```
/
├── index.html          # Main page
├── styles/
│   └── main.css       # Styles
├── scripts/
│   └── main.js        # Interactivity, form handling
├── assets/
│   ├── images/        # Product photos, logo, heritage images
│   └── icons/         # UI icons
└── .github/
    └── copilot-instructions.md
```

## Design Considerations
- **Heritage feel**: Design should reflect 90-year tradition and authenticity
- **Trust signals**: Emphasize grandmother's recipe, traditional preparation
- **Clarity on batch model**: Make it obvious this is NOT instant/on-demand ordering
- **Regional pride**: Highlight Kathiyawad heritage and cultural significance
- **Mobile-first**: Likely audience will access from mobile devices

## Batch Registration System
- Capture: Name, contact, quantity desired
- Display: Next batch date/time prominently
- Clarify: 1-day advance registration deadline
- Consider: Basic form validation, confirmation messaging

## Asset Management
- Current images: `WhatsApp_Image_*.png` (remove background versions)
- Rename to: `logo.png`, `chutney-hero.png`, `grandmother-portrait.png`, etc.
- Optimize: Compress for web, create responsive sizes
- Add: Product photography, preparation process, packaging shots

## Tech Stack
- **HTML5**: Semantic markup
- **CSS3**: Custom styles (consider CSS Grid/Flexbox for layout)
- **Vanilla JavaScript**: Form handling, animations, no framework needed
- **Forms**: Use Formspree, Netlify Forms, or similar for batch registration
- **Hosting**: Static site hosts (Netlify, Vercel, GitHub Pages recommended)

## Key Messaging Points
- "90+ year old recipe"
- "Pride of Kathiyawad"
- "Prepared in traditional batches"
- "Fresh, authentic, delivered to your doorstep"
- "Register 1 day before batch preparation"

---

**Note**: This is a heritage product with unique batch-based ordering. The website should educate customers about this model while building trust through tradition and authenticity.
