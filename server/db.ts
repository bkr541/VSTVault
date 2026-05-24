import fs from "fs";
import path from "path";
import { 
  PluginEntry, 
  PluginFormatEntry, 
  ScanFolderEntry, 
  TagEntry, 
  PluginTagEntry, 
  NoteEntry, 
  ScanHistoryEntry,
  PluginCategory,
  ConsolidatedPlugin
} from "../src/types";

// DB Path
const DB_FILE = path.join(process.cwd(), "vst_vault_sqlite.json");

interface SQLiteDatabase {
  plugins: PluginEntry[];
  plugin_formats: PluginFormatEntry[];
  scan_folders: ScanFolderEntry[];
  tags: TagEntry[];
  plugin_tags: PluginTagEntry[];
  notes: NoteEntry[];
  scan_history: ScanHistoryEntry[];
}

const DEFAULT_STATE: SQLiteDatabase = {
  plugins: [],
  plugin_formats: [],
  scan_folders: [
    { id: "sf1", path: "/Library/Audio/Plug-Ins/VST", is_custom: false, created_at: new Date().toISOString() },
    { id: "sf2", path: "/Library/Audio/Plug-Ins/VST3", is_custom: false, created_at: new Date().toISOString() },
    { id: "sf3", path: "/Library/Audio/Plug-Ins/Components", is_custom: false, created_at: new Date().toISOString() },
    { id: "sf4", path: "C:\\Program Files\\Common Files\\VST3", is_custom: false, created_at: new Date().toISOString() },
    { id: "sf5", path: "C:\\Program Files\\VSTPlugins", is_custom: false, created_at: new Date().toISOString() }
  ],
  tags: [
    { id: "t1", name: "Analog" },
    { id: "t2", name: "Digital" },
    { id: "t3", name: "Warm" },
    { id: "t4", name: "Creative" },
    { id: "t5", name: "CPU Heavy" }
  ],
  plugin_tags: [],
  notes: [],
  scan_history: []
};

