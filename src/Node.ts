//
import {
  NodeDefinition,
  NodeInitialisation,
  Resolver,
  OnNodeValueChangeCallback,
  DumpOutput,
} from "./types";

export const INVALID = Symbol("Invalid");

/*******************************************************************************
  Component
 ******************************************************************************/

export default abstract class Node<T> {
  protected name: string;
  protected value: T | null | Symbol;
  protected onChange: OnNodeValueChangeCallback<T>;
  private metadata: {};

  constructor(nodeDef: NodeInitialisation<T>) {
    const { name, paramNodes, resolver, value, metadata, onChange } = nodeDef;
    this.name = name;
    this.metadata = metadata;
    this.onChange = onChange;
    this.value = INVALID;
  }

  protected _set = (value: T | null | Symbol): void => {
    this.value = value;
    this.onChange(value);
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
}
