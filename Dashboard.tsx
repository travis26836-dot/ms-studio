import React, { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import type { DashboardStats, UserProfile, UserActivity, ProjectFolder } from "@shared/designTypes";

// ═══════════════════════════════════════════════════════════════
// CUSTOMER DASHBOARD — Full Portal with Stats, Activity, Folders
// ═══════════════════════════════════════════════════════════════

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "projects" | "uploads" | "activity" | "settings">("overview");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState("#6366f1");
  const [filterView, setFilterView] = useState<"all" | "starred" | "recent">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Data queries
  const userQuery = trpc.auth.me.useQuery();
  const statsQuery = trpc.auth.stats.useQuery();
  const activityQuery = trpc.auth.activity.useQuery();
  const projectsQuery = trpc.projects.list.useQuery();
  const starredQuery = trpc.projects.starred.useQuery();
  const foldersQuery = trpc.folders.list.useQuery();
  const uploadsQuery = trpc.uploads.list.useQuery();

  // Mutations
  const createFolder = trpc.folders.create.useMutation({
    onSuccess: () => { foldersQuery.refetch(); setShowNewFolder(false); setNewFolderName(""); },
  });
  const deleteFolder = trpc.folders.delete.useMutation({
    onSuccess: () => foldersQuery.refetch(),
  });
  const starProject = trpc.projects.star.useMutation({
    onSuccess: () => { projectsQuery.refetch(); starredQuery.refetch(); },
  });
  const deleteProject = trpc.projects.delete.useMutation({
    onSuccess: () => projectsQuery.refetch(),
  });
  const updateProfile = trpc.auth.updateProfile.useMutation({
    onSuccess: () => userQuery.refetch(),
  });

  const user = userQuery.data;
  const stats = statsQuery.data;
  const projects = projectsQuery.data || [];
  const folders = foldersQuery.data || [];
  const uploads = uploadsQuery.data || [];
  const activity = activityQuery.data || [];

  const filteredProjects = useMemo(() => {
    let list = filterView === "starred" ? (starredQuery.data || []) : projects;
    if (searchQuery) {
      list = list.filter((p: any) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (filterView === "recent") {
      list = [...list].sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 10);
    }
    return list;
  }, [projects, starredQuery.data, filterView, searchQuery]);

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const activityIcon = (type: string) => {
    const icons: Record<string, string> = {
      project_created: "📐", project_edited: "✏️", project_exported: "📤",
      project_published: "🚀", template_used: "📋", ai_generated: "🤖",
      upload: "📁", brand_kit_updated: "🎨", social_connected: "🔗",
      social_published: "📱", folder_created: "📂", profile_updated: "👤",
    };
    return icons[type] || "📌";
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-lg">
              M
            </div>
            <div>
              <h1 className="text-xl font-bold">ManuScript Studio</h1>
              <p className="text-xs text-gray-400">Creative Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <svg className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <a href="/editor" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors">
              + New Design
            </a>
            {user && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold">
                  {(user.name || "U")[0].toUpperCase()}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Tab Navigation */}
        <div className="flex gap-1 mb-8 bg-gray-900 rounded-xl p-1 w-fit">
          {(["overview", "projects", "uploads", "activity", "settings"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* ─── Overview Tab ─── */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Total Projects" value={stats?.totalProjects || 0} icon="📐" color="indigo" />
              <StatCard title="Total Uploads" value={stats?.totalUploads || 0} icon="📁" color="purple" />
              <StatCard title="Published" value={stats?.totalPublished || 0} icon="🚀" color="green" />
              <StatCard title="AI Generations" value={stats?.aiGenerations || 0} icon="🤖" color="orange" />
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <QuickAction href="/editor" icon="✨" label="New Design" description="Start from scratch" />
                <QuickAction href="/editor?template=true" icon="📋" label="From Template" description="Use a template" />
                <QuickAction href="/editor?ai=true" icon="🤖" label="AI Generate" description="AI-powered design" />
                <QuickAction href="/brand-kit" icon="🎨" label="Brand Kit" description="Manage your brand" />
              </div>
            </div>

            {/* Recent Projects */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Recent Projects</h2>
                <button onClick={() => setActiveTab("projects")} className="text-sm text-indigo-400 hover:text-indigo-300">
                  View All →
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {projects.slice(0, 8).map((project: any) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onStar={() => starProject.mutate({ id: project.id, isStarred: !project.isStarred })}
                    onDelete={() => deleteProject.mutate({ id: project.id })}
                  />
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
              <div className="bg-gray-900 rounded-xl border border-gray-800 divide-y divide-gray-800">
                {activity.slice(0, 8).map((item: any) => (
                  <div key={item.id} className="px-4 py-3 flex items-center gap-3">
                    <span className="text-lg">{activityIcon(item.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-300 truncate">{item.description}</p>
                      <p className="text-xs text-gray-500">{formatDate(item.createdAt)}</p>
                    </div>
                  </div>
                ))}
                {activity.length === 0 && (
                  <div className="px-4 py-8 text-center text-gray-500 text-sm">
                    No activity yet. Start creating!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── Projects Tab ─── */}
        {activeTab === "projects" && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {(["all", "starred", "recent"] as const).map((view) => (
                  <button
                    key={view}
                    onClick={() => setFilterView(view)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filterView === view
                        ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                        : "text-gray-400 hover:text-white bg-gray-800/50 border border-gray-700"
                    }`}
                  >
                    {view === "all" ? "All Projects" : view === "starred" ? "⭐ Starred" : "🕐 Recent"}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowNewFolder(true)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm border border-gray-700"
              >
                + New Folder
              </button>
            </div>

            {/* Folders */}
            {folders.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-3">Folders</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {folders.map((folder: any) => (
                    <div
                      key={folder.id}
                      className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-600 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: folder.color + "20" }}>
                          <span style={{ color: folder.color }}>📂</span>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteFolder.mutate({ id: folder.id }); }}
                          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all"
                        >
                          ×
                        </button>
                      </div>
                      <p className="text-sm font-medium truncate">{folder.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Folder Dialog */}
            {showNewFolder && (
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 flex items-center gap-3">
                <input
                  type="color"
                  value={newFolderColor}
                  onChange={(e) => setNewFolderColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer"
                />
                <input
                  type="text"
                  placeholder="Folder name..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
                <button
                  onClick={() => createFolder.mutate({ name: newFolderName, color: newFolderColor })}
                  disabled={!newFolderName.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  Create
                </button>
                <button onClick={() => setShowNewFolder(false)} className="px-3 py-2 text-gray-400 hover:text-white text-sm">
                  Cancel
                </button>
              </div>
            )}

            {/* Projects Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProjects.map((project: any) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onStar={() => starProject.mutate({ id: project.id, isStarred: !project.isStarred })}
                  onDelete={() => deleteProject.mutate({ id: project.id })}
                />
              ))}
            </div>

            {filteredProjects.length === 0 && (
              <div className="text-center py-16">
                <p className="text-4xl mb-4">📐</p>
                <p className="text-gray-400 text-lg">No projects yet</p>
                <p className="text-gray-500 text-sm mt-1">Create your first design to get started</p>
                <a href="/editor" className="inline-block mt-4 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm font-medium transition-colors">
                  Create New Design
                </a>
              </div>
            )}
          </div>
        )}

        {/* ─── Uploads Tab ─── */}
        {activeTab === "uploads" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Your Uploads</h2>
              <p className="text-sm text-gray-400">
                {uploads.length} files • {formatBytes(uploads.reduce((acc: number, u: any) => acc + (u.size || 0), 0))} used
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {uploads.map((upload: any) => (
                <div key={upload.id} className="group relative bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-600 transition-colors">
                  <div className="aspect-square bg-gray-800 flex items-center justify-center">
                    {upload.mimeType?.startsWith("image/") ? (
                      <img src={upload.url} alt={upload.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl">📄</span>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-gray-300 truncate">{upload.name}</p>
                    <p className="text-xs text-gray-500">{formatBytes(upload.size || 0)}</p>
                  </div>
                </div>
              ))}
            </div>
            {uploads.length === 0 && (
              <div className="text-center py-16">
                <p className="text-4xl mb-4">📁</p>
                <p className="text-gray-400">No uploads yet</p>
                <p className="text-gray-500 text-sm mt-1">Upload images and assets from the editor</p>
              </div>
            )}
          </div>
        )}

        {/* ─── Activity Tab ─── */}
        {activeTab === "activity" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Activity History</h2>
            <div className="bg-gray-900 rounded-xl border border-gray-800 divide-y divide-gray-800">
              {activity.map((item: any) => (
                <div key={item.id} className="px-5 py-4 flex items-center gap-4">
                  <span className="text-xl">{activityIcon(item.type)}</span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-200">{item.description}</p>
                    {item.projectName && (
                      <p className="text-xs text-indigo-400 mt-0.5">{item.projectName}</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 whitespace-nowrap">{formatDate(item.createdAt)}</p>
                </div>
              ))}
              {activity.length === 0 && (
                <div className="px-5 py-12 text-center text-gray-500">No activity recorded yet</div>
              )}
            </div>
          </div>
        )}

        {/* ─── Settings Tab ─── */}
        {activeTab === "settings" && (
          <ProfileSettings user={user} onSave={(data: any) => updateProfile.mutate(data)} />
        )}
      </div>
    </div>
  );
}

// ─── Sub-Components ──────────────────────────────────────────

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: string; color: string }) {
  const colorClasses: Record<string, string> = {
    indigo: "from-indigo-500/10 to-indigo-600/5 border-indigo-500/20",
    purple: "from-purple-500/10 to-purple-600/5 border-purple-500/20",
    green: "from-green-500/10 to-green-600/5 border-green-500/20",
    orange: "from-orange-500/10 to-orange-600/5 border-orange-500/20",
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-5`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm text-gray-400 mt-1">{title}</p>
    </div>
  );
}

function QuickAction({ href, icon, label, description }: { href: string; icon: string; label: string; description: string }) {
  return (
    <a
      href={href}
      className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-indigo-500/50 hover:bg-gray-900/80 transition-all group"
    >
      <span className="text-2xl block mb-2">{icon}</span>
      <p className="text-sm font-medium group-hover:text-indigo-400 transition-colors">{label}</p>
      <p className="text-xs text-gray-500 mt-0.5">{description}</p>
    </a>
  );
}

function ProjectCard({ project, onStar, onDelete }: { project: any; onStar: () => void; onDelete: () => void }) {
  return (
    <div className="group bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-600 transition-all">
      <a href={`/editor/${project.id}`} className="block">
        <div className="aspect-video bg-gray-800 relative">
          {project.thumbnailUrl ? (
            <img src={project.thumbnailUrl} alt={project.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <span className="text-3xl opacity-30">📐</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-medium bg-indigo-600 px-3 py-1.5 rounded-lg transition-opacity">
              Open
            </span>
          </div>
        </div>
      </a>
      <div className="p-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium truncate flex-1">{project.name}</p>
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={(e) => { e.preventDefault(); onStar(); }}
              className={`p-1 rounded transition-colors ${project.isStarred ? "text-yellow-400" : "text-gray-600 hover:text-yellow-400"}`}
            >
              ★
            </button>
            <button
              onClick={(e) => { e.preventDefault(); onDelete(); }}
              className="p-1 rounded text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
            >
              🗑
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {project.canvasWidth}×{project.canvasHeight} • {new Date(project.updatedAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

function ProfileSettings({ user, onSave }: { user: any; onSave: (data: any) => void }) {
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [company, setCompany] = useState(user?.company || "");
  const [website, setWebsite] = useState(user?.website || "");

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-lg font-semibold">Profile Settings</h2>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Display Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            placeholder="Tell us about yourself..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Company</label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Website</label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="https://"
          />
        </div>
        <button
          onClick={() => onSave({ name, bio, company, website })}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors"
        >
          Save Changes
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-sm font-semibold mb-3">Account Details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Email</span>
            <span>{user?.email || "Not set"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Plan</span>
            <span className="capitalize">{user?.plan || "free"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Member Since</span>
            <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
