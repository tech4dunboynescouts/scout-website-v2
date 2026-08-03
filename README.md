This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Windows Dev Note

On Windows, this project can hang on `next dev` (Turbopack) even after `Ready` is shown.
The default `npm run dev` script is configured to use webpack mode for stability.

- Stable local start: `npm run dev`
- Optional Turbopack test: `npm run dev:turbo`

If you see `Another next dev server is already running`, stop the stale process and restart:

```powershell
Get-NetTCPConnection -LocalPort 3000 -State Listen | Select-Object OwningProcess
taskkill /PID <pid> /F
```

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Environment Variables

For the Leaders Portal payments flow, set these server-side values in your local `.env.local` and in production:

- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL` or `VERCEL_URL`
- `SANITY_WRITE_TOKEN`

Leaders payments also require an `annualSubscriptionPricing` singleton document in Sanity with unit prices and Stripe Price IDs for Beavers, Cubs, Scouts, and Ventures.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


# Use Stripe’s standard test cards in sandbox mode. The easiest one:

Card number: 4242 4242 4242 4242
Expiry: any future date (for example 12/34)
CVC: any 3 digits (for example 123)
ZIP/Postcode: any value
Useful additional test cards for flow testing:

4000 0025 0000 3155 : requires 3D Secure authentication
4000 0000 0000 0002 : generic card decline
4000 0000 0000 9995 : insufficient funds
4000 0000 0000 0069 : expired card
Tips:

Make sure you’re using Stripe test API keys.
In test mode, never use real card details.
If Stripe shows an auth challenge (3DS), follow the on-screen test prompts to complete/fail as needed.