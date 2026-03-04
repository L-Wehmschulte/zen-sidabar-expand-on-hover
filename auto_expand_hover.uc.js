// ==UserScript==
// @name           Sidebar exand on hover
// @version        1.0.0
// @author         LWehmschulte
// @description    Expands the sidebar when hovering over it.
// @compatibility  Firefox 100+
// ==/UserScript==

(function () {
    function init() {
        console.log("Starting sidebarHover")

        let sidebar = document.getElementById("TabsToolbar");
        if (!sidebar) return;

        let tracking = false;
        let expanded = false;
        let suppressExpansion = false;

        let lastX = 0;
        let lastY = 0;
        let lastTime = 0;
        let slowTime = 0;
        let interval = null;
        let collapseTimer = null;
        let popupOpen = false;
        let popupListenersAttached = false;

        let currentX = 0;
        let currentY = 0;

        // Default values
        const DEFAULTS = {
            check_interval: 50,        // ms
            speed_threshold: 0.10,     // px/ms
            required_slow_time: 220,   // ms
            collapse_delay: 100,       // ms
            context_menu_popup_ids: "toolbar-context-menu,tabContextMenu,zenWorkspaceMoreActions,downloadsPanel,zenCreateNewPopup,zenFolderActions"
        };

        function getAllowedPopupIdSet() {
            const { CONTEXT_MENU_POPUP_IDS } = getPrefs();
            return new Set(
                (CONTEXT_MENU_POPUP_IDS || "")
                    .split(",")
                    .map(s => s.trim())
                    .filter(Boolean)
            );
        }

        function isAllowedPopup(popup) {
            console.log("Checking popup", popup);
            if (!popup) return false;
            const id = popup.id || "";
            if (!id) return false;

            const allowed = getAllowedPopupIdSet();
            return allowed.has(id);
        }

        function onPopupShown(e) {
            if (!isAllowedPopup(e.target)) return;
            popupOpen = true;

            if (collapseTimer) {
                window.clearTimeout(collapseTimer);
                collapseTimer = null;
            }
        }

        function onPopupHidden(e) {
            console.log("Popup hidden", e.target);
            if (!isAllowedPopup(e.target)) return;
            popupOpen = false;

            // If we're not hovered anymore, allow normal collapse scheduling now
            scheduleCollapse();
        }

        function attachPopupListeners() {
            console.log("Attaching popup listeners");
            if (popupListenersAttached) return;
            window.addEventListener("popupshown", onPopupShown, true);
            window.addEventListener("popuphidden", onPopupHidden, true);
            popupListenersAttached = true;
        }

        function detachPopupListeners() {
            console.log("Detaching popup listeners");
            if (!popupListenersAttached) return;
            window.removeEventListener("popupshown", onPopupShown, true);
            window.removeEventListener("popuphidden", onPopupHidden, true);
            popupListenersAttached = false;
            popupOpen = false; // reset
        }

        function getPrefs() {
            // ensurePrefs();

            const CHECK_INTERVAL = Services.prefs.getIntPref("de.lwehmschulte.sidebar.check_interval", DEFAULTS.check_interval);
            const REQUIRED_SLOW_TIME = Services.prefs.getIntPref("de.lwehmschulte.sidebar.required_slow_time", DEFAULTS.required_slow_time);
            const COLLAPSE_DELAY = Services.prefs.getIntPref("de.lwehmschulte.sidebar.collapse_delay", DEFAULTS.collapse_delay);
            const CONTEXT_MENU_POPUP_IDS = Services.prefs.getCharPref("de.lwehmschulte.sidebar.context_menu_popup_ids", DEFAULTS.context_menu_popup_ids);

            const SPEED_THRESHOLD = parseFloat(
                Services.prefs.getCharPref("de.lwehmschulte.sidebar.speed_threshold", DEFAULTS.speed_threshold.toString())
            );

            return { CHECK_INTERVAL, SPEED_THRESHOLD, REQUIRED_SLOW_TIME, COLLAPSE_DELAY, CONTEXT_MENU_POPUP_IDS };
        }

        function startTracking(e) {
            const { CHECK_INTERVAL, SPEED_THRESHOLD, REQUIRED_SLOW_TIME } = getPrefs();

            tracking = true;
            expanded = false;

            lastX = e.screenX;
            lastY = e.screenY;
            lastTime = Date.now();
            slowTime = 0;

            interval = window.setInterval(() => {
                if (suppressExpansion) return;
                if (!tracking) return;

                let now = Date.now();
                let dt = now - lastTime;
                if (dt <= 0) return;

                let dx = currentX - lastX;
                let dy = currentY - lastY;
                let speed = Math.sqrt(dx * dx + dy * dy) / dt;

                lastX = currentX;
                lastY = currentY;
                lastTime = now;

                if (speed < SPEED_THRESHOLD) {
                    slowTime += dt;

                    if (!expanded && slowTime >= REQUIRED_SLOW_TIME) {
                        Services.prefs.setBoolPref("zen.view.sidebar-expanded", true);
                        expanded = true;

                        attachPopupListeners();
                    }
                } else {
                    slowTime = 0;
                }
            }, CHECK_INTERVAL);
        }

        function scheduleCollapse() {
            const { COLLAPSE_DELAY } = getPrefs();

            // Clear any previous collapse timer
            if (collapseTimer) {
                window.clearTimeout(collapseTimer);
                collapseTimer = null;
            }

            // Schedule a fresh collapse
            collapseTimer = window.setTimeout(() => {
                if (expanded) {
                    if (popupOpen) return;
                    Services.prefs.setBoolPref("zen.view.sidebar-expanded", false);
                    expanded = false;
                    detachPopupListeners();
                }
            }, COLLAPSE_DELAY);
        }

        function stopTracking() {
            tracking = false;
            slowTime = 0;

            if (interval) {
                window.clearInterval(interval);
                interval = null;
            }

            // Delay collapse on leave
            scheduleCollapse();
        }

        sidebar.addEventListener("mouseenter", (e) => {
            suppressExpansion = false; // new hover session → allow expansion again

            currentX = e.screenX;
            currentY = e.screenY;

            // Cancel pending collapse if re-entering
            if (collapseTimer) {
                window.clearTimeout(collapseTimer);
                collapseTimer = null;
            }

            startTracking(e);
        });

        sidebar.addEventListener("mousemove", (e) => {
            currentX = e.screenX;
            currentY = e.screenY;
        });

        sidebar.addEventListener("mouseleave", stopTracking);

        sidebar.addEventListener("mousedown", () => {
            // User is interacting intentionally → never treat this as hover intent
            suppressExpansion = true;

            // Stop any running detection immediately
            tracking = false;
            slowTime = 0;

            if (interval) {
                window.clearInterval(interval);
                interval = null;
            }
        });
    }

    if (gBrowserInit?.delayedStartupFinished) {
        init();
    } else {
        const obs = (subject, topic) => {
            if (topic === 'browser-delayed-startup-finished' && subject === window) {
                Services.obs.removeObserver(obs, topic);
                init();
            }
        };

        Services.obs.addObserver(obs, 'browser-delayed-startup-finished');
    }
})();
