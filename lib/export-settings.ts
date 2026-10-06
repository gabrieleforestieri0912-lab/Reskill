/** Impostazioni export Markdown condivise tra web ed estensione. */

export const DEFAULT_EXPORT_PATH = "reskill";
export const DEFAULT_EXPORT_FOLDER = "youtube-skills";

export interface ExportSettings {
  /** Percorso base (prefisso) dove salvare i file, es. "reskill" */
  exportPath: string;
  /** Nome cartella dedicata agli export YouTube, es. "youtube-skills" */
  exportFolder: string;
}

export function sanitizePathSegment(s: string, fallback: string): string {
  const cleaned = (s || "")
    .trim()
    .replace(/\\/g, "/")
    .replace(/\.\./g, "")
    .replace(/[^a-zA-Z0-9_\-/ ]/g, "")
    .replace(/\s+/g, "-")
    .replace(/\/+/g, "/")
    .replace(/^\/+|\/+$/g, "");
  return cleaned || fallback;
}

/** Costruisce il filename completo: `<path>/<folder>/<base>.md` */
export function buildExportFilename(
  baseName: string,
  settings: Partial<ExportSettings>
): string {
  const path = sanitizePathSegment(
    settings.exportPath ?? DEFAULT_EXPORT_PATH,
    DEFAULT_EXPORT_PATH
  );
  const folder = sanitizePathSegment(
    settings.exportFolder ?? DEFAULT_EXPORT_FOLDER,
    DEFAULT_EXPORT_FOLDER
  );
  const base = (baseName || "export")
    .replace(/[^a-zA-Z0-9_\-\s]/g, "")
    .trim()
    .substring(0, 60) || "export";
  return `${path}/${folder}/${base}.md`;
}

/** Legge le impostazioni da localStorage (web). */
export function loadExportSettingsWeb(): ExportSettings {
  if (typeof window === "undefined") {
    return { exportPath: DEFAULT_EXPORT_PATH, exportFolder: DEFAULT_EXPORT_FOLDER };
  }
  try {
    const raw = localStorage.getItem("reskill_export_settings");
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        exportPath: sanitizePathSegment(
          parsed.exportPath || DEFAULT_EXPORT_PATH,
          DEFAULT_EXPORT_PATH
        ),
        exportFolder: sanitizePathSegment(
          parsed.exportFolder || DEFAULT_EXPORT_FOLDER,
          DEFAULT_EXPORT_FOLDER
        ),
      };
    }
  } catch { /* fallback */ }
  return { exportPath: DEFAULT_EXPORT_PATH, exportFolder: DEFAULT_EXPORT_FOLDER };
}

export function saveExportSettingsWeb(s: ExportSettings) {
  try {
    localStorage.setItem("reskill_export_settings", JSON.stringify(s));
  } catch { /* ignore */ }
}
