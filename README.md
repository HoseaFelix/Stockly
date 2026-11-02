# STOCKLY pre-launch

A pre-launch landing page and survey for STOCKLY, an upcoming grocery shopping and delivery service for Osogbo, Osun State. The service is not yet operational and the category cards are not a live catalogue.

## Prerequisites

- Node.js 20 or newer and npm
- A Firebase project with Cloud Firestore enabled for real survey submissions

## Install and run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The landing page, privacy page and questionnaire work without Firebase credentials, but submitting a questionnaire will show a configuration error until valid server credentials are added. No fake submission is recorded or shown as successful.

Useful scripts:

```bash
npm run build
npm run lint
npm start
```

## Firebase setup

1. Create a Firebase project in the Firebase console.
2. Create/enable the project's Cloud Firestore database.
3. In Firestore, start in production mode. Deploy the restrictive rules in `firestore.rules` using the Firebase CLI (`firebase deploy --only firestore:rules`) after selecting the correct project. The rules deny all direct client reads and writes; submissions are performed only by the trusted server using Admin SDK credentials.
4. In Firebase project settings, create a service account key for the server. Keep the downloaded key private and do not commit it.
5. Copy `.env.example` to `.env.local` and fill the server-only variables:

   - `FIREBASE_PROJECT_ID`: Firebase project ID.
   - `FIREBASE_CLIENT_EMAIL`: service account `client_email`.
   - `FIREBASE_PRIVATE_KEY`: service account `private_key`, including its `BEGIN/END PRIVATE KEY` lines. Either use escaped `\n` characters in a single-line value or a quoted multiline value. The server normalizes escaped newlines.

The Admin SDK configuration is in `lib/firebase-admin.js`. Credentials are never exposed in browser code. This app does not use Firebase's browser SDK, so no `NEXT_PUBLIC_FIREBASE_*` settings are required. Never place service account values in `NEXT_PUBLIC_` variables. `.env.local` and `.env*` files are ignored by Git.

## Verify submissions

1. Start the development server and open `/pre-register`.
2. Complete the nine survey questions and optional contact details. The survey navigation preserves entered answers.
3. Before configuring Firebase, submit once to confirm the helpful development-only missing-credentials state. The form retains responses and does not claim success.
4. After adding valid service credentials, submit a valid response. The success screen appears only after Firestore confirms the write.
5. In Firebase Console → Firestore Database, inspect the `preregistrations` collection. Records use random IDs and server-generated timestamps.
6. To check invalid payload handling, send an invalid POST to `/api/preregistrations` (for example `{}`); it should return HTTP 400. The API rejects unknown fields, invalid options, conflicting selections, and missing notification contact details.

The route applies an in-process limit of five requests per IP per ten-minute window as a basic abuse barrier. This memory-based limit is per server process/instance and is not distributed; use a shared rate limiter (for example Redis/Upstash) for production scaling. Consider Firebase App Check or a CAPTCHA if abuse becomes a concern.

## Data and privacy

Documents are stored in `preregistrations` with survey answers, the requested contact details when notifications are selected, a marketing consent boolean, and a server timestamp for the consent when provided. Contact details are omitted when a respondent declines notifications. There is no public list or read endpoint. Review `app/privacy/page.js` before launch and replace the clearly marked business privacy contact placeholder.

The collection can later be exported from Firebase Console or with an authenticated Admin SDK script for analysis. Keep exports access-controlled and remove them when no longer needed. Do not create a public dashboard over registration records.

## Deployment and launch checklist

- Add `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` as server-side environment variables in Vercel or your hosting provider. Do not add them to client-exposed environment variables.
- Deploy `firestore.rules` to the same Firebase project.
- Replace `[REPLACE WITH STOCKLY PRIVACY EMAIL OR CONTACT DETAILS]` in the privacy page with a business-controlled contact method.
- Review data retention, deletion requests, and the privacy policy for your actual operating practices before launch.
- If deploying multiple instances, replace the in-memory rate limiter with a shared store. The current limiter resets on process restart and does not coordinate across instances.
- Confirm Firestore billing, service account permissions, deployment environment variables, and the production build in the hosting project.

## Routes

- `/` — landing page
- `/pre-register` — multi-step questionnaire
- `/privacy` — privacy policy
- `POST /api/preregistrations` — validated server-side Firestore submission
