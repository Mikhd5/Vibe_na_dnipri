# Deploy to Vercel

This is a static website; no build command is required.

1. Unzip the project.
2. Import the project folder/repository into Vercel.
3. Select **Other** as the framework preset.
4. Leave **Build Command** blank.
5. Set **Output Directory** to `.` (project root).
6. Deploy.

Keep `index.html`, `styles.css`, `script.js`, `vercel.json`, and the complete `assets/` directory together. All media paths are relative.

## Before commercial launch

- Connect the booking form to the owner's Telegram/CRM endpoint.
- Add a server-side availability calendar and booking conflict checks.
- Confirm current prices, house rules, address and policies with the owner.
- Replace concept visuals with approved photos wherever they suggest a specific room, amenity, or view that differs from the real property.
- Set an absolute canonical URL and absolute Open Graph image URL after the production domain is chosen.

The current form calculates an estimate and prepares a copyable request; it is not a live reservation or payment system.
