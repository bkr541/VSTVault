/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  FolderPlus, 
  Search, 
  Activity, 
  Database, 
  Heart, 
  EyeOff, 
  Eye, 
  Download, 
  Upload, 
  Tag, 
  Filter, 
  Grid, 
  List, 
  Sparkles, 
  Clock, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  FolderOpen, 
  Music, 
  Settings, 
  Check, 
  Briefcase, 
  FileText,
  Info
} from "lucide-react";

import { ConsolidatedPlugin, PluginCategory, PluginFormatType, ScanFolderEntry } from "./types";

// UI Components
import { Button } from "./renderer/components/ui/Button";
import { Input } from "./renderer/components/ui/Input";
import { Textarea } from "./renderer/components/ui/Textarea";
import { Select } from "./renderer/components/ui/Select";
import { Dropdown } from "./renderer/components/ui/Dropdown";
import { Toggle } from "./renderer/components/ui/Toggle";
import { Checkbox } from "./renderer/components/ui/Checkbox";
import { Card } from "./renderer/components/ui/Card";
import { Badge } from "./renderer/components/ui/Badge";
import { Modal } from "./renderer/components/ui/Modal";
import { Tabs } from "./renderer/components/ui/Tabs";
import { Table } from "./renderer/components/ui/Table";
import { SearchInput } from "./renderer/components/ui/SearchInput";
import { EmptyState } from "./renderer/components/ui/EmptyState";
import { Tooltip } from "./renderer/components/ui/Tooltip";
import { IconButton } from "./renderer/components/ui/IconButton";
import { SectionHeader } from "./renderer/components/ui/SectionHeader";
import { SidebarItem } from "./renderer/components/ui/SidebarItem";
import { StatCard } from "./renderer/components/ui/StatCard";
import { DetailRow } from "./renderer/components/ui/DetailRow";

