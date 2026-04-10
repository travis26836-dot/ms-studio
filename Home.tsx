import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus, Search, LayoutTemplate, FileText, Image as ImageIcon,
  Presentation, Star, Clock, Folder, Sparkles, Palette,
  ArrowRight, Zap, Layers, Wand2, Code2, Bot, Download,
  Trash2, MoreHorizontal, Loader2, Upload, Settings, Activity,
  FolderPlus, Share2, BarChart3, Globe, Eye, Edit3,
  ChevronRight, Grid, List, Filter, SortAsc, SortDesc,
  Facebook, Instagram, Twitter, Linkedin, Youtube, Hash,
  User, LogOut, Bell, HelpCircle, Crown, Shield,
  Paintbrush, Type, Bookmark, Archive, RefreshCw, ExternalLink,
  TrendingUp, Calendar, PieChart, Target, Megaphone
} from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useState, useMemo, useCallback } from "react";
import { CANVAS_PRESETS, PLATFORM_GROUPS } from "@shared/designTypes";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import NewProjectDialog from "@/components/NewProjectDialog";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (!isAuthenticated && !loading) {
    return <LandingPage />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return <CustomerDashboard user={user} setLocation={setLocation} />;
}

// ═══════════════════════════════════════════════════════════════
// CUSTOMER DASHBOARD — Full Portal with Persistent Storage
// ═══════════════════════════════════════════════════════════════

