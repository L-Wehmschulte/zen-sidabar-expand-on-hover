import { getPrefs } from "./utils";

export class Tracking {

  private onHoverIntentDetectedCallback: (() => void) | null = null;

  private onLeaveIntentDetectedCallback: (() => void) | null = null;

  private leaveTimeout: number | null = null;

  private trackingInterval: number | null = null;

  private isTracking = false;

  private lastX = 0;
  private lastY = 0;
  private currentX = 0;
  private currentY = 0;

  private lastTime = 0;
  private slowTime = 0;
  private interval = 0;

  constructor() {
    this.mouseEnterWhileCollaped = this.mouseEnterWhileCollaped.bind(this);
    this.mouseLeaveWhileCollapsed = this.mouseLeaveWhileCollapsed.bind(this);
    this.mouseMove = this.mouseMove.bind(this);
    this.mouseDown = this.mouseDown.bind(this);

    this.mouseEnterWhileExpanded = this.mouseEnterWhileExpanded.bind(this);
    this.mouseLeaveWhileExpanded = this.mouseLeaveWhileExpanded.bind(this);
  }

  mouseEnterWhileCollaped(e: MouseEvent) {
    console.debug("Mouse entered while collapsed");
    const { CHECK_INTERVAL, SPEED_THRESHOLD, REQUIRED_SLOW_TIME } = getPrefs();
    this.isTracking = true;

    this.lastX = e.clientX;
    this.lastY = e.clientY;
    this.lastTime = Date.now();
    this.slowTime = 0;

    this.trackingInterval = window.setInterval(() => {
      if (!this.isTracking) {
        return;
      }

      const now = Date.now();
      const dt = now - this.lastTime;
      if (dt <= 0) return;

      const dx = this.currentX - this.lastX;
      const dy = this.currentY - this.lastY;

      const speed = Math.sqrt(dx * dx + dy * dy) / dt;

      this.lastX = this.currentX;
      this.lastY = this.currentY;
      this.lastTime = now;

      if (speed < SPEED_THRESHOLD) {
        this.slowTime += dt;

        if (this.slowTime >= REQUIRED_SLOW_TIME) {
          this.onHoverIntentDetectedCallback?.();
        }
      }
      else {
        this.slowTime = 0;
      }
    }, CHECK_INTERVAL);
  }

  mouseLeaveWhileCollapsed(_: MouseEvent) {
    console.debug("Mouse left while collapsed");
    this.isTracking = false;
    if (this.trackingInterval) {
      window.clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }
  }

  mouseLeaveWhileExpanded(_: MouseEvent) {
    const { COLLAPSE_DELAY } = getPrefs();

    this.leaveTimeout = window.setTimeout(() => {
      if (this.onLeaveIntentDetectedCallback) {
        this.onLeaveIntentDetectedCallback();
      }
    }, COLLAPSE_DELAY);
  }

  mouseEnterWhileExpanded(_: MouseEvent) {
    if (this.leaveTimeout) {
      window.clearTimeout(this.leaveTimeout);
      this.leaveTimeout = null;
    }
  }

  mouseMove(e: MouseEvent) {
    this.currentX = e.clientX;
    this.currentY = e.clientY;
  }

  mouseDown(_: MouseEvent) {
    this.isTracking = false;
    if (this.trackingInterval) {
      window.clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }
  }

  startCheckingLeaveIntent(sidebar: HTMLElement, onLeaveIntentDetected: (() => void) | null = null) {
    this.onLeaveIntentDetectedCallback = onLeaveIntentDetected;
    sidebar?.addEventListener("mouseleave", this.mouseLeaveWhileExpanded);
  }

  stopCheckingLeaveIntent(sidebar: HTMLElement) {
    this.onLeaveIntentDetectedCallback = null;
    if (this.leaveTimeout) {
      window.clearTimeout(this.leaveTimeout!);
      this.leaveTimeout = null;
    }

    sidebar?.removeEventListener("mouseleave", this.mouseLeaveWhileExpanded);
  }

  startCheckingHoverIntent(sidebar: HTMLElement, onHoverIntentDetected: (() => void) | null = null) {
    this.onHoverIntentDetectedCallback = onHoverIntentDetected;
    sidebar?.addEventListener("mouseenter", this.mouseEnterWhileCollaped);
    sidebar?.addEventListener("mousemove", this.mouseMove);
    sidebar?.addEventListener("mousedown", this.mouseDown);
    sidebar?.addEventListener("mouseleave", this.mouseLeaveWhileCollapsed);
  }

  stopCheckingHoverIntent(sidebar: HTMLElement) {
    this.onHoverIntentDetectedCallback = null;
    if (this.trackingInterval) {
      window.clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }

    sidebar?.removeEventListener("mouseenter", this.mouseEnterWhileCollaped);
    sidebar?.removeEventListener("mousemove", this.mouseMove);
    sidebar?.removeEventListener("mousedown", this.mouseDown);
    sidebar?.removeEventListener("mouseleave", this.mouseLeaveWhileCollapsed);
  }
}

