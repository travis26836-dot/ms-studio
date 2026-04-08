        })).optional(),
      }))
      .mutation(async ({ input }) => {
        const messages = [
          {
            role: "system" as const,
            content: `You are a professional design assistant for Manus Design Studio. You help users with:
- Design suggestions (layouts, color palettes, typography)
- Copy writing for designs (headlines, body text, taglines)
- Design feedback and improvements
- Technical guidance on using the editor features
Be concise, creative, and actionable in your responses. When suggesting colors, provide hex codes. When suggesting fonts, use available Google Fonts.`,
          },
          ...(input.history || []).map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
          { role: "user" as const, content: input.message },
        ];

        const response = await invokeLLM({ messages });
        const rawContent = response.choices?.[0]?.message?.content;
        const content = (typeof rawContent === "string" ? rawContent : null) || "I can help you with your design. What would you like to create?";

        return { response: content };
      }),

    suggestLayout: protectedProcedure
      .input(z.object({
        purpose: z.string(),
        canvasWidth: z.number(),
        canvasHeight: z.number(),
      }))
      .mutation(async ({ input }) => {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are a design layout expert. Generate JSON layout suggestions for a canvas editor.",
            },
            {
              role: "user",
              content: `Suggest a layout for: ${input.purpose}. Canvas size: ${input.canvasWidth}x${input.canvasHeight}. Return JSON with an array of elements, each having: type (text/shape/image), left, top, width, height, and relevant properties.`,
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

    history: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserAiGenerations(ctx.user.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;

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
