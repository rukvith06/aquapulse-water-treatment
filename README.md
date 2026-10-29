<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/f4cf359f-4726-40b4-af30-1990710e8dc7

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to Vercel

The included [`vercel.json`](./vercel.json) routes `/api/*` requests to the Express serverless function and serves the Vite build for frontend routes.

1. Import the repository into Vercel and set the project root to the folder containing `package.json` and `vercel.json`.
2. Set `MONGO_URI` to a MongoDB Atlas connection string and `JWT_SECRET` to a unique secret in Vercel Environment Variables. Do not commit credentials or `.env`.
3. Configure Atlas Network Access to allow the Vercel deployment to connect, then deploy.
4. Verify `/api/health` returns JSON with `"status":"UP"`.

The continuous sensor simulation is only started by the persistent local server. Vercel functions are request-driven and do not keep the background simulation running between requests.
