//
import {
  NodeDefinition,
  NodeInitialisation,
  Resolver,
  OnNodeValueChangeCallback,
  DumpOutput,
  EventListener,
} from "./types";

export const INVALID = Symbol("Invalid");

/*******************************************************************************
  Component
 ******************************************************************************/

export default abstract class Node<T> {
  protected name: string;
  protected value: T | null | Symbol;
  private metadata: {};
  private listeners: Array<EventListener> = [];

  constructor(nodeDef: NodeInitialisation<T>) {
    const { name, paramNodes, resolver, value, metadata } = nodeDef;
    this.name = name;
    this.metadata = metadata;
    this.value = INVALID;
  }

  protected emit = (value: T | null | Symbol): void => {
    this.listeners.forEach((listener) => listener(value));
  };

  protected _set = (value: T | null | Symbol): void => {
    this.value = value;
    this.emit(value);
  };

  protected _getValueUsingPath = (
    value: any,
    path?: Array<string>
  ): T | null => {
    if (path == null || path.length === 0 || value == null) {
      return value;
    }
    const [key, ...subPath] = path;
    return this._getValueUsingPath(value[key], subPath);
  };

  protected isValidValue = (value: T | null | Symbol): value is T | null => {
    return value !== INVALID;
  };

  // ----------------------------
  // PUBLIC METHODS:

  public abstract get(path?: Array<string>): Promise<T | null>;

  public abstract set(value: T | null): void;

  public isValid = (): boolean => this.isValidValue(this.value);

  public getRawValue = (): T | null | Symbol | DumpOutput => this.value;

  public invalidate = (): void => this._set(INVALID);

  public addListener = (listener: EventListener): void => {
    this.listeners.push(listener);
  };

  public removeListener = (listener: EventListener): void => {
    this.listeners = this.listeners.filter((l) => l !== listener);
  };
}
