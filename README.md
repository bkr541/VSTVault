# VST Vault 🎹

VST Vault is a high-fidelity, local-first catalog and indexer designed to organize, merge, filter, and inspect your digital audio unit formats (VST, VST3, AU, AAX) on Windows, macOS, or custom studio paths.

The UI resembles a clean, enterprise music workstation dashboard combining **Notion**, **Stripe Dashboard**, and **Ableton Live** structural typography, using spacious padding, a pure white-and-gray color scheme (#F7F8FA), and deep teal accents (#0F5B59).

---

## 🚀 Key Functional Features

1. **Structured Folder Scanning**: Crawls standard paths (e.g. `/Library/Audio/...` on macOS, `C:\Program Files\Common Files\VST3` on Windows) and registers custom folders. Safe handling ignores unreadable directories and logs them as harmless report warnings.
2. **True Format Deduplication**: Identifies identical plugins across formats (e.g. `Serum.vst` + `Serum.vst3` + `Serum.component`) and aggregates them into a single consolidated row detailing version profiles and installed architectures.
3. **Automated Keyword Categorization**: Uses name triggers (e.g., matching "reverb", "valhalla" to *Reverb*; "comp", "limiter" to *Dynamics*) to classify plugins instantly into 13 high-fidelity categories.
4. **Relational Database Storage**: Persists data in 7 custom simulated SQLite relational tables (`plugins`, `plugin_formats`, `scan_folders`, `tags`, `plugin_tags`, `notes`, `scan_history`).
5. **Standard SQL Backup Import & Export**: Users can download a `.sql` file containing sequential SQLite command statements (`CREATE TABLE`, `INSERT INTO`) or paste a dump file to fully restore states.
6. **Polished Metadata Inspector**: Allows real-time classification edits, note logging, custom tag management, favorites toggles, and item archiving (hiding).
7. **Multi-Format Exports**: Downloads real-time listings of active grids as standard CSV spreadsheets, consolidated JSON arrays, or beautifully-styled Markdown lists.

---

## 💾 Relational Database Tables List

*   **`plugins`**: Primary unique catalog names, vendors, and category guesses.
*   **`plugin_formats`**: Extensions, versions, CPU architectures, and platform compatibility flags.
*   **`scan_folders`**: Configured disk paths directories.
*   **`tags`**: Unique user label glossary.
*   **`plugin_tags`**: Joins plugins and tags under full relational guidelines.
*   **`notes`**: Saves text logs.
*   **`scan_history`**: Scans dates, mode types, discovered totals, and error histories.

---

## 🛠️ Development Setup & Scripts

Initialize the package scripts and boot the fully integrated custom server engine:

```bash
# Install core workspace items
npm install

# Run Vite + Express server on port 3000
npm run dev

# Bundle React Client and Server-side elements
npm run build

# Start Standalone Production Bundle File
npm run start
```
