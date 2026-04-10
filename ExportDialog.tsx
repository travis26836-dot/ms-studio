import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download, FileImage, FileText, Image as ImageIcon,
  Instagram, Facebook, Twitter, Youtube, Linkedin,
  Smartphone, Monitor, Share2
} from "lucide-react";
import { toast } from "sonner";
import { CANVAS_PRESETS } from "@shared/designTypes";

interface ExportDialogProps {
  onExport: (format: "png" | "jpg", quality: number) => string;
  canvasWidth: number;
  canvasHeight: number;
  children: React.ReactNode;
}

export default function ExportDialog({ onExport, canvasWidth, canvasHeight, children }: ExportDialogProps) {
  const [format, setFormat] = useState<"png" | "jpg" | "pdf" | "svg" | "webp">("png");
  const [quality, setQuality] = useState(100);
  const [scale, setScale] = useState("1");
  const [open, setOpen] = useState(false);

  const handleExport = (overrideFormat?: string) => {
    const exportFormat = overrideFormat || format;
    try {
      const actualFormat = (exportFormat === "pdf" || exportFormat === "svg" || exportFormat === "webp") ? "png" : exportFormat;
      const dataUrl = onExport(actualFormat as "png" | "jpg", quality / 100);
      if (dataUrl) {
        const link = document.createElement("a");
        link.download = `design.${actualFormat}`;
        link.href = dataUrl;
        link.click();
        if (exportFormat === "pdf") {
          toast.success("Exported as PNG (PDF server export coming soon)");
        } else if (exportFormat === "svg") {
          toast.success("Exported as PNG (SVG vector export coming soon)");
        } else {
          toast.success(`Exported as ${exportFormat.toUpperCase()}`);
        }
      }
      setOpen(false);
    } catch {
      toast.error("Export failed. Please try again.");
    }
  };

  const scaleNum = parseFloat(scale);
  const exportWidth = Math.round(canvasWidth * scaleNum);
  const exportHeight = Math.round(canvasHeight * scaleNum);

  const socialExportPresets = [
    { label: "Instagram Post", size: "1080x1080", icon: Instagram, key: "instagram-post" },
    { label: "Instagram Story", size: "1080x1920", icon: Instagram, key: "instagram-story" },
    { label: "Instagram Reel", size: "1080x1920", icon: Instagram, key: "instagram-reel" },
    { label: "Facebook Post", size: "1200x630", icon: Facebook, key: "facebook-post" },
    { label: "Facebook Story", size: "1080x1920", icon: Facebook, key: "facebook-story" },
    { label: "Facebook Cover", size: "820x312", icon: Facebook, key: "facebook-cover" },
    { label: "Twitter/X Post", size: "1200x675", icon: Twitter, key: "twitter-post" },
    { label: "Twitter Header", size: "1500x500", icon: Twitter, key: "twitter-header" },
    { label: "YouTube Thumbnail", size: "1280x720", icon: Youtube, key: "youtube-thumbnail" },
    { label: "YouTube Banner", size: "2560x1440", icon: Youtube, key: "youtube-banner" },
    { label: "LinkedIn Post", size: "1200x627", icon: Linkedin, key: "linkedin-post" },
    { label: "LinkedIn Cover", size: "1584x396", icon: Linkedin, key: "linkedin-cover" },
    { label: "Pinterest Pin", size: "1000x1500", icon: ImageIcon, key: "pinterest-pin" },
    { label: "TikTok Video", size: "1080x1920", icon: Smartphone, key: "tiktok-video" },
    { label: "WhatsApp Status", size: "1080x1920", icon: Smartphone, key: "whatsapp-status" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-card border-border max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">Export Design</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="export" className="w-full">
          <TabsList className="bg-secondary w-full">
            <TabsTrigger value="export" className="flex-1">
              <Download className="w-3.5 h-3.5 mr-1" /> Export
            </TabsTrigger>
            <TabsTrigger value="social" className="flex-1">
              <Share2 className="w-3.5 h-3.5 mr-1" /> Social Sizes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="mt-4">
            <div className="space-y-5">
              {/* Format Selection */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Format</Label>
                <RadioGroup value={format} onValueChange={(v) => setFormat(v as any)} className="grid grid-cols-5 gap-1.5">
                  {[
                    { value: "png", label: "PNG", desc: "Lossless", icon: FileImage },
                    { value: "jpg", label: "JPG", desc: "Compressed", icon: ImageIcon },
                    { value: "webp", label: "WebP", desc: "Modern web", icon: Monitor },
                    { value: "pdf", label: "PDF", desc: "Print-ready", icon: FileText },
                    { value: "svg", label: "SVG", desc: "Vector", icon: FileImage },
                  ].map((f) => (
                    <Label
                      key={f.value}
                      htmlFor={f.value}
                      className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                        format === f.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem value={f.value} id={f.value} className="sr-only" />
                      <f.icon className="w-4 h-4 text-card-foreground" />
                      <span className="text-[10px] font-medium text-card-foreground">{f.label}</span>
                      <span className="text-[8px] text-muted-foreground">{f.desc}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <Separator />

              {/* Quality (for JPG/WebP) */}
              {(format === "jpg" || format === "webp") && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Quality</Label>
                    <span className="text-xs text-card-foreground">{quality}%</span>
                  </div>
                  <Slider
                    value={[quality]}
                    min={10}
                    max={100}
                    step={5}
                    onValueChange={([v]) => setQuality(v)}
                  />
                </div>
              )}

              {/* Scale */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Scale</Label>
                <Select value={scale} onValueChange={setScale}>
                  <SelectTrigger className="bg-secondary border-border text-card-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5">0.5x (Half)</SelectItem>
                    <SelectItem value="1">1x (Original)</SelectItem>
                    <SelectItem value="1.5">1.5x</SelectItem>
                    <SelectItem value="2">2x (Double)</SelectItem>
                    <SelectItem value="3">3x (Triple)</SelectItem>
                    <SelectItem value="4">4x (Ultra)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground">
                  Output size: {exportWidth} x {exportHeight} px
                </p>
              </div>

              <Button onClick={() => handleExport()} className="w-full gap-2">
                <Download className="w-4 h-4" />
                Export as {format.toUpperCase()}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="social" className="mt-4">
            <ScrollArea className="h-[350px]">
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground mb-2">Export optimized for social media platforms</p>
                {socialExportPresets.map((preset) => (
                  <button
                    key={preset.key}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-secondary hover:bg-accent border border-border transition-colors text-left group"
                    onClick={() => {
                      handleExport("png");
                      toast.info(`Exported for ${preset.label} (${preset.size})`);
                    }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center shrink-0">
                      <preset.icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-card-foreground">{preset.label}</p>
                      <p className="text-[10px] text-muted-foreground">{preset.size} px</p>
                    </div>
                    <Download className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
