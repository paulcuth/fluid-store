//
import { NodeDefinition, Resolver } from "./types";

export const INVALID = Symbol("Invalid");

/*******************************************************************************
  Types
 ******************************************************************************/

export type OnChangeCallback<T> = (value: T | null | Symbol) => void;

export type NodeInitialisation<T> = {
  name: string;
  paramNodes: Array<Node<any>>;
  resolver: Resolver<T | null> | null;
  value: T | null | Symbol;
  metadata: {};
  onChange: OnChangeCallback<T>;
};

/*******************************************************************************
  Component
 ******************************************************************************/

export default class Node<T> {
  private name: string;
  private paramNodes: Array<Node<T>> | null;
  private resolver: Resolver<T | null> | null;
  private value: T | null | Symbol;
  private metadata: {};
  private onChange: OnChangeCallback<T>;

  constructor(nodeDef: NodeInitialisation<T>) {
    const { name, paramNodes, resolver, value, metadata, onChange } = nodeDef;
    this.name = name;
    this.metadata = metadata;
    this.onChange = onChange;

    if (resolver != null) {
      this.paramNodes = paramNodes;
      this.resolver = resolver;
      this.value = INVALID;
    } else {
      this.paramNodes = null;
      this.resolver = null;
      this.value = value;
    }
  }

  private isValidValue = (value: T | null | Symbol): value is T | null => {
    return value !== INVALID;
  };

  // ----------------------------
  // PUBLIC METHODS:

  public isValid = (): boolean => {
    return this.isValidValue(this.value);
  };

  public isComputed = (): boolean => {
    return this.resolver != null;
  };

  public set = (value: T | null): void => {
    this.value = value;
    this.onChange(value);
  };

  public get = async (): Promise<T | null> => {
    if (this.isValidValue(this.value)) {
      return this.value;
    }

    if (this.resolver == null || this.paramNodes == null) {
      return null;
    }

    const args = await Promise.all(
      this.paramNodes.map(async (p) => await p.get())
    );

    const value = await this.resolver(...args);
    this.set(value);

    return value;
  };

  public getRawValue = (): T | null | Symbol => {
    return this.value;
  };

  public invalidate = (): void => {
    this.value = INVALID;
    this.onChange(INVALID);
  };
}
