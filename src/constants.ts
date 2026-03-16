const modeRaw = "#{{MODE}}";
const branchRaw = "#{{BRANCH}}";


export const Services: any = (window as any).Services || {};

/** The mode in which the script was built (production or development) */
export const mode = (modeRaw.match(/^#{{.+}}$/) ? "production" : modeRaw) as "production" | "development";
/** The branch to use in various URLs that point to the GitHub repo */
export const branch = (branchRaw.match(/^#{{.+}}$/) ? "main" : branchRaw) as "main" | "develop";
/** Path to the GitHub repo in the format "User/Repo" */
export const repo = "L-Wehmschulte/zen-sidabar-expand-on-hover";
/** Which host the userscript was installed from */
export const host = "github";

/** Default compression format used throughout the entire script */
export const compressionFormat: CompressionFormat = "deflate-raw";

export const DEFAULTS = {
  check_interval: 50,
  speed_threshold: 0.1,
  required_slow_time: 220,
  collapse_delay: 400,
  context_menu_popup_ids: [
    "toolbar-context-menu",
    "tabContextMenu",
    "zenWorkspaceMoreActions",
    "downloadsPanel",
    "zenCreateNewPopup",
    "zenFolderActions"
  ].join(","),
};
