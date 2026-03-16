// ==UserScript==
// @name              zen-sidebar-expand-on-hover
// @namespace         https://github.com/L-Wehmschulte/zen-sidebar-expand-on-hover
// @version           1.0.0
// @description       A userscript template with a modern development setup using TypeScript, Rollup, and Express for local testing.
// @homepageURL       https://github.com/L-Wehmschulte/zen-sidebar-expand-on-hover#readme
// @supportURL        https://github.com/L-Wehmschulte/zen-sidebar-expand-on-hover/issues
// @license           WTFPL
// @author            L. Wehmschulte
// @copyright         L. Wehmschulte (https://github.com/L-Wehmschulte)
// @icon              https://raw.githubusercontent.com/L-Wehmschulte/zen-sidebar-expand-on-hover/main/assets/images/logo_48.png?b=fc14988
// @match             https://lwehmschulte.de
// @run-at            document-start
// @downloadURL       https://raw.githubusercontent.com/L-Wehmschulte/zen-sidebar-expand-on-hover/refs/main/dist/zen-sidebar-expand-on-hover.user.js
// @updateURL         https://raw.githubusercontent.com/L-Wehmschulte/zen-sidebar-expand-on-hover/refs/main/dist/zen-sidebar-expand-on-hover.user.js
// @connect           github.com
// @connect           raw.githubusercontent.com
// @noframes
// @resource          img-icon      https://raw.githubusercontent.com/L-Wehmschulte/zen-sidebar-expand-on-hover/main/assets/images/icon.png?b=fc14988
// @resource          doc-changelog https://raw.githubusercontent.com/L-Wehmschulte/zen-sidebar-expand-on-hover/main/CHANGELOG.md?b=fc14988
// ==/UserScript==

