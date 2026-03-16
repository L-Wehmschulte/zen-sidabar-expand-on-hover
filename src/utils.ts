import { Services, DEFAULTS } from "./constants";

//#region DOM utils

export let domLoaded = document.readyState === "complete" || document.readyState === "interactive";
document.addEventListener("DOMContentLoaded", () => domLoaded = true);

export function getPrefs() {
  const CHECK_INTERVAL = Services.prefs?.getIntPref?.("de.lwehmschulte.sidebar.check_interval", DEFAULTS.check_interval) as number ?? DEFAULTS.check_interval;
  const REQUIRED_SLOW_TIME = Services.prefs?.getIntPref?.("de.lwehmschulte.sidebar.required_slow_time", DEFAULTS.required_slow_time) as number ?? DEFAULTS.required_slow_time;
  const COLLAPSE_DELAY = Services.prefs?.getIntPref?.("de.lwehmschulte.sidebar.collapse_delay", DEFAULTS.collapse_delay) as number ?? DEFAULTS.collapse_delay;
  const CONTEXT_MENU_POPUP_IDS = Services.prefs?.getCharPref?.("de.lwehmschulte.sidebar.context_menu_popup_ids", DEFAULTS.context_menu_popup_ids) as string ?? DEFAULTS.context_menu_popup_ids;
  const CONTEXT_MENU_CLOSED_REENTER_TIMEOUT = Services.prefs?.getIntPref?.("de.lwehmschulte.sidebar.context_menu_closed_reenter_timeout", 1000) as number ?? 1000;

  const SPEED_THRESHOLD = parseFloat(
    Services.prefs?.getCharPref?.("de.lwehmschulte.sidebar.speed_threshold", DEFAULTS.speed_threshold.toString()) ?? DEFAULTS.speed_threshold.toString()
  );

  return { CHECK_INTERVAL, SPEED_THRESHOLD, REQUIRED_SLOW_TIME, COLLAPSE_DELAY, CONTEXT_MENU_POPUP_IDS, CONTEXT_MENU_CLOSED_REENTER_TIMEOUT };
}
