import { getPrefs } from "./utils";

function getAllowedContextMenuPopupIds() {
  const { CONTEXT_MENU_POPUP_IDS } = getPrefs();
  return CONTEXT_MENU_POPUP_IDS.split(",")
    .map(id => id.trim())
    .filter(id => id.length > 0);
}

export function isAllowedPopup(popup: HTMLElement) {
  console.log("Checking if popup is allowed:", popup.id);
  const allowedPopupIds = getAllowedContextMenuPopupIds();
  return allowedPopupIds.includes(popup.id);
}

export function handlePopupClosed(sidebar: HTMLElement): Promise<boolean> {
  const { CONTEXT_MENU_CLOSED_REENTER_TIMEOUT } = getPrefs();

  if (sidebar.matches(":hover")) {
    return Promise.resolve(true);
  }

  return new Promise(function (resolve, _) {
    let reenterTimeout: number | null = null;

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
