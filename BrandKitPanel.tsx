import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Palette, Plus, Trash2, Star, Sparkles, Type, Loader2, Upload, Check, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  COLOR_PALETTE_PRESETS, FONT_COLLECTION, FONT_PAIRINGS,
  BrandColor, BrandFont, BrandLogo, BrandGradient, BrandVoice,
} from "@shared/designTypes";

// ═══════════════════════════════════════════════════════════════
// BRAND KIT PANEL — Canva Premium-Level Branding System
// ═══════════════════════════════════════════════════════════════

interface BrandKitPanelProps {
  onApplyColor?: (hex: string) => void;
  onApplyFont?: (font: BrandFont) => void;
  onApplyGradient?: (gradient: BrandGradient) => void;
  onInsertLogo?: (url: string) => void;
}

export default function BrandKitPanel({ onApplyColor, onApplyFont, onApplyGradient, onInsertLogo }: BrandKitPanelProps) {
  const [activeSection, setActiveSection] = useState<"kits" | "colors" | "fonts" | "logos" | "gradients" | "voice" | "ai">("kits");
  const [selectedKitId, setSelectedKitId] = useState<number | null>(null);
  const [showCreateKit, setShowCreateKit] = useState(false);
  const [showPresetPalettes, setShowPresetPalettes] = useState(false);
  const [showFontBrowser, setShowFontBrowser] = useState(false);
  const [newKitName, setNewKitName] = useState("");
  const [editingColor, setEditingColor] = useState<{ index: number; color: BrandColor } | null>(null);
  const [newColorHex, setNewColorHex] = useState("#6366f1");
  const [newColorName, setNewColorName] = useState("");
  const [newColorGroup, setNewColorGroup] = useState<string>("primary");

  // Data
  const brandKitsQuery = trpc.brandKits.list.useQuery();
  const brandKits = brandKitsQuery.data || [];
  const selectedKit = brandKits.find((k: any) => k.id === selectedKitId) || brandKits[0];

  // Mutations
  const createKit = trpc.brandKits.create.useMutation({
    onSuccess: (data) => { brandKitsQuery.refetch(); setSelectedKitId(data.id); setShowCreateKit(false); setNewKitName(""); },
  });
  const updateKit = trpc.brandKits.update.useMutation({
    onSuccess: () => brandKitsQuery.refetch(),
  });
  const deleteKit = trpc.brandKits.delete.useMutation({
    onSuccess: () => { brandKitsQuery.refetch(); setSelectedKitId(null); },
  });
  const setDefaultKit = trpc.brandKits.setDefault.useMutation({
    onSuccess: () => brandKitsQuery.refetch(),
  });

  // AI mutations
  const generatePalette = trpc.ai.generatePalette.useMutation();
  const suggestFonts = trpc.ai.suggestFonts.useMutation();

  const kitColors = (selectedKit?.colors as BrandColor[]) || [];
  const kitFonts = (selectedKit?.fonts as BrandFont[]) || [];
  const kitLogos = (selectedKit?.logos as BrandLogo[]) || [];
  const kitGradients = (selectedKit?.gradients as BrandGradient[]) || [];
  const kitVoice = selectedKit?.voice as BrandVoice | undefined;

  const addColorToKit = useCallback((color: BrandColor) => {
    if (!selectedKit) return;
    const updated = [...kitColors, color];
    updateKit.mutate({ id: selectedKit.id, colors: updated });
  }, [selectedKit, kitColors, updateKit]);

  const removeColorFromKit = useCallback((index: number) => {
    if (!selectedKit) return;
    const updated = kitColors.filter((_: any, i: number) => i !== index);
    updateKit.mutate({ id: selectedKit.id, colors: updated });
  }, [selectedKit, kitColors, updateKit]);

  const addFontToKit = useCallback((font: BrandFont) => {
    if (!selectedKit) return;
    const updated = [...kitFonts, font];
    updateKit.mutate({ id: selectedKit.id, fonts: updated });
  }, [selectedKit, kitFonts, updateKit]);

  const removeFontFromKit = useCallback((index: number) => {
    if (!selectedKit) return;
    const updated = kitFonts.filter((_: any, i: number) => i !== index);
    updateKit.mutate({ id: selectedKit.id, fonts: updated });
  }, [selectedKit, kitFonts, updateKit]);

  const addGradientToKit = useCallback((gradient: BrandGradient) => {
    if (!selectedKit) return;
    const updated = [...kitGradients, gradient];
    updateKit.mutate({ id: selectedKit.id, gradients: updated });
  }, [selectedKit, kitGradients, updateKit]);

  const applyPresetPalette = useCallback((paletteKey: string) => {
    if (!selectedKit) return;
    const palette = COLOR_PALETTE_PRESETS[paletteKey];
    if (palette) {
      updateKit.mutate({ id: selectedKit.id, colors: palette.colors });
      setShowPresetPalettes(false);
    }
  }, [selectedKit, updateKit]);

  const sections = [
    { id: "kits" as const, label: "Brand Kits", icon: "🎨" },
    { id: "colors" as const, label: "Colors", icon: "🎨" },
    { id: "fonts" as const, label: "Typography", icon: "🔤" },
    { id: "logos" as const, label: "Logos", icon: "✦" },
    { id: "gradients" as const, label: "Gradients", icon: "🌈" },
    { id: "voice" as const, label: "Brand Voice", icon: "📝" },
    { id: "ai" as const, label: "AI Generate", icon: "🤖" },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-950 text-white">
      {/* Section Tabs */}
      <div className="flex gap-1 p-2 overflow-x-auto border-b border-gray-800 flex-shrink-0">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeSection === s.id
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* ─── Brand Kits Section ─── */}
        {activeSection === "kits" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Your Brand Kits</h3>
              <button
                onClick={() => setShowCreateKit(true)}
                className="text-xs text-indigo-400 hover:text-indigo-300"
              >
                + New Kit
              </button>
            </div>

            {showCreateKit && (
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 space-y-2">
                <input
                  type="text"
                  placeholder="Brand kit name..."
                  value={newKitName}
                  onChange={(e) => setNewKitName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => createKit.mutate({ name: newKitName })}
                    disabled={!newKitName.trim()}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded text-xs font-medium disabled:opacity-50"
                  >
                    Create
                  </button>
                  <button onClick={() => setShowCreateKit(false)} className="px-3 py-1.5 text-gray-400 hover:text-white text-xs">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {brandKits.map((kit: any) => (
              <div
                key={kit.id}
                onClick={() => setSelectedKitId(kit.id)}
                className={`bg-gray-900 border rounded-lg p-3 cursor-pointer transition-all ${
                  selectedKit?.id === kit.id
                    ? "border-indigo-500 ring-1 ring-indigo-500/30"
                    : "border-gray-800 hover:border-gray-600"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">{kit.name}</h4>
                  <div className="flex items-center gap-1">
                    {kit.isDefault && (
                      <span className="text-[10px] bg-indigo-600/20 text-indigo-400 px-1.5 py-0.5 rounded">Default</span>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); setDefaultKit.mutate({ id: kit.id }); }}
                      className="text-xs text-gray-500 hover:text-indigo-400"
                      title="Set as default"
                    >
                      ⭐
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteKit.mutate({ id: kit.id }); }}
                      className="text-xs text-gray-500 hover:text-red-400"
                    >
                      🗑
                    </button>
                  </div>
                </div>
                {/* Color preview */}
                <div className="flex gap-1">
                  {((kit.colors as BrandColor[]) || []).slice(0, 8).map((c: BrandColor, i: number) => (
                    <div key={i} className="w-5 h-5 rounded-full border border-gray-700" style={{ backgroundColor: c.hex }} title={c.name} />
                  ))}
                </div>
              </div>
            ))}

            {brandKits.length === 0 && !showCreateKit && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No brand kits yet</p>
                <button onClick={() => setShowCreateKit(true)} className="mt-2 text-sm text-indigo-400 hover:text-indigo-300">
                  Create your first brand kit
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─── Colors Section ─── */}
        {activeSection === "colors" && selectedKit && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Brand Colors</h3>
              <button
                onClick={() => setShowPresetPalettes(!showPresetPalettes)}
                className="text-xs text-indigo-400 hover:text-indigo-300"
              >
                {showPresetPalettes ? "Hide Presets" : "Browse Presets"}
              </button>
            </div>

            {/* Preset Palettes */}
            {showPresetPalettes && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {Object.entries(COLOR_PALETTE_PRESETS).map(([key, palette]) => (
                  <button
                    key={key}
                    onClick={() => applyPresetPalette(key)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 hover:border-indigo-500/50 transition-all text-left"
                  >
                    <p className="text-xs font-medium mb-1.5">{palette.name}</p>
                    <div className="flex gap-1">
                      {palette.colors.map((c, i) => (
                        <div key={i} className="flex-1 h-6 rounded" style={{ backgroundColor: c.hex }} title={c.name} />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Current Colors */}
            <div className="space-y-1.5">
              {(["primary", "secondary", "accent", "neutral", "custom"] as const).map((group) => {
                const groupColors = kitColors.filter((c) => c.group === group);
                if (groupColors.length === 0) return null;
                return (
                  <div key={group}>
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">{group}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {groupColors.map((color, i) => (
                        <button
                          key={i}
                          onClick={() => onApplyColor?.(color.hex)}
                          className="group relative w-10 h-10 rounded-lg border-2 border-gray-700 hover:border-indigo-500 transition-all"
                          style={{ backgroundColor: color.hex }}
                          title={`${color.name}: ${color.hex}`}
                        >
                          <span
                            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeColorFromKit(kitColors.indexOf(color));
                            }}
                          >
                            ×
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Color */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 space-y-2">
              <p className="text-xs font-medium text-gray-300">Add Color</p>
              <div className="flex gap-2">
                <input type="color" value={newColorHex} onChange={(e) => setNewColorHex(e.target.value)} className="w-10 h-10 rounded cursor-pointer bg-transparent" />
                <div className="flex-1 space-y-1.5">
                  <input
                    type="text"
                    placeholder="Color name"
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <div className="flex gap-1.5">
                    <select
                      value={newColorGroup}
                      onChange={(e) => setNewColorGroup(e.target.value)}
                      className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs focus:outline-none"
                    >
                      <option value="primary">Primary</option>
                      <option value="secondary">Secondary</option>
                      <option value="accent">Accent</option>
                      <option value="neutral">Neutral</option>
                      <option value="custom">Custom</option>
                    </select>
                    <button
                      onClick={() => {
                        addColorToKit({ name: newColorName || newColorHex, hex: newColorHex, group: newColorGroup as any });
                        setNewColorName("");
                      }}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 rounded text-xs font-medium"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Typography Section ─── */}
        {activeSection === "fonts" && selectedKit && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Typography</h3>
              <button
                onClick={() => setShowFontBrowser(!showFontBrowser)}
                className="text-xs text-indigo-400 hover:text-indigo-300"
              >
                {showFontBrowser ? "Hide Browser" : "Browse Fonts"}
              </button>
            </div>

            {/* Font Pairings */}
            <div className="space-y-2">
              <p className="text-xs text-gray-400 font-medium">Quick Pairings</p>
              {FONT_PAIRINGS.slice(0, 6).map((pairing, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const fonts: BrandFont[] = [
                      { name: pairing.heading.family, family: pairing.heading.family, variants: [pairing.heading.weight], role: "heading", weight: pairing.heading.weight },
                      { name: pairing.subheading.family, family: pairing.subheading.family, variants: [pairing.subheading.weight], role: "subheading", weight: pairing.subheading.weight },
                      { name: pairing.body.family, family: pairing.body.family, variants: [pairing.body.weight], role: "body", weight: pairing.body.weight },
                    ];
                    updateKit.mutate({ id: selectedKit.id, fonts });
                  }}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 hover:border-indigo-500/50 transition-all text-left"
                >
                  <p className="text-xs font-medium">{pairing.name}</p>
                  <p className="text-[10px] text-gray-500">{pairing.description}</p>
                  <div className="mt-1.5 space-y-0.5">
                    <p className="text-xs" style={{ fontFamily: pairing.heading.family }}>Heading: {pairing.heading.family}</p>
                    <p className="text-[10px] text-gray-400" style={{ fontFamily: pairing.body.family }}>Body: {pairing.body.family}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Current Kit Fonts */}
            {kitFonts.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs text-gray-400 font-medium">Kit Fonts</p>
                {kitFonts.map((font, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-lg p-2.5">
                    <div>
                      <p className="text-sm" style={{ fontFamily: font.family }}>{font.name}</p>
                      <p className="text-[10px] text-gray-500 capitalize">{font.role || "custom"} • {font.weight || "400"}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => onApplyFont?.(font)} className="text-xs text-indigo-400 hover:text-indigo-300 px-2 py-1">
                        Apply
                      </button>
                      <button onClick={() => removeFontFromKit(i)} className="text-xs text-gray-500 hover:text-red-400 px-1">
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Font Browser */}
            {showFontBrowser && (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {Object.entries(FONT_COLLECTION).map(([category, { fonts }]) => (
                  <div key={category}>
                    <p className="text-xs font-medium text-gray-300 mb-1.5 capitalize">{category.replace(/-/g, " ")}</p>
                    <div className="space-y-1">
                      {fonts.map((font, i) => (
                        <button
                          key={i}
                          onClick={() => addFontToKit(font)}
                          className="w-full flex items-center justify-between bg-gray-900 border border-gray-800 rounded px-2.5 py-1.5 hover:border-indigo-500/50 transition-all text-left"
                        >
                          <span className="text-sm" style={{ fontFamily: font.family }}>{font.name}</span>
                          <span className="text-[10px] text-gray-500">+ Add</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── Logos Section ─── */}
        {activeSection === "logos" && selectedKit && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Brand Logos</h3>
            <div className="grid grid-cols-2 gap-2">
              {kitLogos.map((logo, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-2 group relative">
                  <img src={logo.url} alt={logo.name} className="w-full h-20 object-contain" />
                  <p className="text-[10px] text-gray-400 text-center mt-1 capitalize">{logo.type}</p>
                  <button
                    onClick={() => onInsertLogo?.(logo.url)}
                    className="absolute inset-0 bg-indigo-600/0 hover:bg-indigo-600/20 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <span className="text-xs font-medium bg-indigo-600 px-2 py-1 rounded">Insert</span>
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 text-center">Upload logos from the editor's upload panel</p>
          </div>
        )}

        {/* ─── Gradients Section ─── */}
        {activeSection === "gradients" && selectedKit && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Brand Gradients</h3>
            <div className="grid grid-cols-2 gap-2">
              {kitGradients.map((gradient, i) => (
                <button
                  key={i}
                  onClick={() => onApplyGradient?.(gradient)}
                  className="h-16 rounded-lg border border-gray-800 hover:border-indigo-500/50 transition-all"
                  style={{
                    background: gradient.type === "linear"
                      ? `linear-gradient(${gradient.angle}deg, ${gradient.colors.join(", ")})`
                      : `radial-gradient(circle, ${gradient.colors.join(", ")})`,
                  }}
                />
              ))}
            </div>
            <GradientCreator onAdd={(g) => addGradientToKit(g)} />
          </div>
        )}

        {/* ─── Brand Voice Section ─── */}
        {activeSection === "voice" && selectedKit && (
          <BrandVoiceEditor
            voice={kitVoice}
            onSave={(voice) => updateKit.mutate({ id: selectedKit.id, voice })}
          />
        )}

        {/* ─── AI Generate Section ─── */}
        {activeSection === "ai" && selectedKit && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">AI Brand Generation</h3>

            {/* AI Palette */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 space-y-2">
              <p className="text-xs font-medium">Generate Color Palette</p>
              <AIColorGenerator
                onGenerate={(params) => generatePalette.mutate(params)}
                result={generatePalette.data}
                isLoading={generatePalette.isPending}
                onApply={(colors) => updateKit.mutate({ id: selectedKit.id, colors })}
              />
            </div>

            {/* AI Fonts */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 space-y-2">
              <p className="text-xs font-medium">AI Font Suggestions</p>
              <AIFontSuggester
                onGenerate={(params) => suggestFonts.mutate(params)}
                result={suggestFonts.data}
                isLoading={suggestFonts.isPending}
                onApply={(fonts) => updateKit.mutate({ id: selectedKit.id, fonts })}
              />
            </div>
          </div>
        )}

        {/* No kit selected */}
        {activeSection !== "kits" && !selectedKit && (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">Select or create a brand kit first</p>
            <button onClick={() => setActiveSection("kits")} className="mt-2 text-sm text-indigo-400">
              Go to Brand Kits
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-Components ──────────────────────────────────────────

function GradientCreator({ onAdd }: { onAdd: (g: BrandGradient) => void }) {
  const [color1, setColor1] = useState("#6366f1");
  const [color2, setColor2] = useState("#ec4899");
  const [angle, setAngle] = useState(135);
  const [type, setType] = useState<"linear" | "radial">("linear");
  const [name, setName] = useState("");

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 space-y-2">
      <p className="text-xs font-medium text-gray-300">Create Gradient</p>
      <div
        className="h-12 rounded-lg"
        style={{
          background: type === "linear"
            ? `linear-gradient(${angle}deg, ${color1}, ${color2})`
            : `radial-gradient(circle, ${color1}, ${color2})`,
        }}
      />
      <div className="flex gap-2">
        <input type="color" value={color1} onChange={(e) => setColor1(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
        <input type="color" value={color2} onChange={(e) => setColor2(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
        <select value={type} onChange={(e) => setType(e.target.value as any)} className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs">
          <option value="linear">Linear</option>
          <option value="radial">Radial</option>
        </select>
        {type === "linear" && (
          <input type="number" value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="w-16 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs" placeholder="Angle" />
        )}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Gradient name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs focus:outline-none"
        />
        <button
          onClick={() => { onAdd({ name: name || "Custom", colors: [color1, color2], angle, type }); setName(""); }}
          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 rounded text-xs font-medium"
        >
          Add
        </button>
      </div>
    </div>
  );
}

function BrandVoiceEditor({ voice, onSave }: { voice?: BrandVoice; onSave: (v: BrandVoice) => void }) {
  const [tone, setTone] = useState(voice?.tone || "");
  const [personality, setPersonality] = useState(voice?.personality?.join(", ") || "");
  const [keywords, setKeywords] = useState(voice?.keywords?.join(", ") || "");
  const [avoidWords, setAvoidWords] = useState(voice?.avoidWords?.join(", ") || "");
  const [sampleCopy, setSampleCopy] = useState(voice?.sampleCopy || "");

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Brand Voice</h3>
      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Tone</label>
          <input
            type="text"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            placeholder="e.g., Professional, friendly, bold"
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Personality Traits (comma-separated)</label>
          <input
            type="text"
            value={personality}
            onChange={(e) => setPersonality(e.target.value)}
            placeholder="e.g., Innovative, trustworthy, approachable"
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Key Words & Phrases (comma-separated)</label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="e.g., Transform, empower, seamless"
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Words to Avoid (comma-separated)</label>
          <input
            type="text"
            value={avoidWords}
            onChange={(e) => setAvoidWords(e.target.value)}
            placeholder="e.g., Cheap, basic, simple"
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Sample Copy</label>
          <textarea
            value={sampleCopy}
            onChange={(e) => setSampleCopy(e.target.value)}
            rows={3}
            placeholder="Paste an example of your brand's writing style..."
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
          />
        </div>
        <button
          onClick={() => onSave({
            tone,
            personality: personality.split(",").map(s => s.trim()).filter(Boolean),
            keywords: keywords.split(",").map(s => s.trim()).filter(Boolean),
            avoidWords: avoidWords.split(",").map(s => s.trim()).filter(Boolean),
            sampleCopy,
          })}
          className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium"
        >
          Save Brand Voice
        </button>
      </div>
    </div>
  );
}

function AIColorGenerator({ onGenerate, result, isLoading, onApply }: any) {
  const [mood, setMood] = useState("");
  const [industry, setIndustry] = useState("");

  return (
    <div className="space-y-2">
      <input
        type="text"
        placeholder="Mood (e.g., energetic, calm, luxurious)"
        value={mood}
        onChange={(e) => setMood(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
      <input
        type="text"
        placeholder="Industry (e.g., tech, fashion, food)"
        value={industry}
        onChange={(e) => setIndustry(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
      <button
        onClick={() => onGenerate({ mood, industry, count: 6 })}
        disabled={isLoading}
        className="w-full px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded text-xs font-medium disabled:opacity-50"
      >
        {isLoading ? "Generating..." : "🤖 Generate Palette"}
      </button>
      {result?.colors && (
        <div className="space-y-2">
          <div className="flex gap-1">
            {result.colors.map((c: any, i: number) => (
              <div key={i} className="flex-1 h-8 rounded" style={{ backgroundColor: c.hex }} title={`${c.name}: ${c.hex}`} />
            ))}
          </div>
          <button
            onClick={() => onApply(result.colors)}
            className="w-full px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-xs font-medium"
          >
            Apply to Brand Kit
          </button>
        </div>
      )}
    </div>
  );
}

function AIFontSuggester({ onGenerate, result, isLoading, onApply }: any) {
  const [style, setStyle] = useState("");
  const [industry, setIndustry] = useState("");

  return (
    <div className="space-y-2">
      <input
        type="text"
        placeholder="Style (e.g., modern, elegant, playful)"
        value={style}
        onChange={(e) => setStyle(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
      <input
        type="text"
        placeholder="Industry (e.g., tech, luxury, education)"
        value={industry}
        onChange={(e) => setIndustry(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
      <button
        onClick={() => onGenerate({ style, industry })}
        disabled={isLoading}
        className="w-full px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded text-xs font-medium disabled:opacity-50"
      >
        {isLoading ? "Generating..." : "🤖 Suggest Fonts"}
      </button>
      {result?.pairings && (
        <div className="space-y-2">
          {result.pairings.map((p: any, i: number) => (
            <button
              key={i}
              onClick={() => onApply([
                { name: p.heading.family, family: p.heading.family, variants: [p.heading.weight], role: "heading", weight: p.heading.weight },
                { name: p.subheading.family, family: p.subheading.family, variants: [p.subheading.weight], role: "subheading", weight: p.subheading.weight },
                { name: p.body.family, family: p.body.family, variants: [p.body.weight], role: "body", weight: p.body.weight },
              ])}
              className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-left hover:border-indigo-500/50"
            >
              <p className="text-xs font-medium">{p.name}</p>
              <p className="text-[10px] text-gray-500">{p.description}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
