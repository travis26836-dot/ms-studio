/** Canvas element types */
export type ElementType = "text" | "image" | "shape" | "icon" | "group" | "ai-generated";

export interface CanvasElement {
  id: string;
  type: ElementType;
  left: number;
  top: number;
  width: number;
  height: number;
  angle: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  locked: boolean;
  visible: boolean;
  name: string;
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  textAlign?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  underline?: boolean;
  linethrough?: boolean;
  charSpacing?: number;
  lineHeight?: number;
  src?: string;
  shapeType?: string;
  rx?: number;
  ry?: number;
  filters?: ImageFilter[];
  aiGenerated?: boolean;
  aiPrompt?: string;
}

export interface ImageFilter {
  type: string;
  value: number;
}

export interface CanvasState {
  version: string;
  width: number;
  height: number;
  background: string;
  elements: CanvasElement[];
}

export const TEMPLATE_CATEGORIES = [
  "social-media",
  "flyer",
  "document",
  "presentation",
  "promotional",
  "poster",
  "business-card",
  "invitation",
  "resume",
  "infographic",
  "menu",
  "certificate",
  "email-header",
  "web-banner",
  "ad",
  "logo",
  "thumbnail",
  "story",
  "reel",
  "cover",
] as const;

export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number];

// ─── COMPREHENSIVE SOCIAL MEDIA & DESIGN PRESETS ──────────────
// Every major platform size for 2025-2026
export const CANVAS_PRESETS: Record<string, { width: number; height: number; label: string; category: string; platform?: string }> = {
  // ── Instagram ──
  "instagram-post": { width: 1080, height: 1080, label: "Instagram Post", category: "social-media", platform: "instagram" },
  "instagram-post-portrait": { width: 1080, height: 1350, label: "Instagram Post (Portrait)", category: "social-media", platform: "instagram" },
  "instagram-post-landscape": { width: 1080, height: 566, label: "Instagram Post (Landscape)", category: "social-media", platform: "instagram" },
  "instagram-story": { width: 1080, height: 1920, label: "Instagram Story", category: "social-media", platform: "instagram" },
  "instagram-reel": { width: 1080, height: 1920, label: "Instagram Reel", category: "social-media", platform: "instagram" },
  "instagram-carousel": { width: 1080, height: 1080, label: "Instagram Carousel", category: "social-media", platform: "instagram" },
  "instagram-profile": { width: 320, height: 320, label: "Instagram Profile Photo", category: "social-media", platform: "instagram" },
  "instagram-highlight": { width: 1080, height: 1920, label: "Instagram Highlight Cover", category: "social-media", platform: "instagram" },
  "instagram-ad": { width: 1080, height: 1080, label: "Instagram Ad", category: "ad", platform: "instagram" },

  // ── Facebook ──
  "facebook-post": { width: 1200, height: 630, label: "Facebook Post", category: "social-media", platform: "facebook" },
  "facebook-cover": { width: 820, height: 312, label: "Facebook Cover Photo", category: "cover", platform: "facebook" },
  "facebook-cover-mobile": { width: 640, height: 360, label: "Facebook Cover (Mobile)", category: "cover", platform: "facebook" },
  "facebook-profile": { width: 170, height: 170, label: "Facebook Profile Photo", category: "social-media", platform: "facebook" },
  "facebook-story": { width: 1080, height: 1920, label: "Facebook Story", category: "story", platform: "facebook" },
  "facebook-event": { width: 1920, height: 1005, label: "Facebook Event Cover", category: "cover", platform: "facebook" },
  "facebook-group": { width: 1640, height: 856, label: "Facebook Group Cover", category: "cover", platform: "facebook" },
  "facebook-ad": { width: 1200, height: 628, label: "Facebook Ad", category: "ad", platform: "facebook" },
  "facebook-carousel-ad": { width: 1080, height: 1080, label: "Facebook Carousel Ad", category: "ad", platform: "facebook" },
  "facebook-video-cover": { width: 1920, height: 1080, label: "Facebook Video Cover", category: "cover", platform: "facebook" },

  // ── TikTok ──
  "tiktok-video": { width: 1080, height: 1920, label: "TikTok Video", category: "social-media", platform: "tiktok" },
  "tiktok-profile": { width: 200, height: 200, label: "TikTok Profile Photo", category: "social-media", platform: "tiktok" },
  "tiktok-thumbnail": { width: 1080, height: 1920, label: "TikTok Thumbnail", category: "thumbnail", platform: "tiktok" },

  // ── X/Twitter ──
  "twitter-post": { width: 1200, height: 675, label: "X/Twitter Post", category: "social-media", platform: "twitter" },
  "twitter-header": { width: 1500, height: 500, label: "X/Twitter Header", category: "cover", platform: "twitter" },
  "twitter-profile": { width: 400, height: 400, label: "X/Twitter Profile Photo", category: "social-media", platform: "twitter" },
  "twitter-card": { width: 800, height: 418, label: "X/Twitter Card Image", category: "social-media", platform: "twitter" },
  "twitter-ad": { width: 1200, height: 675, label: "X/Twitter Ad", category: "ad", platform: "twitter" },

  // ── LinkedIn ──
  "linkedin-post": { width: 1200, height: 627, label: "LinkedIn Post", category: "social-media", platform: "linkedin" },
  "linkedin-cover": { width: 1584, height: 396, label: "LinkedIn Cover Photo", category: "cover", platform: "linkedin" },
  "linkedin-profile": { width: 400, height: 400, label: "LinkedIn Profile Photo", category: "social-media", platform: "linkedin" },
  "linkedin-company-logo": { width: 300, height: 300, label: "LinkedIn Company Logo", category: "logo", platform: "linkedin" },
  "linkedin-article": { width: 1200, height: 644, label: "LinkedIn Article Cover", category: "cover", platform: "linkedin" },
  "linkedin-carousel": { width: 1080, height: 1080, label: "LinkedIn Carousel", category: "social-media", platform: "linkedin" },
  "linkedin-ad": { width: 1200, height: 627, label: "LinkedIn Ad", category: "ad", platform: "linkedin" },

  // ── Pinterest ──
  "pinterest-pin": { width: 1000, height: 1500, label: "Pinterest Pin", category: "social-media", platform: "pinterest" },
  "pinterest-square": { width: 1000, height: 1000, label: "Pinterest Square Pin", category: "social-media", platform: "pinterest" },
  "pinterest-long": { width: 1000, height: 2100, label: "Pinterest Long Pin", category: "social-media", platform: "pinterest" },
  "pinterest-profile": { width: 165, height: 165, label: "Pinterest Profile Photo", category: "social-media", platform: "pinterest" },
  "pinterest-board": { width: 222, height: 150, label: "Pinterest Board Cover", category: "cover", platform: "pinterest" },

  // ── YouTube ──
  "youtube-thumbnail": { width: 1280, height: 720, label: "YouTube Thumbnail", category: "thumbnail", platform: "youtube" },
  "youtube-channel-art": { width: 2560, height: 1440, label: "YouTube Channel Art", category: "cover", platform: "youtube" },
  "youtube-profile": { width: 800, height: 800, label: "YouTube Profile Photo", category: "social-media", platform: "youtube" },
  "youtube-video": { width: 1920, height: 1080, label: "YouTube Video (1080p)", category: "social-media", platform: "youtube" },
  "youtube-shorts": { width: 1080, height: 1920, label: "YouTube Shorts", category: "social-media", platform: "youtube" },
  "youtube-end-screen": { width: 1920, height: 1080, label: "YouTube End Screen", category: "social-media", platform: "youtube" },

  // ── Print Sizes ──
  "business-card": { width: 1050, height: 600, label: "Business Card", category: "business-card" },
  "business-card-vertical": { width: 600, height: 1050, label: "Business Card (Vertical)", category: "business-card" },
  "flyer-letter": { width: 2550, height: 3300, label: "Flyer (Letter)", category: "flyer" },
  "flyer-a4": { width: 2480, height: 3508, label: "Flyer (A4)", category: "flyer" },
  "flyer-half": { width: 2550, height: 1650, label: "Flyer (Half Letter)", category: "flyer" },
  "poster-18x24": { width: 5400, height: 7200, label: "Poster (18x24)", category: "poster" },
  "poster-24x36": { width: 7200, height: 10800, label: "Poster (24x36)", category: "poster" },
  "poster-11x17": { width: 3300, height: 5100, label: "Poster (11x17)", category: "poster" },
  "postcard": { width: 1800, height: 1200, label: "Postcard", category: "promotional" },
  "invitation-5x7": { width: 1500, height: 2100, label: "Invitation (5x7)", category: "invitation" },
  "menu-letter": { width: 2550, height: 3300, label: "Menu (Letter)", category: "menu" },
  "menu-a4": { width: 2480, height: 3508, label: "Menu (A4)", category: "menu" },
  "certificate-landscape": { width: 3300, height: 2550, label: "Certificate (Landscape)", category: "certificate" },
  "certificate-portrait": { width: 2550, height: 3300, label: "Certificate (Portrait)", category: "certificate" },
  "resume-letter": { width: 2550, height: 3300, label: "Resume (Letter)", category: "resume" },
  "resume-a4": { width: 2480, height: 3508, label: "Resume (A4)", category: "resume" },

  // ── Presentations ──
  "presentation-16-9": { width: 1920, height: 1080, label: "Presentation (16:9)", category: "presentation" },
  "presentation-4-3": { width: 1024, height: 768, label: "Presentation (4:3)", category: "presentation" },
  "presentation-widescreen": { width: 2560, height: 1440, label: "Presentation (Widescreen)", category: "presentation" },

  // ── Documents ──
  "document-letter": { width: 2550, height: 3300, label: "Document (Letter)", category: "document" },
  "document-a4": { width: 2480, height: 3508, label: "Document (A4)", category: "document" },
  "document-legal": { width: 2550, height: 4200, label: "Document (Legal)", category: "document" },

  // ── Email & Web ──
  "email-header": { width: 600, height: 200, label: "Email Header", category: "email-header" },
  "web-banner": { width: 1200, height: 300, label: "Web Banner", category: "web-banner" },
  "blog-header": { width: 1200, height: 630, label: "Blog Header Image", category: "web-banner" },
  "newsletter": { width: 600, height: 1200, label: "Newsletter", category: "email-header" },
  "favicon": { width: 512, height: 512, label: "Favicon", category: "logo" },
  "open-graph": { width: 1200, height: 630, label: "Open Graph Image", category: "web-banner" },
  "leaderboard-ad": { width: 728, height: 90, label: "Leaderboard Ad", category: "ad" },
  "medium-rectangle-ad": { width: 300, height: 250, label: "Medium Rectangle Ad", category: "ad" },
  "skyscraper-ad": { width: 160, height: 600, label: "Skyscraper Ad", category: "ad" },

  // ── Logo ──
  "logo-square": { width: 500, height: 500, label: "Logo (Square)", category: "logo" },
  "logo-landscape": { width: 800, height: 400, label: "Logo (Landscape)", category: "logo" },
  "logo-icon": { width: 256, height: 256, label: "Logo Icon", category: "logo" },

  // ── Infographic ──
  "infographic-standard": { width: 800, height: 2000, label: "Infographic", category: "infographic" },
  "infographic-wide": { width: 1200, height: 3000, label: "Infographic (Wide)", category: "infographic" },

  // ── Custom ──
  "custom": { width: 1080, height: 1080, label: "Custom Size", category: "custom" },
};

