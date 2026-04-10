import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Instagram, Facebook, Twitter, Youtube, Linkedin, FileText,
  Presentation, Image as ImageIcon, Plus, ArrowRight, Monitor,
  Smartphone, Tablet, Globe, Hash, Music, Video, Mail, ShoppingBag
} from "lucide-react";
import { useLocation } from "wouter";
import { CANVAS_PRESETS } from "@shared/designTypes";

interface NewProjectDialogProps {
  children: React.ReactNode;
}

export default function NewProjectDialog({ children }: NewProjectDialogProps) {
  const [, setLocation] = useLocation();
  const [customWidth, setCustomWidth] = useState("1080");
  const [customHeight, setCustomHeight] = useState("1080");
  const [open, setOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string>("all");

  const presetGroups: Record<string, Array<{ key: string; icon: React.ElementType; category: string }>> = {
    "Instagram": [
      { key: "instagram-post", icon: Instagram, category: "instagram" },
      { key: "instagram-story", icon: Instagram, category: "instagram" },
      { key: "instagram-reel", icon: Instagram, category: "instagram" },
      { key: "instagram-carousel", icon: Instagram, category: "instagram" },
      { key: "instagram-profile", icon: Instagram, category: "instagram" },
      { key: "instagram-highlight", icon: Instagram, category: "instagram" },
      { key: "instagram-ad", icon: Instagram, category: "instagram" },
    ],
    "Facebook": [
      { key: "facebook-post", icon: Facebook, category: "facebook" },
      { key: "facebook-story", icon: Facebook, category: "facebook" },
      { key: "facebook-cover", icon: Facebook, category: "facebook" },
      { key: "facebook-event", icon: Facebook, category: "facebook" },
      { key: "facebook-ad", icon: Facebook, category: "facebook" },
      { key: "facebook-group-cover", icon: Facebook, category: "facebook" },
      { key: "facebook-profile", icon: Facebook, category: "facebook" },
    ],
    "TikTok": [
      { key: "tiktok-video", icon: Video, category: "tiktok" },
      { key: "tiktok-profile", icon: Video, category: "tiktok" },
    ],
    "X / Twitter": [
      { key: "twitter-post", icon: Twitter, category: "twitter" },
      { key: "twitter-header", icon: Twitter, category: "twitter" },
      { key: "twitter-profile", icon: Twitter, category: "twitter" },
      { key: "twitter-card", icon: Twitter, category: "twitter" },
    ],
    "YouTube": [
      { key: "youtube-thumbnail", icon: Youtube, category: "youtube" },
      { key: "youtube-banner", icon: Youtube, category: "youtube" },
      { key: "youtube-shorts", icon: Youtube, category: "youtube" },
      { key: "youtube-end-screen", icon: Youtube, category: "youtube" },
    ],
    "LinkedIn": [
      { key: "linkedin-post", icon: Linkedin, category: "linkedin" },
      { key: "linkedin-cover", icon: Linkedin, category: "linkedin" },
      { key: "linkedin-profile", icon: Linkedin, category: "linkedin" },
      { key: "linkedin-story", icon: Linkedin, category: "linkedin" },
      { key: "linkedin-ad", icon: Linkedin, category: "linkedin" },
    ],
    "Pinterest": [
      { key: "pinterest-pin", icon: ImageIcon, category: "pinterest" },
      { key: "pinterest-long-pin", icon: ImageIcon, category: "pinterest" },
      { key: "pinterest-board-cover", icon: ImageIcon, category: "pinterest" },
      { key: "pinterest-profile", icon: ImageIcon, category: "pinterest" },
    ],
    "Print": [
      { key: "flyer-letter", icon: FileText, category: "print" },
      { key: "flyer-a4", icon: FileText, category: "print" },
      { key: "poster-18x24", icon: ImageIcon, category: "print" },
      { key: "poster-24x36", icon: ImageIcon, category: "print" },
      { key: "business-card", icon: FileText, category: "print" },
      { key: "postcard-4x6", icon: Mail, category: "print" },
      { key: "rack-card", icon: FileText, category: "print" },
      { key: "brochure-trifold", icon: FileText, category: "print" },
      { key: "menu-letter", icon: FileText, category: "print" },
      { key: "bookmark", icon: FileText, category: "print" },
      { key: "sticker-circle", icon: ImageIcon, category: "print" },
      { key: "label-2x3", icon: FileText, category: "print" },
    ],
    "Presentations & Docs": [
      { key: "presentation-16-9", icon: Presentation, category: "other" },
      { key: "presentation-4-3", icon: Presentation, category: "other" },
      { key: "document-letter", icon: FileText, category: "other" },
      { key: "document-a4", icon: FileText, category: "other" },
      { key: "infographic", icon: FileText, category: "other" },
      { key: "resume", icon: FileText, category: "other" },
      { key: "certificate", icon: FileText, category: "other" },
    ],
    "Web & Digital": [
      { key: "web-banner", icon: Monitor, category: "web" },
      { key: "email-header", icon: Mail, category: "web" },
      { key: "blog-header", icon: Globe, category: "web" },
      { key: "leaderboard-ad", icon: Monitor, category: "web" },
      { key: "medium-rectangle-ad", icon: Monitor, category: "web" },
      { key: "skyscraper-ad", icon: Monitor, category: "web" },
      { key: "mobile-wallpaper", icon: Smartphone, category: "web" },
      { key: "desktop-wallpaper", icon: Monitor, category: "web" },
      { key: "tablet-wallpaper", icon: Tablet, category: "web" },
    ],
    "E-Commerce": [
      { key: "product-photo", icon: ShoppingBag, category: "ecommerce" },
      { key: "etsy-banner", icon: ShoppingBag, category: "ecommerce" },
      { key: "shopify-banner", icon: ShoppingBag, category: "ecommerce" },
    ],
    "Messaging": [
      { key: "whatsapp-status", icon: Smartphone, category: "messaging" },
      { key: "snapchat-geofilter", icon: Smartphone, category: "messaging" },
      { key: "discord-banner", icon: Globe, category: "messaging" },
      { key: "twitch-banner", icon: Monitor, category: "messaging" },
      { key: "twitch-overlay", icon: Monitor, category: "messaging" },
      { key: "zoom-background", icon: Monitor, category: "messaging" },
    ],
  };

  const groupNames = ["all", ...Object.keys(presetGroups)];

  const filteredGroups = activeGroup === "all"
    ? presetGroups
    : { [activeGroup]: presetGroups[activeGroup] || [] };

  const startProject = (w: number, h: number, preset: string) => {
    setOpen(false);
    setLocation(`/editor?w=${w}&h=${h}&preset=${preset}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl bg-card border-border max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">Create New Design</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="presets" className="w-full">
          <TabsList className="bg-secondary w-full">
            <TabsTrigger value="presets" className="flex-1">Presets</TabsTrigger>
            <TabsTrigger value="custom" className="flex-1">Custom Size</TabsTrigger>
          </TabsList>

          <TabsContent value="presets" className="mt-4">
            {/* Category filter */}
            <ScrollArea className="w-full mb-3">
              <div className="flex gap-1.5 pb-1">
                {groupNames.map((group) => (
                  <button
                    key={group}
                    onClick={() => setActiveGroup(group)}
                    className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
                      activeGroup === group
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {group === "all" ? "All Sizes" : group}
                  </button>
                ))}
              </div>
            </ScrollArea>

            <ScrollArea className="h-[400px]">
              <div className="space-y-5">
                {Object.entries(filteredGroups).map(([group, presets]) => (
                  <div key={group}>
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">{group}</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {presets.map(({ key, icon: Icon }) => {
                        const preset = CANVAS_PRESETS[key];
                        if (!preset) return null;
                        return (
                          <button
                            key={key}
                            onClick={() => startProject(preset.width, preset.height, key)}
                            className="flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-accent border border-border transition-colors text-left group"
                          >
                            <div className="w-9 h-9 rounded-lg bg-background flex items-center justify-center shrink-0">
                              <Icon className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-card-foreground truncate">{preset.label}</p>
                              <p className="text-[10px] text-muted-foreground">{preset.width} x {preset.height} px</p>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="custom" className="mt-4">
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Width (px)</Label>
                  <Input
                    type="number"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(e.target.value)}
                    min={1}
                    max={10000}
                    className="bg-secondary"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Height (px)</Label>
                  <Input
                    type="number"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(e.target.value)}
                    min={1}
                    max={10000}
                    className="bg-secondary"
                  />
                </div>
              </div>

              {/* Quick size presets */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Quick Sizes</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { w: 1080, h: 1080, label: "Square" },
                    { w: 1080, h: 1920, label: "Portrait" },
                    { w: 1920, h: 1080, label: "Landscape" },
                    { w: 1200, h: 630, label: "OG Image" },
                    { w: 1280, h: 720, label: "HD" },
                    { w: 1920, h: 1080, label: "Full HD" },
                    { w: 3840, h: 2160, label: "4K" },
                    { w: 800, h: 600, label: "Web" },
                  ].map((qs) => (
                    <button
                      key={qs.label}
                      onClick={() => { setCustomWidth(String(qs.w)); setCustomHeight(String(qs.h)); }}
                      className="px-2.5 py-1 rounded-full bg-secondary text-[10px] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                    >
                      {qs.label} ({qs.w}x{qs.h})
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-secondary rounded-lg p-4 text-center">
                <div
                  className="mx-auto border-2 border-dashed border-border rounded-md flex items-center justify-center"
                  style={{
                    width: Math.min(200, 200),
                    height: Math.min(200, 200 * (parseInt(customHeight) / parseInt(customWidth) || 1)),
                    maxHeight: 200,
                  }}
                >
                  <span className="text-[10px] text-muted-foreground">
                    {customWidth} x {customHeight}
                  </span>
                </div>
              </div>

              <Button
                className="w-full gap-2"
                onClick={() => startProject(parseInt(customWidth) || 1080, parseInt(customHeight) || 1080, "custom")}
              >
                <Plus className="w-4 h-4" />
                Create Design
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
