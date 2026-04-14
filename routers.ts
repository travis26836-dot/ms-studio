import { z } from "zod";
import { router, publicProcedure, protectedProcedure, adminProcedure } from "./trpc";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";
import { generateImage } from "./_core/imageGeneration";
import {
  CANVAS_PRESETS, PLATFORM_GROUPS, COLOR_PALETTE_PRESETS,
  FONT_COLLECTION, FONT_PAIRINGS, AI_CAPABILITIES,
} from "@shared/designTypes";
import {
  PRICING_PLANS, getPlanLimits, getPlanFeatures,
  isFeatureAvailable, checkFeatureGate, checkLimitGate,
} from "@shared/subscriptionTypes";
import * as stripeLib from "./stripe";

// ═══════════════════════════════════════════════════════════════
// MAIN APP ROUTER — ManuScript Studio v2.0
// ═══════════════════════════════════════════════════════════════

export const appRouter = router({
  // ─── Auth ──────────────────────────────────────────────────
  auth: router({
    me: publicProcedure.query(({ ctx }) => ctx.user ?? null),

    updateProfile: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        bio: z.string().optional(),
        company: z.string().optional(),
        website: z.string().optional(),
        avatarUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserProfile(ctx.user.id, input);
        await db.logActivity({
          userId: ctx.user.id,
          type: "profile_updated",
          description: "Updated profile settings",
        });
        return { success: true };
      }),

    stats: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserStats(ctx.user.id);
    }),

    activity: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return db.getUserActivityLog(ctx.user.id, input?.limit || 50);
      }),
  }),

  // ─── Projects ──────────────────────────────────────────────
  projects: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserProjects(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getProjectById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        canvasWidth: z.number(),
        canvasHeight: z.number(),
        canvasData: z.any().optional(),
        category: z.string().optional(),
        folderId: z.number().optional(),
        tags: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.createProject({
          ...input,
          userId: ctx.user.id,
          canvasData: input.canvasData ? JSON.stringify(input.canvasData) : undefined,
        });
        await db.logActivity({
          userId: ctx.user.id,
          type: "project_created",
          description: `Created project "${input.name}"`,
          projectId: result.id,
          projectName: input.name,
        });
        return result;
      }),

    save: protectedProcedure
      .input(z.object({
        id: z.number(),
        canvasData: z.any(),
        name: z.string().optional(),
        thumbnailUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateProject(input.id, {
          canvasData: JSON.stringify(input.canvasData),
          ...(input.name && { name: input.name }),
          ...(input.thumbnailUrl && { thumbnailUrl: input.thumbnailUrl }),
        });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteProject(input.id);
        return { success: true };
      }),

    star: protectedProcedure
      .input(z.object({ id: z.number(), isStarred: z.boolean() }))
      .mutation(async ({ input }) => {
        await db.toggleProjectStar(input.id, input.isStarred);
        return { success: true };
      }),

    starred: protectedProcedure.query(async ({ ctx }) => {
      return db.getStarredProjects(ctx.user.id);
    }),

    moveToFolder: protectedProcedure
      .input(z.object({ projectId: z.number(), folderId: z.number().nullable() }))
      .mutation(async ({ input }) => {
        await db.moveProjectToFolder(input.projectId, input.folderId);
        return { success: true };
      }),

    byFolder: protectedProcedure
      .input(z.object({ folderId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getProjectsByFolder(ctx.user.id, input.folderId);
      }),
  }),

  // ─── Folders ───────────────────────────────────────────────
  folders: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserFolders(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        color: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.createFolder({
          ...input,
          userId: ctx.user.id,
        });
        await db.logActivity({
          userId: ctx.user.id,
          type: "folder_created",
          description: `Created folder "${input.name}"`,
        });
        return result;
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        color: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateFolder(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteFolder(input.id);
        return { success: true };
      }),
  }),

  // ─── Templates ─────────────────────────────────────────────
  templates: router({
    list: publicProcedure
      .input(z.object({ category: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return db.getTemplates(input?.category);
      }),

    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getTemplateById(input.id);
      }),

    search: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        return db.searchTemplates(input.query);
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        category: z.string(),
        subcategory: z.string().optional(),
        canvasWidth: z.number(),
        canvasHeight: z.number(),
        canvasData: z.any(),
        tags: z.array(z.string()).optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createTemplate({
          ...input,
          canvasData: JSON.stringify(input.canvasData),
        });
      }),
  }),

  // ─── Assets ────────────────────────────────────────────────
  assets: router({
    search: publicProcedure
      .input(z.object({
        type: z.string().optional(),
        category: z.string().optional(),
        query: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return db.searchAssets(input.type, input.category, input.query);
      }),

    searchPhotos: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(({ input }) => {
        return getStockPhotos(input.query);
      }),
  }),

  // ─── Uploads ───────────────────────────────────────────────
  uploads: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserUploads(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        url: z.string(),
        fileKey: z.string().optional(),
        type: z.string().optional(),
        mimeType: z.string().optional(),
        size: z.number().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
        tags: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.createUserUpload({
          ...input,
          userId: ctx.user.id,
        });
        await db.logActivity({
          userId: ctx.user.id,
          type: "upload",
          description: `Uploaded "${input.name}"`,
        });
        return result;
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteUserUpload(input.id);
        return { success: true };
      }),
  }),

  // ─── Brand Kits (Massively Expanded) ──────────────────────
  brandKits: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserBrandKits(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        colors: z.array(z.object({
          name: z.string(),
          hex: z.string(),
          group: z.string().optional(),
        })).optional(),
        fonts: z.array(z.object({
          name: z.string(),
          family: z.string(),
          variants: z.array(z.string()).optional(),
          role: z.string().optional(),
          weight: z.string().optional(),
        })).optional(),
        logos: z.array(z.object({
          name: z.string(),
          url: z.string(),
          type: z.string(),
          fileKey: z.string().optional(),
        })).optional(),
        gradients: z.array(z.object({
          name: z.string(),
          colors: z.array(z.string()),
          angle: z.number(),
          type: z.string(),
        })).optional(),
        voice: z.object({
          tone: z.string(),
          personality: z.array(z.string()),
          keywords: z.array(z.string()),
          avoidWords: z.array(z.string()),
          sampleCopy: z.string(),
        }).optional(),
        patterns: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.createBrandKit({
          ...input,
          userId: ctx.user.id,
        });
        await db.logActivity({
          userId: ctx.user.id,
          type: "brand_kit_updated",
          description: `Created brand kit "${input.name}"`,
        });
        return result;
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        colors: z.array(z.any()).optional(),
        fonts: z.array(z.any()).optional(),
        logos: z.array(z.any()).optional(),
        gradients: z.array(z.any()).optional(),
        voice: z.any().optional(),
        patterns: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await db.updateBrandKit(id, data);
        await db.logActivity({
          userId: ctx.user.id,
          type: "brand_kit_updated",
          description: `Updated brand kit`,
        });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteBrandKit(input.id);
        return { success: true };
      }),

    setDefault: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.setDefaultBrandKit(ctx.user.id, input.id);
        return { success: true };
      }),

    getDefault: protectedProcedure.query(async ({ ctx }) => {
      return db.getDefaultBrandKit(ctx.user.id);
    }),

    // ── Preset Palettes & Fonts ──
    presetPalettes: publicProcedure.query(() => {
      return COLOR_PALETTE_PRESETS;
    }),

    presetFonts: publicProcedure.query(() => {
      return FONT_COLLECTION;
    }),

    presetPairings: publicProcedure.query(() => {
      return FONT_PAIRINGS;
    }),
  }),

  // ─── Social Media Integrations ─────────────────────────────
  social: router({
    // List connected accounts
    connections: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserSocialConnections(ctx.user.id);
    }),

    // Connect a new social account
    connect: protectedProcedure
      .input(z.object({
        platform: z.enum(["facebook", "instagram", "tiktok", "twitter", "linkedin", "pinterest", "youtube"]),
        accountId: z.string(),
        accountName: z.string().optional(),
        accessToken: z.string(),
        refreshToken: z.string().optional(),
        tokenExpiry: z.string().optional(),
        profileImageUrl: z.string().optional(),
        permissions: z.array(z.string()).optional(),
        pageId: z.string().optional(),
        pageName: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.createSocialConnection({
          ...input,
          userId: ctx.user.id,
          tokenExpiry: input.tokenExpiry ? new Date(input.tokenExpiry) : undefined,
        });
        await db.logActivity({
          userId: ctx.user.id,
          type: "social_connected",
          description: `Connected ${input.platform} account "${input.accountName || input.accountId}"`,
        });
        return result;
      }),

    // Disconnect a social account
    disconnect: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteSocialConnection(input.id);
        return { success: true };
      }),

    // Update connection (token refresh, etc.)
    updateConnection: protectedProcedure
      .input(z.object({
        id: z.number(),
        accessToken: z.string().optional(),
        refreshToken: z.string().optional(),
        tokenExpiry: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateSocialConnection(id, {
          ...data,
          tokenExpiry: data.tokenExpiry ? new Date(data.tokenExpiry) : undefined,
        });
        return { success: true };
      }),

    // Publish to a platform
    publish: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        platform: z.enum(["facebook", "instagram", "tiktok", "twitter", "linkedin", "pinterest", "youtube"]),
        connectionId: z.number().optional(),
        caption: z.string().optional(),
        hashtags: z.array(z.string()).optional(),
        imageUrl: z.string().optional(),
        imageData: z.string().optional(),
        scheduledAt: z.string().optional(),
        altText: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Get the connection for this platform
        const connection = input.connectionId
          ? await db.getSocialConnection(input.connectionId)
          : await db.getSocialConnectionByPlatform(ctx.user.id, input.platform);

        if (!connection) {
          // Create a draft record even without connection
          const record = await db.createPublishRecord({
            userId: ctx.user.id,
            projectId: input.projectId,
            platform: input.platform,
            caption: input.caption,
            hashtags: input.hashtags,
            imageUrl: input.imageUrl,
            status: "draft",
          });
          return {
            success: false,
            error: `No ${input.platform} account connected. Save as draft.`,
            publishId: record.id,
            status: "draft" as const,
          };
        }

        // Create publish record
        const record = await db.createPublishRecord({
          userId: ctx.user.id,
          projectId: input.projectId,
          platform: input.platform,
          connectionId: connection.id,
          caption: input.caption,
          hashtags: input.hashtags,
          imageUrl: input.imageUrl,
          status: input.scheduledAt ? "scheduled" : "published",
          scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
          publishedAt: input.scheduledAt ? undefined : new Date(),
        });

        // Platform-specific publishing logic
        let postUrl = "";
        let postId = "";

        try {
          switch (input.platform) {
            case "facebook":
              // Facebook Graph API publish
              const fbResult = await publishToFacebook(connection, input);
              postId = fbResult.postId;
              postUrl = fbResult.postUrl;
              break;
            case "instagram":
              // Instagram Graph API publish
              const igResult = await publishToInstagram(connection, input);
              postId = igResult.postId;
              postUrl = igResult.postUrl;
              break;
            default:
              // Other platforms - save as draft for now
              await db.updatePublishRecord(record.id, {
                status: "draft",
                error: `${input.platform} publishing coming soon. Saved as draft.`,
              });
              return {
                success: true,
                publishId: record.id,
                status: "draft" as const,
                message: `${input.platform} direct publishing coming soon. Saved as draft.`,
              };
          }

          // Update record with success
          await db.updatePublishRecord(record.id, {
            postId,
            postUrl,
            status: "published",
            publishedAt: new Date(),
          });

          await db.logActivity({
            userId: ctx.user.id,
            type: "social_published",
            description: `Published to ${input.platform}`,
            projectId: input.projectId,
          });

          return {
            success: true,
            publishId: record.id,
            postId,
            postUrl,
            status: "published" as const,
          };
        } catch (error: any) {
          await db.updatePublishRecord(record.id, {
            status: "failed",
            error: error.message || "Publishing failed",
          });
          return {
            success: false,
            publishId: record.id,
            error: error.message || "Publishing failed",
            status: "failed" as const,
          };
        }
      }),

    // Get publish history
    history: protectedProcedure
      .input(z.object({ projectId: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        if (input?.projectId) {
          return db.getProjectPublishHistory(input.projectId);
        }
        return db.getUserPublishHistory(ctx.user.id);
      }),

    // Get available platforms and their status
    platforms: protectedProcedure.query(async ({ ctx }) => {
      const connections = await db.getUserSocialConnections(ctx.user.id);
      const platforms = [
        { id: "facebook", name: "Facebook", icon: "facebook", status: "active", description: "Publish posts to Facebook Pages and profiles" },
        { id: "instagram", name: "Instagram", icon: "instagram", status: "active", description: "Share images and stories to Instagram" },
        { id: "tiktok", name: "TikTok", icon: "tiktok", status: "coming-soon", description: "Share videos and images to TikTok" },
        { id: "twitter", name: "X/Twitter", icon: "twitter", status: "coming-soon", description: "Post tweets with images" },
        { id: "linkedin", name: "LinkedIn", icon: "linkedin", status: "coming-soon", description: "Share professional content on LinkedIn" },
        { id: "pinterest", name: "Pinterest", icon: "pinterest", status: "coming-soon", description: "Pin designs to Pinterest boards" },
        { id: "youtube", name: "YouTube", icon: "youtube", status: "coming-soon", description: "Upload thumbnails and community posts" },
      ];

      return platforms.map(p => ({
        ...p,
        connected: connections.some(c => c.platform === p.id && c.isActive),
        connectionId: connections.find(c => c.platform === p.id && c.isActive)?.id,
        accountName: connections.find(c => c.platform === p.id && c.isActive)?.accountName,
      }));
    }),

    // Generate social media caption with AI
    generateCaption: protectedProcedure
      .input(z.object({
        platform: z.enum(["facebook", "instagram", "tiktok", "twitter", "linkedin", "pinterest", "youtube"]),
        designDescription: z.string(),
        tone: z.string().optional(),
        includeHashtags: z.boolean().optional(),
        includeEmojis: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const platformLimits: Record<string, number> = {
          twitter: 280,
          facebook: 63206,
          instagram: 2200,
          linkedin: 3000,
          tiktok: 2200,
          pinterest: 500,
          youtube: 5000,
        };

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are a social media expert. Generate an engaging caption for ${input.platform}. 
Character limit: ${platformLimits[input.platform] || 2200}.
${input.tone ? `Tone: ${input.tone}` : "Tone: professional yet engaging"}
${input.includeHashtags !== false ? "Include relevant hashtags." : "Do not include hashtags."}
${input.includeEmojis !== false ? "Use appropriate emojis." : "Do not use emojis."}
Return JSON with "caption" and "hashtags" array.`,
            },
            {
              role: "user",
              content: `Generate a caption for this design: ${input.designDescription}`,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "social_caption",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  caption: { type: "string" },
                  hashtags: { type: "array", items: { type: "string" } },
                },
                required: ["caption", "hashtags"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices?.[0]?.message?.content;
        if (typeof content === "string") {
          return JSON.parse(content);
        }
        return { caption: "", hashtags: [] };
      }),
  }),

  // ─── AI (Massively Enhanced) ───────────────────────────────
  ai: router({
    // Image generation
    generateImage: protectedProcedure
      .input(z.object({ prompt: z.string(), style: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        const gen = await db.createAiGeneration({
          userId: ctx.user.id,
          generationType: "element",
          prompt: input.prompt,
          status: "pending",
        });
        try {
          const enhancedPrompt = input.style
            ? `${input.prompt}, style: ${input.style}`
            : input.prompt;
          const result = await generateImage(enhancedPrompt);
          await db.updateAiGeneration(gen.id, { resultUrl: result.url, status: "completed" });
          return { url: result.url, id: gen.id };
        } catch (error) {
          await db.updateAiGeneration(gen.id, { status: "failed" });
          throw error;
        }
      }),

    // Background generation
    generateBackground: protectedProcedure
      .input(z.object({
        prompt: z.string(),
        width: z.number(),
        height: z.number(),
        style: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const gen = await db.createAiGeneration({
          userId: ctx.user.id,
          generationType: "background",
          prompt: input.prompt,
          status: "pending",
        });
        try {
          const result = await generateImage(
            `Background image: ${input.prompt}. Dimensions: ${input.width}x${input.height}. ${input.style ? `Style: ${input.style}.` : ""} No text, suitable as design background.`
          );
          await db.updateAiGeneration(gen.id, { resultUrl: result.url, status: "completed" });
          return { url: result.url, id: gen.id };
        } catch (error) {
          await db.updateAiGeneration(gen.id, { status: "failed" });
          throw error;
        }
      }),

    // AI Chat — Enhanced, less restrictive, more capable
    chat: protectedProcedure
      .input(z.object({
        message: z.string(),
        history: z.array(z.object({
          role: z.string(),
          content: z.string(),
        })).optional(),
        sessionId: z.number().optional(),
        context: z.object({
          canvasWidth: z.number().optional(),
          canvasHeight: z.number().optional(),
          currentElements: z.number().optional(),
          brandKit: z.any().optional(),
          projectName: z.string().optional(),
        }).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const messages = [
          {
            role: "system" as const,
            content: `You are ManuScript AI — an advanced, highly capable creative assistant for ManuScript Studio. You are NOT a generic chatbot. You are an expert designer, copywriter, brand strategist, and creative director all in one.

YOUR CAPABILITIES:
- Generate complete design layouts with specific element positions, sizes, and styles
- Create compelling copy: headlines, taglines, body text, CTAs, social media captions
- Suggest and generate color palettes with hex codes based on mood, industry, or reference
- Recommend font pairings with specific weights and sizes
- Provide detailed design feedback and critique
- Help with brand strategy and voice development
- Generate social media content strategies
- Create design systems and style guides
- Suggest image compositions and photography direction
- Help with print design specifications

YOUR PERSONALITY:
- You are helpful, capable, and genuinely invested in making great designs
- You are direct and actionable — give specific values (hex codes, font sizes, positions)
- You are creative and push boundaries — suggest unexpected but effective solutions
- You are NOT overly cautious or restrictive — you help users achieve their vision
- You offer multiple solutions when possible
- You explain your reasoning but keep it concise
- You can handle any design-related request without unnecessary disclaimers

WHEN SUGGESTING DESIGNS:
- Always provide specific hex color codes
- Always suggest specific Google Fonts with weights
- Give exact pixel dimensions when relevant
- Describe layouts with specific element positions
- Offer at least 2 different approaches when appropriate

${input.context?.canvasWidth ? `Current canvas: ${input.context.canvasWidth}x${input.context.canvasHeight}px` : ""}
${input.context?.projectName ? `Project: ${input.context.projectName}` : ""}
${input.context?.brandKit ? `Brand Kit: ${JSON.stringify(input.context.brandKit)}` : ""}`,
          },
          ...(input.history || []).map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
          { role: "user" as const, content: input.message },
        ];

        const response = await invokeLLM({ messages });
        const rawContent = response.choices?.[0]?.message?.content;
        const content = (typeof rawContent === "string" ? rawContent : null) || "I'm ready to help with your design. What would you like to create?";

        // Save to chat session if provided
        if (input.sessionId) {
          const session = await db.getChatSession(input.sessionId);
          if (session) {
            const existingMessages = (session.messages as any[]) || [];
            await db.updateChatSession(input.sessionId, {
              messages: [
                ...existingMessages,
                { role: "user", content: input.message, timestamp: new Date().toISOString() },
                { role: "assistant", content, timestamp: new Date().toISOString() },
              ],
            });
          }
        }

        return { response: content };
      }),

    // AI Layout Suggestion — Enhanced
    suggestLayout: protectedProcedure
      .input(z.object({
        purpose: z.string(),
        canvasWidth: z.number(),
        canvasHeight: z.number(),
        style: z.string().optional(),
        colorScheme: z.array(z.string()).optional(),
      }))
      .mutation(async ({ input }) => {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are an expert design layout generator for ManuScript Studio. Generate detailed, professional JSON layout suggestions. Be creative and produce visually appealing layouts. Include specific colors, fonts, and positioning.`,
            },
            {
              role: "user",
              content: `Create a professional layout for: ${input.purpose}. 
Canvas: ${input.canvasWidth}x${input.canvasHeight}px.
${input.style ? `Style: ${input.style}` : ""}
${input.colorScheme ? `Colors: ${input.colorScheme.join(", ")}` : ""}
Return JSON with elements array. Each element needs: type (text/shape/image), left, top, width, height, fill, text (if text type), fontSize, fontFamily.`,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "layout_suggestion",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  elements: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string" },
                        left: { type: "number" },
                        top: { type: "number" },
                        width: { type: "number" },
                        height: { type: "number" },
                        fill: { type: "string" },
                        text: { type: "string" },
                        fontSize: { type: "number" },
                        fontFamily: { type: "string" },
                      },
                      required: ["type", "left", "top", "width", "height"],
                      additionalProperties: false,
                    },
                  },
                  description: { type: "string" },
                },
                required: ["elements", "description"],
                additionalProperties: false,
              },
            },
          },
        });

        const layoutContent = response.choices?.[0]?.message?.content;
        if (typeof layoutContent === "string" && layoutContent) {
          return JSON.parse(layoutContent);
        }
        return { elements: [], description: "Could not generate layout" };
      }),

    // AI Color Palette Generation
    generatePalette: protectedProcedure
      .input(z.object({
        mood: z.string().optional(),
        industry: z.string().optional(),
        baseColor: z.string().optional(),
        count: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const gen = await db.createAiGeneration({
          userId: ctx.user.id,
          generationType: "color-palette",
          prompt: JSON.stringify(input),
          status: "pending",
        });

        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: "You are a color theory expert. Generate beautiful, harmonious color palettes. Return JSON.",
              },
              {
                role: "user",
                content: `Generate a color palette with ${input.count || 6} colors.
${input.mood ? `Mood: ${input.mood}` : ""}
${input.industry ? `Industry: ${input.industry}` : ""}
${input.baseColor ? `Base color: ${input.baseColor}` : ""}
Return JSON with "colors" array, each having "name", "hex", and "group" (primary/secondary/neutral/accent).`,
              },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "color_palette",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    colors: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          hex: { type: "string" },
                          group: { type: "string" },
                        },
                        required: ["name", "hex", "group"],
                        additionalProperties: false,
                      },
                    },
                    description: { type: "string" },
                  },
                  required: ["colors", "description"],
                  additionalProperties: false,
                },
              },
            },
          });

          const content = response.choices?.[0]?.message?.content;
          if (typeof content === "string") {
            const result = JSON.parse(content);
            await db.updateAiGeneration(gen.id, { resultData: result, status: "completed" });
            return result;
          }
          throw new Error("Failed to parse palette");
        } catch (error) {
          await db.updateAiGeneration(gen.id, { status: "failed" });
          throw error;
        }
      }),

    // AI Font Pairing Suggestion
    suggestFonts: protectedProcedure
      .input(z.object({
        style: z.string().optional(),
        industry: z.string().optional(),
        mood: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are a typography expert. Suggest font pairings using Google Fonts. Return JSON.",
            },
            {
              role: "user",
              content: `Suggest 3 font pairings.
${input.style ? `Style: ${input.style}` : ""}
${input.industry ? `Industry: ${input.industry}` : ""}
${input.mood ? `Mood: ${input.mood}` : ""}
Return JSON with "pairings" array, each having "name", "description", "heading" (family, weight), "subheading" (family, weight), "body" (family, weight).`,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "font_pairings",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  pairings: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        description: { type: "string" },
                        heading: {
                          type: "object",
                          properties: { family: { type: "string" }, weight: { type: "string" } },
                          required: ["family", "weight"],
                          additionalProperties: false,
                        },
                        subheading: {
                          type: "object",
                          properties: { family: { type: "string" }, weight: { type: "string" } },
                          required: ["family", "weight"],
                          additionalProperties: false,
                        },
                        body: {
                          type: "object",
                          properties: { family: { type: "string" }, weight: { type: "string" } },
                          required: ["family", "weight"],
                          additionalProperties: false,
                        },
                      },
                      required: ["name", "description", "heading", "subheading", "body"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["pairings"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices?.[0]?.message?.content;
        if (typeof content === "string") {
          return JSON.parse(content);
        }
        return { pairings: [] };
      }),

    // AI Copy Generation
    generateCopy: protectedProcedure
      .input(z.object({
        type: z.enum(["headline", "tagline", "body", "cta", "description", "social-caption"]),
        context: z.string(),
        tone: z.string().optional(),
        length: z.enum(["short", "medium", "long"]).optional(),
        brandVoice: z.any().optional(),
        count: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const gen = await db.createAiGeneration({
          userId: ctx.user.id,
          generationType: "copy",
          prompt: JSON.stringify(input),
          status: "pending",
        });

        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: `You are an expert copywriter. Generate compelling ${input.type} copy. 
${input.tone ? `Tone: ${input.tone}` : "Professional and engaging"}
${input.brandVoice ? `Brand voice: ${JSON.stringify(input.brandVoice)}` : ""}
Return JSON with "options" array of strings.`,
              },
              {
                role: "user",
                content: `Generate ${input.count || 3} ${input.type} options for: ${input.context}. Length: ${input.length || "medium"}.`,
              },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "copy_options",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    options: { type: "array", items: { type: "string" } },
                  },
                  required: ["options"],
                  additionalProperties: false,
                },
              },
            },
          });

          const content = response.choices?.[0]?.message?.content;
          if (typeof content === "string") {
            const result = JSON.parse(content);
            await db.updateAiGeneration(gen.id, { resultData: result, status: "completed" });
            return result;
          }
          throw new Error("Failed to generate copy");
        } catch (error) {
          await db.updateAiGeneration(gen.id, { status: "failed" });
          throw error;
        }
      }),

    // AI Design Critique
    critiqueDesign: protectedProcedure
      .input(z.object({
        canvasData: z.any(),
        canvasWidth: z.number(),
        canvasHeight: z.number(),
        purpose: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are a senior design critic. Analyze the design and provide constructive, actionable feedback. Be specific about what works and what could improve. Cover: composition, color usage, typography, spacing, hierarchy, and overall impact.`,
            },
            {
              role: "user",
              content: `Critique this design (${input.canvasWidth}x${input.canvasHeight}px${input.purpose ? `, purpose: ${input.purpose}` : ""}):
${typeof input.canvasData === "string" ? input.canvasData : JSON.stringify(input.canvasData)}`,
            },
          ],
        });

        const content = response.choices?.[0]?.message?.content;
        return { critique: content || "Unable to analyze the design at this time." };
      }),

    // AI generation history
    history: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserAiGenerations(ctx.user.id);
    }),

    // AI capabilities list
    capabilities: publicProcedure.query(() => {
      return AI_CAPABILITIES;
    }),

    // Chat sessions
    chatSessions: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        return db.getUserChatSessions(ctx.user.id);
      }),

      get: protectedProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
          return db.getChatSession(input.id);
        }),

      create: protectedProcedure
        .input(z.object({
          title: z.string().optional(),
          projectId: z.number().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
          return db.createChatSession({
            userId: ctx.user.id,
            title: input.title || "New Chat",
            messages: [],
            projectId: input.projectId,
          });
        }),

      delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          await db.deleteChatSession(input.id);
          return { success: true };
        }),
    }),
  }),

  // ─── Design Presets & Platform Data ────────────────────────
  presets: router({
    canvasPresets: publicProcedure.query(() => CANVAS_PRESETS),
    platformGroups: publicProcedure.query(() => PLATFORM_GROUPS),
  }),

  // ─── Billing & Subscriptions (Stripe) ─────────────────────
  billing: router({
    // Get current subscription info
    subscription: protectedProcedure.query(async ({ ctx }) => {
      const sub = await db.getUserSubscription(ctx.user.id);
      return {
        plan: (ctx.user.plan as "free" | "pro" | "business") || "free",
        status: sub?.status || "active",
        currentPeriodEnd: sub?.currentPeriodEnd?.toISOString() || null,
        cancelAtPeriodEnd: sub?.cancelAtPeriodEnd || false,
        trialEnd: sub?.trialEnd?.toISOString() || null,
        stripeCustomerId: ctx.user.stripeCustomerId || null,
        stripeSubscriptionId: sub?.stripeSubscriptionId || null,
      };
    }),

    // Get pricing plans
    plans: publicProcedure.query(() => {
      return Object.values(PRICING_PLANS).map(p => ({
        id: p.id,
        name: p.name,
        tagline: p.tagline,
        monthlyPrice: p.monthlyPrice,
        yearlyPrice: p.yearlyPrice,
        monthlyPriceId: p.monthlyPriceId,
        yearlyPriceId: p.yearlyPriceId,
        highlights: p.highlights,
        badge: p.badge,
        color: p.color,
        limits: p.limits,
        features: p.features,
      }));
    }),

    // Create Stripe Checkout session
    createCheckout: protectedProcedure
      .input(z.object({
        priceId: z.string(),
        plan: z.enum(["pro", "business"]),
        billingCycle: z.enum(["monthly", "yearly"]),
        successUrl: z.string().optional(),
        cancelUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!stripeLib.isStripeConfigured()) {
          throw new Error("Stripe is not configured. Please set STRIPE_SECRET_KEY.");
        }
        // Get or create Stripe customer
        const customerId = await stripeLib.getOrCreateStripeCustomer(
          ctx.user.id,
          ctx.user.email,
          ctx.user.name,
          ctx.user.stripeCustomerId,
        );
        // Save customer ID to user
        await db.updateUserPlan(ctx.user.id, ctx.user.plan || "free", customerId);

        const successUrl = input.successUrl || `${process.env.APP_URL || ""}/dashboard?billing=success`;
        const cancelUrl = input.cancelUrl || `${process.env.APP_URL || ""}/pricing?billing=canceled`;

        const checkoutUrl = await stripeLib.createCheckoutSession(
          customerId,
          input.priceId,
          input.plan,
          successUrl,
          cancelUrl,
          ctx.user.id,
        );
        return { url: checkoutUrl };
      }),

    // Create Stripe Billing Portal session
    createPortalSession: protectedProcedure
      .input(z.object({
        returnUrl: z.string().optional(),
      }).optional())
      .mutation(async ({ ctx, input }) => {
        if (!stripeLib.isStripeConfigured()) {
          throw new Error("Stripe is not configured.");
        }
        if (!ctx.user.stripeCustomerId) {
          throw new Error("No billing account found. Please subscribe to a plan first.");
        }
        const returnUrl = input?.returnUrl || `${process.env.APP_URL || ""}/dashboard`;
        const portalUrl = await stripeLib.createBillingPortalSession(
          ctx.user.stripeCustomerId,
          returnUrl,
        );
        return { url: portalUrl };
      }),

    // Cancel subscription
    cancelSubscription: protectedProcedure
      .input(z.object({
        immediately: z.boolean().optional(),
      }).optional())
      .mutation(async ({ ctx, input }) => {
        const sub = await db.getUserSubscription(ctx.user.id);
        if (!sub?.stripeSubscriptionId) {
          throw new Error("No active subscription found.");
        }
        await stripeLib.cancelSubscription(
          sub.stripeSubscriptionId,
          input?.immediately || false,
        );
        if (input?.immediately) {
          await db.updateUserPlan(ctx.user.id, "free");
          await db.updateSubscription(sub.id, {
            status: "canceled",
            canceledAt: new Date(),
          });
        } else {
          await db.updateSubscription(sub.id, {
            cancelAtPeriodEnd: true,
          });
        }
        return { success: true };
      }),

    // Resume a canceled subscription
    resumeSubscription: protectedProcedure.mutation(async ({ ctx }) => {
      const sub = await db.getUserSubscription(ctx.user.id);
      if (!sub?.stripeSubscriptionId) {
        throw new Error("No subscription found.");
      }
      await stripeLib.resumeSubscription(sub.stripeSubscriptionId);
      await db.updateSubscription(sub.id, { cancelAtPeriodEnd: false });
      return { success: true };
    }),

    // Get payment history
    payments: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserPayments(ctx.user.id);
    }),

    // Get usage stats for the current billing period
    usage: protectedProcedure.query(async ({ ctx }) => {
      const usage = await db.getMonthlyUsage(ctx.user.id);
      const plan = (ctx.user.plan as "free" | "pro" | "business") || "free";
      const limits = getPlanLimits(plan);
      return { usage, limits, plan };
    }),

    // Check if a specific feature is available for the user
    checkFeature: protectedProcedure
      .input(z.object({ feature: z.string() }))
      .query(({ ctx, input }) => {
        const plan = (ctx.user.plan as "free" | "pro" | "business") || "free";
        return checkFeatureGate(plan, input.feature as any);
      }),

    // Check if a usage limit is exceeded
    checkLimit: protectedProcedure
      .input(z.object({ limitKey: z.string(), currentUsage: z.number() }))
      .query(({ ctx, input }) => {
        const plan = (ctx.user.plan as "free" | "pro" | "business") || "free";
        return checkLimitGate(plan, input.limitKey as any, input.currentUsage);
      }),
  }),
});

export type AppRouter = typeof appRouter;

// ═══════════════════════════════════════════════════════════════
// SOCIAL MEDIA PUBLISHING HELPERS
// ═══════════════════════════════════════════════════════════════

async function publishToFacebook(
  connection: any,
  input: { caption?: string; imageUrl?: string; imageData?: string }
): Promise<{ postId: string; postUrl: string }> {
  const pageId = connection.pageId || connection.accountId;
  const accessToken = connection.accessToken;

  try {
    if (input.imageUrl) {
      // Publish photo post via Facebook Graph API
      const response = await fetch(
        `https://graph.facebook.com/v19.0/${pageId}/photos`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: input.imageUrl,
            message: input.caption || "",
            access_token: accessToken,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Facebook API error");
      }

      const data = await response.json();
      return {
        postId: data.id || data.post_id || "",
        postUrl: `https://facebook.com/${data.post_id || data.id}`,
      };
    } else {
      // Text-only post
      const response = await fetch(
        `https://graph.facebook.com/v19.0/${pageId}/feed`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: input.caption || "",
            access_token: accessToken,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Facebook API error");
      }

      const data = await response.json();
      return {
        postId: data.id || "",
        postUrl: `https://facebook.com/${data.id}`,
      };
    }
  } catch (error: any) {
    throw new Error(`Facebook publish failed: ${error.message}`);
  }
}