export type CanvasPreset = keyof typeof CANVAS_PRESETS;

// ─── PLATFORM GROUPINGS ──────────────────────────────────────
export const PLATFORM_GROUPS: Record<string, { label: string; icon: string; presets: string[] }> = {
  instagram: {
    label: "Instagram",
    icon: "instagram",
    presets: Object.keys(CANVAS_PRESETS).filter(k => CANVAS_PRESETS[k].platform === "instagram"),
  },
  facebook: {
    label: "Facebook",
    icon: "facebook",
    presets: Object.keys(CANVAS_PRESETS).filter(k => CANVAS_PRESETS[k].platform === "facebook"),
  },
  tiktok: {
    label: "TikTok",
    icon: "tiktok",
    presets: Object.keys(CANVAS_PRESETS).filter(k => CANVAS_PRESETS[k].platform === "tiktok"),
  },
  twitter: {
    label: "X/Twitter",
    icon: "twitter",
    presets: Object.keys(CANVAS_PRESETS).filter(k => CANVAS_PRESETS[k].platform === "twitter"),
  },
  linkedin: {
    label: "LinkedIn",
    icon: "linkedin",
    presets: Object.keys(CANVAS_PRESETS).filter(k => CANVAS_PRESETS[k].platform === "linkedin"),
  },
  pinterest: {
    label: "Pinterest",
    icon: "pinterest",
    presets: Object.keys(CANVAS_PRESETS).filter(k => CANVAS_PRESETS[k].platform === "pinterest"),
  },
  youtube: {
    label: "YouTube",
    icon: "youtube",
    presets: Object.keys(CANVAS_PRESETS).filter(k => CANVAS_PRESETS[k].platform === "youtube"),
  },
  print: {
    label: "Print",
    icon: "printer",
    presets: ["business-card", "business-card-vertical", "flyer-letter", "flyer-a4", "poster-18x24", "poster-24x36", "postcard", "invitation-5x7", "menu-letter", "certificate-landscape", "resume-letter"],
  },
  web: {
    label: "Web & Email",
    icon: "globe",
    presets: ["email-header", "web-banner", "blog-header", "newsletter", "favicon", "open-graph", "leaderboard-ad", "medium-rectangle-ad", "skyscraper-ad"],
  },
};

