import { z } from "zod";

const options = {
  location: ["Oke-Fia / Alekuwodo", "Dada Estate / Ring Road", "Oja-Oba / City Centre", "Testing Ground / other areas nearby", "Other part of Osogbo", "Outside Osogbo"],
  shoppingFrequency: ["Daily", "2–3 times a week", "Once a week", "2–3 times a month", "Only when necessary"],
  preferredCategories: ["Rice, beans, garri and other foodstuffs", "Tomatoes, peppers, onions and vegetables", "Fruits", "Drinks and dairy products", "Frozen foods", "Detergents, toiletries and cleaning products", "A combination of these"],
  shoppingChallenges: ["High or inconsistent prices", "Transport or distance to the market", "Time spent shopping", "Difficulty finding good-quality products", "Unreliable sellers or inaccurate measurements", "Getting groceries delivered conveniently", "I have no major challenge"],
  deliveryInterest: ["Definitely, I would try it", "Probably, depending on prices and delivery fees", "Maybe, after seeing reviews or recommendations", "No, I prefer shopping in person"],
  spendingRange: ["Below ₦3,000", "₦3,000–₦5,000", "₦5,001–₦10,000", "₦10,001–₦20,000", "Above ₦20,000", "It varies too much to say"],
  trustFactors: ["Clear prices with no hidden charges", "Fresh, quality products and accurate quantities", "Reliable delivery within the promised time", "Customer reviews and recommendations", "Easy payment and responsive customer support", "A combination of all these"],
  notificationPreference: ["Yes — notify me when orders open", "Yes — send me launch offers and updates", "Maybe — I want to learn more first", "No, not at the moment"],
};
const phoneSchema = z.string().trim().max(25).refine(value => !value || /^\+?[0-9\s()-]{7,20}$/.test(value), "Enter a valid phone number.");
const emailSchema = z.string().trim().max(254).refine(value => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), "Enter a valid email address.");
export const preregistrationSchema = z.object({
  firstName: z.string().trim().max(80).optional().default(""),
  phone: phoneSchema.optional().default(""),
  email: emailSchema.optional().default(""),
  preferredMethod: z.enum(["phone", "whatsapp", "email", ""]).optional().default(""),
  location: z.enum(options.location),
  otherLocation: z.string().trim().max(100).optional().default(""),
  shoppingFrequency: z.enum(options.shoppingFrequency),
  preferredCategories: z.array(z.enum(options.preferredCategories)).min(1).max(7),
  shoppingChallenges: z.array(z.enum(options.shoppingChallenges)).min(1).max(7),
  deliveryInterest: z.enum(options.deliveryInterest),
  spendingRange: z.enum(options.spendingRange),
  trustFactors: z.array(z.enum(options.trustFactors)).min(1).max(6),
  notificationPreference: z.enum(options.notificationPreference),
  additionalFeedback: z.string().trim().max(500).optional().default(""),
  marketingConsent: z.boolean().default(false),
}).strict().superRefine((data, ctx) => {
  const noChallenge = data.shoppingChallenges.includes("I have no major challenge");
  if (noChallenge && data.shoppingChallenges.length > 1) ctx.addIssue({ code: "custom", path: ["shoppingChallenges"], message: "“I have no major challenge” cannot be combined with other answers." });
  const notify = data.notificationPreference !== "No, not at the moment";
  if (notify && !data.phone.trim() && !data.email.trim()) ctx.addIssue({ code: "custom", path: ["phone"], message: "At least one contact method is required for launch notifications." });
  if (notify && !data.preferredMethod) ctx.addIssue({ code: "custom", path: ["preferredMethod"], message: "Choose a preferred contact method for notifications." });
  if (data.preferredMethod === "phone" && !data.phone.trim()) ctx.addIssue({ code: "custom", path: ["phone"], message: "Add a phone number for your selected contact method." });
  if (data.preferredMethod === "whatsapp" && !data.phone.trim()) ctx.addIssue({ code: "custom", path: ["phone"], message: "Add a phone number for WhatsApp updates." });
  if (data.preferredMethod === "email" && !data.email.trim()) ctx.addIssue({ code: "custom", path: ["email"], message: "Add an email address for your selected contact method." });
  if (!notify && (data.phone.trim() || data.email.trim() || data.firstName.trim())) ctx.addIssue({ code: "custom", path: ["phone"], message: "Contact details are not collected when you decline notifications." });
});