function CustomerDashboard({ user, setLocation }: { user: any; setLocation: (path: string) => void }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [projectView, setProjectView] = useState<"grid" | "list">("grid");
  const [projectFilter, setProjectFilter] = useState<"all" | "starred" | "recent">("all");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState("#6366f1");
  const [settingsTab, setSettingsTab] = useState("profile");

  // ── Data Queries ──
  const { data: myProjects, isLoading: projectsLoading, refetch: refetchProjects } = trpc.projects.list.useQuery();
  const { data: starredProjects } = trpc.projects.starred.useQuery();
  const { data: dbTemplates, isLoading: templatesLoading } = trpc.templates.list.useQuery(undefined);
  const { data: folders, refetch: refetchFolders } = trpc.folders.list.useQuery();
  const { data: uploads, refetch: refetchUploads } = trpc.uploads.list.useQuery();
  const { data: stats } = trpc.auth.stats.useQuery();
  const { data: activityLog } = trpc.auth.activity.useQuery({ limit: 50 });

  // ── Mutations ──
  const deleteMutation = trpc.projects.delete.useMutation();
  const starMutation = trpc.projects.star.useMutation();
  const createFolderMutation = trpc.folders.create.useMutation();
  const deleteFolderMutation = trpc.folders.delete.useMutation();
  const deleteUploadMutation = trpc.uploads.delete.useMutation();
  const updateProfileMutation = trpc.auth.updateProfile.useMutation();

  // ── Profile Edit State ──
  const [editName, setEditName] = useState(user?.name || "");
  const [editBio, setEditBio] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editWebsite, setEditWebsite] = useState("");

  // ── Handlers ──
  const handleDeleteProject = async (id: number) => {
    try {
      await deleteMutation.mutateAsync({ id });
      refetchProjects();
      toast.success("Project deleted");
    } catch { toast.error("Failed to delete project"); }
  };

  const handleStarProject = async (id: number, isStarred: boolean) => {
    try {
      await starMutation.mutateAsync({ id, isStarred: !isStarred });
      refetchProjects();
      toast.success(isStarred ? "Removed from starred" : "Added to starred");
    } catch { toast.error("Failed to update"); }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      await createFolderMutation.mutateAsync({ name: newFolderName, color: newFolderColor });
      refetchFolders();
      setNewFolderName("");
      setShowNewFolder(false);
      toast.success("Folder created");
    } catch { toast.error("Failed to create folder"); }
  };

  const handleDeleteFolder = async (id: number) => {
    try {
      await deleteFolderMutation.mutateAsync({ id });
      refetchFolders();
      toast.success("Folder deleted");
    } catch { toast.error("Failed to delete folder"); }
  };

  const handleDeleteUpload = async (id: number) => {
    try {
      await deleteUploadMutation.mutateAsync({ id });
      refetchUploads();
      toast.success("Upload deleted");
    } catch { toast.error("Failed to delete upload"); }
  };

  const handleUpdateProfile = async () => {
    try {
      await updateProfileMutation.mutateAsync({
        name: editName || undefined,
        bio: editBio || undefined,
        company: editCompany || undefined,
        website: editWebsite || undefined,
      });
      toast.success("Profile updated!");
    } catch { toast.error("Failed to update profile"); }
  };

  // ── Filtered Projects ──
  const displayProjects = useMemo(() => {
    let list = myProjects || [];
    if (projectFilter === "starred") list = starredProjects || [];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p: any) => p.name.toLowerCase().includes(q));
    }
    return list;
  }, [myProjects, starredProjects, projectFilter, searchQuery]);

  const templateColors = ["#6366f1", "#ec4899", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#22c55e", "#f97316", "#64748b"];

  return (
    <div className="min-h-screen bg-background">
      {/* ── Top Header ── */}
      <header className="h-14 border-b border-border bg-card flex items-center px-6 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-base font-bold text-foreground">ManuScript Studio</h1>
        </div>
        <div className="flex-1 max-w-lg mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search projects, templates, uploads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-secondary border-border"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <NewProjectDialog>
            <Button size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" /> New Design
            </Button>
          </NewProjectDialog>
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setLocation("/api-docs")}>
            <Code2 className="w-4 h-4" />
          </Button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-purple-500/30 flex items-center justify-center text-sm font-semibold text-primary cursor-pointer" onClick={() => setActiveTab("settings")}>
            {user?.name?.[0] || "U"}
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-56 border-r border-border bg-card min-h-[calc(100vh-3.5rem)] sticky top-14 shrink-0 hidden md:block">
          <nav className="p-3 space-y-1">
            {[
              { id: "overview", icon: BarChart3, label: "Overview" },
              { id: "projects", icon: Layers, label: "Projects" },
              { id: "templates", icon: LayoutTemplate, label: "Templates" },
              { id: "uploads", icon: Upload, label: "Uploads" },
              { id: "brand-kit", icon: Palette, label: "Brand Kit" },
              { id: "social", icon: Share2, label: "Social Media" },
              { id: "ai-studio", icon: Sparkles, label: "AI Studio" },
              { id: "activity", icon: Activity, label: "Activity" },
              { id: "settings", icon: Settings, label: "Settings" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                  activeTab === item.id
                    ? "bg-primary/15 text-primary font-medium"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>

          {/* Storage Usage */}
          <div className="p-3 mt-4 mx-3 rounded-lg bg-secondary/50 border border-border">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-medium text-muted-foreground">Storage</span>
              <span className="text-[10px] text-muted-foreground">{stats?.totalUploads || 0} files</span>
            </div>
            <div className="h-1.5 bg-background rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min((stats?.storageUsed || 0) / 524288000 * 100, 100)}%` }} />
            </div>
            <p className="text-[9px] text-muted-foreground mt-1">
              {((stats?.storageUsed || 0) / 1048576).toFixed(1)} MB / 500 MB
            </p>
          </div>

          {/* Quick Stats */}
          <div className="p-3 mx-3 mt-3 space-y-2">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">Projects</span>
              <span className="font-medium text-foreground">{stats?.totalProjects || 0}</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">Published</span>
              <span className="font-medium text-foreground">{stats?.totalPublished || 0}</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">AI Generations</span>
              <span className="font-medium text-foreground">{stats?.aiGenerations || 0}</span>
            </div>
          </div>
        </aside>

        {/* Main Panel */}
        <main className="flex-1 p-6 max-w-6xl">
          {/* ═══ OVERVIEW TAB ═══ */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">Welcome back, {user?.name || "Creator"}!</h2>
                <p className="text-sm text-muted-foreground">Here's what's happening in your studio.</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Projects", value: stats?.totalProjects || 0, icon: Layers, color: "#6366f1" },
                  { label: "Published", value: stats?.totalPublished || 0, icon: Globe, color: "#22c55e" },
                  { label: "AI Generations", value: stats?.aiGenerations || 0, icon: Sparkles, color: "#f59e0b" },
                  { label: "Uploads", value: stats?.totalUploads || 0, icon: Upload, color: "#ec4899" },
                ].map((stat) => (
                  <Card key={stat.label} className="bg-card border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}20` }}>
                          <stat.icon className="w-4.5 h-4.5" style={{ color: stat.color }} />
                        </div>
                        <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                      </div>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "New Design", desc: "Start from scratch", icon: Plus, action: () => setLocation("/editor") },
                    { label: "From Template", desc: "Browse templates", icon: LayoutTemplate, action: () => setActiveTab("templates") },
                    { label: "AI Generate", desc: "Create with AI", icon: Sparkles, action: () => setActiveTab("ai-studio") },
                    { label: "Brand Kit", desc: "Manage branding", icon: Palette, action: () => setActiveTab("brand-kit") },
                  ].map((action) => (
                    <button
                      key={action.label}
                      onClick={action.action}
                      className="p-4 rounded-xl bg-secondary hover:bg-secondary/80 border border-border hover:border-primary/50 transition-all text-left group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                        <action.icon className="w-5 h-5 text-primary" />
                      </div>
                      <p className="text-sm font-medium text-foreground">{action.label}</p>
                      <p className="text-xs text-muted-foreground">{action.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Create a Design — Platform Presets */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Create a Design</h3>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {Object.entries(CANVAS_PRESETS).filter(([k]) => k !== "custom").slice(0, 10).map(([key, preset]) => (
                    <button
                      key={key}
                      onClick={() => setLocation(`/editor?w=${preset.width}&h=${preset.height}&preset=${key}`)}
                      className="flex flex-col items-center gap-2 shrink-0 group"
                    >
                      <div className="w-20 h-20 rounded-xl bg-secondary border border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary/5 transition-all">
                        <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors whitespace-nowrap max-w-20 truncate">
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Projects */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground">Recent Projects</h3>
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => setActiveTab("projects")}>
                    View All <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
                {projectsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : (myProjects && myProjects.length > 0) ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {myProjects.slice(0, 8).map((project: any) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onOpen={() => setLocation(`/editor?project=${project.id}&w=${project.canvasWidth}&h=${project.canvasHeight}`)}
                        onDelete={() => handleDeleteProject(project.id)}
                        onStar={() => handleStarProject(project.id, project.isStarred)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border border-dashed border-border rounded-xl">
                    <Folder className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground mb-3">No designs yet</p>
                    <Button onClick={() => setLocation("/editor")} className="gap-1.5">
                      <Plus className="w-4 h-4" /> Create your first design
                    </Button>
                  </div>
                )}
              </div>

              {/* Recent Activity */}
              {activityLog && activityLog.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Recent Activity</h3>
                  <div className="space-y-2">
                    {activityLog.slice(0, 5).map((activity: any) => (
                      <div key={activity.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/50">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Activity className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-foreground truncate">{activity.description}</p>
                          <p className="text-[10px] text-muted-foreground">{new Date(activity.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ PROJECTS TAB ═══ */}
          {activeTab === "projects" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">My Projects</h2>
                <div className="flex items-center gap-2">
                  <div className="flex bg-secondary rounded-lg p-0.5">
                    <button
                      onClick={() => setProjectView("grid")}
                      className={`p-1.5 rounded-md ${projectView === "grid" ? "bg-background shadow-sm" : ""}`}
                    >
                      <Grid className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => setProjectView("list")}
                      className={`p-1.5 rounded-md ${projectView === "list" ? "bg-background shadow-sm" : ""}`}
                    >
                      <List className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                  <div className="flex bg-secondary rounded-lg p-0.5">
                    {(["all", "starred", "recent"] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setProjectFilter(f)}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-medium capitalize ${
                          projectFilter === f ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                  <NewProjectDialog>
                    <Button size="sm" className="gap-1.5">
                      <Plus className="w-3.5 h-3.5" /> New
                    </Button>
                  </NewProjectDialog>
                </div>
              </div>

              {/* Folders */}
              {folders && folders.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-muted-foreground">Folders</p>
                    <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => setShowNewFolder(true)}>
                      <FolderPlus className="w-3 h-3 mr-1" /> New Folder
                    </Button>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {folders.map((folder: any) => (
                      <div key={folder.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary border border-border hover:border-primary/50 transition-all group">
                        <Folder className="w-4 h-4" style={{ color: folder.color || "#6366f1" }} />
                        <span className="text-xs font-medium text-foreground">{folder.name}</span>
                        <button
                          onClick={() => handleDeleteFolder(folder.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {showNewFolder && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary border border-border">
                  <input type="color" value={newFolderColor} onChange={(e) => setNewFolderColor(e.target.value)} className="w-7 h-7 rounded cursor-pointer" />
                  <Input value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} placeholder="Folder name" className="h-8 text-xs bg-background flex-1" />
                  <Button size="sm" className="h-8" onClick={handleCreateFolder}>Create</Button>
                  <Button size="sm" variant="ghost" className="h-8" onClick={() => setShowNewFolder(false)}>Cancel</Button>
                </div>
              )}

              {/* Project Grid/List */}
              {projectsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : displayProjects.length > 0 ? (
                projectView === "grid" ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {displayProjects.map((project: any) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onOpen={() => setLocation(`/editor?project=${project.id}&w=${project.canvasWidth}&h=${project.canvasHeight}`)}
                        onDelete={() => handleDeleteProject(project.id)}
                        onStar={() => handleStarProject(project.id, project.isStarred)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {displayProjects.map((project: any) => (
                      <div key={project.id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary border border-transparent hover:border-border transition-all group">
                        <div className="w-12 h-12 rounded-lg bg-secondary border border-border flex items-center justify-center shrink-0">
                          {project.thumbnailUrl ? (
                            <img src={project.thumbnailUrl} alt="" className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <FileText className="w-5 h-5 text-muted-foreground/30" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{project.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {project.canvasWidth}x{project.canvasHeight} &middot; {new Date(project.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => handleStarProject(project.id, project.isStarred)}>
                            <Star className={`w-3.5 h-3.5 ${project.isStarred ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`} />
                          </Button>
                          <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setLocation(`/editor?project=${project.id}&w=${project.canvasWidth}&h=${project.canvasHeight}`)}>
                            <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => handleDeleteProject(project.id)}>
                            <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="text-center py-16 border border-dashed border-border rounded-xl">
                  <Folder className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground mb-3">
                    {projectFilter === "starred" ? "No starred projects" : "No projects yet"}
                  </p>
                  <Button onClick={() => setLocation("/editor")} className="gap-1.5">
                    <Plus className="w-4 h-4" /> Create a design
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* ═══ TEMPLATES TAB ═══ */}
          {activeTab === "templates" && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-foreground">Template Library</h2>
              <TemplatesBrowser setLocation={setLocation} searchQuery={searchQuery} />
            </div>
          )}

          {/* ═══ UPLOADS TAB ═══ */}
          {activeTab === "uploads" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">My Uploads</h2>
                <p className="text-xs text-muted-foreground">{uploads?.length || 0} files uploaded</p>
              </div>

              {uploads && uploads.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {uploads.map((upload: any) => (
                    <div key={upload.id} className="group relative">
                      <div className="aspect-square rounded-xl overflow-hidden border border-border bg-secondary flex items-center justify-center">
                        <img src={upload.url} alt={upload.name} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      <p className="text-xs text-foreground truncate mt-1.5">{upload.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {upload.width && upload.height ? `${upload.width}x${upload.height}` : ""}
                        {upload.size ? ` · ${(upload.size / 1024).toFixed(0)} KB` : ""}
                      </p>
                      <button
                        onClick={() => handleDeleteUpload(upload.id)}
                        className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-background/80 border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 border border-dashed border-border rounded-xl">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground mb-1">No uploads yet</p>
                  <p className="text-xs text-muted-foreground/60">Upload images in the editor to see them here</p>
                </div>
              )}
            </div>
          )}

          {/* ═══ BRAND KIT TAB ═══ */}
          {activeTab === "brand-kit" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Brand Kit</h2>
                  <p className="text-xs text-muted-foreground">Manage your brand identity — colors, fonts, logos, and voice</p>
                </div>
                <Button size="sm" className="gap-1.5" onClick={() => setLocation("/editor")}>
                  <Paintbrush className="w-3.5 h-3.5" /> Open in Editor
                </Button>
              </div>
              <BrandKitDashboard />
            </div>
          )}

          {/* ═══ SOCIAL MEDIA TAB ═══ */}
          {activeTab === "social" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">Social Media</h2>
                <p className="text-xs text-muted-foreground">Connect accounts and publish directly from the studio</p>
              </div>
              <SocialDashboard />
            </div>
          )}

          {/* ═══ AI STUDIO TAB ═══ */}
          {activeTab === "ai-studio" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">AI Studio</h2>
                <p className="text-xs text-muted-foreground">Generate designs, copy, palettes, and more with AI</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: "Generate Image", desc: "Create images from text descriptions", icon: ImageIcon, action: () => setLocation("/editor") },
                  { label: "AI Background", desc: "Generate custom backgrounds", icon: Paintbrush, action: () => setLocation("/editor") },
                  { label: "Layout Generator", desc: "Auto-generate complete layouts", icon: LayoutTemplate, action: () => setLocation("/editor") },
                  { label: "Copy Writer", desc: "Generate headlines, body text, CTAs", icon: Type, action: () => setLocation("/editor") },
                  { label: "Color Palette", desc: "AI-generated color harmonies", icon: Palette, action: () => setLocation("/editor") },
                  { label: "Font Pairing", desc: "Smart typography suggestions", icon: Type, action: () => setLocation("/editor") },
                  { label: "Design Critique", desc: "Get AI feedback on your designs", icon: Eye, action: () => setLocation("/editor") },
                  { label: "Social Captions", desc: "Platform-optimized captions", icon: Megaphone, action: () => setLocation("/editor") },
                  { label: "Brand Strategy", desc: "AI brand identity development", icon: Target, action: () => setLocation("/editor") },
                ].map((tool) => (
                  <button
                    key={tool.label}
                    onClick={tool.action}
                    className="p-4 rounded-xl bg-secondary hover:bg-secondary/80 border border-border hover:border-primary/50 transition-all text-left group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center mb-3 group-hover:from-primary/20 group-hover:to-purple-500/20 transition-colors">
                      <tool.icon className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-sm font-medium text-foreground">{tool.label}</p>
                    <p className="text-xs text-muted-foreground">{tool.desc}</p>
                  </button>
                ))}
              </div>

              {/* AI Generation History */}
              <AIGenerationHistory />
            </div>
          )}

          {/* ═══ ACTIVITY TAB ═══ */}
          {activeTab === "activity" && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-foreground">Activity Log</h2>
              {activityLog && activityLog.length > 0 ? (
                <div className="space-y-2">
                  {activityLog.map((activity: any) => (
                    <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <ActivityIcon type={activity.type} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{activity.description}</p>
                        {activity.projectName && (
                          <p className="text-[10px] text-primary">{activity.projectName}</p>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground shrink-0">{new Date(activity.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 border border-dashed border-border rounded-xl">
                  <Activity className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">No activity yet</p>
                </div>
              )}
            </div>
          )}

          {/* ═══ SETTINGS TAB ═══ */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-foreground">Account Settings</h2>
              <Tabs value={settingsTab} onValueChange={setSettingsTab}>
                <TabsList className="bg-secondary">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="preferences">Preferences</TabsTrigger>
                  <TabsTrigger value="plan">Plan</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="mt-4 space-y-4">
                  <Card className="bg-card border-border">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-purple-500/30 flex items-center justify-center text-2xl font-bold text-primary">
                          {user?.name?.[0] || "U"}
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-foreground">{user?.name || "User"}</p>
                          <p className="text-sm text-muted-foreground">{user?.email || ""}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Crown className="w-3 h-3 text-yellow-500" />
                            <span className="text-[10px] font-medium text-yellow-500 uppercase">{user?.plan || "Free"} Plan</span>
                          </div>
                        </div>
                      </div>
                      <Separator />
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-muted-foreground font-medium">Display Name</label>
                          <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="mt-1 bg-secondary" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground font-medium">Company</label>
                          <Input value={editCompany} onChange={(e) => setEditCompany(e.target.value)} className="mt-1 bg-secondary" placeholder="Your company" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground font-medium">Website</label>
                        <Input value={editWebsite} onChange={(e) => setEditWebsite(e.target.value)} className="mt-1 bg-secondary" placeholder="https://yoursite.com" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground font-medium">Bio</label>
                        <Textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} className="mt-1 bg-secondary" placeholder="Tell us about yourself..." rows={3} />
                      </div>
                      <Button onClick={handleUpdateProfile} disabled={updateProfileMutation.isPending}>
                        {updateProfileMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Save Changes
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="preferences" className="mt-4">
                  <Card className="bg-card border-border">
                    <CardContent className="p-6 space-y-4">
                      <p className="text-sm text-foreground font-medium">Display Preferences</p>
                      <p className="text-xs text-muted-foreground">Theme, language, and notification settings will be available in a future update.</p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="plan" className="mt-4">
                  <Card className="bg-card border-border">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                          <Crown className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-foreground capitalize">{user?.plan || "Free"} Plan</p>
                          <p className="text-xs text-muted-foreground">Current subscription</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { plan: "Free", price: "$0", features: ["5 projects", "500MB storage", "Basic AI", "Standard export"] },
                          { plan: "Pro", price: "$12/mo", features: ["Unlimited projects", "10GB storage", "Advanced AI", "All exports", "Social publishing", "Brand kits"] },
                          { plan: "Enterprise", price: "Custom", features: ["Everything in Pro", "Custom storage", "API access", "Priority support", "Team features", "White label"] },
                        ].map((tier) => (
                          <Card key={tier.plan} className={`border-border ${user?.plan === tier.plan.toLowerCase() ? "ring-2 ring-primary" : ""}`}>
                            <CardContent className="p-4">
                              <p className="text-sm font-bold text-foreground">{tier.plan}</p>
                              <p className="text-lg font-bold text-primary mt-1">{tier.price}</p>
                              <div className="mt-3 space-y-1.5">
                                {tier.features.map((f) => (
                                  <p key={f} className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <span className="text-green-500">&#10003;</span> {f}
                                  </p>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════

function ProjectCard({ project, onOpen, onDelete, onStar }: {
  project: any;
  onOpen: () => void;
  onDelete: () => void;
  onStar: () => void;
}) {
  return (
    <div className="group relative">
      <button onClick={onOpen} className="w-full text-left">
        <div className="aspect-[4/3] rounded-xl overflow-hidden border border-border group-hover:ring-2 group-hover:ring-primary transition-all mb-2 bg-secondary flex items-center justify-center">
          {project.thumbnailUrl ? (
            <img src={project.thumbnailUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <FileText className="w-8 h-8 text-muted-foreground/30" />
          )}
        </div>
        <p className="text-xs font-medium text-foreground truncate">{project.name}</p>
        <p className="text-[10px] text-muted-foreground">
          {project.canvasWidth}x{project.canvasHeight} &middot; {new Date(project.updatedAt).toLocaleDateString()}
        </p>
      </button>
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onStar} className="w-6 h-6 rounded-lg bg-background/80 border border-border flex items-center justify-center hover:bg-yellow-500/20">
          <Star className={`w-3 h-3 ${project.isStarred ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`} />
        </button>
        <button onClick={onDelete} className="w-6 h-6 rounded-lg bg-background/80 border border-border flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground">
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

function ActivityIcon({ type }: { type: string }) {
  const iconMap: Record<string, React.ElementType> = {
    project_created: Plus,
    project_edited: Edit3,
    project_exported: Download,
    project_published: Globe,
    template_used: LayoutTemplate,
    ai_generated: Sparkles,
    upload: Upload,
    brand_kit_updated: Palette,
    social_connected: Share2,
    social_published: Megaphone,
    folder_created: FolderPlus,
    profile_updated: User,
  };
  const Icon = iconMap[type] || Activity;
  return <Icon className="w-4 h-4 text-primary" />;
}

function TemplatesBrowser({ setLocation, searchQuery }: { setLocation: (path: string) => void; searchQuery: string }) {
  const [activeCategory, setActiveCategory] = useState<string | undefined>(undefined);
  const { data: dbTemplates, isLoading } = trpc.templates.list.useQuery(
    activeCategory ? { category: activeCategory } : undefined
  );

  const categories = [
    { id: "menu", label: "Menus", icon: "🍽" },
    { id: "invitation", label: "Invitations", icon: "💌" },
    { id: "certificate", label: "Certificates", icon: "📜" },
    { id: "social-media", label: "Social Media", icon: "📱" },
    { id: "flyer", label: "Flyers", icon: "📄" },
    { id: "document", label: "Documents", icon: "📝" },
    { id: "presentation", label: "Presentations", icon: "📊" },
    { id: "promotional", label: "Promotional", icon: "🎯" },
    { id: "logo", label: "Logos", icon: "🎨" },
    { id: "business-card", label: "Business Cards", icon: "💼" },
  ];

  const filteredTemplates = useMemo(() => {
    if (!dbTemplates) return [];
    if (!searchQuery) return dbTemplates;
    const q = searchQuery.toLowerCase();
    return dbTemplates.filter((t: any) => t.name.toLowerCase().includes(q));
  }, [dbTemplates, searchQuery]);

  const templateColors = ["#6366f1", "#ec4899", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#22c55e", "#f97316", "#64748b"];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <button
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            !activeCategory ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-accent"
          }`}
          onClick={() => setActiveCategory(undefined)}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeCategory === cat.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-accent"
            }`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredTemplates.map((template: any, i: number) => (
            <button
              key={template.id}
              onClick={() => setLocation(`/editor?template=${template.id}&w=${template.canvasWidth}&h=${template.canvasHeight}`)}
              className="group text-left"
            >
              <div
                className="aspect-[3/4] rounded-xl overflow-hidden border border-border group-hover:ring-2 group-hover:ring-primary transition-all mb-2 relative"
                style={{ background: `linear-gradient(135deg, ${templateColors[i % templateColors.length]}22, ${templateColors[i % templateColors.length]}55)` }}
              >
                <div className="w-full h-full flex flex-col items-center justify-center p-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-2" style={{ background: templateColors[i % templateColors.length] }}>
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xs font-medium text-card-foreground text-center leading-tight">{template.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{template.canvasWidth}x{template.canvasHeight}</p>
                </div>
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="text-xs font-medium text-primary bg-background/80 px-2 py-1 rounded">Use Template</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-border rounded-xl">
          <LayoutTemplate className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No templates in this category</p>
        </div>
      )}
    </div>
  );
}

function BrandKitDashboard() {
  const { data: brandKits, isLoading, refetch } = trpc.brandKits.list.useQuery();
  const createMutation = trpc.brandKits.create.useMutation();
  const deleteMutation = trpc.brandKits.delete.useMutation();
  const setDefaultMutation = trpc.brandKits.setDefault.useMutation();
  const [showCreate, setShowCreate] = useState(false);
  const [newKitName, setNewKitName] = useState("");

  const handleCreate = async () => {
    if (!newKitName.trim()) return;
    try {
      await createMutation.mutateAsync({ name: newKitName });
      refetch();
      setNewKitName("");
      setShowCreate(false);
      toast.success("Brand kit created!");
    } catch { toast.error("Failed to create brand kit"); }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync({ id });
      refetch();
      toast.success("Brand kit deleted");
    } catch { toast.error("Failed to delete"); }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await setDefaultMutation.mutateAsync({ id });
      refetch();
      toast.success("Default brand kit updated");
    } catch { toast.error("Failed to set default"); }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{brandKits?.length || 0} brand kits</p>
        <Button size="sm" className="gap-1.5" onClick={() => setShowCreate(true)}>
          <Plus className="w-3.5 h-3.5" /> New Brand Kit
        </Button>
      </div>

      {showCreate && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary border border-border">
          <Input value={newKitName} onChange={(e) => setNewKitName(e.target.value)} placeholder="Brand kit name" className="h-8 text-xs bg-background flex-1" />
          <Button size="sm" className="h-8" onClick={handleCreate}>Create</Button>
          <Button size="sm" variant="ghost" className="h-8" onClick={() => setShowCreate(false)}>Cancel</Button>
        </div>
      )}

      {brandKits && brandKits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {brandKits.map((kit: any) => (
            <Card key={kit.id} className={`bg-card border-border ${kit.isDefault ? "ring-2 ring-primary" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{kit.name}</p>
                    {kit.isDefault && <span className="text-[10px] text-primary font-medium">Default Kit</span>}
                  </div>
                  <div className="flex gap-1">
                    {!kit.isDefault && (
                      <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={() => handleSetDefault(kit.id)}>
                        Set Default
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => handleDelete(kit.id)}>
                      <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </div>
                {/* Color swatches */}
                {kit.colors && (kit.colors as any[]).length > 0 && (
                  <div className="flex gap-1 mb-2">
                    {(kit.colors as any[]).slice(0, 8).map((c: any, i: number) => (
                      <div key={i} className="w-6 h-6 rounded border border-border" style={{ background: c.hex }} title={c.name} />
                    ))}
                  </div>
                )}
                {/* Font list */}
                {kit.fonts && (kit.fonts as any[]).length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {(kit.fonts as any[]).slice(0, 3).map((f: any, i: number) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 bg-secondary rounded-full text-muted-foreground">{f.name}</span>
                    ))}
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground mt-2">
                  Updated {new Date(kit.updatedAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-border rounded-xl">
          <Palette className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground mb-1">No brand kits yet</p>
          <p className="text-xs text-muted-foreground/60 mb-3">Create a brand kit to maintain consistent branding</p>
          <Button onClick={() => setShowCreate(true)} className="gap-1.5">
            <Plus className="w-4 h-4" /> Create Brand Kit
          </Button>
        </div>
      )}
    </div>
  );
}

function SocialDashboard() {
  const { data: platforms } = trpc.social.platforms.useQuery();
  const { data: history } = trpc.social.history.useQuery(undefined);

  return (
    <div className="space-y-6">
      {/* Connected Platforms */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Platforms</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(platforms || []).map((platform: any) => (
            <Card key={platform.id} className="bg-card border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  platform.connected ? "bg-green-500/10" : platform.status === "active" ? "bg-primary/10" : "bg-secondary"
                }`}>
                  <PlatformIcon platform={platform.id} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{platform.name}</p>
                  <p className="text-[10px] text-muted-foreground">{platform.description}</p>
                  {platform.connected && (
                    <p className="text-[10px] text-green-500 font-medium">Connected: {platform.accountName}</p>
                  )}
                </div>
                <div>
                  {platform.status === "active" ? (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      platform.connected ? "bg-green-500/10 text-green-500" : "bg-primary/10 text-primary"
                    }`}>
                      {platform.connected ? "Connected" : "Available"}
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">Coming Soon</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Publish History */}
      {history && history.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Publish History</h3>
          <div className="space-y-2">
            {history.map((item: any) => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50">
                <PlatformIcon platform={item.platform} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground truncate">{item.caption || "No caption"}</p>
                  <p className="text-[10px] text-muted-foreground">{item.platform} &middot; {new Date(item.createdAt).toLocaleString()}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  item.status === "published" ? "bg-green-500/10 text-green-500" :
                  item.status === "failed" ? "bg-red-500/10 text-red-500" :
                  item.status === "scheduled" ? "bg-blue-500/10 text-blue-500" :
                  "bg-secondary text-muted-foreground"
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PlatformIcon({ platform }: { platform: string }) {
  const icons: Record<string, React.ElementType> = {
    facebook: Facebook,
    instagram: Instagram,
    twitter: Twitter,
    linkedin: Linkedin,
    youtube: Youtube,
    tiktok: Hash,
    pinterest: Bookmark,
  };
  const Icon = icons[platform] || Globe;
  return <Icon className="w-5 h-5 text-primary" />;
}

function AIGenerationHistory() {
  const { data: history } = trpc.ai.history.useQuery();

  if (!history || history.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-3">Recent AI Generations</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {history.slice(0, 12).map((gen: any) => (
          <Card key={gen.id} className="bg-card border-border overflow-hidden">
            <CardContent className="p-0">
              {gen.resultUrl && (
                <div className="aspect-square bg-secondary">
                  <img src={gen.resultUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                </div>
              )}
              <div className="p-2">
                <p className="text-[10px] text-foreground truncate">{gen.prompt}</p>
                <p className="text-[9px] text-muted-foreground capitalize">{gen.generationType} &middot; {gen.status}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// LANDING PAGE — For unauthenticated users
// ═══════════════════════════════════════════════════════════════

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm flex items-center px-6 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-bold text-foreground">ManuScript Studio</h1>
        </div>
        <div className="flex-1" />
        <Button asChild>
          <a href={getLoginUrl()}>Get Started</a>
        </Button>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-6">
              <Sparkles className="w-4 h-4" /> AI-Powered Design Platform
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Design anything.
              <br />
              <span className="text-primary">Publish everywhere.</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              A professional design platform with drag-and-drop editing, AI-powered tools,
              brand kits, social media publishing, and developer integrations. Create stunning visuals in minutes.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Button size="lg" asChild>
                <a href={getLoginUrl()} className="gap-2">
                  Start Designing <ArrowRight className="w-4 h-4" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="gap-2 bg-transparent" asChild>
                <a href="/api-docs">
                  <Code2 className="w-4 h-4" /> View API Docs
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 px-6 bg-card/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">
              Everything you need to create
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Layers, title: "Drag & Drop Editor", desc: "Intuitive canvas with layers, grouping, and precise element control." },
                { icon: Wand2, title: "AI Magic Tools", desc: "Background removal, smart erase, image enhancement, and AI generation." },
                { icon: LayoutTemplate, title: "Template Library", desc: "107+ templates for menus, invitations, certificates, social media, flyers, and more." },
                { icon: ImageIcon, title: "Asset Database", desc: "Royalty-free photos, icons, shapes, and design elements." },
                { icon: Palette, title: "Brand Kit", desc: "Store your colors, fonts, logos, gradients, and brand voice for consistent branding." },
                { icon: Bot, title: "AI Assistant", desc: "Conversational AI that generates layouts, copy, palettes, and design elements." },
                { icon: Share2, title: "Social Publishing", desc: "Publish directly to Facebook, Instagram, and more from the studio." },
                { icon: Download, title: "Multi-Format Export", desc: "Export as PNG, JPG, or PDF in any size or resolution." },
                { icon: Code2, title: "Developer API", desc: "Programmatic control of all editor actions via REST API." },
              ].map((feature, i) => (
                <Card key={i} className="bg-card border-border hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-sm font-semibold text-card-foreground mb-1.5">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">How it works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: "1", title: "Choose a template", desc: "Browse professional templates or start from a blank canvas in any size." },
                { step: "2", title: "Customize your design", desc: "Drag and drop elements, add text, images, and use AI tools to create." },
                { step: "3", title: "Apply your brand", desc: "Use your brand kit for consistent colors, fonts, and logos." },
                { step: "4", title: "Export & publish", desc: "Download or publish directly to social media platforms." },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-lg font-bold text-primary">{item.step}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 bg-card/50">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">Ready to create?</h2>
            <p className="text-muted-foreground mb-8">
              Join ManuScript Studio and start creating professional designs with AI-powered tools.
            </p>
            <Button size="lg" asChild>
              <a href={getLoginUrl()} className="gap-2">
                Get Started Free <ArrowRight className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <p className="text-xs text-muted-foreground">ManuScript Studio</p>
          <p className="text-xs text-muted-foreground">Powered by Manus AI</p>
        </div>
      </footer>
    </div>
  );
}