export default function App() {
  // Core Server Data
  const [plugins, setPlugins] = useState<ConsolidatedPlugin[]>([]);
  const [scanFolders, setScanFolders] = useState<ScanFolderEntry[]>([]);
  const [counts, setCounts] = useState<{
    total: number;
    favorites: number;
    hidden: number;
    categories: Record<string, number>;
    tags: { id: string; name: string; count: number }[];
  }>({
    total: 0,
    favorites: 0,
    hidden: 0,
    categories: {},
    tags: []
  });

  // UX Filters / Navigation state
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [filterHidden, setFilterHidden] = useState(false);
  const [sortBy, setSortBy] = useState("name-asc");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  
  // Selected inspect plugin
  const [selectedPluginId, setSelectedPluginId] = useState<string | null>(null);
  const [inspectEditCategory, setInspectEditCategory] = useState<PluginCategory>(PluginCategory.Unknown);
  const [inspectEditTagsStr, setInspectEditTagsStr] = useState("");
  const [inspectEditNotes, setInspectEditNotes] = useState("");
  const [inspectEditName, setInspectEditName] = useState("");
  const [inspectEditVendor, setInspectEditVendor] = useState("");
  const [hasEditChanges, setHasEditChanges] = useState(false);

  // Modals & Scanners State
  const [isScanning, setIsScanning] = useState(false);
  const [scanMode, setScanMode] = useState<"quick" | "full" | "custom">("quick");
  const [selectedScanFolderPaths, setSelectedScanFolderPaths] = useState<string[]>([]);
  const [scanReport, setScanReport] = useState<any>(null);
  const [showScanReportModal, setShowScanReportModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [newCustomFolderPath, setNewCustomFolderPath] = useState("");
  const [sqlBackupText, setSqlBackupText] = useState("");
  const [lastScan, setLastScan] = useState<{
    scan_date: string;
    scan_mode: string;
    plugins_discovered: number;
    plugins_added: number;
  } | null>(null);
  
  // Interactive UI indicators
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error" | "info">("success");

  // Load Database Data On ComponentMount
  useEffect(() => {
    fetchPlugins();
    fetchScanFolders();
    fetchScanHistory();
  }, [search, selectedCategory, selectedTag, filterFavorites, filterHidden, sortBy]);

  const fetchScanHistory = async () => {
    try {
      const res = await fetch("/api/scan-history");
      const data = await res.json();
      if (data.success && data.history.length > 0) {
        const latest = data.history[data.history.length - 1];
        setLastScan(latest);
      }
    } catch (err) {
      console.error("Error fetching scan history:", err);
    }
  };

  const showToast = (msg: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchPlugins = async () => {
    try {
      let url = `/api/plugins?sortBy=${sortBy}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (selectedCategory && selectedCategory !== "All") url += `&category=${encodeURIComponent(selectedCategory)}`;
      if (selectedTag) url += `&tag=${encodeURIComponent(selectedTag)}`;
      if (filterFavorites) url += `&favorite=true`;
      if (filterHidden) url += `&hidden=true`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setPlugins(data.plugins);
        setCounts(data.counts);
        
        // Auto-select first plugin if none selected
        if (data.plugins.length > 0 && !selectedPluginId) {
          selectPlugin(data.plugins[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching plugins:", err);
      showToast("Could not communicate with the database backend.", "error");
    }
  };

  const fetchScanFolders = async () => {
    try {
      const res = await fetch("/api/scan-folders");
      const data = await res.json();
      if (data.success) {
        setScanFolders(data.folders);
        // Default select all folders for custom scan config
        setSelectedScanFolderPaths(data.folders.map((f: any) => f.path));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectPlugin = (p: ConsolidatedPlugin) => {
    setSelectedPluginId(p.id);
    setInspectEditName(p.name);
    setInspectEditVendor(p.vendor);
    setInspectEditCategory(p.category);
    setInspectEditTagsStr(p.tags.join(", "));
    setInspectEditNotes(p.notes || "");
    setHasEditChanges(false);
  };

  // Quick UI save triggers
  const handleToggleFavorite = async (pId: string) => {
    try {
      const res = await fetch(`/api/plugins/${pId}/favorite`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        showToast(data.is_favorite ? "Added to favorites ❤️" : "Removed from favorites");
        fetchPlugins();
        
        // Update inspection state immediately if inspecting this plugin
        if (selectedPluginId === pId) {
          setPlugins(prev => prev.map(p => p.id === pId ? { ...p, is_favorite: data.is_favorite } : p));
        }
      }
    } catch (err) {
      showToast("Failed to toggle favorite status.", "error");
    }
  };

  const handleToggleHide = async (pId: string) => {
    try {
      const res = await fetch(`/api/plugins/${pId}/hide`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        showToast(data.is_hidden ? "Plugin archived/hidden 👁️" : "Plugin restored to view");
        fetchPlugins();
        if (selectedPluginId === pId) {
          setSelectedPluginId(null);
        }
      }
    } catch (err) {
      showToast("Error updating visibility.", "error");
    }
  };

  // Inspect save handler
  const handleSaveInspectEdits = async () => {
    if (!selectedPluginId) return;
    try {
      const tagsArray = inspectEditTagsStr
        .split(",")
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const res = await fetch(`/api/plugins/${selectedPluginId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: inspectEditName,
          vendor: inspectEditVendor,
          category: inspectEditCategory,
          notes: inspectEditNotes,
          tags: tagsArray
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast("Plugin saved successfully!", "success");
        setHasEditChanges(false);
        fetchPlugins();
      } else {
        showToast("Error validation: " + data.error, "error");
      }
    } catch (err: any) {
      showToast("Failed to write coordinates: " + err.message, "error");
    }
  };

  // Scanner triggers
  const handleTriggerScan = async (mode: "quick" | "full" | "custom") => {
    setIsScanning(true);
    showToast(`Scanning plugin directories [${mode}]...`, "info");
    
    try {
      const folders = mode === "custom" ? selectedScanFolderPaths : null;
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, selectedFolders: folders })
      });
      const data = await res.json();

      if (data.success) {
        setScanReport(data.report);
        setIsScanning(false);
        setShowScanReportModal(true);
        fetchPlugins();
        fetchScanHistory();
      } else {
        setIsScanning(false);
        showToast(data.error || "Scanner failure. Review file descriptors.", "error");
      }
    } catch (err) {
      setIsScanning(false);
      showToast("Scanner failed to communicate with binary controller.", "error");
    }
  };

  // Custom folder managers
  const handleAddCustomFolder = async () => {
    if (!newCustomFolderPath.trim()) return;
    try {
      const res = await fetch("/api/scan-folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: newCustomFolderPath })
      });
      const data = await res.json();
      if (data.success) {
        showToast("Custom directory successfully configured!");
        setNewCustomFolderPath("");
        fetchScanFolders();
      } else {
        showToast(data.error, "error");
      }
    } catch (err) {
      showToast("Error adding path target.", "error");
    }
  };

  const handleRemoveFolder = async (id: string) => {
    try {
      const res = await fetch(`/api/scan-folders/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast("Scan path removed.");
        fetchScanFolders();
      }
    } catch (err) {
      showToast("Failed to remove directory entry.", "error");
    }
  };

  // SQLite relational SQL restore importer handler
  const handleRestoreBackup = async () => {
    if (!sqlBackupText.trim()) {
      showToast("Please paste valid SQL backup commands first.", "error");
      return;
    }
    try {
      const res = await fetch("/api/backup/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql: sqlBackupText })
      });
      const data = await res.json();
      
      if (data.success) {
        showToast("SQLite system database restored successfully!");
        setSqlBackupText("");
        setShowBackupModal(false);
        fetchPlugins();
      } else {
        showToast(data.error || "Pasted statements failed SQLite execution.", "error");
      }
    } catch (err) {
      showToast("Critical connection breakdown during database import.", "error");
    }
  };

  // Dev actions
  const handleReseedDemo = async () => {
    if (!confirm("Are you sure? This will wipe your active library and re-discover demo plugins on the sandbox disk.")) return;
    try {
      const res = await fetch("/api/reset-db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seed: true })
      });
      const data = await res.json();
      if (data.success) {
        showToast("Library successfully reset and reseeded with 14 demo plugins!");
        setSelectedPluginId(null);
        fetchPlugins();
      }
    } catch (e) {
      showToast("Error executing system reset.", "error");
    }
  };

  // Helper selectors
  const activePlugin = plugins.find(p => p.id === selectedPluginId);

  // Sorting list logic
  const sortedPlugins = [...plugins];

  // Render variables
  const categoryOptions = Object.values(PluginCategory).map(cat => ({
    value: cat,
    label: cat
  }));

  return (
    <div className="flex h-screen bg-[#F7F8FA] font-sans antialiased overflow-hidden">
      
      {/* Visual Toast Notification Banner */}
      {toastMessage && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-lg shadow-lg border text-sm font-semibold tracking-wide flex items-center space-x-3.5 animate-in fade-in slide-in-from-top-6 duration-200 ${
          toastType === "error" 
            ? "bg-red-50 text-red-700 border-red-200" 
            : toastType === "info"
            ? "bg-teal-50 text-[#0F5B59] border-teal-200"
            : "bg-teal-50 text-[#0F5B59] border-teal-100"
        }`}>
          <div className={`p-1 rounded-full ${toastType === "error" ? "bg-red-100" : "bg-teal-100"}`}>
            <Check size={14} />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* LEFT SIDEBAR - SCANNING, NAVIGATION & FILTERS */}
      <aside className="w-64 bg-white border-r border-[#E5E7EB] flex flex-col z-30 select-none">
        
        {/* Brand App Branding Bar */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0F5B59] flex items-center justify-center text-white">
              <Music size={18} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-800 tracking-tight leading-none">VST Vault</h1>
              <span className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase">Local Indexer</span>
            </div>
          </div>
          <IconButton size="sm" onClick={() => setShowSettingsModal(true)}>
            <Settings size={15} />
          </IconButton>
        </div>

        {/* Scan Commands Box */}
        <div className="p-4 border-b border-gray-100 bg-[#F7F8FA]/60">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1 block mb-2.5">Auto discovery</span>
          
          <div className="space-y-2">
            <Button 
              className="w-full justify-start space-x-2 relative cursor-pointer" 
              size="sm"
              disabled={isScanning}
              onClick={() => handleTriggerScan("quick")}
            >
              {isScanning ? (
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white/50 border-t-white" />
              ) : (
                <Activity size={14} />
              )}
              <span>{isScanning ? "Scanning Disk..." : "Run Quick Scan"}</span>
            </Button>
            
            <div className="grid grid-cols-2 gap-1.5">
              <Button 
                variant="outline" 
                size="sm"
                disabled={isScanning}
                onClick={() => handleTriggerScan("full")}
                className="text-[11px] px-2"
              >
                Full Rescan
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                disabled={isScanning}
                onClick={() => {
                  setScanMode("custom");
                  setShowSettingsModal(true);
                }}
                className="text-[11px] px-2"
              >
                Custom paths
              </Button>
            </div>
          </div>
        </div>

        {/* Scrollable Filters Block */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          
          {/* Main Navigation States */}
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2 block mb-1.5">Library core</span>
            
            <SidebarItem 
              label="All Plugins" 
              icon={<Briefcase size={14} />} 
              active={!filterFavorites && !filterHidden && selectedCategory === "All" && !selectedTag} 
              count={counts.total}
              onClick={() => {
                setFilterFavorites(false);
                setFilterHidden(false);
                setSelectedCategory("All");
                setSelectedTag(null);
              }}
            />

            <SidebarItem 
              label="Favorites" 
              icon={<Heart size={14} />} 
              active={filterFavorites && !filterHidden} 
              count={counts.favorites}
              onClick={() => {
                setFilterFavorites(true);
                setFilterHidden(false);
                setSelectedCategory("All");
                setSelectedTag(null);
              }}
            />

            <SidebarItem 
              label="Archived & Hidden" 
              icon={<EyeOff size={14} />} 
              active={filterHidden} 
              count={counts.hidden}
              onClick={() => {
                setFilterHidden(true);
                setFilterFavorites(false);
                setSelectedCategory("All");
                setSelectedTag(null);
              }}
            />
          </div>

          {/* Categories Groups */}
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2 block mb-1.5">Categories</span>
            
            {categoryOptions.map((opt) => {
              const active = selectedCategory === opt.value && !filterFavorites && !filterHidden && !selectedTag;
              const quantity = counts.categories[opt.value] || 0;
              return (
                <SidebarItem 
                  key={opt.value}
                  label={opt.label}
                  icon={<Music size={13} />}
                  active={active}
                  count={quantity}
                  onClick={() => {
                    setSelectedCategory(opt.value);
                    setFilterFavorites(false);
                    setFilterHidden(false);
                    setSelectedTag(null);
                  }}
                />
              );
            })}
          </div>

          {/* Tags List */}
          {counts.tags.length > 0 && (
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2 block mb-1.5">User tags</span>
              {counts.tags.map(t => {
                const active = selectedTag === t.name && !filterFavorites && !filterHidden;
                return (
                  <SidebarItem 
                    key={t.id}
                    label={t.name}
                    icon={<Tag size={13} />}
                    active={active}
                    count={t.count}
                    onClick={() => {
                      setSelectedTag(t.name);
                      setSelectedCategory("All");
                      setFilterFavorites(false);
                      setFilterHidden(false);
                    }}
                  />
                );
              })}
            </div>
          )}

        </div>

        {/* Dynamic Last Scan Card */}
        <div className="border-t border-[#E5E7EB] p-4 select-none">
          <div className="rounded-xl bg-[#F3F4F6] p-4 text-left">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Last Scan</div>
            <div className="mt-1 text-xs font-semibold text-gray-700">
              {lastScan ? new Date(lastScan.scan_date).toLocaleString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : "10:42 AM"}
            </div>
            <div className="mt-3 h-1.5 w-full rounded-full bg-[#E5E7EB]">
              <div className="h-1.5 w-full rounded-full bg-[#0F5B59] transition-all duration-350"></div>
            </div>
            <div className="mt-2 text-[10px] text-[#6B7280]">
              {counts.total.toLocaleString()} Plugins indexed
            </div>
          </div>
        </div>

        {/* Footprint/Source Indicators */}
        <div className="p-4 border-t border-gray-100 bg-[#F7F8FA]/30 flex items-center justify-between text-[11px] text-gray-400">
          <span className="font-semibold text-[10px] tracking-wide uppercase">System database</span>
          <Button variant="ghost" size="sm" onClick={() => setShowBackupModal(true)} className="text-[10px] py-1 px-1.5 h-auto text-teal-600 hover:text-teal-800 font-bold">
            <Database size={11} className="mr-1 inline" /> SQLite Vault
          </Button>
        </div>

      </aside>

      {/* CORE DISPLAY WINDOW */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA]">
        
        {/* TOP METADATA BAR PANEL */}
        <header className="h-16 bg-white border-b border-[#E5E7EB] px-6 flex items-center justify-between flex-shrink-0 z-20">
          
          {/* Searching and Query controls */}
          <div className="flex items-center space-x-3 w-96">
            <SearchInput 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch("")}
              placeholder="Search plugin names, manufacturers, notes..."
            />
          </div>

          {/* Advanced layout view sort options & backup restore */}
          <div className="flex items-center space-x-4">
            
            {/* Database Export dropdown menu */}
            <div className="flex items-center bg-gray-55 text-xs text-gray-500 font-semibold border border-gray-200 rounded divide-x divide-gray-200 shadow-xs">
              <a 
                href="/api/export/csv" 
                target="_blank"
                className="px-3 py-1.5 hover:bg-gray-50 text-gray-600 flex items-center space-x-1 hover:text-[#0F5B59] transition-all"
                title="Export plugin list as standard comma separated CSV spreadsheet"
              >
                <FileText size={12} />
                <span>Spreadsheet (CSV)</span>
              </a>
              <a 
                href="/api/export/markdown" 
                target="_blank"
                className="px-3 py-1.5 hover:bg-gray-50 text-gray-600 flex items-center space-x-1 hover:text-[#0F5B59] transition-all"
                title="Export beautiful markdown checklist for README or notes"
              >
                <Sparkles size={12} />
                <span>Markdown Inventory</span>
              </a>
              <a 
                href="/api/export/json" 
                target="_blank"
                className="px-3 py-1.5 hover:bg-gray-50 text-gray-600 flex items-center space-x-1 hover:text-[#0F5B59] transition-all"
                title="Download consolidated JSON array database records"
              >
                <Download size={12} />
                <span>JSON API</span>
              </a>
            </div>

            {/* View selectors */}
            <div className="flex items-center border border-gray-200 rounded overflow-hidden shadow-xs bg-white">
              <button 
                onClick={() => setViewMode("list")} 
                className={`p-1.5 transition-colors cursor-pointer ${viewMode === "list" ? "bg-teal-50 text-[#0F5B59]" : "bg-white text-gray-400 hover:text-gray-600"}`}
              >
                <List size={15} />
              </button>
              <button 
                onClick={() => setViewMode("grid")}
                className={`p-1.5 transition-colors cursor-pointer ${viewMode === "grid" ? "bg-teal-50 text-[#0F5B59]" : "bg-white text-gray-400 hover:text-gray-600"}`}
              >
                <Grid size={15} />
              </button>
            </div>

            {/* Seed Actions */}
            <Tooltip content="Reset your catalog back to demo seeding">
              <IconButton size="sm" variant="secondary" onClick={handleReseedDemo}>
                <Clock size={15} />
              </IconButton>
            </Tooltip>
          </div>

        </header>

        {/* WORKSPACE DATA GRID SCENE */}
        <div className="flex-1 overflow-y-auto p-6 transition-all">
          
          {/* Dashboard Title & active query counters */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                  {filterFavorites ? "Favorite Plugins Library" : filterHidden ? "Archived Catalog" : `${selectedCategory} Plugins`}
                </h2>
                {selectedTag && (
                  <Badge variant="primary" className="ml-2 font-mono">tag: {selectedTag}</Badge>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1 font-medium select-none">
                Showing {plugins.length} deduplicated items of audio software across standard directories.
              </p>
            </div>

            {/* Sorting control panel */}
            <div className="flex items-center mt-3 md:mt-0 space-x-3 text-xs">
              <span className="text-gray-400 font-semibold uppercase tracking-wider">Sort by</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-gray-200 px-3 py-1.5 rounded font-medium text-gray-700 outline-none focus:ring-1 focus:ring-[#0F5B59] focus:border-[#0F5B59] transition-all cursor-pointer shadow-xs"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="vendor">Manufacturer/Vendor</option>
                <option value="date">Date Added</option>
              </select>
            </div>
          </div>

          {/* Core Table / Grid representations */}
          {plugins.length === 0 ? (
            <div className="py-20 select-none">
              <EmptyState 
                title="No Plugins Found"
                description={
                  search || selectedTag || selectedCategory !== "All"
                    ? "Adjust your filters or query params to locate missing utilities."
                    : "No plugins scanned on this machine yet. Run a Quick Scan to start cataloging folders!"
                }
                action={
                  !(search || selectedTag || selectedCategory !== "All") ? (
                    <Button onClick={() => handleTriggerScan("quick")} className="space-x-1.5">
                      <Plus size={14} />
                      <span>Start Directory Scan</span>
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={() => {
                      setSearch("");
                      setSelectedCategory("All");
                      setSelectedTag(null);
                      setFilterFavorites(false);
                      setFilterHidden(false);
                    }}>
                      Reset Filters
                    </Button>
                  )
                }
              />
            </div>
          ) : viewMode === "list" ? (
            <div className="bg-white rounded-lg border border-gray-200/60 shadow-sm overflow-hidden">
              <Table 
                columns={[
                  {
                    header: "",
                    accessor: (p: ConsolidatedPlugin) => (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(p.id);
                        }}
                        className={`transition-colors p-1 rounded hover:bg-gray-50 cursor-pointer ${p.is_favorite ? "text-red-500" : "text-gray-300 hover:text-gray-400"}`}
                      >
                        <Heart size={14} fill={p.is_favorite ? "#EF4444" : "none"} />
                      </button>
                    ),
                    className: "w-10 text-center"
                  },
                  {
                    header: "Plugin Name/Bundle",
                    accessor: (p: ConsolidatedPlugin) => (
                      <div className="font-semibold text-gray-900 group flex items-center space-x-2">
                        <span>{p.name}</span>
                        {p.is_favorite && <span className="text-[10px] bg-red-50 px-1 py-0.5 rounded text-red-500 font-bold uppercase tracking-wider shrink-0 select-none">Pref</span>}
                      </div>
                    )
                  },
                  {
                    header: "Developer/Vendor",
                    accessor: (p: ConsolidatedPlugin) => (
                      <span className="text-gray-500 font-medium">{p.vendor}</span>
                    )
                  },
                  {
                    header: "Category",
                    accessor: (p: ConsolidatedPlugin) => (
                      <Badge variant="neutral">{p.category}</Badge>
                    )
                  },
                  {
                    header: "Detected Formats",
                    accessor: (p: ConsolidatedPlugin) => (
                      <div className="flex flex-wrap gap-1">
                        {p.formats.map((fmt, idx) => {
                          const badgColor = 
                            fmt.format === "VST3" ? "primary" : 
                            fmt.format === "AU" ? "neutral" : 
                            fmt.format === "VST2" ? "secondary" : "warning";
                          return (
                            <Badge key={idx} variant={badgColor} className="font-mono text-[9px] px-1.5 py-0">
                              {fmt.format}
                            </Badge>
                          );
                        })}
                      </div>
                    )
                  },
                  {
                    header: "User Notes / Tags",
                    accessor: (p: ConsolidatedPlugin) => (
                      <div className="max-w-[200px] truncate text-xs text-gray-400 font-mono">
                        {p.notes ? `${p.notes}` : p.tags.length > 0 ? p.tags.join(", ") : "—"}
                      </div>
                    )
                  }
                ]}
                data={sortedPlugins}
                onRowClick={(p) => selectPlugin(p)}
                selectedId={selectedPluginId || ""}
                rowIdAccessor={(p) => p.id}
              />
            </div>
          ) : (
            /* Bento Grid Panel View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedPlugins.map((p) => {
                const isSelected = selectedPluginId === p.id;
                return (
                  <Card 
                    key={p.id}
                    hoverable
                    onClick={() => selectPlugin(p)}
                    className={`cursor-pointer transition-all duration-200 border text-left flex flex-col justify-between h-44 ${
                      isSelected 
                        ? "border-[#0F5B59] ring-2 ring-teal-500/10 text-gray-900 bg-teal-50/5" 
                        : "border-gray-200/60 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="p-4 flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 leading-tight mb-1 truncate max-w-[160px]">{p.name}</h4>
                          <span className="text-xs text-gray-400 font-medium block">{p.vendor}</span>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(p.id);
                          }}
                          className={`p-1.5 rounded duration-150 transition-colors cursor-pointer ${p.is_favorite ? "text-red-500" : "text-gray-300 hover:bg-gray-50"}`}
                        >
                          <Heart size={14} fill={p.is_favorite ? "#EF4444" : "none"} />
                        </button>
                      </div>

                      <div className="mt-3.5 flex flex-wrap gap-1">
                        {p.formats.map((fmt, idx) => (
                          <span key={idx} className="text-[10px] font-mono font-bold bg-gray-100 hover:bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded leading-none">
                            {fmt.format}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="px-4 py-2.5 bg-[#F7F8FA] border-t border-gray-100 flex items-center justify-between">
                      <Badge variant="neutral" className="text-[10px] leading-none">{p.category}</Badge>
                      <span className="text-[9px] font-mono font-medium text-gray-400">
                        {p.formats[0]?.version || "v1.0.0"}
                      </span>
                    </div>

                  </Card>
                );
              })}
            </div>
          )}

        </div>

      </main>

      {/* RIGHT METADATA INSPECTOR COLUMN - EXPANDED VIEW CARD */}
      <aside className="w-96 bg-white border-l border-[#E5E7EB] flex flex-col z-20 select-text shrink-0 pb-1 h-screen">
        
        {activePlugin ? (
          <div className="flex flex-col h-full">
            
            {/* Inspector Top Actions list */}
            <div className="px-5 py-4 border-b border-gray-100 bg-[#F7F8FA]/30 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Music size={15} className="text-[#0F5B59]" />
                <span className="text-base font-bold text-[#111827]">Details</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Tooltip content={activePlugin.is_favorite ? "Remove favorite" : "Set as favorite"}>
                  <IconButton 
                    size="sm" 
                    variant={activePlugin.is_favorite ? "active" : "ghost"}
                    onClick={() => handleToggleFavorite(activePlugin.id)}
                  >
                    <Heart size={15} fill={activePlugin.is_favorite ? "#0F5B59" : "none"} />
                  </IconButton>
                </Tooltip>

                <Tooltip content="Hide from index view">
                  <IconButton size="sm" onClick={() => handleToggleHide(activePlugin.id)}>
                    <EyeOff size={15} />
                  </IconButton>
                </Tooltip>
              </div>
            </div>

            {/* Scrollable meta structures */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              
              {/* Giant branding card inside panel */}
              <div className="text-left pb-4 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900 leading-tight">
                  <input 
                    type="text" 
                    value={inspectEditName} 
                    onChange={(e) => {
                      setInspectEditName(e.target.value);
                      setHasEditChanges(true);
                    }}
                    className="w-full font-bold text-lg text-gray-900 focus:bg-gray-50 px-1 py-0.5 rounded outline-none border border-transparent focus:border-gray-200"
                  />
                </h3>
                <p className="text-sm text-gray-400 font-medium">
                  <input 
                    type="text" 
                    value={inspectEditVendor} 
                    onChange={(e) => {
                      setInspectEditVendor(e.target.value);
                      setHasEditChanges(true);
                    }}
                    className="w-full text-xs text-gray-400 focus:bg-gray-50 px-1 py-0.5 rounded outline-none border border-transparent focus:border-gray-200"
                  />
                </p>
              </div>

              {/* Editable Fields form */}
              <div className="space-y-4 text-left">
                
                {/* Category editor */}
                <div>
                  <Select 
                    label="Plugin Classification" 
                    options={categoryOptions}
                    value={inspectEditCategory}
                    onChange={(e) => {
                      setInspectEditCategory(e.target.value as PluginCategory);
                      setHasEditChanges(true);
                    }}
                  />
                  <p className="text-[10px] text-gray-400 mt-1 select-none font-medium">
                    Auto-categorized based on name keyword identifiers.
                  </p>
                </div>

                {/* Multiple Tags commas list */}
                <div>
                  <Input 
                    label="Custom Labels / Tags"
                    placeholder="e.g. analog, warm, synth, delay"
                    value={inspectEditTagsStr}
                    onChange={(e) => {
                      setInspectEditTagsStr(e.target.value);
                      setHasEditChanges(true);
                    }}
                  />
                  <p className="text-[10px] text-gray-400 mt-1 select-none font-medium">
                    Separate values with commas.
                  </p>
                </div>

                {/* Notes box */}
                <div>
                  <Textarea 
                    label="User Review / Studio Notes"
                    placeholder="Enter plugin presets, rating, or preset directories details on this computer..."
                    value={inspectEditNotes}
                    onChange={(e) => {
                      setInspectEditNotes(e.target.value);
                      setHasEditChanges(true);
                    }}
                  />
                </div>

                {/* Sticky inspector update save button */}
                {hasEditChanges && (
                  <Button onClick={handleSaveInspectEdits} className="w-full text-xs py-2 shadow-xs bg-[#0F5B59] hover:bg-teal-800 tracking-wide font-bold uppercase transition-all">
                    Apply Changes
                  </Button>
                )}

              </div>

              {/* Installed Physical Formats & Paths segments */}
              <div className="space-y-3.5 pt-4 text-left border-t border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Installed architectures ({activePlugin.formats.length})</span>
                
                <div className="space-y-3 bg-[#F7F8FA] p-3 rounded-lg border border-gray-100">
                  {activePlugin.formats.map((fmt, idx) => (
                    <div key={idx} className="space-y-1.5 pb-2.5 last:pb-0 border-b border-gray-200/50 last:border-0 last:mb-0">
                      
                      <div className="flex items-center justify-between">
                        <Badge variant={fmt.format === "AAX" ? "warning" : "primary"}>
                          {fmt.format}
                        </Badge>
                        <span className="text-[10px] font-mono text-gray-500 font-semibold">{fmt.version || "Unknown version"}</span>
                      </div>

                      <div className="text-[10px] text-gray-500 font-mono break-all leading-tight">
                        <div className="text-gray-400 uppercase text-[9px] font-bold tracking-wider mb-0.5">Physical location</div>
                        {fmt.path}
                      </div>

                      {fmt.architecture && (
                        <div className="text-[9px] font-semibold text-gray-400 font-mono">
                          Arch: <span className="text-gray-700">{fmt.architecture}</span>
                        </div>
                      )}

                      {!fmt.is_loadable_outside && (
                        <span className="text-[9px] font-bold text-amber-500 flex items-center space-x-1 select-none">
                          <AlertTriangle size={10} />
                          <span>Not directly loadable outside Pro Tools</span>
                        </span>
                      )}

                      <Button 
                        variant="secondary" 
                        size="sm"
                        className="text-[9px] py-1 px-1.5 h-auto text-gray-500 hover:text-[#0F5B59] bg-white cursor-pointer hover:bg-gray-150"
                        onClick={() => {
                          const fileName = fmt.path.split(/[/\\]/).pop() || 'PluginFile';
                          showToast(`Visual Folder simulation: Triggered OS find for file path "${fileName}"`, "info");
                        }}
                      >
                        <FolderOpen size={10} className="mr-1 inline" /> Open containing explorer
                      </Button>

                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Bottom details context stamp */}
            <div className="p-4 border-t border-gray-100 bg-[#F7F8FA]/30 text-center select-none text-[10px] text-gray-400 font-mono">
              Registered internally on: {new Date(activePlugin.created_at).toLocaleDateString()}
            </div>

          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center select-none">
            <Music size={32} className="text-gray-200 mb-2 animate-pulse" />
            <span className="text-xs text-gray-400 font-medium">Select a plugin bundle from the catalog table to inspect and edit user metadata metadata.</span>
          </div>
        )}

      </aside>

      {/* SETTINGS / PATH CONFIGURATION MODAL */}
      <Modal 
        isOpen={showSettingsModal} 
        onClose={() => setShowSettingsModal(false)}
        title="Plugin Scan Directory Preferences"
        footer={
          <Button onClick={() => setShowSettingsModal(false)} variant="primary" className="text-xs">
            Done Saving
          </Button>
        }
        maxWidth="lg"
      >
        <div className="space-y-5 text-left select-none">
          
          <div className="bg-teal-50/50 p-4 rounded-lg border border-teal-100 flex items-start space-x-3.5 mb-5">
            <Info className="text-[#0F5B59] mt-0.5 shrink-0" size={18} />
            <div className="text-xs space-y-1">
              <span className="font-bold text-gray-800 block">Cross-Platform Discovery Rules</span>
              <p className="text-gray-500 leading-relaxed">
                Add paths representing physical folders on macOS or Windows. Standard locations are registered automatically. Folders that do not exist or are unreadable will be safely ignored during traversal.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Add custom seek folder</label>
            <div className="flex items-center space-x-2">
              <Input 
                placeholder="e.g. D:\Audio\Plugins\VST3 or ~/Library/Audio/Plug-ins/VST"
                value={newCustomFolderPath}
                onChange={(e) => setNewCustomFolderPath(e.target.value)}
              />
              <Button onClick={handleAddCustomFolder} className="shrink-0 h-9">
                <Plus size={16} />
              </Button>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block pb-1 border-b border-gray-100">Configured Directories ({scanFolders.length})</span>
            
            <div className="divide-y divide-gray-100 max-h-56 overflow-y-auto pr-1">
              {scanFolders.map((sf) => (
                <div key={sf.id} className="py-2.5 flex items-center justify-between text-xs hover:bg-gray-50/50 transition-colors rounded px-2">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <FolderOpen size={14} className="text-teal-600 shrink-0" />
                    <span className="text-gray-700 font-mono truncate">{sf.path}</span>
                    {!sf.is_custom && <span className="text-[8px] bg-gray-100 px-1 py-0.5 rounded text-gray-400 uppercase font-bold shrink-0">Default</span>}
                  </div>
                  {sf.is_custom && (
                    <button 
                      onClick={() => handleRemoveFolder(sf.id)}
                      className="text-red-400 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Trigger scan mode selector */}
          <div className="space-y-3 pt-3 border-t border-gray-100">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">Trigger custom scan now</span>
            
            <div className="p-3 bg-gray-50 border border-gray-150 rounded-lg flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-gray-700 block">Perform customized path crawling</span>
                <p className="text-[10.5px] text-gray-400">Scans all custom folders in background mode</p>
              </div>
              <Button 
                onClick={() => {
                  setShowSettingsModal(false);
                  handleTriggerScan("custom");
                }} 
                className="text-xs py-1.5"
              >
                Start Scan
              </Button>
            </div>
          </div>

        </div>
      </Modal>

      {/* SCAN REPORT MODAL */}
      <Modal 
        isOpen={showScanReportModal} 
        onClose={() => setShowScanReportModal(false)}
        title="Software Scan Report"
        footer={
          <Button onClick={() => setShowScanReportModal(false)} variant="primary" className="text-xs px-5">
            Acknowledge
          </Button>
        }
        maxWidth="lg"
      >
        {scanReport && (
          <div className="text-left select-none space-y-4">
            
            <div className="bg-teal-50 p-4 border border-teal-100 rounded-lg flex items-start space-x-3.5">
              <Sparkles className="text-teal-700 shrink-0" size={20} />
              <div className="text-xs space-y-1">
                <span className="font-bold text-teal-800 leading-tight block">Scan Successfully Executed!</span>
                <p className="text-teal-600 font-medium">Completed folder recursive indexing crawl in {scanReport.durationMs}ms.</p>
              </div>
            </div>

            {/* Grid statistics */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-1">Discovered Frameworks</span>
                <span className="text-lg font-bold text-gray-850 font-mono">{scanReport.discovered}</span>
                <p className="text-[10px] text-gray-400">Total physical package bundles found</p>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-1">Deduplicated Inserted</span>
                <span className="text-lg font-bold text-gray-850 font-mono">{scanReport.added}</span>
                <p className="text-[10px] text-gray-400">New unique plugin database rows added</p>
              </div>
            </div>

            {/* Warnings list section */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">Safe Exception Logs ({scanReport.warnings.length})</span>
              
              <div className="bg-gray-900 text-[10px] font-mono text-zinc-300 p-3.5 rounded max-h-40 overflow-y-auto leading-relaxed border border-gray-850">
                {scanReport.warnings.length === 0 ? (
                  <span className="text-emerald-500 font-semibold">• Done crawl. Checked directories returned zero warnings or folder skips. Zero execution errors.</span>
                ) : (
                  scanReport.warnings.map((errStr: string, idx: number) => (
                    <div key={idx} className="pb-1 text-red-400 border-b border-zinc-800 last:border-0 last:pb-0">
                      • {errStr}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}
      </Modal>

      {/* SQL DATABASE BACKUP & RESTORE MODAL */}
      <Modal
        isOpen={showBackupModal}
        onClose={() => setShowBackupModal(false)}
        title="SQLite Relational Database Vault Backups"
        footer={
          <div className="flex items-center space-x-2">
            <Button onClick={() => setShowBackupModal(false)} variant="secondary" className="text-xs">
              Close
            </Button>
            <Button onClick={handleRestoreBackup} variant="primary" className="text-xs bg-[#0F5B59] hover:bg-teal-800">
              Execute Parse & Restore
            </Button>
          </div>
        }
        maxWidth="lg"
      >
        <div className="text-left select-none space-y-4">
          <div className="bg-amber-50 rounded-lg border border-amber-200 p-4 flex items-start space-x-3">
            <Database className="text-amber-500 shrink-0 mt-0.5" size={18} />
            <div className="text-xs leading-relaxed text-amber-800 space-y-1">
              <span className="font-bold block">Import/Export SQLite Text Backups</span>
              <p>
                Download standard SQLite database backups or import text dumps. SQL statements are processed sequentially to guarantee physical referential integrity across plugins, tags, and scan folders!
              </p>
            </div>
          </div>

          <div className="space-y-3.5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Export SQLite files</span>
              <a 
                href="/api/backup/sqlite" 
                target="_blank"
                className="inline-flex items-center justify-center font-bold font-mono text-xs px-3 py-2 border border-teal-200 text-[#0F5B59] bg-teal-50 hover:bg-teal-100 rounded cursor-pointer transition-all w-full"
              >
                <Download size={13} className="mr-1.5" /> DOWNLOAD STANDARD SQLITE BACKUP (.SQL)
              </a>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">Import SQL dump script</label>
              <textarea 
                className="w-full h-44 bg-gray-50 border border-gray-200 rounded p-3 text-xs font-mono text-gray-700 placeholder-gray-400 focus:outline-[#0F5B59] focus:bg-white transition-all resize-y"
                placeholder="Paste standard SQL dump here... e.g.\nINSERT INTO plugins VALUES ('plugin_id', 'Serum', 'Xfer Records', ...);\nINSERT INTO plugin_formats VALUES (...);"
                value={sqlBackupText}
                onChange={(e) => setSqlBackupText(e.target.value)}
              />
            </div>
          </div>

        </div>
      </Modal>

    </div>
  );
}
