# HN Foods website (Next.js + Tailwind + Supabase)

## 1. Install (Windows)
1. Install Node.js LTS from nodejs.org.
2. Open PowerShell in this folder and run: `npm install`
3. Copy `.env.example` to `.env.local` and fill in the two Supabase values (step 2 below).
4. Run `npm run dev`, then open http://localhost:3000 (site) and http://localhost:3000/admin (dashboard).

## 2. Database + image storage (Supabase, free)
1. Create a project at supabase.com.
2. SQL Editor > New query > paste all of `supabase/schema.sql` > Run. This creates the tables, security rules and the public `images` bucket.
3. Project Settings > API: copy the Project URL and the `anon public` key into `.env.local`.

## 3. First admin account
Supabase > Authentication > Users > Add user > enter email + password (tick "Auto confirm"). Then Authentication > Providers > Email > turn OFF "Allow new users to sign up" so nobody else can become an admin. Log in at /admin.

## 4. Owner guide (/admin)
- Restaurant details: edit address, phone, WhatsApp (digits with country code, e.g. 92300xxxxxxx), opening hours, social links, hero photo, then Save details.
- Menu: fill in "Add dish", upload a photo, click Add. Use Available / Popular / Edit / Delete on each item.
- Gallery: choose a photo to upload; Remove deletes it.
- Contact-form messages appear in Supabase > Table Editor > messages.

## 5. Deploy
To change the logo, replace `public/logo.png` with a new image of the same name.

, import the repo into vercel.com and add the same two environment variables.

## Replacing the built-in photos
Photos are in `public/images/` (hero.jpg = top banner, interior.jpg = About Us background, platter.jpg = Popular Dishes background, halwapuri.jpg = Contact background, kabab.png = menu heading). Replace a file with a new image of the same name. Gallery photos uploaded in /admin appear before these.