export const ASSET_TYPES = ["photo", "icon", "shape", "element", "background", "pattern", "illustration", "texture", "frame", "sticker"] as const;
export type AssetType = (typeof ASSET_TYPES)[number];

export const EXPORT_FORMATS = ["png", "jpg", "pdf", "svg", "webp"] as const;
export type ExportFormat = (typeof EXPORT_FORMATS)[number];

// ─── EXPANDED BRAND KIT TYPES ────────────────────────────────

export interface BrandColor {
  name: string;
  hex: string;
  group?: "primary" | "secondary" | "neutral" | "accent" | "custom";
}

export interface BrandFont {
  name: string;
  family: string;
  variants: string[];
  role?: "heading" | "subheading" | "body" | "caption" | "accent" | "custom";
  weight?: string;
  style?: string;
}

export interface BrandLogo {
  name: string;
  url: string;
  type: "primary" | "secondary" | "icon" | "wordmark" | "monochrome" | "dark" | "light";
  fileKey?: string;
}

export interface BrandGradient {
  name: string;
  colors: string[];
  angle: number;
  type: "linear" | "radial";
}

export interface BrandVoice {
  tone: string;
  personality: string[];
  keywords: string[];
  avoidWords: string[];
  sampleCopy: string;
}

export interface BrandKit {
  id?: number;
  name: string;
  description?: string;
  colors: BrandColor[];
  fonts: BrandFont[];
  logos: BrandLogo[];
  gradients?: BrandGradient[];
  voice?: BrandVoice;
  patterns?: string[];
  isDefault?: boolean;
}

