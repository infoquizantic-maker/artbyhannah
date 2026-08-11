import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Please enter your name').max(120),
  email: z.string().trim().email('Please enter a valid email').max(200),
  subject: z.string().trim().max(200).optional().or(z.literal('')),
  message: z.string().trim().min(1, 'Please enter a message').max(5000),
});

export const customRequestSchema = z.object({
  name: z.string().trim().max(120).optional().or(z.literal('')),
  email: z.string().trim().email('Please enter a valid email').max(200).optional().or(z.literal('')),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  size: z.string().trim().max(60).optional().or(z.literal('')),
  style: z.string().trim().max(60).optional().or(z.literal('')),
  budget: z.string().trim().max(60).optional().or(z.literal('')),
  description: z.string().trim().max(5000).optional().or(z.literal('')),
  deadline: z.string().trim().max(60).optional().or(z.literal('')),
});

export const inquirySchema = z.object({
  name: z.string().trim().max(120).optional().or(z.literal('')),
  email: z.string().trim().email('Please enter a valid email').max(200).optional().or(z.literal('')),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  message: z.string().trim().max(5000).optional().or(z.literal('')),
  items: z.array(z.object({ id: z.string(), title: z.string() })).max(20).optional(),
});

/**
 * POSTs to the rate-limited Netlify Function instead of inserting into
 * Supabase directly from the browser. See netlify/functions/submit-form.js.
 */
export async function submitForm(table, payload) {
  const res = await fetch('/.netlify/functions/submit-form', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ table, payload }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Submission failed. Please try again later.');
  }
  return data;
}
