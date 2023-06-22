type BehaviorFunction<T> = (e: T) => void;
type StateFunction<T> = (e: T) => void;

abstract class EntityFactory {
  static Events: {
    [key: string]: any;
  };
  static Behaviors: {
    [key: string]: string;
  };
  static AnimationCycles?: { [key: string]: NewCycleInformation };
  static create: (manager: GameManager) => void;
}

class Entity {
  readonly id: string;
  readonly layer: number;

  readonly tags: string[];

  private activeBehaviors: Set<string>;
  private behaviors: Map<string, BehaviorFunction<Entity>>;
  private internalFunctions: Map<string, Function>;
  private eventListeners: Map<string, (event: any) => void>;

  scale: Size;
  positionVector: p5.Vector;
  size: Size;
  rotation: number;

  static Assets = {
    sample: "sample",
  };

  static ERROR = {
    NoBehavior: new Error("Behavior not in entity."),
    NoState: new Error("State not in entity."),
  };

  constructor(
    id: string,
    layer: number,
    size = { width: 0, height: 0 },
    position = { x: 0, y: 0 },
    tags: string[] = [],
    rotation = 0
  ) {
    this.id = id;
    this.positionVector = createVector(position.x, position.y);
    this.size = size;
    this.rotation = rotation;
    this.layer = layer;
    this.behaviors = new Map();
    this.activeBehaviors = new Set();
    this.internalFunctions = new Map();
    this.eventListeners = new Map();
    this.tags = tags;
    this.scale = { width: 1, height: 1 };
  }

  addListener<EventData>(eventName: string, func: (event: EventData) => void) {
    this.eventListeners.set(eventName, func);
  }

  removeListener(eventName: string) {
    this.eventListeners.delete(eventName);
  }

  get position(): p5.Vector {
    return this.positionVector;
  }

  setPosition(newVector: p5.Vector) {
    this.positionVector = newVector;
  }

  getFunction(name: string) {
    return this.internalFunctions.get(name);
  }

  addInternalFunction<T>(name: string, func: (param: T) => void) {
    this.internalFunctions.set(name, func);
  }

  removeInternalFunction(name: string) {
    this.internalFunctions.delete(name);
  }

  activateBehavior(name: string) {
    if (!this.behaviors.has(name))
      throwCustomError(
        ERRORS.Entity.NO_BEHAVIOR,
        `Behavior [${name}] is not in entity [${this.id}]`
      );
    this.activeBehaviors.add(name);
  }

  deactivateBehavior(name: string) {
    this.activeBehaviors.delete(name);
  }

  addBehavior(
    name: string,
    behavior: BehaviorFunction<Entity>,
    doActivate = false
  ) {
    this.behaviors.set(name, behavior);
    if (doActivate) this.activateBehavior(name);
  }

  removeBehavior(name: string) {
    this.behaviors.delete(name);
  }

  run(manager: GameManager) {
    push();
    translate(this.position.x, this.position.y);
    rotate(this.rotation);
    scale(this.scale.width, this.scale.height);

    for (const [eventName, eventFunc] of this.eventListeners.entries()) {
      const event = manager.getEvent(eventName);
      if (event !== undefined) eventFunc(event.options);
    }

    for (const behavior of this.activeBehaviors) {
      const behaviorFunction = this.behaviors.get(behavior);
      if (behaviorFunction === undefined)
        throwCustomError(
          Entity.ERROR.NoBehavior,
          `[${behavior}] doesn't exist in [${this.id}].`
        );
      behaviorFunction(this);
    }

    pop();
  }
}
