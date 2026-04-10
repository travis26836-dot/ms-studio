import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Facebook, Instagram, Twitter, Linkedin, Youtube, Hash, Globe,
  Send, Loader2, Link, Unlink, Clock, Sparkles, Image, Calendar,
  CheckCircle, XCircle, AlertCircle, Bookmark, ExternalLink
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import type { SocialPlatform } from "@shared/designTypes";

// ═══════════════════════════════════════════════════════════════
// SOCIAL MEDIA PANEL — Direct Publishing to Facebook & Instagram
// With extensible architecture for all major platforms
// ═══════════════════════════════════════════════════════════════

interface SocialMediaPanelProps {
  projectId?: number;
  projectName?: string;
  onExportImage?: () => string | undefined; // Returns base64 or URL
  canvasWidth?: number;
  canvasHeight?: number;
}

export default function SocialMediaPanel({ projectId, projectName, onExportImage, canvasWidth, canvasHeight }: SocialMediaPanelProps) {
  const [activeTab, setActiveTab] = useState<"publish" | "connections" | "history">("publish");
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | null>(null);
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState("");
  const [altText, setAltText] = useState("");
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [publishStatus, setPublishStatus] = useState<"idle" | "publishing" | "success" | "error">("idle");
  const [publishMessage, setPublishMessage] = useState("");

  // OAuth state for connecting accounts
  const [connectingPlatform, setConnectingPlatform] = useState<SocialPlatform | null>(null);
  const [oauthToken, setOauthToken] = useState("");
  const [oauthAccountId, setOauthAccountId] = useState("");
  const [oauthAccountName, setOauthAccountName] = useState("");
  const [oauthPageId, setOauthPageId] = useState("");

  // Queries
  const platformsQuery = trpc.social.platforms.useQuery();
  const connectionsQuery = trpc.social.connections.useQuery();
  const historyQuery = trpc.social.history.useQuery(projectId ? { projectId } : undefined);

  // Mutations
  const publishMutation = trpc.social.publish.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setPublishStatus("success");
        setPublishMessage(data.postUrl ? `Published! View at: ${data.postUrl}` : "Published successfully!");
        historyQuery.refetch();
      } else {
        setPublishStatus(data.status === "draft" ? "success" : "error");
        setPublishMessage(data.error || data.message || "Publishing failed");
      }
    },
    onError: (error) => {
      setPublishStatus("error");
      setPublishMessage(error.message);
    },
  });

  const connectMutation = trpc.social.connect.useMutation({
    onSuccess: () => {
      connectionsQuery.refetch();
      platformsQuery.refetch();
      setConnectingPlatform(null);
      resetOauthFields();
    },
  });

  const disconnectMutation = trpc.social.disconnect.useMutation({
    onSuccess: () => {
      connectionsQuery.refetch();
      platformsQuery.refetch();
    },
  });

  const generateCaptionMutation = trpc.social.generateCaption.useMutation({
    onSuccess: (data) => {
      setCaption(data.caption);
      setHashtags(data.hashtags || []);
    },
  });

  const platforms = platformsQuery.data || [];
  const connections = connectionsQuery.data || [];
  const history = historyQuery.data || [];

  const resetOauthFields = () => {
    setOauthToken("");
    setOauthAccountId("");
    setOauthAccountName("");
    setOauthPageId("");
  };

  const handlePublish = useCallback(() => {
    if (!selectedPlatform || !projectId) return;

    setPublishStatus("publishing");
    setPublishMessage("");

    const imageUrl = onExportImage?.();

    publishMutation.mutate({
      projectId,
      platform: selectedPlatform,
      caption: caption + (hashtags.length > 0 ? "\n\n" + hashtags.map(h => `#${h}`).join(" ") : ""),
      hashtags,
      imageUrl: imageUrl || undefined,
      altText: altText || undefined,
      scheduledAt: showSchedule && scheduleDate && scheduleTime
        ? new Date(`${scheduleDate}T${scheduleTime}`).toISOString()
        : undefined,
    });
  }, [selectedPlatform, projectId, caption, hashtags, altText, showSchedule, scheduleDate, scheduleTime, onExportImage, publishMutation]);

  const addHashtag = () => {
    const tag = hashtagInput.replace(/^#/, "").trim();
    if (tag && !hashtags.includes(tag)) {
      setHashtags([...hashtags, tag]);
      setHashtagInput("");
    }
  };

  const removeHashtag = (tag: string) => {
    setHashtags(hashtags.filter(h => h !== tag));
  };

  const platformIcons: Record<string, string> = {
    facebook: "📘", instagram: "📸", tiktok: "🎵", twitter: "🐦",
    linkedin: "💼", pinterest: "📌", youtube: "▶️",
  };

  const platformColors: Record<string, string> = {
    facebook: "from-blue-600 to-blue-700",
    instagram: "from-pink-500 via-purple-500 to-orange-400",
    tiktok: "from-gray-900 to-gray-800",
    twitter: "from-sky-500 to-sky-600",
    linkedin: "from-blue-700 to-blue-800",
    pinterest: "from-red-600 to-red-700",
    youtube: "from-red-600 to-red-700",
  };

  return (
    <div className="h-full flex flex-col bg-gray-950 text-white">
      {/* Tab Navigation */}
      <div className="flex gap-1 p-2 border-b border-gray-800 flex-shrink-0">
        {(["publish", "connections", "history"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            {tab === "publish" ? "📤 Publish" : tab === "connections" ? "🔗 Accounts" : "📋 History"}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* ─── Publish Tab ─── */}
        {activeTab === "publish" && (
          <div className="space-y-4">
            {/* Platform Selection */}
            <div>
              <p className="text-xs font-medium text-gray-400 mb-2">Select Platform</p>
              <div className="grid grid-cols-2 gap-2">
                {platforms.map((platform: any) => (
                  <button
                    key={platform.id}
                    onClick={() => setSelectedPlatform(platform.id)}
                    disabled={platform.status === "coming-soon" && !platform.connected}
                    className={`relative p-3 rounded-xl border transition-all text-left ${
                      selectedPlatform === platform.id
                        ? "border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/30"
                        : platform.status === "coming-soon"
                        ? "border-gray-800 bg-gray-900/50 opacity-60"
                        : "border-gray-800 bg-gray-900 hover:border-gray-600"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{platformIcons[platform.id]}</span>
                      <span className="text-sm font-medium">{platform.name}</span>
                    </div>
                    {platform.connected ? (
                      <p className="text-[10px] text-green-400">✓ Connected: {platform.accountName}</p>
                    ) : platform.status === "coming-soon" ? (
                      <p className="text-[10px] text-gray-500">Coming Soon</p>
                    ) : (
                      <p className="text-[10px] text-yellow-400">Not connected</p>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Caption & Content */}
            {selectedPlatform && (
              <>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-gray-400">Caption</label>
                    <button
                      onClick={() => generateCaptionMutation.mutate({
                        platform: selectedPlatform,
                        designDescription: projectName || "design",
                        includeHashtags: true,
                        includeEmojis: true,
                      })}
                      disabled={generateCaptionMutation.isPending}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300"
                    >
                      {generateCaptionMutation.isPending ? "Generating..." : "🤖 AI Generate"}
                    </button>
                  </div>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    rows={4}
                    placeholder={`Write your ${selectedPlatform} caption...`}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">{caption.length} characters</p>
                </div>

                {/* Hashtags */}
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1.5 block">Hashtags</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {hashtags.map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1 bg-indigo-600/20 text-indigo-400 text-xs px-2 py-1 rounded-full">
                        #{tag}
                        <button onClick={() => removeHashtag(tag)} className="hover:text-white">×</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={hashtagInput}
                      onChange={(e) => setHashtagInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addHashtag()}
                      placeholder="Add hashtag..."
                      className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button onClick={addHashtag} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs">
                      Add
                    </button>
                  </div>
                </div>

                {/* Alt Text */}
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1.5 block">Alt Text (Accessibility)</label>
                  <input
                    type="text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="Describe the image for accessibility..."
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Schedule */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showSchedule}
                      onChange={(e) => setShowSchedule(e.target.checked)}
                      className="rounded border-gray-600"
                    />
                    <span className="text-xs font-medium text-gray-400">Schedule for later</span>
                  </label>
                  {showSchedule && (
                    <div className="flex gap-2 mt-2">
                      <input
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-xs focus:outline-none"
                      />
                      <input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Publish Button */}
                <button
                  onClick={handlePublish}
                  disabled={publishStatus === "publishing" || !projectId}
                  className={`w-full py-3 rounded-xl text-sm font-semibold transition-all bg-gradient-to-r ${
                    platformColors[selectedPlatform] || "from-indigo-600 to-purple-600"
                  } hover:opacity-90 disabled:opacity-50`}
                >
                  {publishStatus === "publishing" ? (
                    "Publishing..."
                  ) : showSchedule ? (
                    `Schedule to ${platforms.find((p: any) => p.id === selectedPlatform)?.name || selectedPlatform}`
                  ) : (
                    `Publish to ${platforms.find((p: any) => p.id === selectedPlatform)?.name || selectedPlatform}`
                  )}
                </button>

                {/* Status Message */}
                {publishStatus !== "idle" && publishStatus !== "publishing" && (
                  <div className={`p-3 rounded-lg text-xs ${
                    publishStatus === "success"
                      ? "bg-green-500/10 border border-green-500/20 text-green-400"
                      : "bg-red-500/10 border border-red-500/20 text-red-400"
                  }`}>
                    {publishMessage}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ─── Connections Tab ─── */}
        {activeTab === "connections" && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Connected Accounts</h3>

            {platforms.map((platform: any) => (
              <div key={platform.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{platformIcons[platform.id]}</span>
                    <div>
                      <p className="text-sm font-medium">{platform.name}</p>
                      <p className="text-xs text-gray-500">{platform.description}</p>
                    </div>
                  </div>
                  {platform.connected ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-green-400">✓ {platform.accountName}</span>
                      <button
                        onClick={() => platform.connectionId && disconnectMutation.mutate({ id: platform.connectionId })}
                        className="text-xs text-red-400 hover:text-red-300 px-2 py-1 border border-red-500/30 rounded"
                      >
                        Disconnect
                      </button>
                    </div>
                  ) : platform.status === "active" ? (
                    <button
                      onClick={() => setConnectingPlatform(platform.id)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 px-3 py-1.5 border border-indigo-500/30 rounded-lg hover:bg-indigo-500/10"
                    >
                      Connect
                    </button>
                  ) : (
                    <span className="text-xs text-gray-500 px-3 py-1.5 border border-gray-700 rounded-lg">
                      Coming Soon
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Connect Dialog */}
            {connectingPlatform && (
              <div className="bg-gray-900 border border-indigo-500/30 rounded-xl p-4 space-y-3">
                <h4 className="text-sm font-semibold">Connect {connectingPlatform}</h4>
                <p className="text-xs text-gray-400">
                  {connectingPlatform === "facebook"
                    ? "Enter your Facebook Page access token and Page ID. You can get these from the Facebook Developer Portal."
                    : connectingPlatform === "instagram"
                    ? "Enter your Instagram Business account credentials from the Facebook Graph API."
                    : `Enter your ${connectingPlatform} API credentials.`}
                </p>
                <input
                  type="text"
                  placeholder="Account ID"
                  value={oauthAccountId}
                  onChange={(e) => setOauthAccountId(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Account Name"
                  value={oauthAccountName}
                  onChange={(e) => setOauthAccountName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                {connectingPlatform === "facebook" && (
                  <input
                    type="text"
                    placeholder="Page ID (for Facebook Pages)"
                    value={oauthPageId}
                    onChange={(e) => setOauthPageId(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                )}
                <input
                  type="password"
                  placeholder="Access Token"
                  value={oauthToken}
                  onChange={(e) => setOauthToken(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => connectMutation.mutate({
                      platform: connectingPlatform,
                      accountId: oauthAccountId,
                      accountName: oauthAccountName,
                      accessToken: oauthToken,
                      pageId: oauthPageId || undefined,
                    })}
                    disabled={!oauthAccountId || !oauthToken}
                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-xs font-medium disabled:opacity-50"
                  >
                    Connect Account
                  </button>
                  <button
                    onClick={() => { setConnectingPlatform(null); resetOauthFields(); }}
                    className="px-4 py-2 text-gray-400 hover:text-white text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* OAuth Info */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-gray-300 mb-2">How to Connect</h4>
              <div className="space-y-2 text-xs text-gray-500">
                <p><strong className="text-gray-400">Facebook:</strong> Create a Facebook App at developers.facebook.com, get a Page Access Token with publish_pages permission.</p>
                <p><strong className="text-gray-400">Instagram:</strong> Use the Instagram Graph API through your Facebook Business account. Requires instagram_content_publish permission.</p>
                <p><strong className="text-gray-400">Other Platforms:</strong> Coming soon! We're building integrations for TikTok, X/Twitter, LinkedIn, Pinterest, and YouTube.</p>
              </div>
            </div>
          </div>
        )}

        {/* ─── History Tab ─── */}
        {activeTab === "history" && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Publish History</h3>
            {history.map((item: any) => (
              <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span>{platformIcons[item.platform]}</span>
                    <span className="text-sm font-medium capitalize">{item.platform}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    item.status === "published" ? "bg-green-500/20 text-green-400" :
                    item.status === "scheduled" ? "bg-blue-500/20 text-blue-400" :
                    item.status === "failed" ? "bg-red-500/20 text-red-400" :
                    "bg-gray-500/20 text-gray-400"
                  }`}>
                    {item.status}
                  </span>
                </div>
                {item.caption && (
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.caption}</p>
                )}
                {item.postUrl && (
                  <a href={item.postUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-indigo-400 hover:text-indigo-300 mt-1 block">
                    View Post →
                  </a>
                )}
                {item.error && (
                  <p className="text-[10px] text-red-400 mt-1">{item.error}</p>
                )}
                <p className="text-[10px] text-gray-600 mt-1">
                  {new Date(item.publishedAt || item.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
            {history.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No publish history yet</p>
                <button onClick={() => setActiveTab("publish")} className="mt-2 text-sm text-indigo-400">
                  Publish your first design
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
