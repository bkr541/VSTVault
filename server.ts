import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { SQLiteSimulator } from "./server/db";
import { seedVirtualVSTs, runRecursiveScan } from "./server/scanEngine";
import { PluginCategory } from "./src/types";

// Initialize SQLite Database Simulator
const db = new SQLiteSimulator();

// Initialize virtual file-tree on startup so that "Scan" works immediately
seedVirtualVSTs();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body Parsing Middlewares
  app.use(express.json({ limit: "50mb" }));
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "VST Vault engine running smoothly." });
  });

  // 1. GET PLUGINS (filters, favorites, global search, counts)
  app.get("/api/plugins", (req, res) => {
    try {
      const consolidated = db.getConsolidatedPlugins();
      
      // Perform filtering
      const { search, category, tag, favorite, hidden } = req.query;
      
      let filtered = consolidated;

      if (hidden !== "true") {
        filtered = filtered.filter(p => !p.is_hidden);
      } else {
        filtered = filtered.filter(p => p.is_hidden);
      }

      if (search) {
        const q = String(search).toLowerCase();
        filtered = filtered.filter(
          p => p.name.toLowerCase().includes(q) || 
               p.vendor.toLowerCase().includes(q) ||
               (p.notes && p.notes.toLowerCase().includes(q))
        );
      }

      if (category && category !== "All") {
        filtered = filtered.filter(p => p.category === category);
      }

      if (tag) {
        const checkTag = String(tag).toLowerCase();
        filtered = filtered.filter(p => p.tags.some(t => t.toLowerCase() === checkTag));
      }

      if (favorite === "true") {
        filtered = filtered.filter(p => p.is_favorite);
      }

      res.json({
        success: true,
        plugins: filtered,
        counts: {
          total: consolidated.filter(p => !p.is_hidden).length,
          favorites: consolidated.filter(p => p.is_favorite && !p.is_hidden).length,
          hidden: consolidated.filter(p => p.is_hidden).length,
          categories: Object.values(PluginCategory).reduce((acc, cat) => {
            acc[cat] = consolidated.filter(p => p.category === cat && !p.is_hidden).length;
            return acc;
          }, {} as Record<string, number>),
          tags: db.getTags().map(t => {
            const count = consolidated.filter(p => !p.is_hidden && p.tags.includes(t.name)).length;
            return { id: t.id, name: t.name, count };
          }).filter(t => t.count > 0)
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. EDIT/UPDATE PLUGIN
  app.put("/api/plugins/:id", (req, res) => {
    try {
      const id = req.params.id;
      const { name, vendor, category, notes, tags } = req.body;
      db.updatePlugin(id, { name, vendor, category, notes, tags });
      res.json({ success: true, message: "Plugin updated successfully." });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3. TOGGLE FAVORITE
  app.post("/api/plugins/:id/favorite", (req, res) => {
    try {
      const id = req.params.id;
      const state = db.toggleFavorite(id);
      res.json({ success: true, is_favorite: state });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 4. TOGGLE HIDE
  app.post("/api/plugins/:id/hide", (req, res) => {
    try {
      const id = req.params.id;
      const state = db.toggleHide(id);
      res.json({ success: true, is_hidden: state });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 5. SCAN FOLDERS GET / POST / DELETE
  app.get("/api/scan-folders", (req, res) => {
    res.json({ success: true, folders: db.getScanFolders() });
  });

  app.post("/api/scan-folders", (req, res) => {
    try {
      const { path: newPath } = req.body;
      if (!newPath || typeof newPath !== "string") {
        return res.status(400).json({ success: false, error: "Invalid path provided." });
      }
      const created = db.addScanFolder(newPath);
      res.json({ success: true, folder: created });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete("/api/scan-folders/:id", (req, res) => {
    try {
      const id = req.params.id;
      db.removeScanFolder(id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 6. SCAN ACTION
  app.post("/api/scan", (req, res) => {
    try {
      const { mode, selectedFolders } = req.body; // mode: "quick", "full", "custom"
      
      let foldersToScan: string[] = [];
      const allFolders = db.getScanFolders();

      if (mode === "custom" && Array.isArray(selectedFolders)) {
        foldersToScan = selectedFolders;
      } else {
        foldersToScan = allFolders.map(f => f.path);
      }

      const scanModeLabel = 
        mode === "full" ? "Full Rescan" : 
        mode === "custom" ? "Custom Scan" : "Quick Scan";

      const start = Date.now();
      const results = runRecursiveScan(foldersToScan, db, scanModeLabel);
      const durationMs = Date.now() - start;

      // Save scan history
      db.addScanHistory({
        scan_date: new Date().toISOString(),
        scan_mode: scanModeLabel,
        folders_scanned: foldersToScan.length,
        plugins_discovered: results.discovered,
        plugins_added: results.added,
        errors_logged: results.warnings.length > 0 ? JSON.stringify(results.warnings) : null
      });

      res.json({
        success: true,
        report: {
          mode: scanModeLabel,
          foldersScannedCount: foldersToScan.length,
          folders: foldersToScan,
          discovered: results.discovered,
          added: results.added,
          durationMs,
          warnings: results.warnings
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 7. GET SCAN HISTORY
  app.get("/api/scan-history", (req, res) => {
    res.json({ success: true, history: db.getScanHistory() });
  });

  // 8. RESET/SEED DB
  app.post("/api/reset-db", (req, res) => {
    try {
      const { seed } = req.body;
      db.clearPluginsAndScanHistory();
      if (seed) {
        // Runs standard trigger
        runRecursiveScan(db.getScanFolders().map(f => f.path), db, "Quick Scan");
      }
      res.json({ success: true, message: "Database reset/reseeded successfully." });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 9. EXPORTS (CSV, JSON, Markdown plugin inventory)
  app.get("/api/export/:type", (req, res) => {
    try {
      const format = req.params.type;
      const plugins = db.getConsolidatedPlugins();

      if (format === "json") {
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Content-Disposition", "attachment; filename=vst_vault_inventory.json");
        return res.send(JSON.stringify(plugins, null, 2));
      }

      if (format === "csv") {
        let csv = "ID,Name,Vendor,Category,Favorite,Hidden,Formats,Install Paths,Notes\n";
        plugins.forEach(p => {
          const formatString = p.formats.map(f => f.format).join("; ");
          const pathString = p.formats.map(f => f.path).join("; ");
          const safeNote = p.notes ? p.notes.replace(/"/g, '""').replace(/\n/g, ' ') : "";
          csv += `"${p.id}","${p.name}","${p.vendor}","${p.category}","${p.is_favorite ? 'YES' : 'NO'}","${p.is_hidden ? 'YES' : 'NO'}","${formatString}","${pathString}","${safeNote}"\n`;
        });
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=vst_vault_inventory.csv");
        return res.send(csv);
      }

      if (format === "markdown") {
        let md = `# VST Vault Plugin Inventory\n`;
        md += `Generated on: ${new Date().toLocaleDateString()}\n`;
        md += `Total Plugins: ${plugins.length}\n\n`;
        md += `| Name | Vendor | Category | Formats | Favorite | Notes |\n`;
        md += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;
        
        plugins.forEach(p => {
          const fmts = p.formats.map(f => f.format).join(", ");
          const favStr = p.is_favorite ? "❤️" : "";
          const noteStr = p.notes || "";
          md += `| **${p.name}** | ${p.vendor} | ${p.category} | ${fmts} | ${favStr} | ${noteStr} |\n`;
        });

        res.setHeader("Content-Type", "text/markdown");
        res.setHeader("Content-Disposition", "attachment; filename=vst_vault_inventory.md");
        return res.send(md);
      }

      res.status(400).json({ success: false, error: "Unsupported backup export type." });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // 10. DATABASE SQL BACKUP EXPORT / RESTORE
  app.get("/api/backup/sqlite", (req, res) => {
    try {
      const sqlDump = db.generateSQLDump();
      res.setHeader("Content-Type", "application/sql");
      res.setHeader("Content-Disposition", "attachment; filename=vst_vault_sqlite.sql");
      res.send(sqlDump);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/backup/restore", (req, res) => {
    try {
      const { sql } = req.body;
      if (!sql) {
        return res.status(400).json({ success: false, error: "Empty SQLite dump string provided." });
      }
      const success = db.importSQLDump(sql);
      if (success) {
        res.json({ success: true, message: "SQLite database backup successfully restored." });
      } else {
        res.status(400).json({ success: false, error: "Failed to parse standard SQLite backup statements." });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[VST Vault Backend] Server running on http://localhost:${PORT}`);
  });
}

startServer();
