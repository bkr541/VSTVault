import fs from "fs";
import path from "path";
import { PluginCategory, PluginFormatType, PluginEntry, PluginFormatEntry } from "../src/types";
import { SQLiteSimulator } from "./db";

// Common VST roots for virtualized or real scan targets
export const VIRTUAL_VST_ROOT = path.join(process.cwd(), "virtual_vst_root");

// Automated Seeder to build realistic file tree for beautiful dashboard demo
export function seedVirtualVSTs() {
  if (fs.existsSync(VIRTUAL_VST_ROOT)) {
    return; // Already populated
  }

  console.log("Seeding virtual VST path elements for scanning...");
  try {
    fs.mkdirSync(VIRTUAL_VST_ROOT, { recursive: true });

    // Let's model common OS folders inside virtual directory
    const directoriesToCreate = [
      // macOS simulated path segments
      "macOS_Library/Audio/Plug-Ins/VST",
      "macOS_Library/Audio/Plug-Ins/VST3",
      "macOS_Library/Audio/Plug-Ins/Components",
      "macOS_User_Library/Audio/Plug-Ins/VST3",
      // Windows simulated path segments
      "Win_Program_Files/Common Files/VST3",
      "Win_Program_Files/VSTPlugins",
      "Win_Program_Files/Common Files/Avid/Audio/Plug-Ins"
    ];

    directoriesToCreate.forEach(dir => {
      fs.mkdirSync(path.join(VIRTUAL_VST_ROOT, dir), { recursive: true });
    });

    interface SeedPlugin {
      name: string;
      vendor: string;
      category: PluginCategory;
      version: string;
      filename: string;
      formats: { type: PluginFormatType; dirKey: string }[];
    }

    const seeds: SeedPlugin[] = [
      {
        name: "Serum",
        vendor: "Xfer Records",
        category: PluginCategory.Synth,
        version: "1.35b1",
        filename: "Serum",
        formats: [
          { type: "VST2", dirKey: "macOS_Library/Audio/Plug-Ins/VST" },
          { type: "VST3", dirKey: "macOS_Library/Audio/Plug-Ins/VST3" },
          { type: "AU", dirKey: "macOS_Library/Audio/Plug-Ins/Components" },
          { type: "VST3", dirKey: "Win_Program_Files/Common Files/VST3" }
        ]
      },
      {
        name: "ValhallaDelay",
        vendor: "Valhalla DSP",
        category: PluginCategory.Delay,
        version: "2.5.0",
        filename: "ValhallaDelay",
        formats: [
          { type: "VST3", dirKey: "macOS_Library/Audio/Plug-Ins/VST3" },
          { type: "AU", dirKey: "macOS_Library/Audio/Plug-Ins/Components" },
          { type: "VST3", dirKey: "Win_Program_Files/Common Files/VST3" }
        ]
      },
      {
        name: "ValhallaRoom",
        vendor: "Valhalla DSP",
        category: PluginCategory.Reverb,
        version: "1.6.2",
        filename: "ValhallaRoom",
        formats: [
          { type: "VST2", dirKey: "macOS_Library/Audio/Plug-Ins/VST" },
          { type: "VST3", dirKey: "macOS_Library/Audio/Plug-Ins/VST3" },
          { type: "AU", dirKey: "macOS_Library/Audio/Plug-Ins/Components" }
        ]
      },
      {
        name: "Pro-Q 3",
        vendor: "FabFilter",
        category: PluginCategory.EQ,
        version: "3.24",
        filename: "FabFilter Pro-Q 3",
        formats: [
          { type: "VST3", dirKey: "macOS_Library/Audio/Plug-Ins/VST3" },
          { type: "AU", dirKey: "macOS_Library/Audio/Plug-Ins/Components" },
          { type: "VST3", dirKey: "Win_Program_Files/Common Files/VST3" },
          { type: "AAX", dirKey: "Win_Program_Files/Common Files/Avid/Audio/Plug-Ins" }
        ]
      },
      {
        name: "Pro-C 2",
        vendor: "FabFilter",
        category: PluginCategory.Compressor,
        version: "2.18",
        filename: "FabFilter Pro-C 2",
        formats: [
          { type: "VST3", dirKey: "macOS_Library/Audio/Plug-Ins/VST3" },
          { type: "AU", dirKey: "macOS_Library/Audio/Plug-Ins/Components" }
        ]
      },
      {
        name: "Pro-L 2",
        vendor: "FabFilter",
        category: PluginCategory.Limiter,
        version: "2.12",
        filename: "FabFilter Pro-L 2",
        formats: [
          { type: "VST3", dirKey: "macOS_Library/Audio/Plug-Ins/VST3" },
          { type: "AU", dirKey: "macOS_Library/Audio/Plug-Ins/Components" }
        ]
      },
      {
        name: "Kontakt 7",
        vendor: "Native Instruments",
        category: PluginCategory.Sampler,
        version: "7.10.2",
        filename: "Kontakt",
        formats: [
          { type: "VST2", dirKey: "Win_Program_Files/VSTPlugins" },
          { type: "VST3", dirKey: "Win_Program_Files/Common Files/VST3" },
          { type: "AU", dirKey: "macOS_Library/Audio/Plug-Ins/Components" }
        ]
      },
      {
        name: "Battery 4",
        vendor: "Native Instruments",
        category: PluginCategory.DrumMachine,
        version: "4.3.0",
        filename: "Battery 4",
        formats: [
          { type: "VST2", dirKey: "Win_Program_Files/VSTPlugins" },
          { type: "AU", dirKey: "macOS_Library/Audio/Plug-Ins/Components" }
        ]
      },
      {
        name: "Massive X",
        vendor: "Native Instruments",
        category: PluginCategory.Synth,
        version: "1.4.3",
        filename: "Massive X",
        formats: [
          { type: "VST3", dirKey: "macOS_Library/Audio/Plug-Ins/VST3" }
        ]
      },
      {
        name: "Decapitator",
        vendor: "Soundtoys",
        category: PluginCategory.Distortion,
        version: "5.3.7",
        filename: "Decapitator",
        formats: [
          { type: "VST2", dirKey: "macOS_Library/Audio/Plug-Ins/VST" },
          { type: "AU", dirKey: "macOS_Library/Audio/Plug-Ins/Components" },
          { type: "AAX", dirKey: "Win_Program_Files/Common Files/Avid/Audio/Plug-Ins" }
        ]
      },
      {
        name: "MicroShift",
        vendor: "Soundtoys",
        category: PluginCategory.Modulation,
        version: "5.3.7",
        filename: "MicroShift",
        formats: [
          { type: "VST2", dirKey: "macOS_Library/Audio/Plug-Ins/VST" },
          { type: "AU", dirKey: "macOS_Library/Audio/Plug-Ins/Components" }
        ]
      },
      {
        name: "Utility Gain",
        vendor: "VaultTools",
        category: PluginCategory.Utility,
        version: "1.0.0",
        filename: "UtilityGain",
        formats: [
          { type: "VST3", dirKey: "macOS_Library/Audio/Plug-Ins/VST3" }
        ]
      },
      {
        name: "SPAN Audio Analyzer",
        vendor: "Voxengo",
        category: PluginCategory.Analyzer,
        version: "3.15",
        filename: "SPAN",
        formats: [
          { type: "VST3", dirKey: "macOS_Library/Audio/Plug-Ins/VST3" },
          { type: "AU", dirKey: "macOS_Library/Audio/Plug-Ins/Components" }
        ]
      },
      {
        name: "Omnisphere",
        vendor: "Spectrasonics",
        category: PluginCategory.Synth,
        version: "2.8.5",
        filename: "Omnisphere",
        formats: [
          { type: "VST3", dirKey: "macOS_Library/Audio/Plug-Ins/VST3" },
          { type: "AU", dirKey: "macOS_Library/Audio/Plug-Ins/Components" }
        ]
      }
    ];

    seeds.forEach(s => {
      s.formats.forEach(form => {
        const ext = {
          VST2: ".vst",
          VST3: ".vst3",
          AU: ".component",
          AAX: ".aaxplugin"
        }[form.type];

        const targetFolder = path.join(VIRTUAL_VST_ROOT, form.dirKey, `${s.filename}${ext}`);
        fs.mkdirSync(targetFolder, { recursive: true });

        // Build a simulated bundle structure if helpful, specifically Info.plist for AU and VST
        if (form.type === "AU" || form.type === "VST3" || form.type === "VST2") {
          const contentsDir = path.join(targetFolder, "Contents");
          fs.mkdirSync(contentsDir, { recursive: true });

          const infoPlistPath = path.join(contentsDir, "Info.plist");
          const plistXML = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleName</key>
  <string>${s.name}</string>
  <key>CFBundleIdentifier</key>
  <string>com.${s.vendor.toLowerCase().replace(/\s+/g, "")}.${s.name.toLowerCase()}</string>
  <key>CFBundleShortVersionString</key>
  <string>${s.version}</string>
  <key>CFBundleManufacturer</key>
  <string>${s.vendor}</string>
  <key>VSTPluginCategory</key>
  <string>${s.category}</string>
  <key>PluginArchitecture</key>
  <string>Universal (arm64/x64)</string>
</dict>
</plist>`;
          fs.writeFileSync(infoPlistPath, plistXML, "utf-8");
        } else {
          // Just write meta manifest file for AAX/Windows paths
          fs.writeFileSync(path.join(targetFolder, "plugin-manifest.txt"), `PluginName: ${s.name}\nVendor: ${s.vendor}\nVersion: ${s.version}\nCategory: ${s.category}\nArch: x64\n`, "utf-8");
        }
      });
    });

    console.log("Virtual VST database seed directory successfully loaded with bundle frameworks.");
  } catch (err) {
    console.error("Failed to seed virtual VST files:", err);
  }
}

// Map real system directories to virtual directories for demonstration scans
export function mapToVirtualPath(p: string): string {
  // If the directory doesn't exist on host, but is one of our default ones, map to the seeded environment folder
  if (!fs.existsSync(p)) {
    const rootName = path.basename(p);
    if (p.includes("/Library/Audio/Plug-Ins/VST3") || p.includes("VST3")) {
      return path.join(VIRTUAL_VST_ROOT, "macOS_Library/Audio/Plug-Ins/VST3");
    }
    if (p.includes("/Library/Audio/Plug-Ins/VST")) {
      return path.join(VIRTUAL_VST_ROOT, "macOS_Library/Audio/Plug-Ins/VST");
    }
    if (p.includes("/Library/Audio/Plug-Ins/Components")) {
      return path.join(VIRTUAL_VST_ROOT, "macOS_Library/Audio/Plug-Ins/Components");
    }
    if (p.includes("Avid/Audio/Plug-Ins") || p.includes("Avid")) {
      return path.join(VIRTUAL_VST_ROOT, "Win_Program_Files/Common Files/Avid/Audio/Plug-Ins");
    }
    if (p.includes("VSTPlugins")) {
      return path.join(VIRTUAL_VST_ROOT, "Win_Program_Files/VSTPlugins");
    }
    if (p.includes("Common Files/VST3") || p.includes("Common Files/VST3")) {
      return path.join(VIRTUAL_VST_ROOT, "Win_Program_Files/Common Files/VST3");
    }
  }
  return p;
}

// Automated Category Guesser based on rules
export function guessCategory(pluginName: string): PluginCategory {
  const norm = pluginName.toLowerCase();

  const rules: { keys: string[]; category: PluginCategory }[] = [
    { keys: ["reverb", "valhalla", "room", "plate", "hall", "shimmer", "spacing", "ambience"], category: PluginCategory.Reverb },
    { keys: ["compressor", "comp", "press", "dynamics", "cla-", "vca", "fet", "opto"], category: PluginCategory.Compressor },
    { keys: ["limiter", "limit", "maximizer", "l1", "l2", "inflator"], category: PluginCategory.Limiter },
    { keys: ["eq", "equalizer", "filter", "pro-q", "parametric", "tilt", "shelf"], category: PluginCategory.EQ },
    { keys: ["synth", "serum", "massive", "vital", "oscillator", "generator", "nexus", "sylenth", "fm8", "sub", "synth", "pigments"], category: PluginCategory.Synth },
    { keys: ["sampler", "kontakt", "decimator", "sample", "play", "omnisphere"], category: PluginCategory.Sampler },
    { keys: ["drum", "beat", "kick", "snare", "drummer", "battery", "cymbals", "percussion"], category: PluginCategory.DrumMachine },
    { keys: ["delay", "echo", "repeater", "tape", "mod delay", "delay designer"], category: PluginCategory.Delay },
    { keys: ["dist", "distortion", "drive", "sat", "saturator", "fuzz", "amp", "overdrive", "decapitator", "trash", "smasher"], category: PluginCategory.Distortion },
    { keys: ["mod", "chorus", "flanger", "phaser", "tremolo", "vibrato", "rotary", "dimension", "microshift", "ensemble"], category: PluginCategory.Modulation },
    { keys: ["utility", "gain", "pan", "splitter", "matrix", "tool", "m/s", "phase align"], category: PluginCategory.Utility },
    { keys: ["analyzer", "analy", "meter", "scope", "visual", "span", "loudness", "goniometer", "tuner"], category: PluginCategory.Analyzer }
  ];

  for (const rule of rules) {
    if (rule.keys.some(k => norm.includes(k))) {
      return rule.category;
    }
  }

  return PluginCategory.Unknown;
}

// Read and parse plist from bundle
function parseInfoPlist(plistPath: string): { name?: string; vendor?: string; version?: string; arch?: string } {
  try {
    if (!fs.existsSync(plistPath)) return {};
    const content = fs.readFileSync(plistPath, "utf-8");

    const getVal = (key: string): string | undefined => {
      const regex = new RegExp(`<key>${key}<\/key>\\s*<string>([^<]+)<\/string>`, "i");
      const m = content.match(regex);
      return m ? m[1] : undefined;
    };

    return {
      name: getVal("CFBundleName") || getVal("CFBundleExecutable"),
      vendor: getVal("CFBundleManufacturer") || getVal("CFBundleShortVersionString") ? "Imported Vendor" : undefined,
      version: getVal("CFBundleShortVersionString") || getVal("CFBundleVersion"),
      arch: getVal("PluginArchitecture") || "Universal"
    };
  } catch (err) {
    console.error("Failed to parse Info.plist", err);
    return {};
  }
}

// Perform Recursive Filesystem Scanner WITHOUT executing binary bundles
export interface ScanResult {
  discovered: number;
  added: number;
  warnings: string[];
}

export function runRecursiveScan(
  folders: string[], 
  db: SQLiteSimulator, 
  mode: "Quick Scan" | "Full Rescan" | "Custom Scan"
): ScanResult {
  console.log(`Starting scan [${mode}] across folders:`, folders);
  const result: ScanResult = {
    discovered: 0,
    added: 0,
    warnings: []
  };

  if (mode === "Full Rescan") {
    db.clearPluginsAndScanHistory();
  }

  // To deduplicate plugins, load existing plugins first to merge formats
  const existingPlugins = db.getConsolidatedPlugins();

  interface PendingFormat {
    name: string;
    vendor: string;
    format: PluginFormatType;
    path: string;
    version: string | null;
    architecture: string | null;
  }

  const pendingFormats: PendingFormat[] = [];

  const visitDirectory = (currentPath: string) => {
    try {
      if (!fs.existsSync(currentPath)) {
        return; // Folders that don't exist are silently skipped or warning logged
      }

      const stats = fs.statSync(currentPath);
      if (!stats.isDirectory()) return;

      const files = fs.readdirSync(currentPath);

      for (const file of files) {
        const fullFilePath = path.join(currentPath, file);
        let stat: fs.Stats;
        try {
          stat = fs.statSync(fullFilePath);
        } catch (e) {
          result.warnings.push(`Skip unreadable item: ${fullFilePath}`);
          continue; // safe error handling: skip unreadable folders
        }

        const ext = path.extname(file).toLowerCase();

        // 1. Check if folder represents an audio plugin bundle
        const isVST2 = ext === ".vst";
        const isVST3 = ext === ".vst3";
        const isAU = ext === ".component" || ext === ".au";
        const isAAX = ext === ".aaxplugin" || ext === ".aax";

        if ((isVST2 || isVST3 || isAU || isAAX) && stat.isDirectory()) {
          result.discovered++;
          const formatType: PluginFormatType = isVST2 ? "VST2" : isVST3 ? "VST3" : isAU ? "AU" : "AAX";

          // Try parsing plist if macOS bundle style
          let name = path.basename(file, ext);
          let vendor = "Unknown Vendor";
          let version: string | null = null;
          let architecture: string | null = formatType === "AAX" ? "x64" : "Universal";

          const plistPath = path.join(fullFilePath, "Contents", "Info.plist");
          if (fs.existsSync(plistPath)) {
            const plistInfo = parseInfoPlist(plistPath);
            if (plistInfo.name) name = plistInfo.name;
            if (plistInfo.vendor) {
              vendor = plistInfo.vendor;
            } else {
              // Guess vendor from bundle identifier or folders
              if (fullFilePath.toLowerCase().includes("valhalla")) vendor = "Valhalla DSP";
              else if (fullFilePath.toLowerCase().includes("fabfilter")) vendor = "FabFilter";
              else if (fullFilePath.toLowerCase().includes("xfer")) vendor = "Xfer Records";
              else if (fullFilePath.toLowerCase().includes("native instruments")) vendor = "Native Instruments";
              else if (fullFilePath.toLowerCase().includes("soundtoys")) vendor = "Soundtoys";
              else if (fullFilePath.toLowerCase().includes("voxengo")) vendor = "Voxengo";
            }
            if (plistInfo.version) version = plistInfo.version;
            if (plistInfo.arch) architecture = plistInfo.arch;
          } else {
            // Check Windows-style manifest helper inside bundle
            const manifestPath = path.join(fullFilePath, "plugin-manifest.txt");
            if (fs.existsSync(manifestPath)) {
              try {
                const lines = fs.readFileSync(manifestPath, "utf-8").split("\n");
                lines.forEach(l => {
                  if (l.startsWith("PluginName:")) name = l.replace("PluginName:", "").trim();
                  if (l.startsWith("Vendor:")) vendor = l.replace("Vendor:", "").trim();
                  if (l.startsWith("Version:")) version = l.replace("Version:", "").trim();
                  if (l.startsWith("Arch:")) architecture = l.replace("Arch:", "").trim();
                });
              } catch (e) {}
            } else {
              // Guess vendor from path structure
              if (fullFilePath.toLowerCase().includes("valhalla")) vendor = "Valhalla DSP";
              else if (fullFilePath.toLowerCase().includes("fabfilter")) vendor = "FabFilter";
              else if (fullFilePath.toLowerCase().includes("xfer")) vendor = "Xfer Records";
              else if (fullFilePath.toLowerCase().includes("native instruments")) vendor = "Native Instruments";
              else if (fullFilePath.toLowerCase().includes("soundtoys")) vendor = "Soundtoys";
              else if (fullFilePath.toLowerCase().includes("voxengo")) vendor = "Voxengo";
            }
          }

          pendingFormats.push({
            name,
            vendor,
            format: formatType,
            path: fullFilePath,
            version,
            architecture
          });

        } else if (stat.isDirectory()) {
          // If just a regular folder, recurse if we are not already inside a plugin bundle
          const isNestedPlugin = currentPath.endsWith(".vst") || currentPath.endsWith(".vst3") || currentPath.endsWith(".component") || currentPath.endsWith(".aaxplugin");
          if (!isNestedPlugin) {
            visitDirectory(fullFilePath);
          }
        }
      }
    } catch (e) {
      result.warnings.push(`Failed scanning path elements in ${currentPath}: ${String(e)}`);
    }
  };

  // Run the recursive scan across all folders
  folders.forEach(rawPath => {
    // Map to virtual directory so user gets simulated plugins on workspace files
    const targetPath = mapToVirtualPath(rawPath);
    if (fs.existsSync(targetPath)) {
      visitDirectory(targetPath);
    } else {
      result.warnings.push(`Folder not found: ${rawPath}`);
    }
  });

  // Now, merge and deduplicate pending formats into high-level plugins!
  const dbPlugins = db.getPlugins();
  const dbFormats = db.getPluginFormats();

  pendingFormats.forEach(pf => {
    // Determine unique name/vendor mapping
    // Case insensitive deduplication across formats
    let matchedPlugin = dbPlugins.find(p => 
      p.name.toLowerCase() === pf.name.toLowerCase() && 
      p.vendor.toLowerCase() === pf.vendor.toLowerCase()
    );

    let pluginId: string;

    if (!matchedPlugin) {
      // Create new plugin entry
      pluginId = "plugin_" + Math.random().toString(36).substring(2, 9);
      
      const newPlugin: PluginEntry = {
        id: pluginId,
        name: pf.name,
        vendor: pf.vendor,
        category: guessCategory(pf.name),
        is_favorite: false,
        is_hidden: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      dbPlugins.push(newPlugin);
      matchedPlugin = newPlugin;
      result.added++;
    } else {
      pluginId = matchedPlugin.id;
    }

    // Check if format already registered for this plugin
    const formatExists = dbFormats.some(f => 
       f.plugin_id === pluginId && 
       f.format === pf.format && 
       f.path.toLowerCase() === pf.path.toLowerCase()
    );

    if (!formatExists) {
      const isLoadableOutside = pf.format !== "AAX";

      const newFormat: PluginFormatEntry = {
        id: "format_" + Math.random().toString(36).substring(2, 9),
        plugin_id: pluginId,
        format: pf.format,
        path: pf.path,
        version: pf.version,
        architecture: pf.architecture,
        is_loadable_outside: isLoadableOutside,
        last_scanned: new Date().toISOString()
      };

      dbFormats.push(newFormat);
    }
  });

  db.save();

  return result;
}
