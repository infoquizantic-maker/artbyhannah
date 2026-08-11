/**
 * seed.js
 * One-off script to repopulate the "artworks" and "testimonials" tables.
 *
 * Usage:
 *   1. In your Supabase project: Settings → API → copy the "service_role" key
 *      (NOT the anon key — this script needs elevated access to bypass RLS
 *      for a bulk insert. Never expose the service_role key in the browser).
 *   2. Run:
 *        SUPABASE_URL=https://xxxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=xxxx node seed.js
 *
 * Note: sample artworks here use hotlinked Unsplash URLs (no `images`/`path`
 * fields), just to get some content on the page quickly. Real product photos
 * should be added through /admin, which uploads them to Supabase Storage.
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars before running this script.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const artworks = [
  { title: "Turquoise Dreams", category: "Canvas Painting", price: 299, cover_image: "https://images.unsplash.com/flagged/photo-1567934150921-7632371abb32", description: "Vibrant abstract landscape with turquoise and orange tones", images: [{ url: "https://images.unsplash.com/flagged/photo-1567934150921-7632371abb32", path: null }] },
  { title: "Floral Symphony", category: "Canvas Painting", price: 349, cover_image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5", description: "Classical flower painting with rich colors", images: [{ url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5", path: null }] },
  { title: "Nature's Song", category: "Canvas Painting", price: 279, cover_image: "https://images.unsplash.com/photo-1579965342575-16428a7c8881", description: "Beautiful bird-themed artwork", images: [{ url: "https://images.unsplash.com/photo-1579965342575-16428a7c8881", path: null }] },
  { title: "Warm Embrace", category: "Abstract Art", price: 399, cover_image: "https://images.unsplash.com/photo-1531056416665-266c4099c928", description: "Warm-toned abstract perfect for modern spaces", images: [{ url: "https://images.unsplash.com/photo-1531056416665-266c4099c928", path: null }] },
  { title: "Ocean Fusion", category: "Abstract Art", price: 429, cover_image: "https://images.unsplash.com/photo-1533208087231-c3618eab623c", description: "Bold blue and orange abstract composition", images: [{ url: "https://images.unsplash.com/photo-1533208087231-c3618eab623c", path: null }] },
  { title: "Color Burst", category: "Abstract Art", price: 379, cover_image: "https://images.unsplash.com/photo-1618331835717-801e976710b2", description: "Dynamic mixed color abstract art", images: [{ url: "https://images.unsplash.com/photo-1618331835717-801e976710b2", path: null }] },
  { title: "Sunset Blend", category: "Watercolor Sketch", price: 199, cover_image: "https://images.unsplash.com/photo-1629196914375-f7e48f477b6d", description: "Vibrant watercolor with orange, pink, and yellow", images: [{ url: "https://images.unsplash.com/photo-1629196914375-f7e48f477b6d", path: null }] },
  { title: "Blue Serenity", category: "Watercolor Sketch", price: 189, cover_image: "https://images.unsplash.com/photo-1630609083938-3acb39a06392", description: "Flowing blue and purple watercolor art", images: [{ url: "https://images.unsplash.com/photo-1630609083938-3acb39a06392", path: null }] },
];

const testimonials = [
  { name: "Sarah Mitchell", rating: 5, text: "Hannah created the most beautiful custom painting for our living room. The colors are absolutely stunning and it's become the centerpiece of our home!", date_label: "2 weeks ago" },
  { name: "Michael Chen", rating: 5, text: "I commissioned a portrait for my wife's birthday. The attention to detail and the vibrant colors exceeded all expectations. Highly recommend!", date_label: "1 month ago" },
  { name: "Emily Rodriguez", rating: 5, text: "The quality of the canvas paintings is exceptional. Each piece is truly unique and you can feel the passion in every brushstroke.", date_label: "3 weeks ago" },
  { name: "David Thompson", rating: 5, text: "Bought three pieces for my office. The artwork creates such an inspiring atmosphere. Hannah's talent is incredible!", date_label: "1 month ago" },
];

async function seed() {
  console.log("Seeding artworks...");
  const { error: artErr } = await supabase.from("artworks").insert(artworks);
  if (artErr) throw artErr;

  console.log("Seeding testimonials...");
  const { error: testErr } = await supabase.from("testimonials").insert(testimonials);
  if (testErr) throw testErr;

  console.log("Done.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
