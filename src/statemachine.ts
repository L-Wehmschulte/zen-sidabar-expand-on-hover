type Transisitons<T extends string> = {
  [fromState in T]: {
    [toState in T]?: {
      transition?: () => void;
     };
  } & {
    onEnter?: () => void;
    onExit?: () => void;
  }
}

export class StateMachine<T extends string> {
  private initialized : boolean = false;
  private state: T;

  private transitions: Transisitons<T>;

  constructor(initialState: T, transitions: Transisitons<T>) {
    this.state = initialState;
    this.transitions = transitions;
  }

  getState() {
    return this.state;
  }

  init() {
    if (this.initialized) {
      console.warn("State machine is already initialized");
      return;
    }

    this.initialized = true;
    console.info(`Initializing state machine in state ${this.state}...`);
    this.transitions[this.state].onEnter?.();
  }

  transition(toState: T) {
    const currentState = this.state;
    const transition = this.transitions[currentState][toState];
    if (!transition) {
      console.warn(`Invalid transition from ${currentState} to ${toState}`);
      return;
    }

    const onExit = this.transitions[currentState].onExit;
    const onEnter = this.transitions[toState].onEnter;


    console.debug(`Leaving state ${currentState}...`);
    onExit?.();
    console.debug(`Transitioning from ${currentState} to ${toState}`);
    transition.transition?.();
    this.state = toState;
    console.debug(`Entering state ${toState}...`);
    onEnter?.();
  }
}