// ─── COLOR PALETTE PRESETS ───────────────────────────────────

export const COLOR_PALETTE_PRESETS: Record<string, { name: string; colors: BrandColor[] }> = {
  "modern-tech": {
    name: "Modern Tech",
    colors: [
      { name: "Electric Blue", hex: "#3B82F6", group: "primary" },
      { name: "Deep Navy", hex: "#1E3A5F", group: "primary" },
      { name: "Cyber Violet", hex: "#7C3AED", group: "secondary" },
      { name: "Neon Teal", hex: "#06B6D4", group: "accent" },
      { name: "Slate", hex: "#64748B", group: "neutral" },
      { name: "Snow", hex: "#F8FAFC", group: "neutral" },
    ],
  },
  "warm-sunset": {
    name: "Warm Sunset",
    colors: [
      { name: "Coral", hex: "#F97316", group: "primary" },
      { name: "Rose", hex: "#F43F5E", group: "primary" },
      { name: "Amber", hex: "#F59E0B", group: "secondary" },
      { name: "Peach", hex: "#FBBF24", group: "accent" },
      { name: "Warm Gray", hex: "#78716C", group: "neutral" },
      { name: "Cream", hex: "#FFFBEB", group: "neutral" },
    ],
  },
  "nature-earth": {
    name: "Nature & Earth",
    colors: [
      { name: "Forest", hex: "#166534", group: "primary" },
      { name: "Sage", hex: "#84CC16", group: "primary" },
      { name: "Earth", hex: "#92400E", group: "secondary" },
      { name: "Sky", hex: "#38BDF8", group: "accent" },
      { name: "Stone", hex: "#A8A29E", group: "neutral" },
      { name: "Linen", hex: "#FAF5FF", group: "neutral" },
    ],
  },
  "luxury-dark": {
    name: "Luxury Dark",
    colors: [
      { name: "Gold", hex: "#D4AF37", group: "primary" },
      { name: "Charcoal", hex: "#1C1917", group: "primary" },
      { name: "Burgundy", hex: "#7F1D1D", group: "secondary" },
      { name: "Champagne", hex: "#F5F0E8", group: "accent" },
      { name: "Platinum", hex: "#A1A1AA", group: "neutral" },
      { name: "Ivory", hex: "#FFFFF0", group: "neutral" },
    ],
  },
  "pastel-dream": {
    name: "Pastel Dream",
    colors: [
      { name: "Lavender", hex: "#C4B5FD", group: "primary" },
      { name: "Blush", hex: "#FBCFE8", group: "primary" },
      { name: "Mint", hex: "#A7F3D0", group: "secondary" },
      { name: "Butter", hex: "#FDE68A", group: "accent" },
      { name: "Dove", hex: "#D1D5DB", group: "neutral" },
      { name: "Cloud", hex: "#FAFAFA", group: "neutral" },
    ],
  },
  "bold-creative": {
    name: "Bold Creative",
    colors: [
      { name: "Hot Pink", hex: "#EC4899", group: "primary" },
      { name: "Electric Purple", hex: "#A855F7", group: "primary" },
      { name: "Lime", hex: "#84CC16", group: "secondary" },
      { name: "Cyan", hex: "#22D3EE", group: "accent" },
      { name: "Jet", hex: "#171717", group: "neutral" },
      { name: "White", hex: "#FFFFFF", group: "neutral" },
    ],
  },
  "ocean-breeze": {
    name: "Ocean Breeze",
    colors: [
      { name: "Deep Sea", hex: "#0369A1", group: "primary" },
      { name: "Aqua", hex: "#06B6D4", group: "primary" },
      { name: "Coral Reef", hex: "#FB923C", group: "secondary" },
      { name: "Sand", hex: "#FDE68A", group: "accent" },
      { name: "Driftwood", hex: "#A8A29E", group: "neutral" },
      { name: "Foam", hex: "#F0F9FF", group: "neutral" },
    ],
  },
  "minimalist": {
    name: "Minimalist",
    colors: [
      { name: "Black", hex: "#000000", group: "primary" },
      { name: "White", hex: "#FFFFFF", group: "primary" },
      { name: "Medium Gray", hex: "#6B7280", group: "secondary" },
      { name: "Light Gray", hex: "#E5E7EB", group: "accent" },
      { name: "Dark Gray", hex: "#374151", group: "neutral" },
      { name: "Off White", hex: "#F9FAFB", group: "neutral" },
    ],
  },
  "retro-vintage": {
    name: "Retro Vintage",
    colors: [
      { name: "Mustard", hex: "#CA8A04", group: "primary" },
      { name: "Rust", hex: "#B45309", group: "primary" },
      { name: "Olive", hex: "#4D7C0F", group: "secondary" },
      { name: "Teal", hex: "#0D9488", group: "accent" },
      { name: "Brown", hex: "#78350F", group: "neutral" },
      { name: "Parchment", hex: "#FEF3C7", group: "neutral" },
    ],
  },
  "corporate-pro": {
    name: "Corporate Professional",
    colors: [
      { name: "Navy", hex: "#1E3A5F", group: "primary" },
      { name: "Royal Blue", hex: "#2563EB", group: "primary" },
      { name: "Steel", hex: "#475569", group: "secondary" },
      { name: "Sky", hex: "#7DD3FC", group: "accent" },
      { name: "Silver", hex: "#CBD5E1", group: "neutral" },
      { name: "White", hex: "#FFFFFF", group: "neutral" },
    ],
  },
};

