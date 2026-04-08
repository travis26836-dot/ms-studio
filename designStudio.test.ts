import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

// ─── Mock DB module ─────────────────────────────────────────
vi.mock("./db", () => ({
  getUserProjects: vi.fn().mockResolvedValue([
    { id: 1, name: "Test Project", canvasWidth: 1080, canvasHeight: 1080, canvasData: null, updatedAt: new Date() },
  ]),
  getProjectById: vi.fn().mockResolvedValue({
    id: 1, name: "Test Project", canvasWidth: 1080, canvasHeight: 1080, canvasData: '{"objects":[]}', updatedAt: new Date(),
  }),
  createProject: vi.fn().mockResolvedValue({ id: 42 }),
  updateProject: vi.fn().mockResolvedValue(undefined),
  deleteProject: vi.fn().mockResolvedValue(undefined),
  getTemplates: vi.fn().mockResolvedValue([
    { id: 1, name: "Social Post", category: "social-media", canvasWidth: 1080, canvasHeight: 1080, canvasData: '{}', usageCount: 5 },
    { id: 2, name: "Business Flyer", category: "flyer", canvasWidth: 2550, canvasHeight: 3300, canvasData: '{}', usageCount: 3 },
  ]),
  getTemplateById: vi.fn().mockResolvedValue({
    id: 1, name: "Social Post", category: "social-media", canvasWidth: 1080, canvasHeight: 1080, canvasData: '{"objects":[]}',
  }),
  createTemplate: vi.fn().mockResolvedValue({ id: 10 }),
  searchAssets: vi.fn().mockResolvedValue([
    { id: 1, name: "Arrow Icon", type: "icon", url: "https://example.com/arrow.svg" },
  ]),
  getUserUploads: vi.fn().mockResolvedValue([]),
  createUserUpload: vi.fn().mockResolvedValue({ id: 5 }),
  getUserBrandKits: vi.fn().mockResolvedValue([
    { id: 1, name: "Acme Corp", colors: [{ name: "Primary", hex: "#6366f1" }], fonts: [], logos: [] },
  ]),
  createBrandKit: vi.fn().mockResolvedValue({ id: 3 }),
  updateBrandKit: vi.fn().mockResolvedValue(undefined),
  deleteBrandKit: vi.fn().mockResolvedValue(undefined),
  createAiGeneration: vi.fn().mockResolvedValue({ id: 7 }),
  updateAiGeneration: vi.fn().mockResolvedValue(undefined),
  getUserAiGenerations: vi.fn().mockResolvedValue([]),
}));

// ─── Mock LLM ───────────────────────────────────────────────
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{ message: { content: "Here's a great color palette: #6366f1, #ec4899, #14b8a6" } }],
  }),
}));

// ─── Mock Image Generation ──────────────────────────────────
vi.mock("./_core/imageGeneration", () => ({
  generateImage: vi.fn().mockResolvedValue({ url: "https://cdn.example.com/generated.png" }),
}));

// ─── Mock Storage ───────────────────────────────────────────
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ key: "test/file.png", url: "https://cdn.example.com/file.png" }),
}));

// ─── Helper: Create authenticated context ───────────────────
function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-123",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ─── Tests ──────────────────────────────────────────────────

describe("Projects Router", () => {
  it("lists user projects", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const projects = await caller.projects.list();
    expect(Array.isArray(projects)).toBe(true);
    expect(projects.length).toBeGreaterThan(0);
    expect(projects[0]).toHaveProperty("name", "Test Project");
  });

  it("gets a project by ID", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const project = await caller.projects.get({ id: 1 });
    expect(project).toBeDefined();
    expect(project?.name).toBe("Test Project");
    expect(project?.canvasWidth).toBe(1080);
  });

  it("creates a new project", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.projects.create({
      name: "My New Design",
      canvasWidth: 1920,
      canvasHeight: 1080,
    });
    expect(result).toHaveProperty("id", 42);
  });

  it("saves canvas data to a project", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.projects.save({
      id: 1,
      canvasData: { objects: [{ type: "rect" }] },
    });
    expect(result).toEqual({ success: true });
  });

  it("deletes a project", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.projects.delete({ id: 1 });
    expect(result).toEqual({ success: true });
  });
});

