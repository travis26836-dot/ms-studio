import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Wand2, Image, Type, Palette, Layout, Shapes, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

// ═══════════════════════════════════════════════════════════════
// AI ELEMENTS PANEL — Dynamic AI-Generated Design Elements
// Architecture for future AI content expansion
// ═══════════════════════════════════════════════════════════════

interface AIElementsPanelProps {
  canvasWidth?: number;
  canvasHeight?: number;
  onAddImage?: (url: string) => void;
  onAddText?: (text: string, options?: any) => void;
  onSetBackground?: (color: string) => void;
  onApplyLayout?: (elements: any[]) => void;
  onApplyColor?: (hex: string) => void;
}

type GenerationMode = "image" | "background" | "layout" | "copy" | "palette" | "elements";

interface GeneratedItem {
  id: string;
  type: GenerationMode;
  prompt: string;
  result: any;
  timestamp: Date;
}

export default function AIElementsPanel({
  canvasWidth = 1080, canvasHeight = 1080,
  onAddImage, onAddText, onSetBackground, onApplyLayout, onApplyColor,
}: AIElementsPanelProps) {
  const [mode, setMode] = useState<GenerationMode>("image");
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("modern");
  const [generatedItems, setGeneratedItems] = useState<GeneratedItem[]>([]);

  // AI Mutations
  const generateImageMutation = trpc.ai.generateImage.useMutation();
  const generateBackgroundMutation = trpc.ai.generateBackground.useMutation();
  const suggestLayoutMutation = trpc.ai.suggestLayout.useMutation();
  const generateCopyMutation = trpc.ai.generateCopy.useMutation();
  const generatePaletteMutation = trpc.ai.generatePalette.useMutation();

  const isLoading = generateImageMutation.isPending || generateBackgroundMutation.isPending ||
    suggestLayoutMutation.isPending || generateCopyMutation.isPending || generatePaletteMutation.isPending;

  const addToHistory = useCallback((type: GenerationMode, prompt: string, result: any) => {
    setGeneratedItems((prev) => [{
      id: `gen-${Date.now()}`,
      type,
      prompt,
      result,
      timestamp: new Date(),
    }, ...prev].slice(0, 50));
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;

    try {
      switch (mode) {
        case "image": {
          const result = await generateImageMutation.mutateAsync({ prompt, style });
          addToHistory("image", prompt, result);
          break;
        }
        case "background": {
          const result = await generateBackgroundMutation.mutateAsync({
            prompt, width: canvasWidth, height: canvasHeight, style,
          });
          addToHistory("background", prompt, result);
          break;
        }
        case "layout": {
          const result = await suggestLayoutMutation.mutateAsync({
            purpose: prompt, canvasWidth, canvasHeight, style,
          });
          addToHistory("layout", prompt, result);
          break;
        }
        case "copy": {
          const result = await generateCopyMutation.mutateAsync({
            type: "headline", context: prompt, tone: style, count: 5,
          });
          addToHistory("copy", prompt, result);
          break;
        }
        case "palette": {
          const result = await generatePaletteMutation.mutateAsync({
            mood: prompt, count: 6,
          });
          addToHistory("palette", prompt, result);
          break;
        }
      }
    } catch (error) {
      console.error("Generation failed:", error);
    }
  }, [mode, prompt, style, canvasWidth, canvasHeight, generateImageMutation, generateBackgroundMutation, suggestLayoutMutation, generateCopyMutation, generatePaletteMutation, addToHistory]);

  const modes: { id: GenerationMode; label: string; icon: typeof Sparkles; description: string }[] = [
    { id: "image", label: "Images", icon: Image, description: "Generate images and elements" },
    { id: "background", label: "Backgrounds", icon: Shapes, description: "Create custom backgrounds" },
    { id: "layout", label: "Layouts", icon: Layout, description: "Generate complete layouts" },
    { id: "copy", label: "Copy", icon: Type, description: "Write headlines & text" },
    { id: "palette", label: "Palettes", icon: Palette, description: "Generate color palettes" },
  ];

  const styleOptions: Record<GenerationMode, string[]> = {
    image: ["modern", "minimal", "vibrant", "retro", "watercolor", "3d-render", "flat-design", "photorealistic", "abstract", "geometric", "hand-drawn", "neon"],
    background: ["gradient", "abstract", "geometric", "nature", "texture", "minimal", "bokeh", "marble", "watercolor", "space", "pattern", "solid"],
    layout: ["modern", "classic", "bold", "minimal", "creative", "corporate", "playful", "elegant", "tech", "editorial"],
    copy: ["professional", "casual", "bold", "witty", "inspirational", "urgent", "luxurious", "friendly", "technical", "storytelling"],
    palette: ["warm", "cool", "vibrant", "pastel", "earthy", "neon", "monochrome", "complementary", "analogous", "triadic"],
    elements: ["modern", "minimal", "bold"],
  };

  const promptSuggestions: Record<GenerationMode, string[]> = {
    image: [
      "Abstract geometric shapes in gradient colors",
      "Minimalist line art illustration",
      "Futuristic tech pattern",
      "Elegant floral design element",
      "Bold typography decoration",
      "Watercolor splash effect",
    ],
    background: [
      "Soft gradient from blue to purple",
      "Abstract marble texture",
      "Geometric pattern with gold accents",
      "Dreamy bokeh light effect",
      "Clean minimal white texture",
      "Dark moody atmosphere",
    ],
    layout: [
      "Social media promotional post",
      "Event invitation with elegant design",
      "Product showcase with pricing",
      "Motivational quote poster",
      "Business announcement",
      "Sale/discount promotional design",
    ],
    copy: [
      "Tech startup launch announcement",
      "Fitness motivation quote",
      "Restaurant special offer",
      "Fashion brand tagline",
      "Real estate listing headline",
      "E-commerce sale promotion",
    ],
    palette: [
      "Energetic and youthful brand",
      "Luxury and sophistication",
      "Nature and sustainability",
      "Tech and innovation",
      "Warm and welcoming cafe",
      "Bold and creative agency",
    ],
    elements: [],
  };

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <Wand2 className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-card-foreground">AI Elements</h3>
            <p className="text-[10px] text-muted-foreground">Generate design elements with AI</p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-1 overflow-x-auto pb-1">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition-all ${
                mode === m.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-card-foreground"
              }`}
            >
              <m.icon className="w-3 h-3" />
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1 p-3">
        <div className="space-y-3">
          {/* Prompt Input */}
          <div className="space-y-2">
            <Input
              value={prompt}
              onChange={(e: any) => setPrompt(e.target.value)}
              onKeyDown={(e: any) => e.key === "Enter" && handleGenerate()}
              placeholder={`Describe what you want to generate...`}
              className="text-xs bg-secondary"
            />

            {/* Style Selector */}
            <div>
              <p className="text-[10px] text-muted-foreground mb-1">Style</p>
              <div className="flex flex-wrap gap-1">
                {(styleOptions[mode] || []).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStyle(s)}
                    className={`px-2 py-1 rounded-md text-[10px] transition-all ${
                      style === s
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "bg-secondary text-muted-foreground hover:text-card-foreground border border-transparent"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isLoading}
              className="w-full h-8 text-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 mr-1.5" />
                  Generate {modes.find(m => m.id === mode)?.label}
                </>
              )}
            </Button>
          </div>

          {/* Prompt Suggestions */}
          {!prompt && (
            <div>
              <p className="text-[10px] text-muted-foreground mb-1.5">Suggestions</p>
              <div className="space-y-1">
                {(promptSuggestions[mode] || []).map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(suggestion)}
                    className="w-full text-left px-2.5 py-1.5 bg-secondary hover:bg-secondary/80 rounded-lg text-[10px] text-muted-foreground hover:text-card-foreground transition-all border border-transparent hover:border-border"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Generated Results */}
          {generatedItems.length > 0 && (
            <div>
              <p className="text-[10px] font-medium text-muted-foreground mb-2">Generated Results</p>
              <div className="space-y-2">
                {generatedItems.map((item) => (
                  <div key={item.id} className="bg-secondary rounded-lg border border-border overflow-hidden">
                    {/* Image Results */}
                    {(item.type === "image" || item.type === "background") && item.result?.url && (
                      <div className="relative group">
                        <img
                          src={item.result.url}
                          alt={item.prompt}
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2">
                          <button
                            onClick={() => item.type === "background" ? onSetBackground?.(item.result.url) : onAddImage?.(item.result.url)}
                            className="opacity-0 group-hover:opacity-100 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-[10px] font-medium transition-opacity"
                          >
                            {item.type === "background" ? "Set as Background" : "Add to Canvas"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Layout Results */}
                    {item.type === "layout" && item.result?.elements && (
                      <div className="p-2.5">
                        <p className="text-[10px] text-muted-foreground mb-1.5">{item.result.description}</p>
                        <p className="text-[10px] text-muted-foreground">{item.result.elements.length} elements</p>
                        <Button
                          size="sm"
                          className="w-full mt-2 h-7 text-[10px]"
                          onClick={() => onApplyLayout?.(item.result.elements)}
                        >
                          Apply Layout
                        </Button>
                      </div>
                    )}

                    {/* Copy Results */}
                    {item.type === "copy" && item.result?.options && (
                      <div className="p-2.5 space-y-1.5">
                        {item.result.options.map((option: string, j: number) => (
                          <button
                            key={j}
                            onClick={() => onAddText?.(option)}
                            className="w-full text-left px-2 py-1.5 bg-card hover:bg-card/80 rounded text-[10px] text-card-foreground transition-colors border border-border"
                          >
                            "{option}"
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Palette Results */}
                    {item.type === "palette" && item.result?.colors && (
                      <div className="p-2.5">
                        <div className="flex gap-0.5 mb-2">
                          {item.result.colors.map((c: any, j: number) => (
                            <button
                              key={j}
                              onClick={() => onApplyColor?.(c.hex)}
                              className="flex-1 h-8 rounded transition-transform hover:scale-105"
                              style={{ backgroundColor: c.hex }}
                              title={`${c.name}: ${c.hex}`}
                            />
                          ))}
                        </div>
                        {item.result.description && (
                          <p className="text-[10px] text-muted-foreground">{item.result.description}</p>
                        )}
                      </div>
                    )}

                    {/* Meta */}
                    <div className="px-2.5 py-1.5 border-t border-border">
                      <p className="text-[9px] text-muted-foreground truncate">{item.prompt}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Architecture Info */}
          <div className="bg-secondary/50 rounded-lg border border-border p-3 mt-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <p className="text-[10px] font-medium text-card-foreground">AI Generation Engine</p>
            </div>
            <p className="text-[9px] text-muted-foreground leading-relaxed">
              ManuScript Studio uses advanced AI models to generate design elements, backgrounds, layouts, copy, and color palettes on demand. The architecture supports future expansion with additional generation types including patterns, textures, mockups, and style transfers.
            </p>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