// ─── FONT COLLECTION ─────────────────────────────────────────
// Comprehensive Google Fonts collection organized by style

export const FONT_COLLECTION: Record<string, { fonts: BrandFont[] }> = {
  "sans-serif-modern": {
    fonts: [
      { name: "Inter", family: "Inter", variants: ["300", "400", "500", "600", "700", "800", "900"], role: "body" },
      { name: "Poppins", family: "Poppins", variants: ["300", "400", "500", "600", "700", "800", "900"], role: "heading" },
      { name: "Montserrat", family: "Montserrat", variants: ["300", "400", "500", "600", "700", "800", "900"], role: "heading" },
      { name: "Roboto", family: "Roboto", variants: ["300", "400", "500", "700", "900"], role: "body" },
      { name: "Open Sans", family: "Open Sans", variants: ["300", "400", "500", "600", "700", "800"], role: "body" },
      { name: "Lato", family: "Lato", variants: ["300", "400", "700", "900"], role: "body" },
      { name: "Nunito", family: "Nunito", variants: ["300", "400", "500", "600", "700", "800", "900"], role: "body" },
      { name: "Raleway", family: "Raleway", variants: ["300", "400", "500", "600", "700", "800", "900"], role: "heading" },
      { name: "Work Sans", family: "Work Sans", variants: ["300", "400", "500", "600", "700", "800", "900"], role: "body" },
      { name: "DM Sans", family: "DM Sans", variants: ["400", "500", "700"], role: "body" },
      { name: "Plus Jakarta Sans", family: "Plus Jakarta Sans", variants: ["300", "400", "500", "600", "700", "800"], role: "heading" },
      { name: "Outfit", family: "Outfit", variants: ["300", "400", "500", "600", "700", "800", "900"], role: "heading" },
      { name: "Space Grotesk", family: "Space Grotesk", variants: ["300", "400", "500", "600", "700"], role: "heading" },
      { name: "Manrope", family: "Manrope", variants: ["300", "400", "500", "600", "700", "800"], role: "body" },
      { name: "Sora", family: "Sora", variants: ["300", "400", "500", "600", "700", "800"], role: "heading" },
    ],
  },
  "sans-serif-classic": {
    fonts: [
      { name: "Source Sans Pro", family: "Source Sans 3", variants: ["300", "400", "600", "700", "900"], role: "body" },
      { name: "Oswald", family: "Oswald", variants: ["300", "400", "500", "600", "700"], role: "heading" },
      { name: "Barlow", family: "Barlow", variants: ["300", "400", "500", "600", "700", "800", "900"], role: "body" },
      { name: "Rubik", family: "Rubik", variants: ["300", "400", "500", "600", "700", "800", "900"], role: "body" },
      { name: "Mulish", family: "Mulish", variants: ["300", "400", "500", "600", "700", "800", "900"], role: "body" },
      { name: "Quicksand", family: "Quicksand", variants: ["300", "400", "500", "600", "700"], role: "body" },
      { name: "Karla", family: "Karla", variants: ["300", "400", "500", "600", "700", "800"], role: "body" },
      { name: "Josefin Sans", family: "Josefin Sans", variants: ["300", "400", "500", "600", "700"], role: "heading" },
      { name: "Cabin", family: "Cabin", variants: ["400", "500", "600", "700"], role: "body" },
      { name: "Exo 2", family: "Exo 2", variants: ["300", "400", "500", "600", "700", "800", "900"], role: "heading" },
    ],
  },
  "serif-elegant": {
    fonts: [
      { name: "Playfair Display", family: "Playfair Display", variants: ["400", "500", "600", "700", "800", "900"], role: "heading" },
      { name: "Merriweather", family: "Merriweather", variants: ["300", "400", "700", "900"], role: "body" },
      { name: "Lora", family: "Lora", variants: ["400", "500", "600", "700"], role: "body" },
      { name: "Cormorant Garamond", family: "Cormorant Garamond", variants: ["300", "400", "500", "600", "700"], role: "heading" },
      { name: "Libre Baskerville", family: "Libre Baskerville", variants: ["400", "700"], role: "body" },
      { name: "EB Garamond", family: "EB Garamond", variants: ["400", "500", "600", "700", "800"], role: "body" },
      { name: "Crimson Text", family: "Crimson Text", variants: ["400", "600", "700"], role: "body" },
      { name: "DM Serif Display", family: "DM Serif Display", variants: ["400"], role: "heading" },
      { name: "Fraunces", family: "Fraunces", variants: ["300", "400", "500", "600", "700", "800", "900"], role: "heading" },
      { name: "Spectral", family: "Spectral", variants: ["300", "400", "500", "600", "700", "800"], role: "body" },
    ],
  },
  "display-bold": {
    fonts: [
      { name: "Bebas Neue", family: "Bebas Neue", variants: ["400"], role: "heading" },
      { name: "Anton", family: "Anton", variants: ["400"], role: "heading" },
      { name: "Righteous", family: "Righteous", variants: ["400"], role: "heading" },
      { name: "Archivo Black", family: "Archivo Black", variants: ["400"], role: "heading" },
      { name: "Bungee", family: "Bungee", variants: ["400"], role: "heading" },
      { name: "Russo One", family: "Russo One", variants: ["400"], role: "heading" },
      { name: "Black Ops One", family: "Black Ops One", variants: ["400"], role: "heading" },
      { name: "Passion One", family: "Passion One", variants: ["400", "700", "900"], role: "heading" },
      { name: "Teko", family: "Teko", variants: ["300", "400", "500", "600", "700"], role: "heading" },
      { name: "Fjalla One", family: "Fjalla One", variants: ["400"], role: "heading" },
    ],
  },
  "handwritten-script": {
    fonts: [
      { name: "Dancing Script", family: "Dancing Script", variants: ["400", "500", "600", "700"], role: "accent" },
      { name: "Pacifico", family: "Pacifico", variants: ["400"], role: "accent" },
      { name: "Great Vibes", family: "Great Vibes", variants: ["400"], role: "accent" },
      { name: "Satisfy", family: "Satisfy", variants: ["400"], role: "accent" },
      { name: "Sacramento", family: "Sacramento", variants: ["400"], role: "accent" },
      { name: "Caveat", family: "Caveat", variants: ["400", "500", "600", "700"], role: "accent" },
      { name: "Kalam", family: "Kalam", variants: ["300", "400", "700"], role: "accent" },
      { name: "Indie Flower", family: "Indie Flower", variants: ["400"], role: "accent" },
      { name: "Shadows Into Light", family: "Shadows Into Light", variants: ["400"], role: "accent" },
      { name: "Amatic SC", family: "Amatic SC", variants: ["400", "700"], role: "accent" },
    ],
  },
  "monospace": {
    fonts: [
      { name: "JetBrains Mono", family: "JetBrains Mono", variants: ["300", "400", "500", "600", "700", "800"], role: "body" },
      { name: "Fira Code", family: "Fira Code", variants: ["300", "400", "500", "600", "700"], role: "body" },
      { name: "Source Code Pro", family: "Source Code Pro", variants: ["300", "400", "500", "600", "700", "900"], role: "body" },
      { name: "Space Mono", family: "Space Mono", variants: ["400", "700"], role: "body" },
      { name: "IBM Plex Mono", family: "IBM Plex Mono", variants: ["300", "400", "500", "600", "700"], role: "body" },
    ],
  },
};