(function () {
    'use strict';

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise, SuppressedError, Symbol */


    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    class StateMachine {
        constructor(initialState, transitions) {
            Object.defineProperty(this, "initialized", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: false
            });
            Object.defineProperty(this, "state", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            Object.defineProperty(this, "transitions", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            this.state = initialState;
            this.transitions = transitions;
        }
        getState() {
            return this.state;
        }
        init() {
            var _a, _b;
            if (this.initialized) {
                console.warn("State machine is already initialized");
                return;
            }
            this.initialized = true;
            console.info(`Initializing state machine in state ${this.state}...`);
            (_b = (_a = this.transitions[this.state]).onEnter) === null || _b === void 0 ? void 0 : _b.call(_a);
        }
        transition(toState) {
            var _a;
            const currentState = this.state;
            const transition = this.transitions[currentState][toState];
            if (!transition) {
                console.warn(`Invalid transition from ${currentState} to ${toState}`);
                return;
            }
            const onExit = this.transitions[currentState].onExit;
            const onEnter = this.transitions[toState].onEnter;
            console.debug(`Leaving state ${currentState}...`);
            onExit === null || onExit === void 0 ? void 0 : onExit();
            console.debug(`Transitioning from ${currentState} to ${toState}`);
            (_a = transition.transition) === null || _a === void 0 ? void 0 : _a.call(transition);
            this.state = toState;
            console.debug(`Entering state ${toState}...`);
            onEnter === null || onEnter === void 0 ? void 0 : onEnter();
        }
    }

    const Services = window.Services || {};
    const DEFAULTS = {
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

    //#region DOM utils
    let domLoaded = document.readyState === "complete" || document.readyState === "interactive";
    document.addEventListener("DOMContentLoaded", () => domLoaded = true);
    function getPrefs() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
        const CHECK_INTERVAL = (_c = (_b = (_a = Services.prefs) === null || _a === void 0 ? void 0 : _a.getIntPref) === null || _b === void 0 ? void 0 : _b.call(_a, "de.lwehmschulte.sidebar.check_interval", DEFAULTS.check_interval)) !== null && _c !== void 0 ? _c : DEFAULTS.check_interval;
        const REQUIRED_SLOW_TIME = (_f = (_e = (_d = Services.prefs) === null || _d === void 0 ? void 0 : _d.getIntPref) === null || _e === void 0 ? void 0 : _e.call(_d, "de.lwehmschulte.sidebar.required_slow_time", DEFAULTS.required_slow_time)) !== null && _f !== void 0 ? _f : DEFAULTS.required_slow_time;
        const COLLAPSE_DELAY = (_j = (_h = (_g = Services.prefs) === null || _g === void 0 ? void 0 : _g.getIntPref) === null || _h === void 0 ? void 0 : _h.call(_g, "de.lwehmschulte.sidebar.collapse_delay", DEFAULTS.collapse_delay)) !== null && _j !== void 0 ? _j : DEFAULTS.collapse_delay;
        const CONTEXT_MENU_POPUP_IDS = (_m = (_l = (_k = Services.prefs) === null || _k === void 0 ? void 0 : _k.getCharPref) === null || _l === void 0 ? void 0 : _l.call(_k, "de.lwehmschulte.sidebar.context_menu_popup_ids", DEFAULTS.context_menu_popup_ids)) !== null && _m !== void 0 ? _m : DEFAULTS.context_menu_popup_ids;
        const CONTEXT_MENU_CLOSED_REENTER_TIMEOUT = (_q = (_p = (_o = Services.prefs) === null || _o === void 0 ? void 0 : _o.getIntPref) === null || _p === void 0 ? void 0 : _p.call(_o, "de.lwehmschulte.sidebar.context_menu_closed_reenter_timeout", 1000)) !== null && _q !== void 0 ? _q : 1000;
        const SPEED_THRESHOLD = parseFloat((_t = (_s = (_r = Services.prefs) === null || _r === void 0 ? void 0 : _r.getCharPref) === null || _s === void 0 ? void 0 : _s.call(_r, "de.lwehmschulte.sidebar.speed_threshold", DEFAULTS.speed_threshold.toString())) !== null && _t !== void 0 ? _t : DEFAULTS.speed_threshold.toString());
        return { CHECK_INTERVAL, SPEED_THRESHOLD, REQUIRED_SLOW_TIME, COLLAPSE_DELAY, CONTEXT_MENU_POPUP_IDS, CONTEXT_MENU_CLOSED_REENTER_TIMEOUT };
    }

    function getAllowedContextMenuPopupIds() {
        const { CONTEXT_MENU_POPUP_IDS } = getPrefs();
        return CONTEXT_MENU_POPUP_IDS.split(",")
            .map(id => id.trim())
            .filter(id => id.length > 0);
    }
    function isAllowedPopup(popup) {
        console.log("Checking if popup is allowed:", popup.id);
        const allowedPopupIds = getAllowedContextMenuPopupIds();
        return allowedPopupIds.includes(popup.id);
    }
    function handlePopupClosed(sidebar) {
        const { CONTEXT_MENU_CLOSED_REENTER_TIMEOUT } = getPrefs();
        if (sidebar.matches(":hover")) {
            return Promise.resolve(true);
        }
        return new Promise(function (resolve, _) {
            let reenterTimeout = null;
            function onMouseOver() {
                resolve(true);
                if (reenterTimeout) {
                    window.clearTimeout(reenterTimeout);
                    reenterTimeout = null;
                }
            }
            reenterTimeout = window.setTimeout(() => {
                resolve(false);
                sidebar.removeEventListener("mouseover", onMouseOver);
            }, CONTEXT_MENU_CLOSED_REENTER_TIMEOUT);
            sidebar.addEventListener("mouseover", onMouseOver, { once: true });
        });
    }

    class Tracking {
        constructor() {
            Object.defineProperty(this, "onHoverIntentDetectedCallback", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: null
            });
            Object.defineProperty(this, "onLeaveIntentDetectedCallback", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: null
            });
            Object.defineProperty(this, "leaveTimeout", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: null
            });
            Object.defineProperty(this, "trackingInterval", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: null
            });
            Object.defineProperty(this, "isTracking", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: false
            });
            Object.defineProperty(this, "lastX", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: 0
            });
            Object.defineProperty(this, "lastY", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: 0
            });
            Object.defineProperty(this, "currentX", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: 0
            });
            Object.defineProperty(this, "currentY", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: 0
            });
            Object.defineProperty(this, "lastTime", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: 0
            });
            Object.defineProperty(this, "slowTime", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: 0
            });
            Object.defineProperty(this, "interval", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: 0
            });
            this.mouseEnterWhileCollaped = this.mouseEnterWhileCollaped.bind(this);
            this.mouseLeaveWhileCollapsed = this.mouseLeaveWhileCollapsed.bind(this);
            this.mouseMove = this.mouseMove.bind(this);
            this.mouseDown = this.mouseDown.bind(this);
            this.mouseEnterWhileExpanded = this.mouseEnterWhileExpanded.bind(this);
            this.mouseLeaveWhileExpanded = this.mouseLeaveWhileExpanded.bind(this);
        }
        mouseEnterWhileCollaped(e) {
            console.debug("Mouse entered while collapsed");
            const { CHECK_INTERVAL, SPEED_THRESHOLD, REQUIRED_SLOW_TIME } = getPrefs();
            this.isTracking = true;
            this.lastX = e.clientX;
            this.lastY = e.clientY;
            this.lastTime = Date.now();
            this.slowTime = 0;
            this.trackingInterval = window.setInterval(() => {
                var _a;
                if (!this.isTracking) {
                    return;
                }
                const now = Date.now();
                const dt = now - this.lastTime;
                if (dt <= 0)
                    return;
                const dx = this.currentX - this.lastX;
                const dy = this.currentY - this.lastY;
                const speed = Math.sqrt(dx * dx + dy * dy) / dt;
                this.lastX = this.currentX;
                this.lastY = this.currentY;
                this.lastTime = now;
                if (speed < SPEED_THRESHOLD) {
                    this.slowTime += dt;
                    if (this.slowTime >= REQUIRED_SLOW_TIME) {
                        (_a = this.onHoverIntentDetectedCallback) === null || _a === void 0 ? void 0 : _a.call(this);
                    }
                }
                else {
                    this.slowTime = 0;
                }
            }, CHECK_INTERVAL);
        }
        mouseLeaveWhileCollapsed(_) {
            console.debug("Mouse left while collapsed");
            this.isTracking = false;
            if (this.trackingInterval) {
                window.clearInterval(this.trackingInterval);
                this.trackingInterval = null;
            }
        }
        mouseLeaveWhileExpanded(_) {
            const { COLLAPSE_DELAY } = getPrefs();
            this.leaveTimeout = window.setTimeout(() => {
                if (this.onLeaveIntentDetectedCallback) {
                    this.onLeaveIntentDetectedCallback();
                }
            }, COLLAPSE_DELAY);
        }
        mouseEnterWhileExpanded(_) {
            if (this.leaveTimeout) {
                window.clearTimeout(this.leaveTimeout);
                this.leaveTimeout = null;
            }
        }
        mouseMove(e) {
            this.currentX = e.clientX;
            this.currentY = e.clientY;
        }
        mouseDown(_) {
            this.isTracking = false;
            if (this.trackingInterval) {
                window.clearInterval(this.trackingInterval);
                this.trackingInterval = null;
            }
        }
        startCheckingLeaveIntent(sidebar, onLeaveIntentDetected = null) {
            this.onLeaveIntentDetectedCallback = onLeaveIntentDetected;
            sidebar === null || sidebar === void 0 ? void 0 : sidebar.addEventListener("mouseleave", this.mouseLeaveWhileExpanded);
        }
        stopCheckingLeaveIntent(sidebar) {
            this.onLeaveIntentDetectedCallback = null;
            if (this.leaveTimeout) {
                window.clearTimeout(this.leaveTimeout);
                this.leaveTimeout = null;
            }
            sidebar === null || sidebar === void 0 ? void 0 : sidebar.removeEventListener("mouseleave", this.mouseLeaveWhileExpanded);
        }
        startCheckingHoverIntent(sidebar, onHoverIntentDetected = null) {
            this.onHoverIntentDetectedCallback = onHoverIntentDetected;
            sidebar === null || sidebar === void 0 ? void 0 : sidebar.addEventListener("mouseenter", this.mouseEnterWhileCollaped);
            sidebar === null || sidebar === void 0 ? void 0 : sidebar.addEventListener("mousemove", this.mouseMove);
            sidebar === null || sidebar === void 0 ? void 0 : sidebar.addEventListener("mousedown", this.mouseDown);
            sidebar === null || sidebar === void 0 ? void 0 : sidebar.addEventListener("mouseleave", this.mouseLeaveWhileCollapsed);
        }
        stopCheckingHoverIntent(sidebar) {
            this.onHoverIntentDetectedCallback = null;
            if (this.trackingInterval) {
                window.clearInterval(this.trackingInterval);
                this.trackingInterval = null;
            }
            sidebar === null || sidebar === void 0 ? void 0 : sidebar.removeEventListener("mouseenter", this.mouseEnterWhileCollaped);
            sidebar === null || sidebar === void 0 ? void 0 : sidebar.removeEventListener("mousemove", this.mouseMove);
            sidebar === null || sidebar === void 0 ? void 0 : sidebar.removeEventListener("mousedown", this.mouseDown);
            sidebar === null || sidebar === void 0 ? void 0 : sidebar.removeEventListener("mouseleave", this.mouseLeaveWhileCollapsed);
        }
    }

    /** Runs when the userscript is loaded initially */
    function init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (domLoaded)
                run();
            else
                document.addEventListener("DOMContentLoaded", run);
        });
    }
    let sidebar = null;
    const tracking = new Tracking();
    const stateMachine = new StateMachine("collapsed", {
        "collapsed": {
            onEnter: () => {
                Services.prefs.setBoolPref("zen.view.sidebar-expanded", false);
                if (sidebar) {
                    tracking.startCheckingHoverIntent(sidebar, () => stateMachine.transition("expanded"));
                }
            },
            onExit: () => {
                if (sidebar) {
                    tracking.stopCheckingHoverIntent(sidebar);
                }
            },
            "expanded": {},
        },
        "expanded": {
            onEnter: () => {
                Services.prefs.setBoolPref("zen.view.sidebar-expanded", true);
                window.addEventListener("popupshown", onPopupShown, true);
                if (sidebar) {
                    tracking.startCheckingLeaveIntent(sidebar, () => stateMachine.transition("collapsed"));
                }
            },
            onExit: () => {
                window.removeEventListener("popupshown", onPopupShown, true);
                if (sidebar) {
                    tracking.stopCheckingLeaveIntent(sidebar);
                }
            },
            "collapsed": {},
            "context-menu-open": {},
        },
        "context-menu-open": {
            onEnter: () => {
                if (sidebar) {
                    window.addEventListener("popuphidden", onPopupHidden, true);
                }
            },
            onExit: () => {
                window.removeEventListener("popuphidden", onPopupHidden, true);
            },
            "expanded": {},
            "collapsed": {},
        }
    });
    function onPopupShown(event) {
        const popup = event.target;
        if (isAllowedPopup(popup)) {
            console.debug("Allowed popup shown:", popup.id);
            stateMachine.transition("context-menu-open");
        }
    }
    function onPopupHidden(event) {
        const popup = event.target;
        if (isAllowedPopup(popup)) {
            console.debug("Allowed popup hidden:", popup.id);
            if (sidebar) {
                handlePopupClosed(sidebar)
                    .then(reentered => {
                    if (reentered) {
                        console.debug("Re-entered sidebar after popup closed, staying expanded");
                        stateMachine.transition("expanded");
                    }
                    else {
                        console.debug("Did not re-enter sidebar after popup closed, collapsing");
                        stateMachine.transition("collapsed");
                    }
                });
            }
        }
    }
    /** Runs after the DOM is available */
    function run() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.info("Initializing zen-sidebar-on-hover...");
                sidebar = document.getElementById("TabsToolbar");
                if (!sidebar) {
                    console.error("Could not find sidebar element");
                    return;
                }
                stateMachine.init();
            }
            catch (err) {
                console.error("Fatal error:", err);
                return;
            }
        });
    }
    init();

})();