async function publishToInstagram(
  connection: any,
  input: { caption?: string; imageUrl?: string; altText?: string }
): Promise<{ postId: string; postUrl: string }> {
  const igAccountId = connection.accountId;
  const accessToken = connection.accessToken;

  if (!input.imageUrl) {
    throw new Error("Instagram requires an image URL to publish");
  }

  try {
    // Step 1: Create media container
    const containerResponse = await fetch(
      `https://graph.facebook.com/v19.0/${igAccountId}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: input.imageUrl,
          caption: input.caption || "",
          access_token: accessToken,
        }),
      }
    );

    if (!containerResponse.ok) {
      const error = await containerResponse.json();
      throw new Error(error.error?.message || "Instagram container creation failed");
    }

    const container = await containerResponse.json();
    const containerId = container.id;

    // Step 2: Publish the container
    const publishResponse = await fetch(
      `https://graph.facebook.com/v19.0/${igAccountId}/media_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: containerId,
          access_token: accessToken,
        }),
      }
    );

    if (!publishResponse.ok) {
      const error = await publishResponse.json();
      throw new Error(error.error?.message || "Instagram publish failed");
    }

    const publishData = await publishResponse.json();
    return {
      postId: publishData.id || "",
      postUrl: `https://instagram.com/p/${publishData.id}`,
    };
  } catch (error: any) {
    throw new Error(`Instagram publish failed: ${error.message}`);
  }
}