// ─── FONT PAIRING PRESETS ────────────────────────────────────

export const FONT_PAIRINGS: Array<{
  name: string;
  description: string;
  heading: { family: string; weight: string };
  subheading: { family: string; weight: string };
  body: { family: string; weight: string };
}> = [
  { name: "Elegant Classic", description: "Timeless serif + clean sans-serif", heading: { family: "Playfair Display", weight: "700" }, subheading: { family: "Lato", weight: "400" }, body: { family: "Lato", weight: "300" } },
  { name: "Modern Minimal", description: "Geometric + humanist pairing", heading: { family: "Montserrat", weight: "700" }, subheading: { family: "Open Sans", weight: "600" }, body: { family: "Open Sans", weight: "400" } },
  { name: "Clean Professional", description: "Round + neutral combination", heading: { family: "Poppins", weight: "700" }, subheading: { family: "Roboto", weight: "500" }, body: { family: "Roboto", weight: "400" } },
  { name: "Tech Forward", description: "Sharp + readable for tech brands", heading: { family: "Space Grotesk", weight: "700" }, subheading: { family: "Inter", weight: "600" }, body: { family: "Inter", weight: "400" } },
  { name: "Bold Statement", description: "Condensed + traditional serif", heading: { family: "Oswald", weight: "700" }, subheading: { family: "Merriweather", weight: "400" }, body: { family: "Merriweather", weight: "300" } },
  { name: "Luxury Brand", description: "Elegant serif + thin sans", heading: { family: "Cormorant Garamond", weight: "600" }, subheading: { family: "Raleway", weight: "500" }, body: { family: "Raleway", weight: "300" } },
  { name: "Creative Studio", description: "Display + rounded sans", heading: { family: "Bebas Neue", weight: "400" }, subheading: { family: "Nunito", weight: "600" }, body: { family: "Nunito", weight: "400" } },
  { name: "Editorial", description: "Classic serif + modern sans", heading: { family: "DM Serif Display", weight: "400" }, subheading: { family: "DM Sans", weight: "500" }, body: { family: "DM Sans", weight: "400" } },
  { name: "Startup Fresh", description: "Modern geometric + clean body", heading: { family: "Plus Jakarta Sans", weight: "800" }, subheading: { family: "Work Sans", weight: "500" }, body: { family: "Work Sans", weight: "400" } },
  { name: "Artisan Craft", description: "Handwritten + classic serif", heading: { family: "Caveat", weight: "700" }, subheading: { family: "Lora", weight: "500" }, body: { family: "Lora", weight: "400" } },
  { name: "Corporate Sharp", description: "Strong + readable for business", heading: { family: "Barlow", weight: "800" }, subheading: { family: "Source Sans 3", weight: "600" }, body: { family: "Source Sans 3", weight: "400" } },
  { name: "Playful Pop", description: "Fun rounded + friendly body", heading: { family: "Righteous", weight: "400" }, subheading: { family: "Quicksand", weight: "600" }, body: { family: "Quicksand", weight: "400" } },
];

