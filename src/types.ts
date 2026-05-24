/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum PluginCategory {
  Synth = "Synth",
  Sampler = "Sampler",
  DrumMachine = "Drum Machine",
  EQ = "EQ",
  Compressor = "Compressor",
  Limiter = "Limiter",
  Reverb = "Reverb",
  Delay = "Delay",
  Distortion = "Distortion",
  Modulation = "Modulation",
  Utility = "Utility",
  Analyzer = "Analyzer",
  Unknown = "Unknown"
}

export type PluginFormatType = "VST2" | "VST3" | "AU" | "AAX";

// Table: plugins
export interface PluginEntry {
  id: string; // Unique ID (e.g. UUID or hash of name + vendor)
  name: string;
  vendor: string;
  category: PluginCategory;
  is_favorite: boolean;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
}

// Table: plugin_formats
export interface PluginFormatEntry {
  id: string;
  plugin_id: string; // Fkey to plugins
  format: PluginFormatType;
  path: string;
  version: string | null;
  architecture: string | null; // e.g. x64, arm64, Universal
  is_loadable_outside: boolean; // false for AAX, true for others
  last_scanned: string;
}

// Table: scan_folders
export interface ScanFolderEntry {
  id: string;
  path: string;
  is_custom: boolean;
  created_at: string;
}

// Table: tags
export interface TagEntry {
  id: string;
  name: string;
}

// Table: plugin_tags
export interface PluginTagEntry {
  plugin_id: string;
  tag_id: string;
}

// Table: notes
export interface NoteEntry {
  id: string;
  plugin_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// Table: scan_history
export interface ScanHistoryEntry {
  id: string;
  scan_date: string;
  scan_mode: "Quick Scan" | "Full Rescan" | "Custom Scan";
  folders_scanned: number;
  plugins_discovered: number;
  plugins_added: number;
  errors_logged: string | null; // JSON array of warnings
}

// Consolidated Presentation Interface for UI
export interface ConsolidatedPlugin {
  id: string;
  name: string;
  vendor: string;
  category: PluginCategory;
  is_favorite: boolean;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
  
  // From formats table
  formats: {
    format: PluginFormatType;
    path: string;
    version: string | null;
    architecture: string | null;
    is_loadable_outside: boolean;
    last_scanned: string;
  }[];
  
  // Joined values
  tags: string[];
  notes: string | null;
}

export type ScanMode = "quick" | "full" | "custom";