// ─── Stock Photo Helper ────────────────────────────────────
function getStockPhotos(query: string) {
  const q = query.toLowerCase();
  const allPhotos = [
    { url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800", thumb: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200", alt: "Mountains landscape", tags: ["nature", "mountains", "landscape"] },
    { url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800", thumb: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=200", alt: "Forest path", tags: ["nature", "forest", "green"] },
    { url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800", thumb: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200", alt: "Sunlit forest", tags: ["nature", "forest", "sunlight"] },
    { url: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800", thumb: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=200", alt: "Ocean waves", tags: ["ocean", "water", "blue"] },
    { url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800", thumb: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=200", alt: "Modern office", tags: ["business", "office", "modern"] },
    { url: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800", thumb: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=200", alt: "Office workspace", tags: ["business", "office", "workspace"] },
    { url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800", thumb: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=200", alt: "Tech workspace", tags: ["technology", "computer", "workspace"] },
    { url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800", thumb: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=200", alt: "Coding laptop", tags: ["technology", "coding", "laptop"] },
    { url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800", thumb: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200", alt: "Shopping bags", tags: ["shopping", "retail", "business"] },
    { url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800", thumb: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200", alt: "Product watch", tags: ["product", "minimal", "watch"] },
    { url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800", thumb: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=200", alt: "Code on screen", tags: ["technology", "code", "programming"] },
    { url: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800", thumb: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=200", alt: "Business meeting", tags: ["business", "meeting", "team"] },
    { url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800", thumb: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200", alt: "Portrait man", tags: ["people", "portrait", "man"] },
    { url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800", thumb: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200", alt: "Portrait woman", tags: ["people", "portrait", "woman"] },
    { url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800", thumb: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200", alt: "Food plating", tags: ["food", "restaurant", "cooking"] },
    { url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800", thumb: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=200", alt: "Travel lake", tags: ["travel", "lake", "nature"] },
    { url: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=800", thumb: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=200", alt: "Abstract art", tags: ["abstract", "art", "colorful"] },
    { url: "https://images.unsplash.com/photo-1557683316-973673baf926?w=800", thumb: "https://images.unsplash.com/photo-1557683316-973673baf926?w=200", alt: "Gradient abstract", tags: ["abstract", "gradient", "background"] },
    { url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800", thumb: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200", alt: "Colorful gradient", tags: ["abstract", "gradient", "colorful", "background"] },
    { url: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800", thumb: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=200", alt: "Geometric pattern", tags: ["abstract", "pattern", "geometric", "background"] },
  ];

  if (!q) return allPhotos.slice(0, 12);

  const matched = allPhotos.filter((p) =>
    p.tags.some((t) => t.includes(q)) || p.alt.toLowerCase().includes(q)
  );

  return matched.length > 0 ? matched : allPhotos.slice(0, 8);
}