// ─── SOCIAL MEDIA INTEGRATION TYPES ─────────────────────────

export type SocialPlatform = "facebook" | "instagram" | "tiktok" | "twitter" | "linkedin" | "pinterest" | "youtube";

export interface SocialConnection {
  platform: SocialPlatform;
  accountId: string;
  accountName: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiry?: Date;
  profileImageUrl?: string;
  isConnected: boolean;
  permissions?: string[];
}

export interface SocialPublishOptions {
  platform: SocialPlatform;
  caption?: string;
  hashtags?: string[];
  scheduledAt?: Date;
  imageUrl?: string;
  imageData?: string;
  altText?: string;
  location?: string;
  firstComment?: string;
}

export interface SocialPublishResult {
  success: boolean;
  platform: SocialPlatform;
  postId?: string;
  postUrl?: string;
  error?: string;
  publishedAt?: Date;
}

export interface PublishHistory {
  id: number;
  projectId: number;
  platform: SocialPlatform;
  postId?: string;
  postUrl?: string;
  caption?: string;
  status: "published" | "scheduled" | "failed" | "draft";
  publishedAt?: Date;
  scheduledAt?: Date;
  error?: string;
}

// ─── AI ASSISTANT TYPES ──────────────────────────────────────

export interface AIAssistantCapability {
  id: string;
  name: string;
  description: string;
  category: "design" | "content" | "branding" | "social" | "analysis" | "generation";
  isEnabled: boolean;
}

