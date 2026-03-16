import { StateMachine } from "./statemachine";
import { domLoaded } from "./utils";
import { handlePopupClosed, isAllowedPopup } from "./popup";
import { Tracking } from "./tracking";
import { Services } from "./constants";

/** Runs when the userscript is loaded initially */
async function init() {
  if (domLoaded)
    run();
  else
    document.addEventListener("DOMContentLoaded", run);
}

let sidebar: HTMLElement | null = null;

type State = "collapsed" | "expanded" | "context-menu-open";

const tracking = new Tracking();

const stateMachine = new StateMachine<State>("collapsed", {
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

function onPopupShown(event: Event) {
  const popup = event.target as HTMLElement;
  if (isAllowedPopup(popup)) {
    console.debug("Allowed popup shown:", popup.id);
    stateMachine.transition("context-menu-open");
  }
}

function onPopupHidden(event: Event) {
  const popup = event.target as HTMLElement;
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
async function run() {
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
}

init();
