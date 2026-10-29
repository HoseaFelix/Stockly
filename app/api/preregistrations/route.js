import { FieldValue } from "firebase-admin/firestore";
import { headers } from "next/headers";
import { preregistrationSchema } from "../../../lib/validations/preregistration";
import { getAdminFirestore } from "../../../lib/firebase-admin";
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 5;
const requests = new Map();
function json(body, status) { return Response.json(body, { status, headers: { "Cache-Control": "no-store" } }); }

export async function POST(request) {
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 16_000) return json({ error: "The submitted form is too large." }, 413);
  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || requestHeaders.get("x-real-ip") || "unknown";
  const now = Date.now();
  if (requests.size > 10_000) {
    for (const [key, entry] of requests) if (entry.resetAt <= now) requests.delete(key);
  }
  const record = requests.get(ip);
  if (record && record.resetAt > now && record.count >= LIMIT) return json({ error: "Too many attempts. Please wait a few minutes and try again." }, 429);
  requests.set(ip, record && record.resetAt > now ? { count: record.count + 1, resetAt: record.resetAt } : { count: 1, resetAt: now + WINDOW_MS });
  try {
    const raw = await request.text();
    if (raw.length > 16_000) return json({ error: "The submitted form is too large." }, 413);
    let body;
    try { body = JSON.parse(raw); } catch { return json({ error: "Please submit a valid form." }, 400); }
    const parsed = preregistrationSchema.safeParse(body);
    if (!parsed.success) return json({ error: "Some answers are missing or invalid. Please review the form and try again." }, 400);
    const db = getAdminFirestore();
    if (!db) return json({ error: process.env.NODE_ENV === "development" ? "Firebase configuration is missing. Add valid Admin credentials to .env.local before submitting." : "Registration is temporarily unavailable. Please try again shortly." }, 503);
    const data = parsed.data;
    const notify = data.notificationPreference !== "No, not at the moment";
    const document = {
      location: data.location,
      shoppingFrequency: data.shoppingFrequency,
      preferredCategories: data.preferredCategories,
      shoppingChallenges: data.shoppingChallenges,
      deliveryInterest: data.deliveryInterest,
      spendingRange: data.spendingRange,
      trustFactors: data.trustFactors,
      notificationPreference: data.notificationPreference,
      marketingConsent: data.marketingConsent,
      source: "landing_page",
      submittedAt: FieldValue.serverTimestamp(),
    };
    if (data.location === "Other part of Osogbo" && data.otherLocation) document.otherLocation = data.otherLocation;
    if (data.additionalFeedback) document.additionalFeedback = data.additionalFeedback;
    if (notify) {
      if (data.firstName) document.firstName = data.firstName;
      document.contact = {};
      if (data.phone) document.contact.phone = data.phone;
      if (data.email) document.contact.email = data.email;
      if (data.preferredMethod) document.contact.preferredMethod = data.preferredMethod;
      if (data.marketingConsent) document.consentTimestamp = FieldValue.serverTimestamp();
    }
    await db.collection("preregistrations").add(document);
    return json({ success: true }, 201);
  } catch {
    return json({ error: "We couldn’t submit your registration right now. Please try again shortly." }, 500);
  }
}