export const AI_CAPABILITIES: AIAssistantCapability[] = [
  { id: "layout-gen", name: "Layout Generation", description: "Generate complete design layouts from descriptions", category: "design", isEnabled: true },
  { id: "color-suggest", name: "Color Palette Suggestion", description: "AI-powered color palette generation based on mood, industry, or reference", category: "design", isEnabled: true },
  { id: "font-suggest", name: "Font Pairing Suggestion", description: "Smart font pairing recommendations", category: "design", isEnabled: true },
  { id: "copy-write", name: "Copywriting", description: "Generate headlines, taglines, body text, and CTAs", category: "content", isEnabled: true },
  { id: "brand-voice", name: "Brand Voice Writing", description: "Write copy that matches your brand voice and tone", category: "branding", isEnabled: true },
  { id: "image-gen", name: "Image Generation", description: "Generate images, backgrounds, and design elements from text", category: "generation", isEnabled: true },
  { id: "bg-gen", name: "Background Generation", description: "Create custom backgrounds from descriptions", category: "generation", isEnabled: true },
  { id: "element-gen", name: "Element Generation", description: "Generate icons, shapes, and decorative elements", category: "generation", isEnabled: true },
  { id: "social-caption", name: "Social Media Captions", description: "Generate platform-optimized captions with hashtags", category: "social", isEnabled: true },
  { id: "design-critique", name: "Design Critique", description: "Get AI feedback on your design's composition, colors, and typography", category: "analysis", isEnabled: true },
  { id: "style-transfer", name: "Style Transfer", description: "Apply design styles from one element to another", category: "design", isEnabled: true },
  { id: "smart-resize", name: "Smart Resize", description: "Intelligently resize designs for different platforms", category: "design", isEnabled: true },
  { id: "text-effects", name: "Text Effects", description: "Generate creative text effects and styles", category: "generation", isEnabled: true },
  { id: "pattern-gen", name: "Pattern Generation", description: "Create seamless patterns and textures", category: "generation", isEnabled: true },
  { id: "mockup-gen", name: "Mockup Generation", description: "Place designs on realistic product mockups", category: "generation", isEnabled: true },
];

// ─── CUSTOMER PORTAL TYPES ───────────────────────────────────

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  company?: string;
  website?: string;
  plan: "free" | "pro" | "enterprise";
  storageUsed: number;
  storageLimit: number;
  projectCount: number;
  createdAt: Date;
}

export interface UserActivity {
  id: number;
  type: "project_created" | "project_edited" | "project_exported" | "project_published" | "template_used" | "ai_generated" | "upload" | "brand_kit_updated";
  description: string;
  projectId?: number;
  projectName?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface DashboardStats {
  totalProjects: number;
  totalExports: number;
  totalPublished: number;
  aiGenerations: number;
  storageUsed: number;
  recentActivity: UserActivity[];
}

export interface ProjectFolder {
  id: number;
  name: string;
  color?: string;
  projectCount: number;
  createdAt: Date;
}
