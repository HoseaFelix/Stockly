import "server-only";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getAdminApp() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const placeholders = ["YOUR_PROJECT_ID", "YOUR_SERVICE_ACCOUNT_EMAIL", "YOUR_SERVICE_ACCOUNT_PRIVATE_KEY"];
  if (!projectId || !clientEmail || !privateKey || placeholders.some(value => [projectId, clientEmail, privateKey].includes(value))) return null;
  if (getApps().length) return getApps()[0];
  return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }), projectId });
}

export function getAdminFirestore() {
  const app = getAdminApp();
  return app ? getFirestore(app) : null;
}
