console.log("Sidebar hover module loaded");

// console.log("Starting sidebarHover")
// Services.obs.addObserver(function(window, topic, data) {
//     if (topic !== "browser-delayed-startup-finished") return;
    
//     let document = window.document;
//     let sidebar = document.getElementById("TabsToolbar");
//     if (!sidebar) return;
    
//     let tracking = false;
//     let expanded = false;
//     let suppressExpansion = false;
    
//     let lastX = 0;
//     let lastY = 0;
//     let lastTime = 0;
//     let slowTime = 0;
//     let interval = null;
//     let collapseTimer = null;
    
//     let currentX = 0;
//     let currentY = 0;
    
//     // Default values
//     const DEFAULTS = {
//         check_interval: 50,        // ms
//         speed_threshold: 0.10,     // px/ms
//         required_slow_time: 220,   // ms
//         collapse_delay: 100        // ms
//     };
    
//     // function ensurePrefs() {
//     //     // int prefs
//     //     ["check_interval", "required_slow_time", "collapse_delay"].forEach(name => {
//     //         let full = "de.lwehmschulte.sidebar." + name;
//     //         if (!Services.prefs.prefHasUserValue(full)) {
//     //             Services.prefs.setIntPref(full, DEFAULTS[name]);
//     //         }
//     //     });
        
//     //     // float pref stored as string
//     //     let fullFloat = "de.lwehmschulte.sidebar.speed_threshold";
//     //     if (!Services.prefs.prefHasUserValue(fullFloat)) {
//     //         Services.prefs.setCharPref(fullFloat, DEFAULTS.speed_threshold.toString());
//     //     }
//     // }
    
//     function getPrefs() {
//         // ensurePrefs();
        
//         const CHECK_INTERVAL = Services.prefs.getIntPref("de.lwehmschulte.sidebar.check_interval");
//         const REQUIRED_SLOW_TIME = Services.prefs.getIntPref("de.lwehmschulte.sidebar.required_slow_time");
//         const COLLAPSE_DELAY = Services.prefs.getIntPref("de.lwehmschulte.sidebar.collapse_delay");
        
//         const SPEED_THRESHOLD = parseFloat(
//             Services.prefs.getCharPref("de.lwehmschulte.sidebar.speed_threshold")
//         );
        
//         return { CHECK_INTERVAL, SPEED_THRESHOLD, REQUIRED_SLOW_TIME, COLLAPSE_DELAY };
//     }
    
//     function startTracking(e) {
//         const { CHECK_INTERVAL, SPEED_THRESHOLD, REQUIRED_SLOW_TIME } = getPrefs();
        
//         tracking = true;
//         expanded = false;
        
//         lastX = e.screenX;
//         lastY = e.screenY;
//         lastTime = Date.now();
//         slowTime = 0;
        
//         interval = window.setInterval(() => {
//             if (suppressExpansion) return;
//             if (!tracking) return;
            
//             let now = Date.now();
//             let dt = now - lastTime;
//             if (dt <= 0) return;
            
//             let dx = currentX - lastX;
//             let dy = currentY - lastY;
//             let speed = Math.sqrt(dx * dx + dy * dy) / dt;
            
//             lastX = currentX;
//             lastY = currentY;
//             lastTime = now;
            
//             if (speed < SPEED_THRESHOLD) {
//                 slowTime += dt;
                
//                 if (!expanded && slowTime >= REQUIRED_SLOW_TIME) {
//                     Services.prefs.setBoolPref("zen.view.sidebar-expanded", true);
//                     expanded = true;
//                 }
//             } else {
//                 slowTime = 0;
//             }
//         }, CHECK_INTERVAL);
//     }
    
//     function scheduleCollapse() {
//         const { COLLAPSE_DELAY } = getPrefs();
        
//         // Clear any previous collapse timer
//         if (collapseTimer) {
//             window.clearTimeout(collapseTimer);
//             collapseTimer = null;
//         }
        
//         // Schedule a fresh collapse
//         collapseTimer = window.setTimeout(() => {
//             if (expanded) {
//                 Services.prefs.setBoolPref("zen.view.sidebar-expanded", false);
//                 expanded = false;
//             }
//         }, COLLAPSE_DELAY);
//     }
    
//     function stopTracking() {
//         tracking = false;
//         slowTime = 0;
        
//         if (interval) {
//             window.clearInterval(interval);
//             interval = null;
//         }
        
//         // Delay collapse on leave
//         scheduleCollapse();
//     }
    
//     sidebar.addEventListener("mouseenter", (e) => {
//         suppressExpansion = false; // new hover session → allow expansion again
        
//         currentX = e.screenX;
//         currentY = e.screenY;
        
//         // Cancel pending collapse if re-entering
//         if (collapseTimer) {
//             window.clearTimeout(collapseTimer);
//             collapseTimer = null;
//         }
        
//         startTracking(e);
//     });
    
//     sidebar.addEventListener("mousemove", (e) => {
//         currentX = e.screenX;
//         currentY = e.screenY;
//     });
    
//     sidebar.addEventListener("mouseleave", stopTracking);
    
//     sidebar.addEventListener("mousedown", () => {
//         // User is interacting intentionally → never treat this as hover intent
//         suppressExpansion = true;
        
//         // Stop any running detection immediately
//         tracking = false;
//         slowTime = 0;
        
//         if (interval) {
//             window.clearInterval(interval);
//             interval = null;
//         }
//     });
    
// }, "browser-delayed-startup-finished");
