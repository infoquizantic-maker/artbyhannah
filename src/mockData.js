// Shared reference data for ART By Hannaah
// Note: live artworks/testimonials come from Supabase (managed via /admin).
// This file only holds the category list and the custom-commission form options.

export const ARTWORK_CATEGORIES = ['Canvas Painting', 'Abstract Art', 'Watercolor Sketch', 'Sketch'];

// Placeholder case-study content for the /case-studies page.
// TODO (Hannah): replace with 3-6 real commissions — swap in the actual
// client brief, a couple of process photos, and a real quote for each.
// Photos referenced below are placeholders; replace with real project photos
// before launch (see /case-studies page for where they render).
export const CASE_STUDIES = [
  {
    slug: 'living-room-abstract-commission',
    title: 'A 24x36 Abstract Centerpiece for a Multan Living Room',
    client: 'Private client, Multan',
    category: 'Abstract Art',
    summary: 'A client wanted a bold abstract piece to anchor a newly renovated living room, matching a warm gold-and-cream palette.',
    challenge: 'The client had a specific color palette from their interior designer but no existing artwork to match it to — the piece had to be designed from scratch to complement furniture that was still being delivered.',
    process: 'Started with three small color-study sketches based on fabric swatches the client shared, refined the composition after feedback, then hand-painted the final 24"x36" canvas over 10 days.',
    result: 'The finished piece became the visual anchor of the room, and the client commissioned a matching smaller companion piece two months later.',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262',
    tags: ['Custom Commission', 'Abstract', 'Interior Design'],
  },
  {
    slug: 'watercolor-portrait-gift',
    title: 'A Watercolor Portrait Commissioned as an Anniversary Gift',
    client: 'Private client, gift commission',
    category: 'Watercolor Sketch',
    summary: 'A client commissioned a watercolor portrait from a single low-resolution phone photo, needed in time for an anniversary.',
    challenge: 'The only reference photo available was slightly blurry and poorly lit, and the piece needed to be finished within 10 days.',
    process: 'Worked from the reference photo alongside a short description of the subject from the client to fill in lighting and detail, sharing a progress sketch midway through for approval before finishing the painting.',
    result: 'Delivered two days ahead of the deadline; the client reported it was gifted as the centerpiece of the celebration.',
    image: 'https://images.unsplash.com/photo-1499892477393-f675706cbe6e',
    tags: ['Custom Commission', 'Portrait', 'Gift'],
  },
  {
    slug: 'gallery-floral-series',
    title: 'A 3-Piece Floral Series for a Home Office',
    client: 'Private client, Multan',
    category: 'Canvas Painting',
    summary: 'A client wanted a cohesive 3-canvas floral set to fill a long wall in a home office, sized to fit an exact gap between windows.',
    challenge: 'The three canvases needed to read as one connected composition while still working individually, and had to fit precise wall dimensions supplied by the client.',
    process: 'Sketched the full composition across all three canvases first, then painted each canvas separately, checking alignment against the combined sketch throughout.',
    result: 'The set was delivered and installed to fit the space exactly on the first attempt, with no on-site adjustments needed.',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38',
    tags: ['Custom Commission', 'Floral', 'Multi-Canvas'],
  },
];

export const customPaintingOptions = {
  sizes: [
    { value: "8x10", label: '8" x 10"', price: 4500 },
    { value: "11x14", label: '11" x 14"', price: 7000 },
    { value: "16x20", label: '16" x 20"', price: 11000 },
    { value: "18x24", label: '18" x 24"', price: 15000 },
    { value: "24x36", label: '24" x 36"', price: 21000 },
    { value: "30x40", label: '30" x 40"', price: 28000 }
  ],
  styles: [
    { value: "abstract", label: "Abstract" },
    { value: "landscape", label: "Landscape" },
    { value: "portrait", label: "Portrait" },
    { value: "floral", label: "Floral" },
    { value: "geometric", label: "Geometric" },
    { value: "watercolor", label: "Watercolor" },
    { value: "sketch", label: "Sketch" },
    { value: "mixed", label: "Mixed Media" }
  ],
  budgetRanges: [
    { value: "5000-10000", label: "Rs 5,000 - Rs 10,000" },
    { value: "10000-20000", label: "Rs 10,000 - Rs 20,000" },
    { value: "20000-35000", label: "Rs 20,000 - Rs 35,000" },
    { value: "35000-60000", label: "Rs 35,000 - Rs 60,000" },
    { value: "60000+", label: "Rs 60,000+" }
  ]
};
