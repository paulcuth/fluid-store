//
import {
  NodeDefinition,
  Resolver,
  OnNodeValueChangeCallback,
  DumpOutput,
  EventListener,
  Path,
  NodeAPI,
  NodeMetadata,
} from "./types";

export const INVALID = Symbol("Invalid");

/*******************************************************************************
  Component
 ******************************************************************************/

export default abstract class Node<T> {
  protected name: string;
  protected value: T | null | Symbol;
  private metadata: NodeMetadata;
  private dependencies: Set<Node<any>> = new Set();
  private listeners: Array<EventListener> = [];

  /**
    Initialise parts of a node that are common to all node types
   */
  constructor(nodeDef: NodeDefinition<T>, api: NodeAPI) {
    const { name, metadata = {} } = nodeDef;
    this.name = name;
    this.metadata = metadata;
    this.value = INVALID;
  }

  // ----------------------------
  // PROTECTED METHODS:

  /**
    Send a new value to listeners
   */
  protected emit = (value: T | null | Symbol): void => {
    this.listeners.forEach((listener) => listener(value));
  };

  /**
    Set the node's value and boadcast to listeners
   */
  protected _set = (path: Path, value: T | null | Symbol): void => {
    this.value = value;
    this.emit(value);
  };

  /**
    Typescript guard for identifying a valid value vs one that has been invalidated
   */
  protected isValidValue = (value: T | null | Symbol): value is T | null => {
    return value !== INVALID;
  };

  // ----------------------------
  // PUBLIC METHODS:

  /**
    Get the node's value
   */
  public abstract get(path: Path): Promise<T | null>;

  /**
    Set the node's value
   */
  public abstract set(path: Path, value: T | null): void;

  /**
    Check if the node currently holds a value or has been invalidated
   */
  public isValid = (): boolean => this.isValidValue(this.value);

  /**
    Get the current value without resolving any dependencies
   */
  public getRawValue = (): T | null | Symbol | DumpOutput => this.value;

  /**
    Invalidate the node's current value
   */
  public invalidate = (): void => {
    if (!this.isValid()) {
      return;
    }

    this.dependencies.forEach((node) => node.invalidate());
    this._set([], INVALID);
  };

  /**
    Register another node as dependent on the value of this node. 
    Registered nodes will be invalidated when this node is invalidated.
   */
  public addDependency = (node: Node<any>): void => {
    this.dependencies.add(node);
  };

  /**
    Add a listener callback. 
    Listeners will be called when the node's value changes (including when the node is invalidated)
   */
  public addListener = (listener: EventListener): void => {
    this.listeners.push(listener);
  };

  /**
    Removes a listener callback. 
   */
  public removeListener = (listener: EventListener): void => {
    this.listeners = this.listeners.filter((l) => l !== listener);
  };
}