describe("Templates Router", () => {
  it("lists all templates (public access)", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const templates = await caller.templates.list();
    expect(Array.isArray(templates)).toBe(true);
    expect(templates.length).toBe(2);
  });

  it("lists templates filtered by category", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const templates = await caller.templates.list({ category: "social-media" });
    expect(Array.isArray(templates)).toBe(true);
  });

  it("gets a template by ID", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const template = await caller.templates.get({ id: 1 });
    expect(template).toBeDefined();
    expect(template?.name).toBe("Social Post");
  });

  it("creates a custom template (authenticated)", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.templates.create({
      name: "My Template",
      category: "social-media",
      canvasWidth: 1080,
      canvasHeight: 1080,
      canvasData: { objects: [] },
    });
    expect(result).toHaveProperty("id", 10);
  });
});

describe("Assets Router", () => {
  it("searches assets (public access)", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const assets = await caller.assets.search({ type: "icon", query: "arrow" });
    expect(Array.isArray(assets)).toBe(true);
  });

  it("searches stock photos", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const photos = await caller.assets.searchPhotos({ query: "nature" });
    expect(Array.isArray(photos)).toBe(true);
    expect(photos.length).toBeGreaterThan(0);
    expect(photos[0]).toHaveProperty("url");
    expect(photos[0]).toHaveProperty("thumb");
    expect(photos[0]).toHaveProperty("alt");
  });

  it("returns relevant photos for specific queries", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const photos = await caller.assets.searchPhotos({ query: "business" });
    expect(photos.length).toBeGreaterThan(0);
    // Business photos should have business-related tags
    const hasBusiness = photos.some((p: any) => p.tags?.includes("business"));
    expect(hasBusiness).toBe(true);
  });
});

describe("Uploads Router", () => {
  it("lists user uploads", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const uploads = await caller.uploads.list();
    expect(Array.isArray(uploads)).toBe(true);
  });

  it("creates a new upload record", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.uploads.create({
      name: "logo.png",
      url: "https://cdn.example.com/logo.png",
      fileKey: "uploads/logo.png",
      mimeType: "image/png",
      size: 45000,
      width: 512,
      height: 512,
    });
    expect(result).toHaveProperty("id", 5);
  });
});

describe("Brand Kits Router", () => {
  it("lists user brand kits", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const kits = await caller.brandKits.list();
    expect(Array.isArray(kits)).toBe(true);
    expect(kits[0]).toHaveProperty("name", "Acme Corp");
  });

  it("creates a brand kit", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.brandKits.create({
      name: "New Brand",
      colors: [{ name: "Primary", hex: "#3b82f6" }],
      fonts: [{ name: "Heading", family: "Montserrat" }],
    });
    expect(result).toHaveProperty("id", 3);
  });

  it("updates a brand kit", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.brandKits.update({
      id: 1,
      name: "Updated Brand",
      colors: [{ name: "Primary", hex: "#ef4444" }],
    });
    expect(result).toEqual({ success: true });
  });

  it("deletes a brand kit", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.brandKits.delete({ id: 1 });
    expect(result).toEqual({ success: true });
  });
});

describe("AI Router", () => {
  it("generates an AI image element", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.ai.generateImage({
      prompt: "A modern geometric logo in purple",
    });
    expect(result).toHaveProperty("url");
    expect(result).toHaveProperty("id");
    expect(result.url).toContain("https://");
  });

  it("generates an AI background", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.ai.generateBackground({
      prompt: "Soft gradient with abstract shapes",
      width: 1920,
      height: 1080,
    });
    expect(result).toHaveProperty("url");
    expect(result.url).toContain("https://");
  });

  it("chats with the AI design assistant", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.ai.chat({
      message: "Suggest a color palette for a tech startup",
    });
    expect(result).toHaveProperty("response");
    expect(typeof result.response).toBe("string");
    expect(result.response.length).toBeGreaterThan(0);
  });

  it("chats with history context", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.ai.chat({
      message: "Make it more vibrant",
      history: [
        { role: "user", content: "Suggest a color palette" },
        { role: "assistant", content: "Here are some colors..." },
      ],
    });
    expect(result).toHaveProperty("response");
    expect(typeof result.response).toBe("string");
  });

  it("gets AI generation history", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const history = await caller.ai.history();
    expect(Array.isArray(history)).toBe(true);
  });
});

describe("Auth Router", () => {
  it("returns null user for unauthenticated context", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const user = await caller.auth.me();
    expect(user).toBeNull();
  });

  it("returns user for authenticated context", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const user = await caller.auth.me();
    expect(user).toBeDefined();
    expect(user?.name).toBe("Test User");
    expect(user?.email).toBe("test@example.com");
  });
});