export class SQLiteSimulator {
  private state: SQLiteDatabase = { ...DEFAULT_STATE };

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        this.state = JSON.parse(raw);
        // Ensure default tables exist
        for (const key of Object.keys(DEFAULT_STATE) as Array<keyof SQLiteDatabase>) {
          if (!this.state[key]) {
            this.state[key] = DEFAULT_STATE[key] as any;
          }
        }
      } else {
        this.state = { ...DEFAULT_STATE };
        this.save();
      }
    } catch (e) {
      console.error("Failed to load SQLite DB file. Initializing defaults.", e);
      this.state = { ...DEFAULT_STATE };
    }
  }

  public save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.state, null, 2), "utf-8");
    } catch (err) {
      console.error("Database write error:", err);
    }
  }

  // Retrieve ALL tables
  public getFullState(): SQLiteDatabase {
    return this.state;
  }

  // Restore state from backup
  public restoreState(newState: SQLiteDatabase) {
    this.state = newState;
    this.save();
  }

  // PLUGINS
  public getPlugins(): PluginEntry[] {
    return this.state.plugins;
  }

  public getPluginTags(): PluginTagEntry[] {
    return this.state.plugin_tags;
  }

  public getTags(): TagEntry[] {
    return this.state.tags;
  }

  public getNotes(): NoteEntry[] {
    return this.state.notes;
  }

  public getPluginFormats(): PluginFormatEntry[] {
    return this.state.plugin_formats;
  }

  public getScanFolders(): ScanFolderEntry[] {
    return this.state.scan_folders;
  }

  public getScanHistory(): ScanHistoryEntry[] {
    return this.state.scan_history;
  }

  // Query and Consolidated list of output
  public getConsolidatedPlugins(): ConsolidatedPlugin[] {
    return this.state.plugins.map(p => {
      // Find formats
      const formats = this.state.plugin_formats
        .filter(f => f.plugin_id === p.id)
        .map(f => ({
          format: f.format,
          path: f.path,
          version: f.version,
          architecture: f.architecture,
          is_loadable_outside: f.is_loadable_outside,
          last_scanned: f.last_scanned
        }));

      // Find tags
      const tagIds = this.state.plugin_tags
        .filter(pt => pt.plugin_id === p.id)
        .map(pt => pt.tag_id);
      
      const tags = this.state.tags
        .filter(t => tagIds.includes(t.id))
        .map(t => t.name);

      // Find user note (latest content if any)
      const note = this.state.notes.find(n => n.plugin_id === p.id)?.content || null;

      return {
        ...p,
        formats,
        tags,
        notes: note
      };
    });
  }

  public addScanFolder(pathStr: string): ScanFolderEntry {
    const trimmed = pathStr.trim();
    const existing = this.state.scan_folders.find(sf => sf.path.toLowerCase() === trimmed.toLowerCase());
    if (existing) return existing;

    const newFolder: ScanFolderEntry = {
      id: "folder_" + Math.random().toString(36).substring(2, 9),
      path: trimmed,
      is_custom: true,
      created_at: new Date().toISOString()
    };
    this.state.scan_folders.push(newFolder);
    this.save();
    return newFolder;
  }

  public removeScanFolder(id: string) {
    this.state.scan_folders = this.state.scan_folders.filter(sf => sf.id !== id);
    this.save();
  }

  public toggleFavorite(pluginId: string): boolean {
    const plugin = this.state.plugins.find(p => p.id === pluginId);
    if (plugin) {
      plugin.is_favorite = !plugin.is_favorite;
      plugin.updated_at = new Date().toISOString();
      this.save();
      return plugin.is_favorite;
    }
    return false;
  }

  public toggleHide(pluginId: string): boolean {
    const plugin = this.state.plugins.find(p => p.id === pluginId);
    if (plugin) {
      plugin.is_hidden = !plugin.is_hidden;
      plugin.updated_at = new Date().toISOString();
      this.save();
      return plugin.is_hidden;
    }
    return false;
  }

  public updatePlugin(
    pluginId: string, 
    data: { 
      name?: string; 
      vendor?: string; 
      category?: PluginCategory; 
      notes?: string; 
      tags?: string[] 
    }
  ) {
    const plugin = this.state.plugins.find(p => p.id === pluginId);
    if (!plugin) return;

    if (data.name) plugin.name = data.name;
    if (data.vendor) plugin.vendor = data.vendor;
    if (data.category) plugin.category = data.category;
    plugin.updated_at = new Date().toISOString();

    // Notes updates
    if (data.notes !== undefined) {
      const idx = this.state.notes.findIndex(n => n.plugin_id === pluginId);
      if (data.notes.trim() === "") {
        if (idx !== -1) this.state.notes.splice(idx, 1);
      } else {
        if (idx !== -1) {
          this.state.notes[idx].content = data.notes;
          this.state.notes[idx].updated_at = new Date().toISOString();
        } else {
          this.state.notes.push({
            id: "note_" + Math.random().toString(36).substring(2, 9),
            plugin_id: pluginId,
            content: data.notes,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      }
    }

    // Dynamic tags management
    if (data.tags !== undefined) {
      // Clear old associations
      this.state.plugin_tags = this.state.plugin_tags.filter(pt => pt.plugin_id !== pluginId);
      
      for (const tName of data.tags) {
        const trimmed = tName.trim();
        if (!trimmed) continue;

        // Ensure tag entry exists in our glossary
        let tag = this.state.tags.find(t => t.name.toLowerCase() === trimmed.toLowerCase());
        if (!tag) {
          tag = {
            id: "tag_" + Math.random().toString(36).substring(2, 9),
            name: trimmed
          };
          this.state.tags.push(tag);
        }

        this.state.plugin_tags.push({
          plugin_id: pluginId,
          tag_id: tag.id
        });
      }
    }

    this.save();
  }

  // Record a finished scan
  public addScanHistory(history: Omit<ScanHistoryEntry, "id">) {
    const newEntry: ScanHistoryEntry = {
      ...history,
      id: "scan_" + Math.random().toString(36).substring(2, 9)
    };
    this.state.scan_history.unshift(newEntry); // Newest first
    this.save();
  }

  // Wipes all data
  public clearPluginsAndScanHistory() {
    this.state.plugins = [];
    this.state.plugin_formats = [];
    this.state.notes = [];
    this.state.plugin_tags = [];
    this.state.scan_history = [];
    this.save();
  }

  // Backup exporter: Generates a raw SQLite source code SQL format string!
  public generateSQLDump(): string {
    let dump = `-- VST Vault SQLite Database Export SQL\n`;
    dump += `-- Generated at: ${new Date().toISOString()}\n\n`;

    // Drop/Create tables
    dump += `DROP TABLE IF EXISTS plugin_tags;\n`;
    dump += `DROP TABLE IF EXISTS plugin_formats;\n`;
    dump += `DROP TABLE IF EXISTS notes;\n`;
    dump += `DROP TABLE IF EXISTS plugins;\n`;
    dump += `DROP TABLE IF EXISTS scan_folders;\n`;
    dump += `DROP TABLE IF EXISTS tags;\n`;
    dump += `DROP TABLE IF EXISTS scan_history;\n\n`;

    dump += `CREATE TABLE plugins (id TEXT PRIMARY KEY, name TEXT, vendor TEXT, category TEXT, is_favorite INTEGER, is_hidden INTEGER, created_at TEXT, updated_at TEXT);\n`;
    dump += `CREATE TABLE plugin_formats (id TEXT PRIMARY KEY, plugin_id TEXT, format TEXT, path TEXT, version TEXT, architecture TEXT, is_loadable_outside INTEGER, last_scanned TEXT);\n`;
    dump += `CREATE TABLE scan_folders (id TEXT PRIMARY KEY, path TEXT, is_custom INTEGER, created_at TEXT);\n`;
    dump += `CREATE TABLE tags (id TEXT PRIMARY KEY, name TEXT UNIQUE);\n`;
    dump += `CREATE TABLE plugin_tags (plugin_id TEXT, tag_id TEXT, PRIMARY KEY (plugin_id, tag_id));\n`;
    dump += `CREATE TABLE notes (id TEXT PRIMARY KEY, plugin_id TEXT, content TEXT, created_at TEXT, updated_at TEXT);\n`;
    dump += `CREATE TABLE scan_history (id TEXT PRIMARY KEY, scan_date TEXT, scan_mode TEXT, folders_scanned INTEGER, plugins_discovered INTEGER, plugins_added INTEGER, errors_logged TEXT);\n\n`;

    // Help escape text
    const esc = (val: any) => {
      if (val === null || val === undefined) return "NULL";
      if (typeof val === "boolean") return val ? 1 : 0;
      if (typeof val === "number") return val;
      return `'${String(val).replace(/'/g, "''")}'`;
    };

    // Insert rows
    this.state.plugins.forEach(p => {
      dump += `INSERT INTO plugins VALUES (${esc(p.id)}, ${esc(p.name)}, ${esc(p.vendor)}, ${esc(p.category)}, ${esc(p.is_favorite)}, ${esc(p.is_hidden)}, ${esc(p.created_at)}, ${esc(p.updated_at)});\n`;
    });
    
    this.state.plugin_formats.forEach(pf => {
      dump += `INSERT INTO plugin_formats VALUES (${esc(pf.id)}, ${esc(pf.plugin_id)}, ${esc(pf.format)}, ${esc(pf.path)}, ${esc(pf.version)}, ${esc(pf.architecture)}, ${esc(pf.is_loadable_outside)}, ${esc(pf.last_scanned)});\n`;
    });

    this.state.scan_folders.forEach(sf => {
      dump += `INSERT INTO scan_folders VALUES (${esc(sf.id)}, ${esc(sf.path)}, ${esc(sf.is_custom)}, ${esc(sf.created_at)});\n`;
    });

    this.state.tags.forEach(t => {
      dump += `INSERT INTO tags VALUES (${esc(t.id)}, ${esc(t.name)});\n`;
    });

    this.state.plugin_tags.forEach(pt => {
      dump += `INSERT INTO plugin_tags VALUES (${esc(pt.plugin_id)}, ${esc(pt.tag_id)});\n`;
    });

    this.state.notes.forEach(n => {
      dump += `INSERT INTO notes VALUES (${esc(n.id)}, ${esc(n.plugin_id)}, ${esc(n.content)}, ${esc(n.created_at)}, ${esc(n.updated_at)});\n`;
    });

    this.state.scan_history.forEach(sh => {
      dump += `INSERT INTO scan_history VALUES (${esc(sh.id)}, ${esc(sh.scan_date)}, ${esc(sh.scan_mode)}, ${esc(sh.folders_scanned)}, ${esc(sh.plugins_discovered)}, ${esc(sh.plugins_added)}, ${esc(sh.errors_logged)});\n`;
    });

    return dump;
  }

  // Backup Importer: Parses SQL string and loads into state
  public importSQLDump(sql: string): boolean {
    try {
      const newState: SQLiteDatabase = {
        plugins: [],
        plugin_formats: [],
        scan_folders: [],
        tags: [],
        plugin_tags: [],
        notes: [],
        scan_history: []
      };

      const lines = sql.split("\n");
      const unescapedVal = (val: string): any => {
        val = val.trim();
        if (val === "NULL") return null;
        if (val.startsWith("'") && val.endsWith("'")) {
          return val.substring(1, val.length - 1).replace(/''/g, "'");
        }
        if (val === "0" || val === "1") {
          return val === "1";
        }
        const parsedNum = Number(val);
        if (!isNaN(parsedNum)) return parsedNum;
        return val;
      };

      for (const line of lines) {
        if (!line.startsWith("INSERT INTO ")) continue;

        // Extract table name
        const match = line.match(/INSERT INTO (\w+) VALUES \((.*)\);/);
        if (!match) continue;

        const table = match[1] as keyof SQLiteDatabase;
        const rawVals = match[2];

        // Custom parser to split by commas outside quotes
        const values: any[] = [];
        let inQuote = false;
        let currentItem = "";
        for (let i = 0; i < rawVals.length; i++) {
          const char = rawVals[i];
          if (char === "'" && rawVals[i + 1] === "'") {
            currentItem += "'";
            i++; // skip next quote
          } else if (char === "'") {
            inQuote = !inQuote;
            currentItem += "'";
          } else if (char === "," && !inQuote) {
            values.push(unescapedVal(currentItem));
            currentItem = "";
          } else {
            currentItem += char;
          }
        }
        values.push(unescapedVal(currentItem));

        if (table === "plugins") {
          newState.plugins.push({
            id: values[0],
            name: values[1],
            vendor: values[2],
            category: values[3] as PluginCategory,
            is_favorite: Boolean(values[4]),
            is_hidden: Boolean(values[5]),
            created_at: values[6] || new Date().toISOString(),
            updated_at: values[7] || new Date().toISOString()
          });
        } else if (table === "plugin_formats") {
          newState.plugin_formats.push({
            id: values[0],
            plugin_id: values[1],
            format: values[2],
            path: values[3],
            version: values[4],
            architecture: values[5],
            is_loadable_outside: Boolean(values[6]),
            last_scanned: values[7] || new Date().toISOString()
          });
        } else if (table === "scan_folders") {
          newState.scan_folders.push({
            id: values[0],
            path: values[1],
            is_custom: Boolean(values[2]),
            created_at: values[3] || new Date().toISOString()
          });
        } else if (table === "tags") {
          newState.tags.push({
            id: values[0],
            name: values[1]
          });
        } else if (table === "plugin_tags") {
          newState.plugin_tags.push({
            plugin_id: values[0],
            tag_id: values[1]
          });
        } else if (table === "notes") {
          newState.notes.push({
            id: values[0],
            plugin_id: values[1],
            content: values[2],
            created_at: values[3] || new Date().toISOString(),
            updated_at: values[4] || new Date().toISOString()
          });
        } else if (table === "scan_history") {
          newState.scan_history.push({
            id: values[0],
            scan_date: values[1],
            scan_mode: values[2],
            folders_scanned: Number(values[3]),
            plugins_discovered: Number(values[4]),
            plugins_added: Number(values[5]),
            errors_logged: values[6]
          });
        }
      }

      // Check if data is parsed successfully
      if (newState.plugins.length > 0 || newState.scan_folders.length > 0) {
        this.state = newState;
        this.save();
        return true;
      }
      return false;
    } catch (err) {
      console.error("SQL SQL dump parser import failed:", err);
      return false;
    }
  }
}
